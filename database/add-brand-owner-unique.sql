-- Merge duplicate brand rows per owner_user_id (kept accumulating because
-- brands.owner_user_id had no uniqueness guarantee), reassigning any missions
-- and wallet transactions from the duplicates onto the oldest brand row before
-- deleting them, then enforce one brand per owner going forward.
do $$
declare
  merged record;
begin
  for merged in
    select
      b.id as duplicate_id,
      first_value(b.id) over (
        partition by b.owner_user_id order by b.created_at, b.id
      ) as canonical_id
    from brands b
  loop
    if merged.duplicate_id <> merged.canonical_id then
      update missions set brand_id = merged.canonical_id where brand_id = merged.duplicate_id;
      update brand_wallet_transactions set brand_id = merged.canonical_id where brand_id = merged.duplicate_id;
      delete from brands where id = merged.duplicate_id;
    end if;
  end loop;
end $$;

do $$ begin
  alter table brands add constraint brands_owner_user_id_key unique (owner_user_id);
exception
  when duplicate_object then null;
end $$;

notify pgrst, 'reload schema';
