const messages = {
  timeout: "Supabase did not respond in time. Check the project status and try again.",
  write_failed: "The database write failed. Confirm the Phase 1 SQL schema has been run.",
  auth_failed: "Authentication failed. Check your Supabase Auth settings and try again.",
  invalid_credentials: "The email or password is not correct.",
  already_registered: "That email is already registered. Try logging in instead.",
  brand_required: "You need to log in with a brand account before creating a mission.",
  creator_required: "You need to log in with a creator account to continue.",
  tiktok_required: "Verify your TikTok handle before submitting videos.",
};

export function FormStatus({ error }: { error?: string }) {
  if (!error || !(error in messages)) return null;

  return (
    <div className="form-status" role="alert">
      {messages[error as keyof typeof messages]}
    </div>
  );
}
