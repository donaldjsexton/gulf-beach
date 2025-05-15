create table photo_galleries (
  id uuid default gen_random_uuid() primary key,
  wedding_id uuid references weddings(id) on delete cascade,
  title text not null,
  description text,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table photos (
  id uuid default gen_random_uuid() primary key,
  gallery_id uuid references photo_galleries(id) on delete cascade,
  url text not null,
  thumbnail_url text not null,
  title text,
  description text,
  taken_at timestamp with time zone,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for photo_galleries
alter table photo_galleries enable row level security;

create policy "Enable read access for authenticated users"
  on photo_galleries for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on photo_galleries for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users"
  on photo_galleries for update
  to authenticated
  using (true);

create policy "Enable delete access for authenticated users"
  on photo_galleries for delete
  to authenticated
  using (true);

-- Add RLS policies for photos
alter table photos enable row level security;

create policy "Enable read access for authenticated users"
  on photos for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on photos for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users"
  on photos for update
  to authenticated
  using (true);

create policy "Enable delete access for authenticated users"
  on photos for delete
  to authenticated
  using (true);

-- Create triggers for updated_at
create trigger update_photo_galleries_updated_at
  before update on photo_galleries
  for each row
  execute function update_updated_at_column();

create trigger update_photos_updated_at
  before update on photos
  for each row
  execute function update_updated_at_column(); 