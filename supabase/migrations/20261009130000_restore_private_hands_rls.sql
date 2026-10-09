-- Las manos vuelven a ser privadas: ahora la sincronización usa Broadcast
-- y cada cliente lee solo su propia mano por REST.
drop policy if exists "Users can read own hand" on public.player_hands;
create policy "Users can read own hand"
  on public.player_hands for select
  using ( auth.uid() = user_id );
