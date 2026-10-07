create table public.decks (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  kind text not null,                    -- 'base' | 'expansion'
  owner_id uuid references public.player_private(id), -- null = oficial
  name text not null,
  description text,
  is_adult boolean default true,
  share_slug text unique,                -- gamyo.app/x/{slug}
  published boolean default false,       -- false = borrador privado
  created_at timestamptz default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references public.decks on delete cascade,
  kind text not null,                    -- 'black' | 'white'
  text text not null,
  pick int not null default 1            -- se calcula según la cantidad de "____"
);

-- RLS
alter table public.decks enable row level security;
alter table public.cards enable row level security;

-- Cualquier usuario puede leer los mazos oficiales o publicados, o los suyos
create policy "leer mazos" on public.decks for select using (
  owner_id is null or owner_id = auth.uid() or published
);

-- Cualquier usuario puede leer las cartas de los mazos legibles
create policy "leer cartas" on public.cards for select using (
  exists (select 1 from public.decks where id = cards.deck_id)
);
