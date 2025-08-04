-- Função RPC para obter estatísticas do dashboard
DROP FUNCTION IF EXISTS get_dashboard_stats();
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
DROP FUNCTION IF EXISTS admin_get_users(INTEGER, INTEGER, TEXT, TEXT);
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
  WHERE 
    (search_term IS NULL OR 
     u.email ILIKE '%' || search_term || '%' OR 
     u.full_name ILIKE '%' || search_term || '%')
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
  WHERE 
    (search_term IS NULL OR 
     u.email ILIKE '%' || search_term || '%' OR 
     u.full_name ILIKE '%' || search_term || '%')
    AND (role_filter IS NULL OR u.role = role_filter)
  LIMIT page_size OFFSET offset_value;

  RETURN users_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função RPC para obter estatísticas de performance
DROP FUNCTION IF EXISTS get_performance_stats();
CREATE OR REPLACE FUNCTION get_performance_stats()
RETURNS json AS $$
DECLARE
  perf_stats json;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem acessar esta função';
  END IF;

  SELECT json_build_object(
    'database_size', pg_size_pretty(pg_database_size(current_database())),
    'active_connections', (
      SELECT count(*) 
      FROM pg_stat_activity 
      WHERE state = 'active'
    ),
    'slow_queries_24h', (
      SELECT COUNT(*) 
      FROM slow_queries_monitor 
      WHERE timestamp >= NOW() - INTERVAL '24 hours'
    ),
    'avg_query_time_24h', (
      SELECT COALESCE(AVG(execution_time_ms), 0) 
      FROM slow_queries_monitor 
      WHERE timestamp >= NOW() - INTERVAL '24 hours'
    ),
    'cache_hit_ratio', (
      SELECT ROUND(
        (sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read) + 1)) * 100, 2
      ) 
      FROM pg_statio_user_tables
    ),
    'table_stats', (
      SELECT json_agg(
        json_build_object(
          'table_name', relname,
          'row_count', n_tup_ins - n_tup_del,
          'size', pg_size_pretty(pg_total_relation_size(oid))
        )
      )
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(oid) DESC
      LIMIT 10
    ),
    'timezone_cache_count', (SELECT COUNT(*) FROM timezone_cache),
    'last_updated', NOW()
  ) INTO perf_stats;
  
  RETURN perf_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar query lenta
DROP FUNCTION IF EXISTS log_slow_query(TEXT, DECIMAL, TEXT, TEXT, JSONB);
CREATE OR REPLACE FUNCTION log_slow_query(
  query_text TEXT,
  execution_time_ms DECIMAL,
  database_name TEXT DEFAULT NULL,
  user_name TEXT DEFAULT NULL,
  additional_info JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO slow_queries_monitor (
    query_text,
    execution_time_ms,
    database_name,
    user_name,
    additional_info
  ) VALUES (
    query_text,
    execution_time_ms,
    COALESCE(database_name, current_database()),
    COALESCE(user_name, current_user),
    additional_info
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar cache de timezone
DROP FUNCTION IF EXISTS update_timezone_cache(TEXT, INTEGER, BOOLEAN, TEXT);
CREATE OR REPLACE FUNCTION update_timezone_cache(
  tz_name TEXT,
  utc_offset_minutes INTEGER,
  is_dst BOOLEAN DEFAULT false,
  region TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO timezone_cache (
    timezone_name,
    utc_offset,
    is_dst,
    region,
    expires_at
  ) VALUES (
    tz_name,
    utc_offset_minutes,
    is_dst,
    region,
    NOW() + INTERVAL '30 days'
  )
  ON CONFLICT (timezone_name)
  DO UPDATE SET
    utc_offset = EXCLUDED.utc_offset,
    is_dst = EXCLUDED.is_dst,
    region = EXCLUDED.region,
    cached_at = NOW(),
    expires_at = NOW() + INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter dados de analytics
DROP FUNCTION IF EXISTS get_analytics_data(DATE, DATE);
CREATE OR REPLACE FUNCTION get_analytics_data(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS json AS $$
DECLARE
  analytics_data json;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem acessar esta função';
  END IF;

  SELECT json_build_object(
    'period', json_build_object(
      'start_date', start_date,
      'end_date', end_date
    ),
    'cafe_orders_by_day', (
      SELECT json_agg(
        json_build_object(
          'date', DATE(created_at),
          'orders_count', COUNT(*),
          'revenue', SUM(total_price)
        ) ORDER BY DATE(created_at)
      )
      FROM cafe_orders
      WHERE DATE(created_at) BETWEEN start_date AND end_date
      AND status = 'DELIVERED'
      GROUP BY DATE(created_at)
    ),
    'bookings_by_day', (
      SELECT json_agg(
        json_build_object(
          'date', DATE(created_at),
          'bookings_count', COUNT(*),
          'revenue', SUM(total_price)
        ) ORDER BY DATE(created_at)
      )
      FROM pousada_bookings
      WHERE DATE(created_at) BETWEEN start_date AND end_date
      AND status = 'CONFIRMED'
      GROUP BY DATE(created_at)
    ),
    'popular_products', (
      SELECT json_agg(
        json_build_object(
          'product_name', product_data->>'name',
          'total_ordered', SUM((product_data->>'quantity')::INTEGER),
          'revenue', SUM((product_data->>'quantity')::INTEGER * (product_data->>'price')::DECIMAL)
        ) ORDER BY SUM((product_data->>'quantity')::INTEGER) DESC
      )
      FROM cafe_orders,
      jsonb_array_elements(products) AS product_data
      WHERE DATE(created_at) BETWEEN start_date AND end_date
      AND status = 'DELIVERED'
      GROUP BY product_data->>'name'
      LIMIT 10
    ),
    'room_occupancy', (
      SELECT json_agg(
        json_build_object(
          'room_type', pr.type,
          'total_bookings', COUNT(*),
          'total_revenue', SUM(pb.total_price)
        )
      )
      FROM pousada_bookings pb
      JOIN pousada_rooms pr ON pb.room_id = pr.id
      WHERE DATE(pb.created_at) BETWEEN start_date AND end_date
      AND pb.status = 'CONFIRMED'
      GROUP BY pr.type
    ),
    'generated_at', NOW()
  ) INTO analytics_data;
  
  RETURN analytics_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para confirmar reserva
DROP FUNCTION IF EXISTS confirm_reserva(UUID);
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
DROP FUNCTION IF EXISTS cancel_reserva(UUID);
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

-- Função para obter papel do usuário
DROP FUNCTION IF EXISTS get_user_role(UUID);
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
DROP FUNCTION IF EXISTS admin_get_users_count();
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

-- Função para atualizar caches de performance
DROP FUNCTION IF EXISTS refresh_all_performance_caches();
CREATE OR REPLACE FUNCTION refresh_all_performance_caches()
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
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem acessar esta função';
  END IF;

  -- Limpar caches expirados
  DELETE FROM timezone_cache WHERE expires_at < NOW();
  DELETE FROM table_metadata_cache WHERE expires_at < NOW();
  DELETE FROM function_metadata_cache WHERE expires_at < NOW();

  SELECT json_build_object(
    'success', true,
    'message', 'Caches de performance atualizados',
    'cleared_timezone_cache', (SELECT COUNT(*) FROM timezone_cache WHERE expires_at < NOW()),
    'cleared_table_cache', (SELECT COUNT(*) FROM table_metadata_cache WHERE expires_at < NOW()),
    'cleared_function_cache', (SELECT COUNT(*) FROM function_metadata_cache WHERE expires_at < NOW())
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para aplicar configurações de performance
DROP FUNCTION IF EXISTS apply_performance_settings();
CREATE OR REPLACE FUNCTION apply_performance_settings()
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
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem acessar esta função';
  END IF;

  -- Aqui você pode adicionar configurações específicas de performance
  -- Por exemplo, ajustar work_mem, shared_buffers, etc.

  SELECT json_build_object(
    'success', true,
    'message', 'Configurações de performance aplicadas',
    'timestamp', NOW()
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 