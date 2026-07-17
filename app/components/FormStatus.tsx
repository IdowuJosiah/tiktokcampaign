const errors: Record<string, string> = {
  timeout: "Request timed out. Try again.",
  write_failed: "Database write failed.",
  schema_cache_stale: "Schema cache is stale. Run `notify pgrst, 'reload schema'` in the SQL editor.",
  campaign_columns_missing: "Campaign payout columns missing. Run database/add-campaign-payout-fields.sql.",
  campaign_amount_too_large: "Amount too large. Use smaller values.",
  payout_tables_missing: "Payout tables missing. Run database/add-creator-payout-tables.sql.",
  auth_failed: "Authentication failed.",
  oauth_provider_failed: "Google auth error. Check the provider and redirect URI in Supabase.",
  oauth_missing_code: "Google didn't return an auth code. Check Supabase redirect URL settings.",
  oauth_exchange_failed: "Google login code exchange failed. Check Site URL and Redirect URLs in Supabase.",
  oauth_email_missing: "Google didn't return an email for this account.",
  oauth_app_user_failed: "Google login succeeded but profile creation failed. Check the users table.",
  invalid_credentials: "Incorrect email or password.",
  demo_login_disabled: "Demo login is disabled.",
  invalid_admin_credentials: "Incorrect admin credentials.",
  withdrawal_no_bank: "Add bank details in Profile & Setup before withdrawing.",
  withdrawal_no_bank_code: "Bank code missing. Re-save your bank details, then try again.",
  transfer_failed: "Transfer failed. Your balance has been restored — try again.",
  withdrawal_min_balance: "Minimum withdrawal is ₦2,000.",
  withdrawal_pending: "A withdrawal is already being processed.",
  already_registered: "Email already registered. Try logging in.",
  brand_required: "Log in with a brand account to continue.",
  creator_required: "Log in with a creator account to continue.",
  admin_required: "Log in with an admin account to continue.",
  tiktok_required: "Verify your TikTok handle before submitting.",
  tiktok_reconnect_required: "TikTok connection expired. Reconnect your account.",
  tiktok_profile_required: "Link TikTok before adding payout details.",
  tiktok_not_configured: "TikTok login not configured. Add TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET.",
  tiktok_oauth_failed: "TikTok verification failed or was cancelled.",
  tiktok_username_unavailable: "TikTok returned no username. Ensure user.info.profile scope is approved in the developer portal.",
  account_unresolved: "Resolve the account name before saving.",
  invalid_tiktok_links: "Each entry must be a unique TikTok video link.",
  title_too_long: "Title must be under 80 characters.",
  brief_too_long: "Brief must be under 2000 characters.",
  hashtag_too_long: "Hashtag must be under 50 characters.",
  rule_too_long: "Each rule must be under 200 characters.",
  invalid_sound_url: "Sound must be a TikTok sound link (tiktok.com/music/... or /sound/...).",
  payout_exceeds_pool: "Payout per 3 submissions can't exceed the reward pool.",
  invalid_reward_pool: "Enter a reward pool amount greater than ₦0.",
  invalid_payout_amount: "Enter a payout amount greater than ₦0.",
  invalid_views_per_submission: "Enter a valid views-per-submission number.",
  invalid_reward_amount: "Enter a valid reward amount.",
  insufficient_wallet_balance: "Wallet balance doesn't cover this reward pool. Add funds first.",
  invalid_deposit_amount: "Enter a deposit of at least ₦1.",
  deposit_key_missing: "PAYSTACK_SECRET_KEY not set in environment variables.",
  deposit_api_failed: "Paystack rejected the request. Check PAYSTACK_SECRET_KEY.",
  wallet_table_missing: "Brand wallet table missing. Run database/add-brand-wallet.sql.",
  deposit_init_failed: "Could not start the deposit. Check server logs.",
  deposit_not_successful: "Payment not successful according to Paystack.",
  deposit_verification_failed: "Couldn't verify deposit with Paystack. No funds added.",
  duplicate_submission: "You've already submitted this TikTok link for this campaign.",
  tiktok_ownership_mismatch: "These videos don't match your connected TikTok account.",
  minimum_links: "Submit at least 3 TikTok links.",
  tiktok_video_not_found: "Couldn't find one of these videos. Make sure it's public and the link is correct.",
  insufficient_views: "One or more videos haven't reached the minimum view count.",
  tiktok_validation_failed: "Couldn't verify these videos against TikTok. Try again shortly.",
  rejection_reason_required: "Enter a reason before rejecting.",
  mission_rejected: "Campaign was rejected. The brand must create a new one.",
  mission_not_live: "Campaign is not live and can't be closed.",
  campaign_funding_failed: "Brand's wallet doesn't cover this reward pool. They need to add funds first.",
  reward_exceeds_pool: "This reward would exceed the campaign's funded pool.",
  invalid_mission: "Select a campaign before submitting.",
};

const successes: Record<string, string> = {
  nin_submitted: "NIN submitted. It'll be reviewed shortly.",
  mission_closed: "Campaign closed. Unspent funds refunded to the brand's wallet.",
  tiktok_verified: "TikTok account connected.",
  funds_added: "Deposit verified and added to your wallet.",
  submitted_for_sound_review: "Submitted! Sound check flagged for manual review on one or more videos.",
  withdrawal_requested: "Withdrawal requested. Payout coming to your bank shortly.",
  withdrawal_sent: "Transfer initiated to your bank account.",
};

export function FormStatus({ error, success }: { error?: string; success?: string }) {
  if (success && success in successes) {
    return (
      <div className="form-status" role="status" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
        {successes[success]}
      </div>
    );
  }

  if (!error || !(error in errors)) return null;

  return (
    <div className="form-status" role="alert">
      {errors[error]}
    </div>
  );
}
