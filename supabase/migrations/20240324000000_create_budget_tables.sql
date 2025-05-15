-- Create budget categories table
create table budget_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create expenses table
create table expenses (
  id uuid default gen_random_uuid() primary key,
  wedding_id uuid references weddings(id) on delete cascade,
  category_id uuid references budget_categories(id) on delete set null,
  vendor_id uuid references vendors(id) on delete set null,
  description text not null,
  amount decimal(10,2) not null,
  due_date date,
  status text check (status in ('pending', 'paid', 'overdue')) default 'pending',
  payment_method text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create payments table
create table payments (
  id uuid default gen_random_uuid() primary key,
  expense_id uuid references expenses(id) on delete cascade,
  amount decimal(10,2) not null,
  payment_date date not null,
  payment_method text not null,
  reference_number text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default budget categories
insert into budget_categories (name, description) values
  ('Venue', 'Wedding venue rental and related costs'),
  ('Catering', 'Food and beverage services'),
  ('Photography', 'Photography and videography services'),
  ('Music', 'DJ, band, or other entertainment'),
  ('Attire', 'Wedding attire for the couple'),
  ('Decorations', 'Flowers, centerpieces, and other decorations'),
  ('Transportation', 'Guest and couple transportation'),
  ('Stationery', 'Invitations, programs, and other printed materials'),
  ('Cake', 'Wedding cake and desserts'),
  ('Vendor Tips', 'Gratuities for vendors'),
  ('Other', 'Miscellaneous expenses');

-- Add RLS policies for budget_categories
alter table budget_categories enable row level security;

create policy "Enable read access for authenticated users"
  on budget_categories for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on budget_categories for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users"
  on budget_categories for update
  to authenticated
  using (true);

create policy "Enable delete access for authenticated users"
  on budget_categories for delete
  to authenticated
  using (true);

-- Add RLS policies for expenses
alter table expenses enable row level security;

create policy "Enable read access for authenticated users"
  on expenses for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on expenses for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users"
  on expenses for update
  to authenticated
  using (true);

create policy "Enable delete access for authenticated users"
  on expenses for delete
  to authenticated
  using (true);

-- Add RLS policies for payments
alter table payments enable row level security;

create policy "Enable read access for authenticated users"
  on payments for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on payments for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users"
  on payments for update
  to authenticated
  using (true);

create policy "Enable delete access for authenticated users"
  on payments for delete
  to authenticated
  using (true);

-- Create triggers for updated_at
create trigger update_budget_categories_updated_at
  before update on budget_categories
  for each row
  execute function update_updated_at_column();

create trigger update_expenses_updated_at
  before update on expenses
  for each row
  execute function update_updated_at_column();

create trigger update_payments_updated_at
  before update on payments
  for each row
  execute function update_updated_at_column(); 