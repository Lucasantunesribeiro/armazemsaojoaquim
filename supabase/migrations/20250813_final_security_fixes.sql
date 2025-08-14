-- Final Security Fixes
-- Fix remaining security and performance issues
-- Priority: CRITICAL/SECURITY

BEGIN;

-- 1. Fix the performance_monitoring view (still has SECURITY DEFINER)
DROP VIEW IF EXISTS public.performance_monitoring CASCADE;

CREATE VIEW public.performance_monitoring AS
SELECT 'performance_log'::text AS table_name,
    count(*) AS record_count,
    max(performance_log.created_at) AS last_updated,
    'logs'::text AS category
FROM performance_log
UNION ALL
SELECT 'timezone_cache'::text AS table_name,
    count(*) AS record_count,
    max(timezone_cache.created_at) AS last_updated,
    'cache'::text AS category
FROM timezone_cache
UNION ALL
SELECT 'table_summary_cache'::text AS table_name,
    count(*) AS record_count,
    max(table_summary_cache.created_at) AS last_updated,
    'cache'::text AS category
FROM table_summary_cache;

-- Grant appropriate permissions
GRANT SELECT ON public.performance_monitoring TO authenticated;
GRANT SELECT ON public.performance_monitoring TO anon;

-- 2. Fix is_admin function - check if it has multiple overloads
SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.proname = 'is_admin';

-- Fix is_admin function with no arguments
ALTER FUNCTION public.is_admin() SET search_path = '';

-- Fix is_admin function with uuid argument (if exists)
DO $$
BEGIN
    -- Try to alter the is_admin(uuid) function
    BEGIN
        ALTER FUNCTION public.is_admin(uuid) SET search_path = '';
        RAISE NOTICE 'Fixed is_admin(uuid) function';
    EXCEPTION
        WHEN undefined_function THEN
            RAISE NOTICE 'is_admin(uuid) function does not exist, skipping';
        WHEN others THEN
            RAISE NOTICE 'Error fixing is_admin(uuid): %', SQLERRM;
    END;
END;
$$;

-- 3. Fix update_user_last_sign_in function - check for overloads
DO $$
BEGIN
    -- Try to alter the update_user_last_sign_in() function (no args)
    BEGIN
        ALTER FUNCTION public.update_user_last_sign_in() SET search_path = '';
        RAISE NOTICE 'Fixed update_user_last_sign_in() function';
    EXCEPTION
        WHEN undefined_function THEN
            RAISE NOTICE 'update_user_last_sign_in() function does not exist, skipping';
        WHEN others THEN
            RAISE NOTICE 'Error fixing update_user_last_sign_in(): %', SQLERRM;
    END;

    -- Try to alter the update_user_last_sign_in(uuid, timestamp) function
    BEGIN
        ALTER FUNCTION public.update_user_last_sign_in(uuid, timestamp with time zone) SET search_path = '';
        RAISE NOTICE 'Fixed update_user_last_sign_in(uuid, timestamp) function';
    EXCEPTION
        WHEN undefined_function THEN
            RAISE NOTICE 'update_user_last_sign_in(uuid, timestamp) function does not exist, skipping';
        WHEN others THEN
            RAISE NOTICE 'Error fixing update_user_last_sign_in(uuid, timestamp): %', SQLERRM;
    END;
END;
$$;

-- Add comments
COMMENT ON VIEW public.performance_monitoring IS 
'Performance monitoring view without SECURITY DEFINER for better security compliance.';

COMMIT;