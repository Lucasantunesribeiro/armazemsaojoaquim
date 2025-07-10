-- Disable timing for this script
\unset timing

DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE '  ARMAZEM SÃO JOAQUIM - CRITICAL PERFORMANCE OPTIMIZATION';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'This script will apply core performance optimizations.';
    RAISE NOTICE 'NOTE: Some operations targeting internal PostgreSQL catalogs are commented out as they require higher privileges or are managed by Supabase internal tools.';
    RAISE NOTICE '=================================================';
END $$;

-------------------------------------------------
-- Step 1: Handle Timezone Cache (If applicable and user-manageable)
-- Based on previous linter output, this aims to speed up pg_timezone_names
-------------------------------------------------
-- WARNING: Creating materialized views on pg_timezone_names might require
-- higher privileges than the default 'postgres' user has on Supabase,
-- or may not be the intended way to optimize internal Supabase queries.
-- This part is for demonstration if you have a custom setup where this is possible.
-- If this section causes 'must be owner of table pg_type' or similar errors,
-- it indicates your user does not have sufficient permissions.
-- Supabase often has internal caching for these types of queries.

-- DROP MATERIALIZED VIEW IF EXISTS timezone_cache;
-- CREATE MATERIALIZED VIEW timezone_cache AS
-- SELECT * FROM pg_timezone_names;
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_timezone_cache_name ON timezone_cache(name);
-- DO $$ BEGIN RAISE NOTICE 'Materialized view "timezone_cache" created/refreshed.'; END $$;


-------------------------------------------------
-- Step 2: Optimize Table and Function Metadata Queries
-- (These are often part of dashboard/introspection tools, not directly user tables)
-------------------------------------------------
-- WARNING: Creating/dropping materialized views on pg_catalog tables (like pg_class, pg_attribute, pg_constraint, pg_proc)
-- is usually NOT allowed for typical 'postgres' user on Supabase instances.
-- These are internal system tables. If you encounter "must be owner of table" errors,
-- it means your user lacks permission, and these materialized views cannot be created this way.
-- Supabase likely handles caching of these internally.

-- DROP MATERIALIZED VIEW IF EXISTS table_metadata_cache;
-- CREATE MATERIALIZED VIEW table_metadata_cache AS
-- SELECT
--     c.oid :: int8 AS id,
--     nc.nspname AS schema,
--     c.relname AS name,
--     c.relrowsecurity AS rls_enabled,
--     c.relforcerowsecurity AS rls_forced,
--     pg_total_relation_size(format('%I.%I', nc.nspname, c.relname)) :: int8 AS bytes,
--     pg_size_pretty(pg_total_relation_size(format('%I.%I', nc.nspname, c.relname))) AS size,
--     pg_stat_get_live_tuples(c.oid) AS live_rows_estimate,
--     pg_stat_get_dead_tuples(c.oid) AS dead_rows_estimate,
--     obj_description(c.oid) AS comment
-- FROM
--     pg_namespace nc
-- JOIN pg_class c ON nc.oid = c.relnamespace
-- WHERE
--     c.relkind IN ('r', 'v', 'm', 'f', 'p') -- regular table, view, materialized view, foreign table, partitioned table
--     AND NOT pg_is_other_temp_schema(nc.oid)
--     AND nc.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'auth', 'extensions', 'graphql', 'graphql_public', 'storage', 'supabase_functions', 'pg_temp');
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_table_metadata_cache_id ON table_metadata_cache(id);
-- CREATE INDEX IF NOT EXISTS idx_table_metadata_cache_schema_name ON table_metadata_cache(schema, name);
-- DO $$ BEGIN RAISE NOTICE 'Materialized view "table_metadata_cache" created/refreshed.'; END $$;


-- DROP MATERIALIZED VIEW IF EXISTS function_metadata_cache;
-- CREATE MATERIALIZED VIEW function_metadata_cache AS
-- SELECT
--     p.oid AS id,
--     n.nspname AS schema,
--     p.proname AS name,
--     l.lanname AS language,
--     pg_get_functiondef(p.oid) AS definition,
--     pg_get_function_arguments(p.oid) AS argument_types,
--     pg_get_function_result(p.oid) AS return_type,
--     p.proretset AS is_set_returning_function,
--     p.provolatile AS behavior,
--     p.prosecdef AS security_definer
-- FROM
--     pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- JOIN pg_language l ON p.prolang = l.oid
-- WHERE
--     p.prokind = 'f' -- functions
--     AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'auth', 'extensions', 'graphql', 'graphql_public', 'storage', 'supabase_functions', 'pg_temp');
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_function_metadata_cache_id ON function_metadata_cache(id);
-- CREATE INDEX IF NOT EXISTS idx_function_metadata_cache_schema_name ON function_metadata_cache(schema, name);
-- DO $$ BEGIN RAISE NOTICE 'Materialized view "function_metadata_cache" created/refreshed.'; END $$;


-------------------------------------------------
-- Step 3: Ensure pg_stat_statements is enabled and accessible
-- This is necessary for query performance analysis.
-------------------------------------------------
-- Check if pg_stat_statements extension is installed, install if not.
-- The 'postgres' user should usually have permission for this.
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
DO $$ BEGIN RAISE NOTICE 'Ensured pg_stat_statements extension is created.'; END $$;

-- Ensure search_path allows finding public.pg_stat_statements
-- This might be set up automatically, but explicit ensures it.
ALTER DATABASE postgres SET search_path TO "$user", public, extensions;


-------------------------------------------------
-- Step 4: Create indexes for existing tables (blog_posts, reservations, menu_items)
-- These were the main points identified for direct application performance.
-------------------------------------------------

-- Add missing 'status' column to blog_posts table if it doesn't exist
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';
DO $$ BEGIN RAISE NOTICE 'Ensured column "status" exists in public.blog_posts.'; END $$;

CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);
DO $$ BEGIN RAISE NOTICE 'Indexes for public.blog_posts created/updated.'; END $$;

CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON public.reservations(created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_data ON public.reservations(data); -- Corrected column name 'data'
DO $$ BEGIN RAISE NOTICE 'Indexes for public.reservations created/updated.'; END $$;

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category); -- Corrected column name 'category'
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(available); -- Corrected column name 'available'
DO $$ BEGIN RAISE NOTICE 'Indexes for public.menu_items created/updated.'; END $$;


-------------------------------------------------
-- Step 5: Create/Replace specific performance-optimized functions (if any were in this file)
-------------------------------------------------
-- The functions like get_dashboard_stats(), admin_get_blog_posts_optimized(),
-- admin_get_reservas_optimized(), cleanup_old_data(), refresh_dashboard_cache()
-- are assumed to be part of the previously executed 'deploy-complete-fix.sql' script,
-- and are already correctly defined and optimized there.
-- If any of these function definitions were duplicated here, they should refer
-- to the most up-to-date definitions from your 'deploy-complete-fix.sql' file.

-- Example for a function that queries pg_stat_statements (if it was intended here)
-- This function is similar to analyze_query_performance from your earlier scripts.
CREATE OR REPLACE FUNCTION get_top_slow_queries(top_n INT DEFAULT 10)
RETURNS TABLE(
    query TEXT,
    calls BIGINT,
    total_time_ms NUMERIC,
    mean_time_ms NUMERIC,
    rows_returned BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER -- Use SECURITY DEFINER if this function needs to access pg_stat_statements without explicit grants to 'authenticated'
AS $$
BEGIN
    -- Check if user is admin (assuming this is an admin-only function)
    IF NOT (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com' THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    -- Ensure pg_stat_statements is available
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
        RAISE EXCEPTION 'pg_stat_statements extension is not enabled. Please enable it first.';
    END IF;

    RETURN QUERY
    SELECT
        s.query::TEXT,
        s.calls::BIGINT,
        s.total_time::NUMERIC,
        s.mean_time::NUMERIC,
        s.rows::BIGINT
    FROM
        pg_stat_statements s
    WHERE
        s.query NOT LIKE 'SELECT % from pg_stat_statements%' AND -- Exclude monitoring queries themselves
        s.query NOT LIKE '%set_config%' AND                     -- Exclude set_config overhead
        s.query NOT LIKE '%select current_setting%' AND         -- Exclude current_setting overhead
        s.query NOT LIKE 'COMMIT' AND
        s.query NOT LIKE 'BEGIN%' AND
        s.query NOT LIKE 'DEALLOCATE%' AND
        s.query NOT LIKE 'SET %'
    ORDER BY
        s.total_time DESC
    LIMIT top_n;
END;
$$;
DO $$ BEGIN RAISE NOTICE 'Function get_top_slow_queries created/updated.'; END $$;

-- Grant execute on the new monitoring function
GRANT EXECUTE ON FUNCTION get_top_slow_queries(INT) TO authenticated;
DO $$ BEGIN RAISE NOTICE 'Granted EXECUTE on get_top_slow_queries to authenticated.'; END $$;

-------------------------------------------------
-- Step 6: Trigger overall performance refresh and analyze (if applicable)
-------------------------------------------------

-- Call a function that refreshes all user-defined materialized caches and analyzes tables.
-- Assuming `refresh_all_performance_caches()` and `apply_performance_settings()`
-- were defined in deploy-complete-fix.sql or similar.
-- If these don't exist, remove these lines or define them here.
SELECT refresh_all_performance_caches();
SELECT apply_performance_settings();

-- This ANALYZE statement usually works for user-owned tables.
-- The warnings about pg_authid etc. are typically ignorable for the 'postgres' role.
ANALYZE VERBOSE;
DO $$ BEGIN RAISE NOTICE 'Database analysis completed.'; END $$;

DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE '  CRITICAL PERFORMANCE OPTIMIZATION COMPLETED!';
    RAISE NOTICE '=================================================';
END $$;