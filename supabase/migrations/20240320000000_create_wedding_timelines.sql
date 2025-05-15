create table wedding_timelines (
  id uuid default gen_random_uuid() primary key,
  wedding_id uuid references weddings(id) on delete cascade,
  title text not null,
  start_time time not null,
  end_time time not null,
  description text,
  location text,
  vendor_id uuid references vendors(id),
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table wedding_timelines enable row level security;

create policy "Enable read access for authenticated users"
  on wedding_timelines for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on wedding_timelines for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users"
  on wedding_timelines for update
  to authenticated
  using (true);

create policy "Enable delete access for authenticated users"
  on wedding_timelines for delete
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
create trigger update_wedding_timelines_updated_at
  before update on wedding_timelines
  for each row
  execute function update_updated_at_column(); 