// Deletes Supabase Auth users (auth.users) via the Auth admin API.
//
// The app's `users` table can be cleared with normal SQL/REST, but the
// underlying Supabase Auth credentials live in auth.users and need this admin
// endpoint. Uses the SERVICE ROLE key — never expose this key client-side.
//
// Usage:
//   node scripts/delete-auth-users.mjs            # DRY RUN — lists users, deletes nothing
//   node scripts/delete-auth-users.mjs --yes      # actually deletes ALL auth users
//   node scripts/delete-auth-users.mjs --yes --keep me@example.com,other@example.com
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the
// environment, falling back to parsing .env.local.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const env = { ...process.env };
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const raw = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
      for (const line of raw.split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
        if (!m) continue;
        const key = m[1];
        let val = m[2].trim().replace(/^["']|["']$/g, "");
        if (!(key in env) || !env[key]) env[key] = val;
      }
    } catch {
      /* .env.local not present — rely on process.env */
    }
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const args = process.argv.slice(2);
const confirmed = args.includes("--yes");
const keepArg = args[args.indexOf("--keep") + 1];
const keep = new Set(
  args.includes("--keep") && keepArg ? keepArg.split(",").map((e) => e.trim().toLowerCase()) : [],
);

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function listAllUsers() {
  const all = [];
  let page = 1;
  const perPage = 1000;
  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
      { headers },
    );
    if (!res.ok) {
      throw new Error(`List failed (HTTP ${res.status}): ${await res.text()}`);
    }
    const data = await res.json();
    const users = data.users ?? [];
    all.push(...users);
    if (users.length < perPage) break;
    page += 1;
  }
  return all;
}

async function deleteUser(id) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    throw new Error(`Delete ${id} failed (HTTP ${res.status}): ${await res.text()}`);
  }
}

async function main() {
  const users = await listAllUsers();
  const targets = users.filter((u) => !keep.has((u.email ?? "").toLowerCase()));

  console.log(`Found ${users.length} auth user(s).`);
  if (keep.size) console.log(`Keeping: ${[...keep].join(", ")}`);
  for (const u of targets) console.log(`  - ${u.email ?? "(no email)"}  ${u.id}`);

  if (!confirmed) {
    console.log(`\nDRY RUN — nothing deleted. Re-run with --yes to delete ${targets.length} user(s).`);
    return;
  }

  console.log(`\nDeleting ${targets.length} user(s)...`);
  let ok = 0;
  for (const u of targets) {
    try {
      await deleteUser(u.id);
      ok += 1;
      console.log(`  deleted ${u.email ?? u.id}`);
    } catch (err) {
      console.error(`  FAILED ${u.email ?? u.id}: ${err.message}`);
    }
  }
  console.log(`\nDone. Deleted ${ok}/${targets.length}.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
