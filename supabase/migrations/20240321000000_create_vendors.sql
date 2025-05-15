create table vendors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text,
  phone text,
  website text,
  description text,
  category text not null,
  status text check (status in ('active', 'inactive')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table vendors enable row level security;

create policy "Enable read access for authenticated users"
  on vendors for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on vendors for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users"
  on vendors for update
  to authenticated
  using (true);

create policy "Enable delete access for authenticated users"
  on vendors for delete
  to authenticated
  using (true);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_vendors_updated_at
  before update on vendors
  for each row
  execute function update_updated_at_column(); 