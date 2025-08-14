-- Fix: Multiple Permissive Policies
-- Consolidate duplicate permissive policies on tables
-- Priority: PERFORMANCE
-- Issue: Multiple permissive policies cause suboptimal query performance

BEGIN;

-- admin_users table: Remove duplicate policy, keep the optimized one
DROP POLICY IF EXISTS "admin_users_admin_only" ON public.admin_users;
-- Keep: admin_users_optimized_policy

-- audit_logs table: Remove duplicate policies, keep the optimized one
DROP POLICY IF EXISTS "audit_logs_admin_read_only" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_system_insert_only" ON public.audit_logs;
-- Keep: audit_logs_optimized_admin_policy (which handles both read and insert)

-- Create unified audit_logs policy for better performance
DROP POLICY IF EXISTS "audit_logs_optimized_admin_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_unified_policy" ON public.audit_logs
    FOR ALL USING (
        (select auth.uid()) IN (
            SELECT p.id
            FROM profiles p
            WHERE (p.role)::text = 'admin'::text
        )
        OR (select auth.role()) = 'service_role'::text
    );

-- blog_posts table: Remove duplicate SELECT policies
DROP POLICY IF EXISTS "blog_posts_public_select" ON public.blog_posts;
-- Keep: blog_posts_admin_all (which handles all operations)

-- Create unified blog_posts policy
DROP POLICY IF EXISTS "blog_posts_admin_all" ON public.blog_posts;
CREATE POLICY "blog_posts_unified_policy" ON public.blog_posts
    FOR ALL USING (
        -- Public can read published posts
        (published = true) 
        OR 
        -- Admins can do everything
        is_admin((select auth.uid()))
    );

-- cafe_products table: Remove multiple SELECT policies
DROP POLICY IF EXISTS "cafe_products_public_read" ON public.cafe_products;
DROP POLICY IF EXISTS "cafe_products_public_read_available" ON public.cafe_products;
-- Keep: cafe_products_admin_full_access (modified)

-- Create unified cafe_products policy
DROP POLICY IF EXISTS "cafe_products_admin_full_access" ON public.cafe_products;
CREATE POLICY "cafe_products_unified_policy" ON public.cafe_products
    FOR ALL USING (
        -- Public can read available products
        (available = true) 
        OR 
        -- Admins can do everything
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE (users.id = (select auth.uid())) 
            AND (users.email)::text = 'armazemsaojoaquimoficial@gmail.com'::text
        )
    );

-- menu_categories table: Remove duplicate SELECT policies
DROP POLICY IF EXISTS "menu_categories_public_read" ON public.menu_categories;
-- Keep: menu_categories_admin_all (modified)

-- Create unified menu_categories policy
DROP POLICY IF EXISTS "menu_categories_admin_all" ON public.menu_categories;
CREATE POLICY "menu_categories_unified_policy" ON public.menu_categories
    FOR ALL USING (
        -- Public can read active categories
        (active = true) 
        OR 
        -- Admins can do everything
        ((select auth.uid())) IN (
            SELECT p.id
            FROM profiles p
            WHERE (p.role)::text = 'admin'::text
        )
    );

-- menu_items table: Remove duplicate SELECT policies
DROP POLICY IF EXISTS "menu_items_public_select" ON public.menu_items;
-- Keep: menu_items_admin_all_access (modified)

-- Create unified menu_items policy
DROP POLICY IF EXISTS "menu_items_admin_all_access" ON public.menu_items;
CREATE POLICY "menu_items_unified_policy" ON public.menu_items
    FOR ALL USING (
        -- Public can read active items
        (active = true) 
        OR 
        -- Admins can do everything
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE (users.id = (select auth.uid())) 
            AND (users.email)::text = 'armazemsaojoaquimoficial@gmail.com'::text
        )
    );

-- pousada_rooms table: Remove multiple SELECT policies
DROP POLICY IF EXISTS "pousada_rooms_public_read_available" ON public.pousada_rooms;
DROP POLICY IF EXISTS "pousada_rooms_public_select" ON public.pousada_rooms;
-- Keep: pousada_rooms_admin_full_access (modified)

-- Create unified pousada_rooms policy
DROP POLICY IF EXISTS "pousada_rooms_admin_full_access" ON public.pousada_rooms;
CREATE POLICY "pousada_rooms_unified_policy" ON public.pousada_rooms
    FOR ALL USING (
        -- Public can read available rooms
        (available = true) 
        OR 
        -- Admins can do everything
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE (users.id = (select auth.uid())) 
            AND (users.email)::text = 'armazemsaojoaquimoficial@gmail.com'::text
        )
    );

-- user_profiles table: Consolidate SELECT policies
DROP POLICY IF EXISTS "Allow authenticated users to read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON public.user_profiles;

-- Create unified user_profiles policy
CREATE POLICY "user_profiles_unified_policy" ON public.user_profiles
    FOR ALL USING (
        -- Users can access their own profile
        ((select auth.uid()) = id)
        OR
        -- Admins can access all profiles
        EXISTS (
            SELECT 1
            FROM user_profiles admin_profile
            WHERE (admin_profile.id = (select auth.uid())) 
            AND (admin_profile.role = 'admin'::text) 
            AND (admin_profile.is_verified = true)
        )
    );

-- Add comments explaining the consolidation
COMMENT ON POLICY "audit_logs_unified_policy" ON public.audit_logs IS 
'Unified policy for audit logs - consolidates multiple permissive policies for better performance';

COMMENT ON POLICY "blog_posts_unified_policy" ON public.blog_posts IS 
'Unified policy for blog posts - allows public read for published posts, admin full access';

COMMENT ON POLICY "cafe_products_unified_policy" ON public.cafe_products IS 
'Unified policy for cafe products - allows public read for available products, admin full access';

COMMENT ON POLICY "menu_categories_unified_policy" ON public.menu_categories IS 
'Unified policy for menu categories - allows public read for active categories, admin full access';

COMMENT ON POLICY "menu_items_unified_policy" ON public.menu_items IS 
'Unified policy for menu items - allows public read for active items, admin full access';

COMMENT ON POLICY "pousada_rooms_unified_policy" ON public.pousada_rooms IS 
'Unified policy for pousada rooms - allows public read for available rooms, admin full access';

COMMENT ON POLICY "user_profiles_unified_policy" ON public.user_profiles IS 
'Unified policy for user profiles - users can access own profile, admins can access all';

COMMIT;