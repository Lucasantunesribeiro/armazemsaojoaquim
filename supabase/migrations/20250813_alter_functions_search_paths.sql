-- Fix: Function Search Path Mutable - Alter Existing Functions
-- Add SET search_path = '' to all public functions with SECURITY DEFINER
-- Priority: CRITICAL
-- Issue: Functions have role mutable search_path

BEGIN;

-- Apply ALTER FUNCTION to set search_path for all functions
-- This approach preserves function signatures and just adds security

-- Critical admin functions
ALTER FUNCTION public.sync_admin_profile_comprehensive() SET search_path = '';
ALTER FUNCTION public.verify_admin_by_email(text) SET search_path = '';
ALTER FUNCTION public.safe_prevent_role_change() SET search_path = '';

-- Admin check functions  
ALTER FUNCTION public.check_admin_profile_sync_status() SET search_path = '';
ALTER FUNCTION public.force_admin_profile_sync() SET search_path = '';
ALTER FUNCTION public.handle_user_update_with_admin_sync() SET search_path = '';
ALTER FUNCTION public.get_user_profile_with_admin_check() SET search_path = '';
ALTER FUNCTION public.ensure_admin_profile_safe() SET search_path = '';
ALTER FUNCTION public.ensure_admin_profile_exists() SET search_path = '';
ALTER FUNCTION public.ensure_admin_profile_exists_with_role() SET search_path = '';

-- Utility functions
ALTER FUNCTION public.get_table_definition_light(text, text) SET search_path = '';
ALTER FUNCTION public.get_table_metadata_fast(text[]) SET search_path = '';
ALTER FUNCTION public.cleanup_old_cache_entries() SET search_path = '';
ALTER FUNCTION public.validate_timezone_fast() SET search_path = '';
ALTER FUNCTION public.refresh_all_caches() SET search_path = '';
ALTER FUNCTION public.update_blog_posts_updated_at() SET search_path = '';
ALTER FUNCTION public.populate_table_summary_cache() SET search_path = '';

-- Performance monitoring functions
ALTER FUNCTION public.get_cache_performance_stats() SET search_path = '';
ALTER FUNCTION public.log_performance_event() SET search_path = '';
ALTER FUNCTION public.identify_expensive_queries() SET search_path = '';
ALTER FUNCTION public.daily_performance_maintenance() SET search_path = '';
ALTER FUNCTION public.sync_user_login() SET search_path = '';
ALTER FUNCTION public.get_optimization_report() SET search_path = '';
ALTER FUNCTION public.performance_health_check() SET search_path = '';

COMMIT;