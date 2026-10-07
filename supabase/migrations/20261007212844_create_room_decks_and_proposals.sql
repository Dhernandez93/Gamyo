-- Expansiones en la partida
create table public.room_decks (
  room_id char(4) references public.rooms on delete cascade,
  deck_id uuid references public.decks,
  source text not null,                  -- 'host' (al crear la sala) | 'vote' (aprobada en el lobby)
  approved_at timestamptz default now(),
  primary key (room_id, deck_id)
);

create table public.deck_proposals (
  id uuid primary key default gen_random_uuid(),
  room_id char(4) references public.rooms on delete cascade,
  deck_id uuid references public.decks,
  proposed_by uuid references public.player_private,
  status text not null default 'open',   -- open | approved | rejected | expired
  closes_at timestamptz not null,
  created_at timestamptz default now()
);

create table public.deck_votes (
  proposal_id uuid references public.deck_proposals on delete cascade,
  user_id uuid references public.player_private,
  approve boolean not null,
  primary key (proposal_id, user_id)
);

-- RLS
alter table public.room_decks enable row level security;
alter table public.deck_proposals enable row level security;
alter table public.deck_votes enable row level security;

-- Cualquier usuario puede ver las expansiones de las salas
create policy "leer room_decks" on public.room_decks for select using (true);
create policy "leer deck_proposals" on public.deck_proposals for select using (true);
create policy "leer deck_votes" on public.deck_votes for select using (true);

-- Solo service role (edge functions) mutan estas tablas.
