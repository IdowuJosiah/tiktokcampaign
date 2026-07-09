-- Merge duplicate creator rows per user_id and enforce one creator per user.
--
-- creators.user_id had no uniqueness guarantee, so a user could end up with
-- more than one creators row. Several queries look creators up with
-- .maybeSingle() (e.g. the submit action and the /api/tiktok/verify-link
-- endpoint), which THROWS when it finds multiple rows — so a duplicate silently
-- breaks submission and link verification. This mirrors the brands fix in
-- add-brand-owner-unique.sql.
--
-- For each user with duplicates we keep the oldest creator (the canonical row)
-- and reassign its dependents, handling the child tables that carry their own
-- uniqueness so the reassignment can't violate a constraint.
do $$
declare
  rec record;
begin
  for rec in
    select
      c.id as duplicate_id,
      c.user_id,
      first_value(c.id) over (
        partition by c.user_id order by c.created_at, c.id
      ) as canonical_id
    from creators c
  loop
    if rec.duplicate_id = rec.canonical_id then
      continue;
    end if;

    -- submissions: unique (mission_id, creator_id, tiktok_url). Drop any
    -- duplicate-owned rows that would collide with the canonical creator's,
    -- then move the rest over.
    delete from submissions s
    where s.creator_id = rec.duplicate_id
      and exists (
        select 1 from submissions t
        where t.creator_id = rec.canonical_id
          and t.mission_id = s.mission_id
          and t.tiktok_url = s.tiktok_url
      );
    update submissions set creator_id = rec.canonical_id where creator_id = rec.duplicate_id;

    -- wallet_transactions: no per-creator uniqueness, move all.
    update wallet_transactions set creator_id = rec.canonical_id where creator_id = rec.duplicate_id;

    -- creator_payout_profiles / creator_identity_verifications: unique(creator_id).
    -- Keep the canonical row if it already has one; otherwise move the duplicate's.
    delete from creator_payout_profiles p
    where p.creator_id = rec.duplicate_id
      and exists (select 1 from creator_payout_profiles q where q.creator_id = rec.canonical_id);
    update creator_payout_profiles set creator_id = rec.canonical_id where creator_id = rec.duplicate_id;

    delete from creator_identity_verifications v
    where v.creator_id = rec.duplicate_id
      and exists (select 1 from creator_identity_verifications w where w.creator_id = rec.canonical_id);
    update creator_identity_verifications set creator_id = rec.canonical_id where creator_id = rec.duplicate_id;

    delete from creators where id = rec.duplicate_id;
  end loop;
end $$;

do $$ begin
  alter table creators add constraint creators_user_id_key unique (user_id);
exception
  when duplicate_object then null;
end $$;

notify pgrst, 'reload schema';
