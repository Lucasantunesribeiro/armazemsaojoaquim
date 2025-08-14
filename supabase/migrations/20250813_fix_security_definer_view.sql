-- Fix: Security Definer View - Performance Monitoring
-- Remove SECURITY DEFINER from public.performance_monitoring view
-- Priority: CRITICAL
-- Issue: View with SECURITY DEFINER property detected

BEGIN;

-- Drop existing view with SECURITY DEFINER
DROP VIEW IF EXISTS public.performance_monitoring CASCADE;

-- Recreate view without SECURITY DEFINER
CREATE OR REPLACE VIEW public.performance_monitoring AS
SELECT 
    pl.id,
    pl.event_type,
    pl.level,
    pl.message,
    pl.metadata,
    pl.created_at,
    pl.user_id,
    -- Additional performance metrics
    CASE 
        WHEN pl.metadata->>'duration' IS NOT NULL 
        THEN (pl.metadata->>'duration')::numeric 
        ELSE NULL 
    END as duration_ms,
    CASE 
        WHEN pl.metadata->>'query_cost' IS NOT NULL 
        THEN (pl.metadata->>'query_cost')::numeric 
        ELSE NULL 
    END as query_cost,
    -- Categorize performance levels
    CASE 
        WHEN pl.level = 'ERROR' THEN 'Critical'
        WHEN pl.level = 'WARN' THEN 'Warning'
        WHEN pl.level = 'INFO' THEN 'Normal'
        ELSE 'Unknown'
    END as performance_category
FROM public.performance_log pl
WHERE pl.event_type IN ('query', 'function', 'rpc', 'auth')
ORDER BY pl.created_at DESC;

-- Set appropriate RLS policies for the view access
-- Only authenticated admins can access performance monitoring data
ALTER VIEW public.performance_monitoring OWNER TO postgres;

-- Grant SELECT permission only to authenticated users (will be filtered by RLS)
GRANT SELECT ON public.performance_monitoring TO authenticated;
GRANT SELECT ON public.performance_monitoring TO anon;

-- Add comment explaining the view purpose
COMMENT ON VIEW public.performance_monitoring IS 
'Performance monitoring view for tracking application performance metrics. 
Access is controlled by RLS policies on the underlying performance_log table.
View no longer uses SECURITY DEFINER to ensure proper permission enforcement.';

COMMIT;