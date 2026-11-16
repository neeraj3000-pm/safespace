-- SafeSpace: schema for Supabase (paste into SQL editor and run once).
-- Users are anonymous: no auth. All writes come from server routes using the service role key.
-- NOTE: there is deliberately NO column for the raw free text. It is never stored.

create extension if not exists "pgcrypto";

create table if not exists experts (
  id text primary key,
  name text not null,
  gender text not null,
  languages text[] not null,
  specialisations text[] not null,
  life_stages text[] not null,
  style text not null,
  years_experience int not null,
  credential text not null,
  avg_felt_heard numeric(3,2) not null,
  bookings_count int not null,
  slots jsonb not null,
  bio text not null
);

create table if not exists resources (
  id text primary key,
  type text not null,
  title text not null,
  duration text not null,
  concerns text[] not null,
  description text not null
);

create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  chips text[] not null default '{}',
  answers jsonb not null default '{}',
  intensity text,
  path text,
  confidence numeric(3,2),
  used_fallback boolean not null default false,
  risk_layer text,            -- null | 'rules' | 'ai'
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid references checkins(id) on delete cascade,
  expert_ids text[] not null,
  chosen_expert_id text,
  created_at timestamptz not null default now()
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid references checkins(id) on delete cascade,
  expert_id text not null,
  felt_heard int not null check (felt_heard between 1 and 5),
  switch_reason text,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id bigserial primary key,
  session_id text not null,
  name text not null,
  props jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Synthetic past sessions powering /insights (seeded by scripts/seed.ts).
create table if not exists history_sessions (
  id text primary key,
  created_at timestamptz not null,
  reached text[] not null,          -- funnel steps reached
  path text,
  felt_heard int,
  switch_reason text,
  same_expert_s4 boolean,
  edited_chips boolean not null,
  used_fallback boolean not null,
  risk_layer text,
  rerank text,                      -- 'ai' | 'fallback' | null
  rerank_changed_top boolean,
  brief_shared boolean
);

-- Briefs shared with an expert (only with consent). No raw text, no personal details.
create table if not exists briefs (
  id uuid primary key,
  checkin_id uuid references checkins(id) on delete cascade,
  expert_id text not null,
  lines text[] not null,
  source text not null,             -- 'ai' | 'template'
  edited boolean not null default false,
  switch_reason text,               -- set on a switch handover
  slot text,
  intro boolean not null default false,
  created_at timestamptz not null default now()
);

-- Safe to re-run on an older schema.
alter table history_sessions add column if not exists rerank text;
alter table history_sessions add column if not exists rerank_changed_top boolean;
alter table history_sessions add column if not exists brief_shared boolean;

create index if not exists events_name_idx on events(name);
create index if not exists checkins_created_idx on checkins(created_at);

-- Lock tables down: only the service role (server) can read/write.
alter table experts enable row level security;
alter table resources enable row level security;
alter table checkins enable row level security;
alter table matches enable row level security;
alter table feedback enable row level security;
alter table events enable row level security;
alter table history_sessions enable row level security;
alter table briefs enable row level security;
