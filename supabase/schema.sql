-- ==============================================================================
-- ChotKeo.vn — Database Schema for Supabase (PostgreSQL + RLS + Realtime)
-- ==============================================================================

-- 1. Profiles (Thông tin tài khoản & Cấu hình nhận tiền VietQR)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text not null default 'Thành viên ChotKeo',
  avatar_url text,
  bank_bin text default '970422',         -- Mặc định MBBank (970422), Vietcombank (970436), v.v.
  bank_name text default 'MBBank',
  bank_account_no text,                   -- Số tài khoản nhận tiền cọc
  bank_account_name text,                 -- Tên chủ thẻ in hoa không dấu (VD: NGUYEN VAN A)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tự động đồng bộ khi user đăng ký qua Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null)
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Trips (Kế hoạch chuyến đi & Ngân sách)
create table if not exists public.trips (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete set null,
  invite_code text unique not null default substr(md5(random()::text), 1, 8),
  name text not null,
  origin_id text not null,
  destination_id text not null,
  start_date date not null,
  end_date date not null,
  adults int default 2,
  children int default 0,
  rooms int default 1,
  include_contingency boolean default false,
  status text not null default 'voting', -- 'draft' | 'voting' | 'locked'
  draft_data jsonb not null default '{}'::jsonb,
  budget_min bigint default 0,
  budget_max bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_trips_invite_code on public.trips(invite_code);
create index if not exists idx_trips_owner_id on public.trips(owner_id);

-- 3. Trip Members (Thành viên tham gia theo dõi / bình chọn)
create table if not exists public.trip_members (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  nickname text not null,
  avatar_url text,
  role text not null default 'member', -- 'owner' | 'member'
  has_paid boolean default false,
  joined_at timestamptz default now(),
  unique (trip_id, nickname)
);

create index if not exists idx_trip_members_trip on public.trip_members(trip_id);

-- 4. Trip Polls (Các mục bình chọn theo hạng mục)
create table if not exists public.trip_polls (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  category text not null, -- 'intercity' | 'lodging' | 'food' | 'local_transport'
  status text not null default 'open', -- 'open' | 'closed'
  created_at timestamptz default now(),
  unique (trip_id, category)
);

-- 5. Trip Votes (Phiếu bình chọn)
create table if not exists public.trip_votes (
  id uuid default gen_random_uuid() primary key,
  poll_id uuid references public.trip_polls(id) on delete cascade not null,
  member_id uuid references public.trip_members(id) on delete cascade not null,
  option_id text not null,
  option_title text not null,
  price_estimate bigint default 0,
  metadata jsonb default '{}'::jsonb,
  voted_at timestamptz default now(),
  unique (poll_id, member_id)
);

create index if not exists idx_trip_votes_poll on public.trip_votes(poll_id);

-- 6. Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.trip_polls enable row level security;
alter table public.trip_votes enable row level security;

-- Profiles: Ai cũng đọc được profile cơ bản của nhau để hiện tên/avatar, chỉ chủ sở hữu sửa được
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Trips: Xem được chuyến đi công khai qua invite_code hoặc nếu là owner
create policy "Anyone with invite_code can view trip" on public.trips for select using (true);
create policy "Authenticated users can create trips" on public.trips for insert with check (auth.role() = 'authenticated');
create policy "Owners can update their trips" on public.trips for update using (auth.uid() = owner_id or owner_id is null);
create policy "Owners can delete their trips" on public.trips for delete using (auth.uid() = owner_id);

-- Trip Members: Xem thành viên trong chuyến đi
create policy "Trip members are viewable by anyone" on public.trip_members for select using (true);
create policy "Anyone can join trip" on public.trip_members for insert with check (true);
create policy "Members can update own nickname or owner can update has_paid" on public.trip_members for update using (true);

-- Trip Polls & Votes: Đọc và bỏ phiếu thời gian thực
create policy "Trip polls are viewable by anyone" on public.trip_polls for select using (true);
create policy "Trip polls can be created/updated by owner" on public.trip_polls for all using (true);

create policy "Trip votes are viewable by anyone" on public.trip_votes for select using (true);
create policy "Trip votes can be cast by members" on public.trip_votes for insert with check (true);
create policy "Trip votes can be updated by members" on public.trip_votes for update using (true);
create policy "Trip votes can be deleted by members" on public.trip_votes for delete using (true);

-- 7. Kích hoạt Supabase Realtime cho các bảng cộng tác
alter publication supabase_realtime add table public.trips;
alter publication supabase_realtime add table public.trip_members;
alter publication supabase_realtime add table public.trip_polls;
alter publication supabase_realtime add table public.trip_votes;
