
-- Secure materialized views by revoking public access
-- This prevents these views from being exposed via the PostgREST API

-- Revoke all privileges from public role on materialized views
REVOKE ALL ON public.timezone_cache FROM public;
REVOKE ALL ON public.table_metadata_cache FROM public;  
REVOKE ALL ON public.function_metadata_cache FROM public;

-- Grant specific access only to authenticated users and service role
-- Only allow SELECT for authenticated users (if needed for internal operations)
GRANT SELECT ON public.timezone_cache TO authenticated;
GRANT SELECT ON public.table_metadata_cache TO authenticated;
GRANT SELECT ON public.function_metadata_cache TO authenticated;

-- Service role retains full access for administrative purposes
GRANT ALL ON public.timezone_cache TO service_role;
GRANT ALL ON public.table_metadata_cache TO service_role;
GRANT ALL ON public.function_metadata_cache TO service_role;

-- Add comments to document the security restriction
COMMENT ON MATERIALIZED VIEW public.timezone_cache IS 'Internal cache view - API access restricted for security';
COMMENT ON MATERIALIZED VIEW public.table_metadata_cache IS 'Internal metadata cache - API access restricted for security';
COMMENT ON MATERIALIZED VIEW public.function_metadata_cache IS 'Internal function cache - API access restricted for security';
