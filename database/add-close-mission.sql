-- close_mission: admin closes a live campaign and refunds the unspent portion
-- of its reward pool back to the brand's wallet.
--
-- "Unspent" = reward_pool_cents minus the sum of all creator wallet_transactions
-- for this mission that are in (available, paid, pending) — i.e. everything the
-- creators have already earned or been paid out, which we keep. Only the truly
-- unclaimed remainder goes back to the brand.

create or replace function close_mission(p_mission_id uuid)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_mission missions%rowtype;
  v_already_earned bigint;
  v_refund bigint;
begin
  select * into v_mission from missions where id = p_mission_id for update;
  if not found then
    raise exception 'mission_not_found';
  end if;
  if v_mission.status <> 'live' then
    raise exception 'mission_not_live';
  end if;

  -- Lock the brand row so concurrent closes or approvals don't race.
  perform id from brands where id = v_mission.brand_id for update;

  -- Total already earned by creators on this mission (kept regardless of close).
  select coalesce(sum(wt.amount_cents), 0) into v_already_earned
  from wallet_transactions wt
  join submissions s on s.id = wt.submission_id
  where s.mission_id = p_mission_id
    and wt.status in ('available', 'paid', 'pending');

  v_refund := greatest(coalesce(v_mission.reward_pool_cents, 0) - v_already_earned, 0);

  update missions set status = 'closed' where id = p_mission_id;

  if v_refund > 0 then
    insert into brand_wallet_transactions (brand_id, mission_id, amount_cents, type, status)
    values (v_mission.brand_id, p_mission_id, v_refund, 'refund', 'completed');
  end if;
end;
$$;

notify pgrst, 'reload schema';
