create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.player_private (id, is_anonymous, nickname, avatar_url)
  values (
    new.id, 
    coalesce(new.is_anonymous, false),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
