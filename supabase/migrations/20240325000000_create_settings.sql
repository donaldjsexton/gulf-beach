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
alter table public.settings enable row level security;

-- Create policies for settings table
create policy "Public can view settings"
  on public.settings for select
  using (true);

create policy "Admins can manage settings"
  on public.settings for all
  using ( auth.jwt() ->> 'role' = 'ADMIN' );

-- Create trigger for updated_at
create trigger handle_settings_updated_at
  before update on public.settings
  for each row
  execute procedure public.handle_updated_at();

-- Insert default settings
insert into public.settings (
  site_name,
  site_description,
  contact_email,
  contact_phone,
  address,
  facebook_url,
  instagram_url,
  twitter_url
) values (
  'Gulf Beach Weddings',
  'Your premier destination for beach weddings in the Gulf Coast',
  'contact@gulfbeachweddings.com',
  null,
  null,
  null,
  null,
  null
); 