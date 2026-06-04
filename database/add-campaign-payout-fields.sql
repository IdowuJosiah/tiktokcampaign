alter table public.missions
  add column if not exists payout_per_5_submissions_cents integer not null default 0;

alter table public.missions
  add column if not exists views_per_submission integer not null default 0;

notify pgrst, 'reload schema';
