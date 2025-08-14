-- Criar tabela pousada_rooms
create table if not exists public.pousada_rooms (
  id uuid not null default gen_random_uuid(),
  name text not null,
  type text not null,
  price_refundable numeric(10, 2) not null,
  price_non_refundable numeric(10, 2) not null,
  description text null,
  amenities text[] null,
  max_guests integer null default 2,
  image_url text null,
  available boolean null default true,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint pousada_rooms_pkey primary key (id),
  constraint pousada_rooms_type_check check (
    type = any (array['STANDARD'::text, 'DELUXE'::text, 'SUITE'::text])
  )
) tablespace pg_default;

-- Criar índice para tipo de quarto
create index if not exists idx_pousada_rooms_type 
on public.pousada_rooms using btree (type) tablespace pg_default;

-- Criar índice para disponibilidade
create index if not exists idx_pousada_rooms_available 
on public.pousada_rooms using btree (available) tablespace pg_default;

-- Trigger para atualizar updated_at
create trigger update_pousada_rooms_updated_at 
before update on pousada_rooms 
for each row execute function update_updated_at_column();

-- Habilitar RLS
alter table public.pousada_rooms enable row level security;

-- Política para leitura pública
create policy "Permitir leitura pública de quartos disponíveis" on public.pousada_rooms
  for select using (available = true);

-- Política para administradores
create policy "Permitir acesso total para administradores" on public.pousada_rooms
  for all using (
    exists (
      select 1 from public.user_profiles 
      where user_id = auth.uid() 
      and role = 'admin'::user_role
    )
  );