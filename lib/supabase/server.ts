import "server-only";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_TIMEOUT_MS = 8000;

async function timeoutFetch(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing server Supabase environment variables.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    global: {
      fetch: timeoutFetch,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
