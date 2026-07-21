-- Stores multiple view-threshold → payout pairs for a campaign.
-- Each element: { "min_views": number, "payout_per_3_cents": number }
-- Sorted ascending by min_views at write time.
-- Legacy single-value columns (minimum_views, views_per_submission,
-- payout_per_3_submissions_cents) are kept and populated from the first
-- (lowest) tier for backwards compatibility.
alter table public.missions
  add column if not exists payout_tiers jsonb null;

notify pgrst, 'reload schema';
