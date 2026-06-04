create table if not exists public.creator_payout_profiles (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id),
  bank_name text not null,
  account_number text not null,
  account_name text not null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (creator_id)
);

create table if not exists public.creator_identity_verifications (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id),
  legal_name text not null,
  nin text not null,
  status text not null default 'pending',
  submitted_at timestamptz not null default now(),
  verified_at timestamptz,
  unique (creator_id)
);

notify pgrst, 'reload schema';
