create table if not exists brand_wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  mission_id uuid references missions(id),
  amount_cents integer not null,
  type text not null check (type in ('deposit', 'campaign_funding', 'refund')),
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  paystack_reference text unique,
  created_at timestamptz not null default now()
);

create index if not exists brand_wallet_transactions_brand_id_idx on brand_wallet_transactions (brand_id);
