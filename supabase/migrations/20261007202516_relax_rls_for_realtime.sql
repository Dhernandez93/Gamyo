drop policy if exists "Users can view rooms" on public.rooms;
create policy "Users can view rooms"
  on public.rooms for select
  using ( true );

drop policy if exists "Users can read own hand" on public.player_hands;
create policy "Users can read own hand"
  on public.player_hands for select
  using ( true );

alter table public.rooms replica identity full;
alter table public.player_hands replica identity full;
