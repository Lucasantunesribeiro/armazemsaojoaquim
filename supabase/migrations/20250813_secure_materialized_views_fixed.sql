-- Fix: Materialized View in API - Fixed Version
-- Remove public access to materialized views for security  
-- Priority: SECURITY
-- Issue: Materialized views are accessible by anon/authenticated roles

BEGIN;

-- Remove access to table_metadata_cache materialized view
REVOKE ALL ON public.table_metadata_cache FROM anon;
REVOKE ALL ON public.table_metadata_cache FROM authenticated;
REVOKE ALL ON public.table_metadata_cache FROM public;

-- Grant access only to postgres and service_role
GRANT SELECT ON public.table_metadata_cache TO postgres;
GRANT SELECT ON public.table_metadata_cache TO service_role;

-- Remove access to function_metadata_cache materialized view  
REVOKE ALL ON public.function_metadata_cache FROM anon;
REVOKE ALL ON public.function_metadata_cache FROM authenticated;
REVOKE ALL ON public.function_metadata_cache FROM public;

-- Grant access only to postgres and service_role
GRANT SELECT ON public.function_metadata_cache TO postgres;
GRANT SELECT ON public.function_metadata_cache TO service_role;

-- Note: Materialized views do not support RLS, so we rely on REVOKE/GRANT for access control

-- Add comments explaining the security restriction
COMMENT ON MATERIALIZED VIEW public.table_metadata_cache IS 
'Materialized view for table metadata. Access restricted to admin users and service role for security. No RLS support for materialized views.';

COMMENT ON MATERIALIZED VIEW public.function_metadata_cache IS 
'Materialized view for function metadata. Access restricted to admin users and service role for security. No RLS support for materialized views.';

-- Optional: Create admin-only functions to access these views if needed by application
CREATE OR REPLACE FUNCTION public.get_table_metadata_admin()
RETURNS SETOF public.table_metadata_cache
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    -- Only allow admin access
    IF NOT EXISTS (
        SELECT 1
        FROM profiles
        WHERE (profiles.id = auth.uid()) 
        AND (profiles.role)::text = 'admin'::text
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    
    RETURN QUERY SELECT * FROM public.table_metadata_cache;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_function_metadata_admin()
RETURNS SETOF public.function_metadata_cache
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    -- Only allow admin access
    IF NOT EXISTS (
        SELECT 1
        FROM profiles
        WHERE (profiles.id = auth.uid()) 
        AND (profiles.role)::text = 'admin'::text
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    
    RETURN QUERY SELECT * FROM public.function_metadata_cache;
END;
$$;

-- Grant execute permission to authenticated users (they will be filtered by the function logic)
GRANT EXECUTE ON FUNCTION public.get_table_metadata_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_function_metadata_admin() TO authenticated;

-- Add comments for the admin functions
COMMENT ON FUNCTION public.get_table_metadata_admin() IS 
'Admin-only function to access table metadata cache. Requires admin role.';

COMMENT ON FUNCTION public.get_function_metadata_admin() IS 
'Admin-only function to access function metadata cache. Requires admin role.';

COMMIT;