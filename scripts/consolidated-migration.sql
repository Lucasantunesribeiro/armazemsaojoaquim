-- MIGRAÇÃO CONSOLIDADA PARA CORRIGIR TODOS OS ERROS
-- Execute este script no SQL Editor do Supabase

-- 1. PRIMEIRO: Dropar funções existentes que podem ter conflito
DROP FUNCTION IF EXISTS get_dashboard_stats();
DROP FUNCTION IF EXISTS admin_get_users(INTEGER, INTEGER, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_performance_stats();
DROP FUNCTION IF EXISTS log_slow_query(TEXT, DECIMAL, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS update_timezone_cache(TEXT, INTEGER, BOOLEAN, TEXT);
DROP FUNCTION IF EXISTS get_analytics_data(DATE, DATE);
DROP FUNCTION IF EXISTS confirm_reserva(UUID);
DROP FUNCTION IF EXISTS cancel_reserva(UUID);
DROP FUNCTION IF EXISTS get_user_role(UUID);
DROP FUNCTION IF EXISTS admin_get_users_count();
DROP FUNCTION IF EXISTS refresh_all_performance_caches();
DROP FUNCTION IF EXISTS apply_performance_settings();

-- 2. Dropar view users se existir
DROP VIEW IF EXISTS users;

-- 3. Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  role VARCHAR(20) DEFAULT 'user' NOT NULL,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Adicionar coluna role se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE profiles ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL;
  END IF;
END $$;

-- 5. Criar view users como alias para profiles
CREATE OR REPLACE VIEW users AS SELECT * FROM profiles;

-- 6. Criar tabelas que estão faltando
-- Tabela de quartos da pousada
CREATE TABLE IF NOT EXISTS pousada_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('STANDARD', 'DELUXE', 'SUITE')),
  price_refundable DECIMAL(10,2) NOT NULL,
  price_non_refundable DECIMAL(10,2) NOT NULL,
  description TEXT,
  amenities TEXT[],
  max_guests INTEGER DEFAULT 2,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de reservas da pousada
CREATE TABLE IF NOT EXISTS pousada_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES pousada_rooms(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  is_refundable BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de produtos do café
CREATE TABLE IF NOT EXISTS cafe_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('CAFE', 'SORVETE', 'DOCE', 'SALGADO', 'BEBIDA')),
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de pedidos do café
CREATE TABLE IF NOT EXISTS cafe_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  products JSONB NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de galeria de arte
CREATE TABLE IF NOT EXISTS art_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('SANTA_TERESA_HISTORICA', 'RIO_ANTIGO', 'ARTE_CONTEMPORANEA', 'RETRATOS_BAIRRO')),
  dimensions TEXT,
  year_created INTEGER,
  historical_context TEXT,
  stock_quantity INTEGER DEFAULT 1,
  featured BOOLEAN DEFAULT false,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de pedidos de arte
CREATE TABLE IF NOT EXISTS art_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  art_item_id UUID REFERENCES art_gallery(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabelas de cache e monitoramento
CREATE TABLE IF NOT EXISTS timezone_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timezone_name TEXT UNIQUE NOT NULL,
  utc_offset INTEGER NOT NULL,
  is_dst BOOLEAN DEFAULT false,
  region TEXT,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW() + INTERVAL '30 days') NOT NULL
);

CREATE TABLE IF NOT EXISTS slow_queries_monitor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query_text TEXT NOT NULL,
  execution_time_ms DECIMAL(10,3) NOT NULL,
  database_name TEXT,
  user_name TEXT,
  additional_info JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Criar funções RPC corrigidas
-- Função RPC para obter estatísticas do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json AS $$
DECLARE
  stats json;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'admin_users', (SELECT COUNT(*) FROM profiles WHERE role = 'admin'),
    'total_rooms', (SELECT COUNT(*) FROM pousada_rooms),
    'available_rooms', (SELECT COUNT(*) FROM pousada_rooms WHERE available = true),
    'total_bookings', (SELECT COUNT(*) FROM pousada_bookings),
    'active_bookings', (SELECT COUNT(*) FROM pousada_bookings WHERE status = 'CONFIRMED'),
    'pending_bookings', (SELECT COUNT(*) FROM pousada_bookings WHERE status = 'PENDING'),
    'total_products', (SELECT COUNT(*) FROM cafe_products),
    'available_products', (SELECT COUNT(*) FROM cafe_products WHERE available = true),
    'total_orders', (SELECT COUNT(*) FROM cafe_orders),
    'pending_orders', (SELECT COUNT(*) FROM cafe_orders WHERE status IN ('PENDING', 'PREPARING')),
    'completed_orders', (SELECT COUNT(*) FROM cafe_orders WHERE status = 'DELIVERED'),
    'revenue_today', (
      SELECT COALESCE(SUM(total_price), 0) 
      FROM cafe_orders 
      WHERE status = 'DELIVERED' 
      AND DATE(created_at) = CURRENT_DATE
    ),
    'revenue_month', (
      SELECT COALESCE(SUM(total_price), 0) 
      FROM cafe_orders 
      WHERE status = 'DELIVERED' 
      AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    ),
    'bookings_revenue_month', (
      SELECT COALESCE(SUM(total_price), 0) 
      FROM pousada_bookings 
      WHERE status = 'CONFIRMED' 
      AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    ),
    'slow_queries_count', (SELECT COUNT(*) FROM slow_queries_monitor WHERE timestamp >= NOW() - INTERVAL '24 hours'),
    'last_updated', NOW()
  ) INTO stats;
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função RPC para admins obterem lista de usuários
CREATE OR REPLACE FUNCTION admin_get_users(
  page_size INTEGER DEFAULT 20,
  page_number INTEGER DEFAULT 1,
  search_term TEXT DEFAULT NULL,
  role_filter TEXT DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  users_data json;
  total_count INTEGER;
  offset_value INTEGER;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem acessar esta função';
  END IF;

  offset_value := (page_number - 1) * page_size;

  -- Contar total de usuários (com filtros aplicados)
  SELECT COUNT(*) INTO total_count
  FROM profiles u
  LEFT JOIN auth.users au ON u.id = au.id
  WHERE (search_term IS NULL OR u.email ILIKE '%' || search_term || '%' OR u.full_name ILIKE '%' || search_term || '%')
    AND (role_filter IS NULL OR u.role = role_filter);

  -- Obter dados dos usuários
  SELECT json_build_object(
    'users', json_agg(
      json_build_object(
        'id', u.id,
        'email', u.email,
        'full_name', u.full_name,
        'role', u.role,
        'phone', u.phone,
        'avatar_url', u.avatar_url,
        'created_at', u.created_at,
        'updated_at', u.updated_at,
        'last_sign_in_at', au.last_sign_in_at,
        'email_confirmed_at', au.email_confirmed_at
      ) ORDER BY u.created_at DESC
    ),
    'pagination', json_build_object(
      'page', page_number,
      'page_size', page_size,
      'total_count', total_count,
      'total_pages', CEIL(total_count::DECIMAL / page_size)
    )
  ) INTO users_data
  FROM profiles u
  LEFT JOIN auth.users au ON u.id = au.id
  WHERE (search_term IS NULL OR u.email ILIKE '%' || search_term || '%' OR u.full_name ILIKE '%' || search_term || '%')
    AND (role_filter IS NULL OR u.role = role_filter)
  LIMIT page_size OFFSET offset_value;

  RETURN users_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter papel do usuário
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para contar usuários (admin)
CREATE OR REPLACE FUNCTION admin_get_users_count()
RETURNS INTEGER AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem acessar esta função';
  END IF;

  RETURN (SELECT COUNT(*) FROM profiles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para confirmar reserva
CREATE OR REPLACE FUNCTION confirm_reserva(reserva_id UUID)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem confirmar reservas';
  END IF;

  UPDATE reservas 
  SET status = 'CONFIRMED', updated_at = NOW() 
  WHERE id = reserva_id;

  IF FOUND THEN
    SELECT json_build_object(
      'success', true,
      'message', 'Reserva confirmada com sucesso'
    ) INTO result;
  ELSE
    SELECT json_build_object(
      'success', false,
      'message', 'Reserva não encontrada'
    ) INTO result;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para cancelar reserva
CREATE OR REPLACE FUNCTION cancel_reserva(reserva_id UUID)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem cancelar reservas';
  END IF;

  UPDATE reservas 
  SET status = 'CANCELLED', updated_at = NOW() 
  WHERE id = reserva_id;

  IF FOUND THEN
    SELECT json_build_object(
      'success', true,
      'message', 'Reserva cancelada com sucesso'
    ) INTO result;
  ELSE
    SELECT json_build_object(
      'success', false,
      'message', 'Reserva não encontrada'
    ) INTO result;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Habilitar RLS nas novas tabelas
ALTER TABLE pousada_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE pousada_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_orders ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas RLS básicas
-- Políticas para pousada_rooms
CREATE POLICY "Todos podem ver quartos disponíveis" ON pousada_rooms
  FOR SELECT USING (available = true);

CREATE POLICY "Apenas admins podem gerenciar quartos" ON pousada_rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para cafe_products
CREATE POLICY "Todos podem ver produtos do café" ON cafe_products
  FOR SELECT USING (available = true);

CREATE POLICY "Apenas admins podem gerenciar produtos do café" ON cafe_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para art_gallery
CREATE POLICY "Todos podem ver arte disponível" ON art_gallery
  FOR SELECT USING (available = true);

CREATE POLICY "Apenas admins podem gerenciar galeria" ON art_gallery
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 10. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pousada_bookings_dates ON pousada_bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_pousada_rooms_type ON pousada_rooms(type);
CREATE INDEX IF NOT EXISTS idx_cafe_products_category ON cafe_products(category);
CREATE INDEX IF NOT EXISTS idx_cafe_orders_date ON cafe_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_art_gallery_category ON art_gallery(category);
CREATE INDEX IF NOT EXISTS idx_art_gallery_featured ON art_gallery(featured);

-- FIM DA MIGRAÇÃO CONSOLIDADA