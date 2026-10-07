create table public.player_private (
  id uuid references auth.users not null primary key,
  nickname text,
  avatar_url text,
  is_anonymous boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.player_private enable row level security;

create policy "Users can view any profile."
  on public.player_private for select
  using ( auth.role() = 'authenticated' or auth.role() = 'anon' );

create policy "Users can update own profile."
  on public.player_private for update
  using ( auth.uid() = id );

create policy "Users can insert own profile."
  on public.player_private for insert
  with check ( auth.uid() = id );

-- Triggers for updated_at
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.player_private
  for each row execute procedure extensions.moddatetime (updated_at);

-- Automáticamente insertar profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.player_private (id, is_anonymous)
  values (new.id, coalesce(new.is_anonymous, false));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
