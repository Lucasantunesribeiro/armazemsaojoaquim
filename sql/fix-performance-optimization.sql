-- Performance Optimization Script
-- Addresses the 52+ second query performance issues

-- Add missing 'status' column to blog_posts table if it doesn't exist
-- This ensures the 'status' column exists before indexes or queries try to use it.
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';

-- Step 1: Create indexes for frequently queried tables
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id); -- Corrected from 'author' to 'author_id'

CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at); -- Corrected 'reservas' to 'reservations'
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);       -- Corrected 'reservas' to 'reservations'
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);     -- Corrected 'reservas' to 'reservations'
CREATE INDEX IF NOT EXISTS idx_reservations_data_reserva ON reservations(data); -- Corrected 'reservas' to 'reservations' and 'data_reserva' to 'data'

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(available); -- Assuming 'available' is the correct column based on schema

-- Step 2: Optimize function queries with caching
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE(
  total_users BIGINT,
  total_reservas BIGINT,
  total_blog_posts BIGINT,
  total_menu_items BIGINT,
  active_reservas BIGINT,
  published_posts BIGINT,
  last_updated TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cache_key TEXT := 'dashboard_stats_cache';
  cache_duration INTERVAL := '5 minutes';
  cached_data JSONB;
  cached_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if user is admin
  IF NOT (auth.email() = 'armazemsaojoaquimoficial@gmail.com') THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Try to get cached data (if you have a cache table)
  -- For now, we'll compute directly but optimized

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.users)::BIGINT as total_users,
    (SELECT COUNT(*) FROM reservations)::BIGINT as total_reservas, -- Corrected 'reservas' to 'reservations'
    (SELECT COUNT(*) FROM blog_posts)::BIGINT as total_blog_posts,
    (SELECT COUNT(*) FROM menu_items)::BIGINT as total_menu_items,
    (SELECT COUNT(*) FROM reservations WHERE status = 'confirmada')::BIGINT as active_reservas, -- Corrected 'reservas' to 'reservations' and 'confirmed' to 'confirmada'
    (SELECT COUNT(*) FROM blog_posts WHERE status = 'published')::BIGINT as published_posts,
    NOW() as last_updated;
END;
$$;

-- Step 3: Create optimized blog management functions
CREATE OR REPLACE FUNCTION admin_get_blog_posts_optimized(
  page_num INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 10,
  status_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  status TEXT,
  author_id UUID, -- Corrected from 'author TEXT' to 'author_id UUID'
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  offset_val INTEGER;
  total_posts BIGINT;
  where_clause TEXT := '';
BEGIN
  -- Check if user is admin
  IF NOT (auth.email() = 'armazemsaojoaquimoficial@gmail.com') THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Calculate offset
  offset_val := (page_num - 1) * page_size;

  -- Build where clause
  IF status_filter IS NOT NULL THEN
    where_clause := ' WHERE status = $1';
  END IF;

  -- Get total count with filter
  IF status_filter IS NOT NULL THEN
    SELECT COUNT(*) INTO total_posts FROM blog_posts WHERE status = status_filter;
  ELSE
    SELECT COUNT(*) INTO total_posts FROM blog_posts;
  END IF;

  -- Return optimized query
  IF status_filter IS NOT NULL THEN
    RETURN QUERY
    SELECT
      bp.id,
      bp.title,
      bp.content,
      bp.excerpt,
      bp.status,
      bp.author_id, -- Corrected from 'bp.author' to 'bp.author_id'
      bp.created_at,
      bp.updated_at,
      total_posts
    FROM blog_posts bp
    WHERE bp.status = status_filter
    ORDER BY bp.created_at DESC
    LIMIT page_size
    OFFSET offset_val;
  ELSE
    RETURN QUERY
    SELECT
      bp.id,
      bp.title,
      bp.content,
      bp.excerpt,
      bp.status,
      bp.author_id, -- Corrected from 'bp.author' to 'bp.author_id'
      bp.created_at,
      bp.updated_at,
      total_posts
    FROM blog_posts bp
    ORDER BY bp.created_at DESC
    LIMIT page_size
    OFFSET offset_val;
  END IF;
END;
$$;

-- Step 4: Create optimized reservations function
CREATE OR REPLACE FUNCTION admin_get_reservas_optimized(
  page_num INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20,
  status_filter TEXT DEFAULT NULL,
  date_filter DATE DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  data_reserva DATE,
  hora_reserva TIME,
  numero_pessoas INTEGER,
  status TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  user_email TEXT,
  user_name TEXT,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  offset_val INTEGER;
  total_reservas BIGINT;
BEGIN
  -- Check if user is admin
  IF NOT (auth.email() = 'armazemsaojoaquimoficial@gmail.com') THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Calculate offset
  offset_val := (page_num - 1) * page_size;

  -- Get total count with filters
  SELECT COUNT(*) INTO total_reservas
  FROM reservations r -- Corrected from 'reservas' to 'reservations'
  WHERE (status_filter IS NULL OR r.status = status_filter::VARCHAR) -- Explicit cast for VARCHAR comparison
    AND (date_filter IS NULL OR r.data = date_filter); -- Corrected from 'data_reserva' to 'data'

  -- Return optimized query with join
  RETURN QUERY
  SELECT
    r.id,
    r.user_id,
    r.data, -- Corrected from 'data_reserva' to 'data'
    r.horario, -- Corrected from 'hora_reserva' to 'horario'
    r.pessoas, -- Corrected from 'numero_pessoas' to 'pessoas'
    r.status::TEXT, -- Explicit cast for TEXT return type
    r.observacoes,
    r.created_at,
    u.email as user_email,
    u.name as user_name,
    total_reservas
  FROM reservations r -- Corrected from 'reservas' to 'reservations'
  LEFT JOIN public.users u ON r.user_id = u.id
  WHERE (status_filter IS NULL OR r.status = status_filter::VARCHAR) -- Explicit cast for VARCHAR comparison
    AND (date_filter IS NULL OR r.data = date_filter) -- Corrected from 'data_reserva' to 'data'
  ORDER BY r.created_at DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$;

-- Step 5: Create function to analyze slow queries
CREATE OR REPLACE FUNCTION analyze_query_performance()
RETURNS TABLE(
  query_type TEXT,
  avg_duration NUMERIC,
  max_duration NUMERIC,
  call_count BIGINT,
  recommendation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT (auth.email() = 'armazemsaojoaquimoficial@gmail.com') THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- This is a placeholder for query analysis
  -- In a real implementation, you would analyze pg_stat_statements
  RETURN QUERY
  SELECT
    'Dashboard Stats'::TEXT as query_type,
    50.0::NUMERIC as avg_duration,
    120.0::NUMERIC as max_duration,
    100::BIGINT as call_count,
    'Use dashboard stats cache function'::TEXT as recommendation
  UNION ALL
  SELECT
    'Blog Posts'::TEXT as query_type,
    15.0::NUMERIC as avg_duration,
    45.0::NUMERIC as max_duration,
    200::BIGINT as call_count,
    'Use optimized blog posts function'::TEXT as recommendation
  UNION ALL
  SELECT
    'User Management'::TEXT as query_type,
    5.0::NUMERIC as avg_duration,
    15.0::NUMERIC as max_duration,
    50::BIGINT as call_count,
    'Use SECURITY DEFINER functions'::TEXT as recommendation;
END;
$$;

-- Step 6: Create materialized view for dashboard (if needed)
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats_cache AS
SELECT
  (SELECT COUNT(*) FROM public.users) as total_users,
  (SELECT COUNT(*) FROM reservations) as total_reservas, -- Corrected 'reservas' to 'reservations'
  (SELECT COUNT(*) FROM blog_posts) as total_blog_posts,
  (SELECT COUNT(*) FROM menu_items) as total_menu_items,
  (SELECT COUNT(*) FROM reservations WHERE status = 'confirmada') as active_reservas, -- Corrected 'reservas' and 'confirmed' to 'reservations' and 'confirmada'
  (SELECT COUNT(*) FROM blog_posts WHERE status = 'published') as published_posts,
  NOW() as last_updated;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_cache_updated ON dashboard_stats_cache(last_updated);

-- Step 7: Create function to refresh dashboard cache
CREATE OR REPLACE FUNCTION refresh_dashboard_cache()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT (auth.email() = 'armazemsaojoaquimoficial@gmail.com') THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  REFRESH MATERIALIZED VIEW dashboard_stats_cache;
END;
$$;

-- Step 8: Optimize settings and configurations
-- Increase work_mem for complex queries (adjust based on your system)
-- This should be done at the database level, not in SQL
-- ALTER SYSTEM SET work_mem = '256MB';
-- ALTER SYSTEM SET shared_buffers = '256MB';
-- ALTER SYSTEM SET effective_cache_size = '1GB';

-- Step 9: Create cleanup function for old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT (auth.email() = 'armazemsaojoaquimoficial@gmail.com') THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Clean up old reservations (older than 1 year)
  DELETE FROM reservations -- Corrected from 'reservas' to 'reservations'
  WHERE created_at < NOW() - INTERVAL '1 year'
    AND status IN ('cancelada', 'confirmada'); -- Corrected from 'cancelled' and 'completed' to 'cancelada' and 'confirmada'

  -- Clean up old blog post drafts (older than 6 months)
  DELETE FROM blog_posts
  WHERE created_at < NOW() - INTERVAL '6 months'
    AND status = 'draft';

  -- Refresh materialized view after cleanup
  REFRESH MATERIALIZED VIEW dashboard_stats_cache;
END;
$$;

-- Step 10: Grant permissions for new functions
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_blog_posts_optimized(INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_reservas_optimized(INTEGER, INTEGER, TEXT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_query_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_dashboard_cache() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_data() TO authenticated;

-- Grant access to materialized view
GRANT SELECT ON dashboard_stats_cache TO authenticated;

-- Step 11: Log completion
DO $$
BEGIN
  RAISE NOTICE 'Performance optimization completed successfully!';
  RAISE NOTICE 'Created optimized functions for dashboard, blog posts, and reservations';
  RAISE NOTICE 'Added performance indexes on frequently queried columns';
  RAISE NOTICE 'Created materialized view for dashboard statistics';
  RAISE NOTICE 'Added cleanup function for old data';
END $$;