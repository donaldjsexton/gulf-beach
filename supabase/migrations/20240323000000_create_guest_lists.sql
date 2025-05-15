create table guest_lists (
  id uuid default gen_random_uuid() primary key,
  wedding_id uuid references weddings(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table guests (
  id uuid default gen_random_uuid() primary key,
  guest_list_id uuid references guest_lists(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  address text,
  dietary_restrictions text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table rsvps (
  id uuid default gen_random_uuid() primary key,
  guest_id uuid references guests(id) on delete cascade,
  status text check (status in ('pending', 'attending', 'declined', 'maybe')) default 'pending',
  plus_one boolean default false,
  plus_one_name text,
  dietary_notes text,
  notes text,
  responded_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table tables (
  id uuid default gen_random_uuid() primary key,
  wedding_id uuid references weddings(id) on delete cascade,
  name text not null,
  capacity integer not null,
  location text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table table_assignments (
  id uuid default gen_random_uuid() primary key,
  table_id uuid references tables(id) on delete cascade,
  guest_id uuid references guests(id) on delete cascade,
  seat_number integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(table_id, guest_id)
);

-- Add RLS policies for guest_lists
alter table guest_lists enable row level security;

create policy "Enable read access for authenticated users"
  on guest_lists for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on guest_lists for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users"
  on guest_lists for update
  to authenticated
  using (true);

create policy "Enable delete access for authenticated users"
  on guest_lists for delete
  to authenticated
  using (true);

-- Add RLS policies for guests
alter table guests enable row level security;

create policy "Enable read access for authenticated users"
  on guests for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on guests for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users"
  on guests for update
  to authenticated
  using (true);

create policy "Enable delete access for authenticated users"
  on guests for delete
  to authenticated
  using (true);

-- Add RLS policies for rsvps
alter table rsvps enable row level security;

create policy "Enable read access for authenticated users"
  on rsvps for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on rsvps for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users"
  on rsvps for update
  to authenticated
  using (true);

create policy "Enable delete access for authenticated users"
  on rsvps for delete
  to authenticated
  using (true);

-- Add RLS policies for tables
alter table tables enable row level security;

create policy "Enable read access for authenticated users"
  on tables for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on tables for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users"
  on tables for update
  to authenticated
  using (true);

create policy "Enable delete access for authenticated users"
  on tables for delete
  to authenticated
  using (true);

-- Add RLS policies for table_assignments
alter table table_assignments enable row level security;

create policy "Enable read access for authenticated users"
  on table_assignments for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on table_assignments for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users"
  on table_assignments for update
  to authenticated
  using (true);

create policy "Enable delete access for authenticated users"
  on table_assignments for delete
  to authenticated
  using (true);

-- Create triggers for updated_at
create trigger update_guest_lists_updated_at
  before update on guest_lists
  for each row
  execute function update_updated_at_column();

create trigger update_guests_updated_at
  before update on guests
  for each row
  execute function update_updated_at_column();

create trigger update_rsvps_updated_at
  before update on rsvps
  for each row
  execute function update_updated_at_column();

create trigger update_tables_updated_at
  before update on tables
  for each row
  execute function update_updated_at_column();

create trigger update_table_assignments_updated_at
  before update on table_assignments
  for each row
  execute function update_updated_at_column(); 