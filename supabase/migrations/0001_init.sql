-- Polling App core schema for Supabase
-- Run via Supabase SQL editor or CLI (e.g., supabase db push)

-- Extensions
create extension if not exists pgcrypto with schema public;

-- 1) Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references public.profiles(id) on delete cascade,
  question text not null check (char_length(question) between 5 and 500),
  slug text unique,
  is_open boolean not null default true,
  open_at timestamptz not null default now(),
  close_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 120),
  idx int not null,
  created_at timestamptz not null default now(),
  unique (poll_id, idx)
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  anon_token text,
  created_at timestamptz not null default now(),
  check (user_id is not null or anon_token is not null),
  unique (poll_id, user_id),
  unique (poll_id, anon_token)
);

-- 1.5) Backfill columns for existing installations (if earlier simplified schema exists)
alter table public.polls
  add column if not exists owner uuid,
  add column if not exists slug text,
  add column if not exists is_open boolean default true,
  add column if not exists open_at timestamptz default now(),
  add column if not exists close_at timestamptz,
  add column if not exists created_at timestamptz default now();

-- ensure FK on owner exists
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'polls'
      and constraint_name = 'polls_owner_fkey'
  ) then
    alter table public.polls
      add constraint polls_owner_fkey foreign key (owner)
      references public.profiles(id) on delete cascade;
  end if;
end$$;

-- 2) Indexes
create index if not exists idx_votes_poll on public.votes(poll_id);
create index if not exists idx_votes_option on public.votes(option_id);
create index if not exists idx_poll_options_poll_idx on public.poll_options(poll_id, idx);
create index if not exists idx_polls_owner on public.polls(owner);

-- 3) Enable RLS
alter table public.profiles enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.votes enable row level security;

-- 4) Policies
-- profiles
create policy profiles_read_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_insert_self on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id);

-- polls visibility and ownership
create policy polls_select_public_or_owner on public.polls
  for select using (
    is_open or (auth.uid() is not null and owner = auth.uid())
  );
create policy polls_insert_owner on public.polls
  for insert with check (owner = auth.uid());
create policy polls_update_owner on public.polls
  for update using (owner = auth.uid());
create policy polls_delete_owner on public.polls
  for delete using (owner = auth.uid());

-- poll options follow poll visibility; writes owner-only
create policy options_select_public on public.poll_options
  for select using (
    exists (
      select 1 from public.polls p where p.id = poll_id and (p.is_open or p.owner = auth.uid())
    )
  );
create policy options_write_owner on public.poll_options
  for all using (
    exists (select 1 from public.polls p where p.id = poll_id and p.owner = auth.uid())
  ) with check (
    exists (select 1 from public.polls p where p.id = poll_id and p.owner = auth.uid())
  );

-- votes readable to poll viewers; insert restricted (one per user/token) while poll open
create policy votes_select_viewers on public.votes
  for select using (
    exists (select 1 from public.polls p where p.id = poll_id and (p.is_open or p.owner = auth.uid()))
  );

create policy votes_insert_once on public.votes
  for insert with check (
    -- poll is open
    exists (
      select 1 from public.polls p
      where p.id = poll_id and coalesce(p.is_open, true) = true
        and (p.close_at is null or now() <= p.close_at)
        and now() >= p.open_at
    )
    and
    -- option belongs to poll
    exists (
      select 1 from public.poll_options o
      where o.id = option_id and o.poll_id = poll_id
    )
    and
    -- enforce one vote per user or token
    (
      (auth.uid() is not null and user_id = auth.uid()
        and not exists (select 1 from public.votes v where v.poll_id = poll_id and v.user_id = auth.uid()))
      or
      (auth.uid() is null and anon_token is not null
        and not exists (select 1 from public.votes v where v.poll_id = poll_id and v.anon_token = anon_token))
    )
  );

-- 5) Results view
create or replace view public.poll_results as
  select v.poll_id, v.option_id, count(*)::bigint as votes
  from public.votes v
  group by v.poll_id, v.option_id;

grant select on public.poll_results to anon, authenticated;

-- 6) RPC: vote_once for atomic insert
create or replace function public.vote_once(p_poll_id uuid, p_option_id uuid, p_anon_token text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_user uuid := auth.uid();
begin
  -- Validate poll is open
  if not exists (
    select 1 from public.polls p
    where p.id = p_poll_id and coalesce(p.is_open, true) = true
      and (p.close_at is null or now() <= p.close_at)
      and now() >= p.open_at
  ) then
    raise exception 'poll_closed' using errcode = 'P0001';
  end if;

  -- Validate option belongs to poll
  if not exists (
    select 1 from public.poll_options o where o.id = p_option_id and o.poll_id = p_poll_id
  ) then
    raise exception 'invalid_option' using errcode = 'P0002';
  end if;

  -- Enforce one vote per user/token
  if v_user is not null then
    if exists (select 1 from public.votes v where v.poll_id = p_poll_id and v.user_id = v_user) then
      raise exception 'already_voted' using errcode = '23505';
    end if;
  else
    if p_anon_token is null then
      raise exception 'missing_token' using errcode = '22023';
    end if;
    if exists (select 1 from public.votes v where v.poll_id = p_poll_id and v.anon_token = p_anon_token) then
      raise exception 'already_voted' using errcode = '23505';
    end if;
  end if;

  insert into public.votes (poll_id, option_id, user_id, anon_token)
  values (p_poll_id, p_option_id, v_user, case when v_user is null then p_anon_token else null end)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.vote_once(uuid, uuid, text) from public;
grant execute on function public.vote_once(uuid, uuid, text) to anon, authenticated;
