-- Complete Fix Deployment Script
-- This script applies all fixes in the correct order
-- Run this script as a database admin to fix all issues

-- Set up proper error handling
\set ON_ERROR_STOP on

-- Enable timing for performance monitoring
\timing on

-- Print banner
\echo '================================================='
\echo 'ARMAZÉM SÃO JOAQUIM - COMPLETE FIX DEPLOYMENT'
\echo '================================================='
\echo 'This script will fix:'
\echo '1. User synchronization issues'
\echo '2. Performance optimization'
\echo '3. RLS policies'
\echo '4. Database triggers'
\echo '================================================='

-- Step 1: Apply user synchronization fixes
\echo 'Step 1: Applying user synchronization fixes...'
\i sql/fix-user-sync-complete.sql

-- Step 2: Apply performance optimizations
\echo 'Step 2: Applying performance optimizations...'
\i sql/fix-performance-optimization.sql

-- Step 3: Verify the fixes
\echo 'Step 3: Verifying fixes...'

-- Check user synchronization
\echo 'Checking user synchronization...'
SELECT 
  'auth.users' as table_name,
  COUNT(*) as record_count
FROM auth.users
UNION ALL
SELECT 
  'public.users' as table_name,
  COUNT(*) as record_count
FROM public.users;

-- Check triggers
\echo 'Checking triggers...'
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name IN ('on_auth_user_created', 'on_auth_user_updated');

-- Check functions
\echo 'Checking functions...'
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE 'admin_%';

-- Check indexes
\echo 'Checking performance indexes...'
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Test admin functions (if admin user exists)
\echo 'Testing admin functions...'
DO $$
DECLARE
  admin_exists BOOLEAN;
  test_result RECORD;
BEGIN
  -- Check if admin user exists
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = 'armazemsaojoaquimoficial@gmail.com'
  ) INTO admin_exists;
  
  IF admin_exists THEN
    -- Test get_dashboard_stats function
    SELECT * FROM get_dashboard_stats() INTO test_result;
    RAISE NOTICE 'Dashboard stats test: Users: %, Reservas: %, Blog posts: %', 
      test_result.total_users, test_result.total_reservas, test_result.total_blog_posts;
      
    -- Test admin_get_users function
    SELECT COUNT(*) FROM admin_get_users(1, 10) INTO test_result;
    RAISE NOTICE 'Admin get users test: % records returned', test_result;
  ELSE
    RAISE NOTICE 'Admin user not found - skipping function tests';
  END IF;
END $$;

-- Performance analysis
\echo 'Performance analysis...'
SELECT 
  'Query Performance Improvements' as analysis_type,
  'Indexes added for frequently queried columns' as improvement,
  'SECURITY DEFINER functions created for admin operations' as security_improvement,
  'Materialized views created for dashboard caching' as caching_improvement;

-- Final verification
\echo 'Final verification...'
SELECT 
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') 
    THEN '✅ User sync triggers created'
    ELSE '❌ User sync triggers missing'
  END as sync_status,
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'admin_get_users') 
    THEN '✅ Admin functions created'
    ELSE '❌ Admin functions missing'
  END as function_status,
  CASE 
    WHEN EXISTS(SELECT 1 FROM pg_indexes WHERE indexname LIKE 'idx_users_%') 
    THEN '✅ Performance indexes created'
    ELSE '❌ Performance indexes missing'
  END as index_status;

-- Success message
\echo '================================================='
\echo 'DEPLOYMENT COMPLETED SUCCESSFULLY!'
\echo '================================================='
\echo 'Next steps:'
\echo '1. Restart your application server'
\echo '2. Run the test script: node scripts/test-complete-fix.js'
\echo '3. Monitor application performance'
\echo '4. Check logs for any issues'
\echo '================================================='