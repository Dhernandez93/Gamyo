create table public.player_hands (
  room_id char(4) references public.rooms on delete cascade,
  user_id uuid references public.player_private on delete cascade,
  state jsonb not null default '{}'::jsonb,
  primary key (room_id, user_id)
);

alter table public.player_hands enable row level security;

create policy "Users can read own hand"
  on public.player_hands for select
  using ( auth.uid() = user_id );

-- Realtime for player_hands
alter publication supabase_realtime add table public.player_hands;
