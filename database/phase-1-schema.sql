do $$ begin
  create type user_role as enum ('brand', 'creator', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type mission_status as enum ('draft', 'live', 'closed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type submission_status as enum ('submitted', 'in_review', 'approved', 'needs_fix', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type review_decision as enum ('approve', 'request_fix', 'reject');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type wallet_transaction_status as enum ('pending', 'available', 'paid', 'reversed');
exception
  when duplicate_object then null;
end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role user_role not null,
  created_at timestamptz not null default now()
);

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users(id),
  name text not null,
  website text,
  category text not null,
  created_at timestamptz not null default now()
);

create table if not exists creators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  display_name text not null,
  tiktok_handle text not null unique,
  tiktok_verification_code text,
  tiktok_verified_at timestamptz,
  country text not null,
  created_at timestamptz not null default now()
);

alter table creators add column if not exists tiktok_verification_code text;
alter table creators add column if not exists tiktok_verified_at timestamptz;

create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  title text not null,
  brief text not null,
  reward_pool_cents integer not null check (reward_pool_cents >= 0),
  deadline timestamptz not null,
  status mission_status not null default 'draft',
  required_hashtag text not null,
  required_sound text,
  minimum_views integer not null default 0,
  disclosure_required boolean not null default true,
  deposit_reference text,
  funded_at timestamptz,
  approved_at timestamptz,
  rules jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table missions add column if not exists deposit_reference text;
alter table missions add column if not exists funded_at timestamptz;
alter table missions add column if not exists approved_at timestamptz;

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references missions(id),
  creator_id uuid not null references creators(id),
  tiktok_url text not null,
  caption text,
  status submission_status not null default 'submitted',
  hashtag_ok boolean not null default false,
  sound_ok boolean not null default false,
  disclosure_ok boolean not null default false,
  deadline_ok boolean not null default false,
  public_video_ok boolean not null default false,
  reward_cents integer not null default 0 check (reward_cents >= 0),
  submitted_at timestamptz not null default now(),
  unique (mission_id, creator_id, tiktok_url)
);

create table if not exists submission_metrics (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  views integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  saves integer,
  captured_at timestamptz not null default now()
);

create table if not exists submission_scores (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  instruction_match integer not null check (instruction_match between 0 and 100),
  reach_quality integer not null check (reach_quality between 0 and 100),
  engagement_depth integer not null check (engagement_depth between 0 and 100),
  authenticity integer not null check (authenticity between 0 and 100),
  brand_safety integer not null check (brand_safety between 0 and 100),
  composite integer not null check (composite between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists submission_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  reviewer_user_id uuid not null references users(id),
  decision review_decision not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators(id),
  submission_id uuid references submissions(id),
  amount_cents integer not null,
  status wallet_transaction_status not null default 'pending',
  label text not null,
  created_at timestamptz not null default now()
);

create index if not exists missions_status_idx on missions(status);
create index if not exists submissions_status_idx on submissions(status);
create index if not exists submissions_mission_idx on submissions(mission_id);
create index if not exists wallet_transactions_creator_idx on wallet_transactions(creator_id);
