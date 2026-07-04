const errors: Record<string, string> = {
  timeout: "Supabase did not respond in time. Check the project status and try again.",
  write_failed: "The database write failed. Confirm the Phase 1 SQL schema has been run.",
  schema_cache_stale: "Supabase has the new columns, but its API schema cache has not refreshed yet. Run the payout-fields SQL patch again, including the schema reload line.",
  campaign_columns_missing: "The campaign payout fields are missing in Supabase. Run database/add-campaign-payout-fields.sql in the SQL editor.",
  campaign_amount_too_large: "One campaign amount is too large for the database. Use smaller values for now while we move money fields to bigint.",
  payout_tables_missing: "The payout tables are missing in Supabase. Run database/add-creator-payout-tables.sql in the SQL editor.",
  auth_failed: "Authentication failed. Check your Supabase Auth settings and try again.",
  oauth_provider_failed: "Google returned an auth error. Confirm the Google provider and redirect URI in Supabase.",
  oauth_missing_code: "Google did not return an auth code. Check the Supabase redirect URL settings.",
  oauth_exchange_failed: "Supabase could not exchange the Google login code. Check Site URL and Redirect URLs.",
  oauth_email_missing: "Google did not return an email address for this account.",
  oauth_app_user_failed: "Google login worked, but VoiceRank could not create your app profile. Check the users table/schema.",
  invalid_credentials: "The email or password is not correct.",
  already_registered: "That email is already registered. Try logging in instead.",
  brand_required: "You need to log in with a brand account before creating a mission.",
  creator_required: "You need to log in with a creator account to continue.",
  tiktok_required: "Verify your TikTok handle before submitting videos.",
  tiktok_profile_required: "Link TikTok before adding payout details.",
  tiktok_not_configured: "TikTok login is not configured yet. Add TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET.",
  tiktok_oauth_failed: "TikTok verification failed or was cancelled. Please try connecting again.",
  tiktok_username_unavailable: "TikTok returned no username. Make sure the user.info.profile scope is approved in the TikTok developer portal.",
  account_unresolved: "Resolve the account name before saving bank details.",
  invalid_tiktok_links: "Each entry must be a unique TikTok video link.",
  title_too_long: "Campaign title is too long. Keep it under 80 characters.",
  brief_too_long: "Creator brief is too long. Keep it under 2000 characters.",
  hashtag_too_long: "Required hashtag is too long. Keep it under 50 characters.",
  rule_too_long: "One of the rules is too long. Keep each rule under 200 characters.",
  invalid_sound_url: "Required sound must be a real TikTok sound link, e.g. tiktok.com/music/... or tiktok.com/sound/...",
  payout_exceeds_pool: "Payout per 5 submissions can't be larger than the total reward pool.",
  insufficient_wallet_balance: "Your wallet balance doesn't cover this reward pool. Add funds first.",
  invalid_deposit_amount: "Enter a deposit amount of at least ₦1.",
  deposit_key_missing: "PAYSTACK_SECRET_KEY is not set. Add it to your environment variables (locally in .env.local, on Vercel under Project Settings → Environment Variables).",
  deposit_api_failed: "Paystack rejected the request. Check that your PAYSTACK_SECRET_KEY is valid and the account is active.",
  wallet_table_missing: "The brand wallet table is missing in Supabase. Run database/add-brand-wallet.sql in the SQL editor.",
  deposit_init_failed: "Could not start the deposit. Check server logs for the exact error.",
  deposit_not_successful: "Paystack reported this payment as not successful.",
  deposit_verification_failed: "We couldn't verify your deposit with Paystack. No funds were added.",
  duplicate_submission: "You've already submitted this exact TikTok link for this campaign.",
  tiktok_ownership_mismatch: "One or more of these videos doesn't belong to your connected TikTok account. Submit links from your own verified handle only.",
  minimum_five_links: "You need at least 5 TikTok links to submit a batch.",
  tiktok_video_not_found: "We couldn't find one of these videos on your TikTok account. Make sure the video is public and the link is correct.",
  insufficient_views: "One or more videos haven't reached the minimum view count required for this campaign yet.",
  tiktok_validation_failed: "We couldn't verify these videos against TikTok right now. Try again shortly.",
  rejection_reason_required: "Enter a reason before rejecting this campaign.",
  mission_rejected: "This campaign was rejected and can't be approved. The brand needs to create a new campaign instead.",
  campaign_funding_failed: "The brand's wallet balance no longer covers this reward pool, so the campaign can't be approved. The brand needs to add funds first.",
  reward_exceeds_pool: "This reward would push total payouts past the campaign's funded reward pool. Lower the amount or have the brand top up.",
};

const successes: Record<string, string> = {
  nin_submitted: "NIN submitted successfully. It will be reviewed shortly.",
  tiktok_verified: "TikTok account connected and verified.",
  funds_added: "Deposit verified and added to your wallet balance.",
  submitted_for_sound_review: "Submitted! We couldn't auto-confirm the required sound on one or more videos, so this batch is flagged for manual review.",
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
