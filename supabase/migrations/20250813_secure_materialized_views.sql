-- Fix: Materialized View in API
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

-- Add RLS to materialized views for extra security
ALTER TABLE public.table_metadata_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.function_metadata_cache ENABLE ROW LEVEL SECURITY;

-- Create restrictive RLS policies - only allow service role and admin access
CREATE POLICY "table_metadata_cache_admin_only" ON public.table_metadata_cache
    FOR ALL USING (
        (select auth.role()) = 'service_role'::text
        OR 
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE (profiles.id = (select auth.uid())) 
            AND (profiles.role)::text = 'admin'::text
        )
    );

CREATE POLICY "function_metadata_cache_admin_only" ON public.function_metadata_cache
    FOR ALL USING (
        (select auth.role()) = 'service_role'::text
        OR 
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE (profiles.id = (select auth.uid())) 
            AND (profiles.role)::text = 'admin'::text
        )
    );

-- Add comments explaining the security restriction
COMMENT ON TABLE public.table_metadata_cache IS 
'Materialized view for table metadata. Access restricted to admin users and service role for security.';

COMMENT ON TABLE public.function_metadata_cache IS 
'Materialized view for function metadata. Access restricted to admin users and service role for security.';

COMMENT ON POLICY "table_metadata_cache_admin_only" ON public.table_metadata_cache IS 
'Security policy - restricts access to admin users and service role only';

COMMENT ON POLICY "function_metadata_cache_admin_only" ON public.function_metadata_cache IS 
'Security policy - restricts access to admin users and service role only';

COMMIT;