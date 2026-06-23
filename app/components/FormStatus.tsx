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
  account_unresolved: "Resolve the account name before saving bank details.",
  invalid_tiktok_links: "Each entry must be a unique TikTok video link.",
};

const successes: Record<string, string> = {
  nin_submitted: "NIN submitted successfully. It will be reviewed shortly.",
  tiktok_verified: "TikTok account connected and verified.",
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
