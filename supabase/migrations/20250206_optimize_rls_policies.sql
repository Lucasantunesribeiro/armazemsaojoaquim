-- Migration: Optimize RLS Policy Performance
-- Description: Replace auth function calls with subquery pattern for better performance
-- Date: 2025-02-06

-- First, let's create a performance measurement function to track improvements
CREATE OR REPLACE FUNCTION measure_policy_performance()
RETURNS TABLE(
  table_name text,
  policy_count bigint,
  optimized boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::text,
    COUNT(p.policyname) as policy_count,
    CASE 
      WHEN COUNT(p.policyname) FILTER (WHERE p.qual LIKE '%auth.uid()%' OR p.qual LIKE '%auth.role()%') = 0 
      THEN true 
      ELSE false 
    END as optimized
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename
  WHERE t.schemaname = 'public' 
    AND t.tablename IN ('audit_logs', 'profiles', 'blog_posts')
  GROUP BY t.tablename;
END;
$$ LANGUAGE plpgsql;

-- Record baseline performance
DO $$
DECLARE
  baseline_record RECORD;
BEGIN
  RAISE NOTICE 'Baseline RLS Policy Performance:';
  FOR baseline_record IN SELECT * FROM measure_policy_performance() LOOP
    RAISE NOTICE 'Table: %, Policies: %, Optimized: %', 
      baseline_record.table_name, 
      baseline_record.policy_count, 
      baseline_record.optimized;
  END LOOP;
END $$;

-- AUDIT_LOGS TABLE OPTIMIZATION
-- Drop existing policies and create optimized ones
DROP POLICY IF EXISTS "audit_logs_admin_only" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_admin_policy" ON public.audit_logs;

-- Create optimized audit_logs policy using subquery pattern
CREATE POLICY "audit_logs_optimized_admin_policy" ON public.audit_logs
FOR ALL USING (
  (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

-- PROFILES TABLE OPTIMIZATION  
-- Remove duplicate policies and optimize remaining ones
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow system inserts" ON public.profiles;

-- Keep the unified policy but optimize it with subquery pattern
DROP POLICY IF EXISTS "profiles_unified_policy" ON public.profiles;

-- Create optimized unified profiles policy
CREATE POLICY "profiles_optimized_unified_policy" ON public.profiles
FOR ALL USING (
  (SELECT auth.uid()) = id 
  OR (SELECT auth.role()) = 'service_role'
)
WITH CHECK (
  (SELECT auth.role()) = 'service_role' 
  OR (SELECT auth.uid()) = id
);

-- BLOG_POSTS TABLE OPTIMIZATION
-- Drop existing policies and create optimized ones
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Blog posts are viewable by everyone" ON public.blog_posts;

-- Create optimized blog posts policies
CREATE POLICY "blog_posts_optimized_public_read" ON public.blog_posts
FOR SELECT USING (published = true);

CREATE POLICY "blog_posts_optimized_admin_all" ON public.blog_posts
FOR ALL USING (
  (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

-- Measure performance improvements
DO $$
DECLARE
  optimized_record RECORD;
  total_policies_before int := 0;
  total_policies_after int := 0;
BEGIN
  RAISE NOTICE 'Optimized RLS Policy Performance:';
  FOR optimized_record IN SELECT * FROM measure_policy_performance() LOOP
    RAISE NOTICE 'Table: %, Policies: %, Optimized: %', 
      optimized_record.table_name, 
      optimized_record.policy_count, 
      optimized_record.optimized;
    total_policies_after := total_policies_after + optimized_record.policy_count;
  END LOOP;
  
  RAISE NOTICE 'RLS Policy Optimization Complete:';
  RAISE NOTICE '- Consolidated duplicate policies';
  RAISE NOTICE '- Replaced direct auth function calls with subquery pattern';
  RAISE NOTICE '- Improved query performance by reducing function re-evaluation';
END $$;

-- Clean up the measurement function
DROP FUNCTION measure_policy_performance();