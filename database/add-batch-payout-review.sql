-- Batch-based payout on submission review.
--
-- Previously an admin typed a reward amount per submission. Now the payout is
-- the campaign's payout_per_5_submissions_cents (chosen by the brand), credited
-- automatically once the creator reaches each complete group of 5 approved
-- submissions for that campaign — capped so total payouts never exceed the
-- funded reward pool. The admin only approves / requests a fix / rejects.
--
-- This replaces the older review_submission(uuid,text,text,integer,uuid) from
-- add-transactional-approvals.sql (note the dropped p_reward_cents argument).
drop function if exists review_submission(uuid, text, text, integer, uuid);

create or replace function review_submission(
  p_submission_id uuid,
  p_decision text,
  p_reason text,
  p_reviewer_user_id uuid
)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_submission submissions%rowtype;
  v_mission missions%rowtype;
  v_next_status text;
  v_approved_count integer;
  v_owed bigint;
  v_already_paid bigint;
  v_mission_paid bigint;
  v_pool_remaining bigint;
  v_credit bigint;
begin
  v_next_status := case
    when p_decision = 'approve' then 'approved'
    when p_decision = 'request_fix' then 'needs_fix'
    else 'rejected'
  end;

  -- Lock the submission and its parent mission so concurrent reviews of sibling
  -- submissions can't both read a stale approved-count / pool total.
  select * into v_submission from submissions where id = p_submission_id for update;
  if not found then
    raise exception 'submission_not_found';
  end if;

  select * into v_mission from missions where id = v_submission.mission_id for update;

  update submissions
  set status = v_next_status::submission_status,
      reward_cents = 0
  where id = p_submission_id;

  insert into submission_reviews (submission_id, reviewer_user_id, decision, reason)
  values (p_submission_id, p_reviewer_user_id, p_decision::review_decision, p_reason);

  -- Only approvals can earn a payout. Recompute what this creator has earned on
  -- this mission from their approved-submission count, and credit the shortfall
  -- (which is one payout_per_5 each time a new group of 5 completes).
  if v_next_status = 'approved' then
    select count(*) into v_approved_count
    from submissions
    where mission_id = v_submission.mission_id
      and creator_id = v_submission.creator_id
      and status = 'approved';

    -- integer division = number of complete groups of 5
    v_owed := (v_approved_count / 5)::bigint * coalesce(v_mission.payout_per_5_submissions_cents, 0);

    select coalesce(sum(wt.amount_cents), 0) into v_already_paid
    from wallet_transactions wt
    join submissions s on s.id = wt.submission_id
    where s.mission_id = v_submission.mission_id
      and s.creator_id = v_submission.creator_id
      and wt.status in ('available', 'pending', 'paid');

    if v_owed > v_already_paid then
      -- Cap so total payouts to ALL creators for this mission stay within the
      -- funded reward pool.
      select coalesce(sum(wt.amount_cents), 0) into v_mission_paid
      from wallet_transactions wt
      join submissions s on s.id = wt.submission_id
      where s.mission_id = v_submission.mission_id
        and wt.status in ('available', 'pending', 'paid');

      v_pool_remaining := coalesce(v_mission.reward_pool_cents, 0) - v_mission_paid;
      v_credit := least(v_owed - v_already_paid, v_pool_remaining);

      if v_credit > 0 then
        insert into wallet_transactions (creator_id, submission_id, amount_cents, status, label)
        values (v_submission.creator_id, p_submission_id, v_credit, 'available', 'Approved batch reward');
      end if;
    end if;
  end if;
end;
$$;

notify pgrst, 'reload schema';
