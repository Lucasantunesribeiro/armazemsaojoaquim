-- Fix: Auth RLS Initialization Plan Issues
-- Replace auth.function() with (select auth.function()) in RLS policies
-- Priority: PERFORMANCE
-- Issue: Policies re-evaluate auth functions for each row causing performance issues

BEGIN;

-- performance_log table policies
DROP POLICY IF EXISTS "performance_log_update_policy" ON public.performance_log;
CREATE POLICY "performance_log_update_policy" ON public.performance_log
    FOR UPDATE USING ((select auth.role()) = 'authenticated'::text);

DROP POLICY IF EXISTS "performance_log_delete_policy" ON public.performance_log;
CREATE POLICY "performance_log_delete_policy" ON public.performance_log
    FOR DELETE USING ((select auth.role()) = 'authenticated'::text);

-- timezone_cache table policies  
DROP POLICY IF EXISTS "timezone_cache_update_policy" ON public.timezone_cache;
CREATE POLICY "timezone_cache_update_policy" ON public.timezone_cache
    FOR UPDATE USING ((select auth.role()) = 'authenticated'::text);

DROP POLICY IF EXISTS "timezone_cache_delete_policy" ON public.timezone_cache;
CREATE POLICY "timezone_cache_delete_policy" ON public.timezone_cache
    FOR DELETE USING ((select auth.role()) = 'authenticated'::text);

-- table_summary_cache table policies
DROP POLICY IF EXISTS "table_summary_cache_update_policy" ON public.table_summary_cache;
CREATE POLICY "table_summary_cache_update_policy" ON public.table_summary_cache
    FOR UPDATE USING ((select auth.role()) = 'authenticated'::text);

DROP POLICY IF EXISTS "table_summary_cache_delete_policy" ON public.table_summary_cache;
CREATE POLICY "table_summary_cache_delete_policy" ON public.table_summary_cache
    FOR DELETE USING ((select auth.role()) = 'authenticated'::text);

-- pousada_rooms table policies
DROP POLICY IF EXISTS "pousada_rooms_admin_full_access" ON public.pousada_rooms;
CREATE POLICY "pousada_rooms_admin_full_access" ON public.pousada_rooms
    FOR ALL USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE (users.id = (select auth.uid())) 
            AND (users.email)::text = 'armazemsaojoaquimoficial@gmail.com'::text
        )
    );

-- cafe_orders table policies
DROP POLICY IF EXISTS "cafe_orders_select_own_or_admin" ON public.cafe_orders;
CREATE POLICY "cafe_orders_select_own_or_admin" ON public.cafe_orders
    FOR SELECT USING (
        ((select auth.jwt()) ->> 'email'::text) = email 
        OR ((select auth.uid())) IN (
            SELECT p.id
            FROM profiles p
            WHERE (p.role)::text = 'admin'::text
        )
    );

-- cafe_products table policies
DROP POLICY IF EXISTS "cafe_products_admin_full_access" ON public.cafe_products;
CREATE POLICY "cafe_products_admin_full_access" ON public.cafe_products
    FOR ALL USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE (users.id = (select auth.uid())) 
            AND (users.email)::text = 'armazemsaojoaquimoficial@gmail.com'::text
        )
    );

-- pousada_bookings table policies
DROP POLICY IF EXISTS "pousada_bookings_select_own_or_admin" ON public.pousada_bookings;
CREATE POLICY "pousada_bookings_select_own_or_admin" ON public.pousada_bookings
    FOR SELECT USING (
        ((select auth.jwt()) ->> 'email'::text) = email 
        OR ((select auth.uid())) IN (
            SELECT p.id
            FROM profiles p
            WHERE (p.role)::text = 'admin'::text
        )
    );

-- audit_logs table policies
DROP POLICY IF EXISTS "audit_logs_admin_read_only" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_read_only" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE (users.id = (select auth.uid())) 
            AND (users.email)::text = 'armazemsaojoaquimoficial@gmail.com'::text
        )
    );

-- admin_users table policies
DROP POLICY IF EXISTS "admin_users_admin_only" ON public.admin_users;
CREATE POLICY "admin_users_admin_only" ON public.admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE (users.id = (select auth.uid())) 
            AND (users.email)::text = 'armazemsaojoaquimoficial@gmail.com'::text
        )
    );

-- menu_items table policies
DROP POLICY IF EXISTS "menu_items_admin_all_access" ON public.menu_items;
CREATE POLICY "menu_items_admin_all_access" ON public.menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE (users.id = (select auth.uid())) 
            AND (users.email)::text = 'armazemsaojoaquimoficial@gmail.com'::text
        )
    );

-- blog_posts table policies
DROP POLICY IF EXISTS "blog_posts_admin_all" ON public.blog_posts;
CREATE POLICY "blog_posts_admin_all" ON public.blog_posts
    FOR ALL USING (is_admin((select auth.uid())));

-- blog_posts_backup table policies
DROP POLICY IF EXISTS "blog_posts_backup_admin_read" ON public.blog_posts_backup;
CREATE POLICY "blog_posts_backup_admin_read" ON public.blog_posts_backup
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE (profiles.id = (select auth.uid())) 
            AND (profiles.role)::text = 'admin'::text
        )
    );

DROP POLICY IF EXISTS "blog_posts_backup_admin_update" ON public.blog_posts_backup;
CREATE POLICY "blog_posts_backup_admin_update" ON public.blog_posts_backup
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE (profiles.id = (select auth.uid())) 
            AND (profiles.role)::text = 'admin'::text
        )
    );

DROP POLICY IF EXISTS "blog_posts_backup_admin_delete" ON public.blog_posts_backup;
CREATE POLICY "blog_posts_backup_admin_delete" ON public.blog_posts_backup
    FOR DELETE USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE (profiles.id = (select auth.uid())) 
            AND (profiles.role)::text = 'admin'::text
        )
    );

-- user_profiles table policies
DROP POLICY IF EXISTS "Allow authenticated users to read own profile" ON public.user_profiles;
CREATE POLICY "Allow authenticated users to read own profile" ON public.user_profiles
    FOR SELECT USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Allow admins to read all profiles" ON public.user_profiles;
CREATE POLICY "Allow admins to read all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM user_profiles user_profiles_1
            WHERE (user_profiles_1.id = (select auth.uid())) 
            AND (user_profiles_1.role = 'admin'::text) 
            AND (user_profiles_1.is_verified = true)
        )
    );

-- profiles table policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (((select auth.uid()) = id) OR is_admin_user());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (((select auth.uid()) = id) OR is_admin_user());

-- Add comments explaining the optimization
COMMENT ON POLICY "performance_log_update_policy" ON public.performance_log IS 
'Optimized RLS policy using (select auth.role()) for better performance';

COMMENT ON POLICY "timezone_cache_update_policy" ON public.timezone_cache IS 
'Optimized RLS policy using (select auth.role()) for better performance';

COMMENT ON POLICY "pousada_rooms_admin_full_access" ON public.pousada_rooms IS 
'Optimized RLS policy using (select auth.uid()) for better performance';

COMMIT;