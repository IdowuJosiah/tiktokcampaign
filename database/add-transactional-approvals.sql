-- approveMission and reviewSubmission each perform several dependent writes
-- (debit the brand wallet + flip the mission live; update a submission +
-- record the review + move a wallet transaction) using separate Supabase
-- calls with no shared transaction, so a failure partway through could leave
-- money debited without the mission going live, or a submission's status
-- updated without its payout recorded. Wrapping each sequence in a single
-- Postgres function makes it atomic, and row locks close the race where two
-- concurrent approvals could both read a stale wallet/pool balance and
-- jointly overspend it.

create or replace function approve_mission(p_mission_id uuid)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_mission missions%rowtype;
  v_balance_cents bigint;
  v_already_funded boolean;
begin
  -- Lock the mission row so a concurrent approval of the same mission
  -- serializes instead of racing this one.
  select * into v_mission from missions where id = p_mission_id for update;

  if not found then
    raise exception 'mission_not_found';
  end if;

  if v_mission.status = 'rejected' then
    raise exception 'mission_rejected';
  end if;

  if v_mission.status <> 'draft' then
    -- Already approved/live — nothing to fund again.
    return;
  end if;

  -- Lock the brand row too, so two of this brand's draft missions being
  -- approved at the same moment can't both read the same stale balance.
  perform id from brands where id = v_mission.brand_id for update;

  select coalesce(sum(amount_cents), 0) into v_balance_cents
  from brand_wallet_transactions
  where brand_id = v_mission.brand_id and status = 'completed';

  select exists(
    select 1 from brand_wallet_transactions
    where mission_id = p_mission_id and type = 'campaign_funding'
  ) into v_already_funded;

  if not v_already_funded and v_balance_cents < v_mission.reward_pool_cents then
    raise exception 'insufficient_funds';
  end if;

  if not v_already_funded then
    insert into brand_wallet_transactions (brand_id, mission_id, amount_cents, type, status)
    values (v_mission.brand_id, p_mission_id, -v_mission.reward_pool_cents, 'campaign_funding', 'completed');
  end if;

  update missions
  set status = 'live', approved_at = now(), funded_at = now()
  where id = p_mission_id;
end;
$$;

create or replace function review_submission(
  p_submission_id uuid,
  p_decision text,
  p_reason text,
  p_reward_cents integer,
  p_reviewer_user_id uuid
)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_submission submissions%rowtype;
  v_next_status text;
  v_pool_cents bigint;
  v_already_paid_cents bigint;
begin
  v_next_status := case
    when p_decision = 'approve' then 'approved'
    when p_decision = 'request_fix' then 'needs_fix'
    else 'rejected'
  end;

  -- Lock the submission row itself.
  select * into v_submission from submissions where id = p_submission_id for update;
  if not found then
    raise exception 'submission_not_found';
  end if;

  -- Lock the parent mission row, serializing concurrent reviews of sibling
  -- submissions so the cumulative pool-cap check below can't race.
  perform id from missions where id = v_submission.mission_id for update;

  if v_next_status = 'approved' and p_reward_cents > 0 then
    select reward_pool_cents into v_pool_cents from missions where id = v_submission.mission_id;

    select coalesce(sum(amount_cents), 0) into v_already_paid_cents
    from wallet_transactions
    where submission_id in (
      select id from submissions
      where mission_id = v_submission.mission_id and id <> p_submission_id
    )
    and status in ('available', 'paid');

    if v_already_paid_cents + p_reward_cents > coalesce(v_pool_cents, 0) then
      raise exception 'reward_exceeds_pool';
    end if;
  end if;

  update submissions
  set status = v_next_status::submission_status,
      reward_cents = case when v_next_status = 'approved' then p_reward_cents else 0 end
  where id = p_submission_id;

  insert into submission_reviews (submission_id, reviewer_user_id, decision, reason)
  values (p_submission_id, p_reviewer_user_id, p_decision::review_decision, p_reason);

  delete from wallet_transactions where submission_id = p_submission_id;

  if v_next_status = 'approved' and p_reward_cents > 0 then
    insert into wallet_transactions (creator_id, submission_id, amount_cents, status, label)
    values (v_submission.creator_id, p_submission_id, p_reward_cents, 'available', 'Approved campaign reward');
  end if;
end;
$$;

notify pgrst, 'reload schema';
