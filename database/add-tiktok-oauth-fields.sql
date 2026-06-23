alter table creators add column if not exists tiktok_open_id text;
alter table creators add column if not exists tiktok_username text;
alter table creators add column if not exists tiktok_avatar_url text;
create unique index if not exists creators_tiktok_open_id_key on creators (tiktok_open_id) where tiktok_open_id is not null;
