-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table
create table public.users (
  id uuid references auth.users on delete cascade,
  email text not null,
  role text not null check (role in ('ADMIN', 'EDITOR')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Create clients table
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  phone text,
  package text not null,
  notes text,
  wedding_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create weddings table
create table public.weddings (
  id uuid default uuid_generate_v4() primary key,
  slug text not null unique,
  title text not null,
  content jsonb not null,
  published boolean default false,
  client_id uuid references public.clients(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add foreign key constraint to clients table
alter table public.clients
  add constraint fk_wedding
  foreign key (wedding_id)
  references public.weddings(id)
  on delete set null;

-- Create blog_posts table
create table public.blog_posts (
  id uuid default uuid_generate_v4() primary key,
  slug text not null unique,
  title text not null,
  content jsonb not null,
  published boolean default false,
  author_id uuid references public.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create settings table
create table public.settings (
  id uuid default uuid_generate_v4() primary key,
  site_name text not null,
  site_description text,
  contact_email text not null,
  contact_phone text,
  address text,
  facebook_url text,
  instagram_url text,
  twitter_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.weddings enable row level security;
alter table public.blog_posts enable row level security;
alter table public.settings enable row level security;

-- Create policies for users table
create policy "Users can view their own profile"
  on public.users for select
  using ( auth.uid() = id );

create policy "Only admins can create users"
  on public.users for insert
  with check ( auth.jwt() ->> 'role' = 'ADMIN' );

create policy "Only admins can update users"
  on public.users for update
  using ( auth.jwt() ->> 'role' = 'ADMIN' );

create policy "Only admins can delete users"
  on public.users for delete
  using ( auth.jwt() ->> 'role' = 'ADMIN' );

-- Create policies for clients table
create policy "Admins can manage all clients"
  on public.clients for all
  using ( auth.jwt() ->> 'role' = 'ADMIN' );

create policy "Editors can view all clients"
  on public.clients for select
  using ( auth.jwt() ->> 'role' in ('ADMIN', 'EDITOR') );

-- Create policies for weddings table
create policy "Admins can manage all weddings"
  on public.weddings for all
  using ( auth.jwt() ->> 'role' = 'ADMIN' );

create policy "Editors can view all weddings"
  on public.weddings for select
  using ( auth.jwt() ->> 'role' in ('ADMIN', 'EDITOR') );

create policy "Public can view published weddings"
  on public.weddings for select
  using ( published = true );

-- Create policies for blog_posts table
create policy "Admins can manage all blog posts"
  on public.blog_posts for all
  using ( auth.jwt() ->> 'role' = 'ADMIN' );

create policy "Editors can view all blog posts"
  on public.blog_posts for select
  using ( auth.jwt() ->> 'role' in ('ADMIN', 'EDITOR') );

create policy "Public can view published blog posts"
  on public.blog_posts for select
  using ( published = true );

-- Create policies for settings table
create policy "Admins can view settings"
  on public.settings for select
  using ( auth.jwt() ->> 'role' = 'ADMIN' );

create policy "Admins can insert settings"
  on public.settings for insert
  with check ( auth.jwt() ->> 'role' = 'ADMIN' );

create policy "Admins can update settings"
  on public.settings for update
  using ( auth.jwt() ->> 'role' = 'ADMIN' );

create policy "Admins can delete settings"
  on public.settings for delete
  using ( auth.jwt() ->> 'role' = 'ADMIN' );

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_users_updated_at
  before update on public.users
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_clients_updated_at
  before update on public.clients
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_weddings_updated_at
  before update on public.weddings
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_blog_posts_updated_at
  before update on public.blog_posts
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_settings_updated_at
  before update on public.settings
  for each row
  execute procedure public.handle_updated_at(); 