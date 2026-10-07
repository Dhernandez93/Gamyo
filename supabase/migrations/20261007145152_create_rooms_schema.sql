create table public.rooms (
  id char(4) primary key,
  host_id uuid references public.player_private not null,
  version integer not null default 1,
  status text not null default 'lobby', -- lobby, playing, finished
  state jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.room_secrets (
  room_id char(4) primary key references public.rooms on delete cascade,
  state jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.rooms enable row level security;
alter table public.room_secrets enable row level security;

-- Policies for rooms
-- Todos los usuarios logueados pueden ver las salas (para unirse o ver el estado)
create policy "Users can view rooms"
  on public.rooms for select
  using ( auth.role() = 'authenticated' or auth.role() = 'anon' );

-- No policies for insert/update/delete on rooms. 
-- The Edge Functions will use the service_role key to bypass RLS and perform mutations.

-- No policies for room_secrets. Only service_role can access.

-- Realtime
alter publication supabase_realtime add table public.rooms;

-- Triggers for updated_at
create trigger handle_updated_at_rooms before update on public.rooms
  for each row execute procedure extensions.moddatetime (updated_at);

create trigger handle_updated_at_room_secrets before update on public.room_secrets
  for each row execute procedure extensions.moddatetime (updated_at);
