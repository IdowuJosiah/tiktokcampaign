-- Every table read/write in this app goes through the server-side service-role
-- Supabase client (see lib/supabase/server.ts), which always bypasses Row Level
-- Security. The public anon key is embedded in the browser bundle, though, and
-- with RLS off it can query Supabase's REST API directly for any table — including
-- NIN numbers, TikTok tokens, and wallet balances. Enabling RLS with no policies
-- denies the anon/authenticated roles by default while leaving the app untouched.
alter table users enable row level security;
alter table brands enable row level security;
alter table creators enable row level security;
alter table missions enable row level security;
alter table submissions enable row level security;
alter table submission_metrics enable row level security;
alter table submission_scores enable row level security;
alter table submission_reviews enable row level security;
alter table wallet_transactions enable row level security;
alter table creator_payout_profiles enable row level security;
alter table creator_identity_verifications enable row level security;
alter table brand_wallet_transactions enable row level security;

notify pgrst, 'reload schema';
