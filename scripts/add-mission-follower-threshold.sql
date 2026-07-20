alter table public.missions
  add column if not exists minimum_follower_count integer null;

notify pgrst, 'reload schema';
