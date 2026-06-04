# CreatorLink Impact Missions

Phase 1 MVP for TikTok creator missions: brands create campaign instructions, creators submit TikTok links, reviewers verify requirements, and approved rewards flow into creator wallets.

## Setup

Install dependencies:

```bash
npm install
```

Create a local env file:

```bash
cp .env.example .env.local
```

Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Use the SQL in `database/phase-1-schema.sql` to create the Phase 1 Supabase tables.

## Development

```bash
npm run dev
```

## Checks

```bash
npm run lint
npm run build
```
