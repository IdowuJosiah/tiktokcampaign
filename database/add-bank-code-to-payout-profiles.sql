-- Add bank_code to creator_payout_profiles so automatic Paystack transfers
-- can be initiated without needing the admin to manually pay out.
alter table creator_payout_profiles
  add column if not exists bank_code text;

notify pgrst, 'reload schema';
