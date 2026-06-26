alter table creators
  add column if not exists tiktok_access_token text,
  add column if not exists tiktok_refresh_token text,
  add column if not exists tiktok_token_expires_at timestamptz;

notify pgrst, 'reload schema';
