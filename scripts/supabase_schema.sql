-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Public user data)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  avatar_url text,
  xp integer default 0,
  level integer default 1,
  streak integer default 0,
  total_sessions integer default 0,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(username) >= 3)
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. BREATHING SESSIONS
create table public.sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  pattern_id text not null,
  duration_seconds integer not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Sessions
alter table public.sessions enable row level security;

create policy "Users can view own sessions."
  on public.sessions for select
  using ( auth.uid() = user_id );

create policy "Users can insert own sessions."
  on public.sessions for insert
  with check ( auth.uid() = user_id );

-- 3. ACHIEVEMENTS
create table public.user_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  achievement_id text not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, achievement_id)
);

-- RLS for Achievements
alter table public.user_achievements enable row level security;

create policy "Users can view own achievements."
  on public.user_achievements for select
  using ( auth.uid() = user_id );

create policy "Users can insert own achievements."
  on public.user_achievements for insert
  with check ( auth.uid() = user_id );


-- 4. FUNCTION TO HANDLE NEW USER SIGNUP
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, username, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- TRIGGER
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
