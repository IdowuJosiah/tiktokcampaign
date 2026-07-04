// Supabase errors (PostgrestError, AuthError) are plain objects with a
// `message` property, not `instanceof Error`, so a naive `error.message`
// access silently falls back to a generic string and hides the real cause.
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}
