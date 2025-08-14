-- Fix: Function Search Path Mutable - Existing Functions Only
-- Add SET search_path = '' to existing public functions with SECURITY DEFINER
-- Priority: CRITICAL
-- Issue: Functions have role mutable search_path

BEGIN;

-- Only alter functions that actually exist in the database
-- Based on the actual function list from pg_proc

-- Core admin functions
DO $$
BEGIN
    -- sync_admin_profile_comprehensive
    ALTER FUNCTION public.sync_admin_profile_comprehensive() SET search_path = '';
    
    -- verify_admin_by_email  
    ALTER FUNCTION public.verify_admin_by_email(text) SET search_path = '';
    
    -- safe_prevent_role_change
    ALTER FUNCTION public.safe_prevent_role_change() SET search_path = '';
    
    -- check_admin_profile_sync_status
    ALTER FUNCTION public.check_admin_profile_sync_status() SET search_path = '';
    
    -- force_admin_profile_sync
    ALTER FUNCTION public.force_admin_profile_sync() SET search_path = '';
    
    -- handle_user_update_with_admin_sync
    ALTER FUNCTION public.handle_user_update_with_admin_sync() SET search_path = '';
    
    -- get_user_profile_with_admin_check
    ALTER FUNCTION public.get_user_profile_with_admin_check(uuid) SET search_path = '';
    
    -- ensure_admin_profile_safe
    ALTER FUNCTION public.ensure_admin_profile_safe() SET search_path = '';
    
    -- ensure_admin_profile_exists
    ALTER FUNCTION public.ensure_admin_profile_exists() SET search_path = '';
    
    -- ensure_admin_profile_exists_with_role
    ALTER FUNCTION public.ensure_admin_profile_exists_with_role() SET search_path = '';

    RAISE NOTICE 'Fixed search_path for admin functions';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error fixing admin functions: %', SQLERRM;
END;
$$;

-- Utility functions
DO $$
BEGIN
    -- get_table_definition_light
    ALTER FUNCTION public.get_table_definition_light(text, text) SET search_path = '';
    
    -- get_table_metadata_fast
    ALTER FUNCTION public.get_table_metadata_fast(text[]) SET search_path = '';
    
    -- cleanup_old_cache_entries
    ALTER FUNCTION public.cleanup_old_cache_entries() SET search_path = '';
    
    -- validate_timezone_fast
    ALTER FUNCTION public.validate_timezone_fast(text) SET search_path = '';
    
    -- refresh_all_caches
    ALTER FUNCTION public.refresh_all_caches() SET search_path = '';
    
    -- update_blog_posts_updated_at
    ALTER FUNCTION public.update_blog_posts_updated_at() SET search_path = '';
    
    -- populate_table_summary_cache
    ALTER FUNCTION public.populate_table_summary_cache() SET search_path = '';

    RAISE NOTICE 'Fixed search_path for utility functions';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error fixing utility functions: %', SQLERRM;
END;
$$;

-- Performance monitoring functions
DO $$
BEGIN
    -- get_cache_performance_stats
    ALTER FUNCTION public.get_cache_performance_stats() SET search_path = '';
    
    -- log_performance_event
    ALTER FUNCTION public.log_performance_event(text, jsonb, integer) SET search_path = '';
    
    -- identify_expensive_queries
    ALTER FUNCTION public.identify_expensive_queries() SET search_path = '';
    
    -- daily_performance_maintenance
    ALTER FUNCTION public.daily_performance_maintenance() SET search_path = '';
    
    -- sync_user_login
    ALTER FUNCTION public.sync_user_login() SET search_path = '';
    
    -- get_optimization_report
    ALTER FUNCTION public.get_optimization_report() SET search_path = '';
    
    -- performance_health_check
    ALTER FUNCTION public.performance_health_check() SET search_path = '';

    RAISE NOTICE 'Fixed search_path for performance functions';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error fixing performance functions: %', SQLERRM;
END;
$$;

COMMIT;