-- Fix: Public Access to API Tables
-- Correct RLS policies that broke public access
-- Priority: CRITICAL - Application broken

BEGIN;

-- Fix menu_items policy - Allow public read for available items, admin via profiles table
DROP POLICY IF EXISTS "menu_items_unified_policy" ON public.menu_items;

-- Create separate policies instead of unified one
CREATE POLICY "menu_items_public_read" ON public.menu_items
    FOR SELECT USING (available = true);

CREATE POLICY "menu_items_admin_all" ON public.menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1
            FROM profiles p
            WHERE (p.id = (select auth.uid())) 
            AND (p.role)::text = 'admin'::text
        )
    );

-- Fix cafe_products policy - Same issue with auth.users
DROP POLICY IF EXISTS "cafe_products_unified_policy" ON public.cafe_products;

CREATE POLICY "cafe_products_public_read" ON public.cafe_products
    FOR SELECT USING (available = true);

CREATE POLICY "cafe_products_admin_all" ON public.cafe_products
    FOR ALL USING (
        EXISTS (
            SELECT 1
            FROM profiles p
            WHERE (p.id = (select auth.uid())) 
            AND (p.role)::text = 'admin'::text
        )
    );

-- Fix pousada_rooms policy - Same issue with auth.users
DROP POLICY IF EXISTS "pousada_rooms_unified_policy" ON public.pousada_rooms;

CREATE POLICY "pousada_rooms_public_read" ON public.pousada_rooms
    FOR SELECT USING (available = true);

CREATE POLICY "pousada_rooms_admin_all" ON public.pousada_rooms
    FOR ALL USING (
        EXISTS (
            SELECT 1
            FROM profiles p
            WHERE (p.id = (select auth.uid())) 
            AND (p.role)::text = 'admin'::text
        )
    );

-- Fix menu_categories policy - Allow public read without admin check
DROP POLICY IF EXISTS "menu_categories_unified_policy" ON public.menu_categories;

CREATE POLICY "menu_categories_public_read" ON public.menu_categories
    FOR SELECT USING (true);

CREATE POLICY "menu_categories_admin_all" ON public.menu_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1
            FROM profiles p
            WHERE (p.id = (select auth.uid())) 
            AND (p.role)::text = 'admin'::text
        )
    );

-- Fix blog_posts policy - Allow public read for published
DROP POLICY IF EXISTS "blog_posts_unified_policy" ON public.blog_posts;

CREATE POLICY "blog_posts_public_read" ON public.blog_posts
    FOR SELECT USING (published = true);

CREATE POLICY "blog_posts_admin_all" ON public.blog_posts
    FOR ALL USING (is_admin((select auth.uid())));

-- Add comments explaining the fix
COMMENT ON POLICY "menu_items_public_read" ON public.menu_items IS 
'Allows anonymous users to read available menu items without auth.users access';

COMMENT ON POLICY "cafe_products_public_read" ON public.cafe_products IS 
'Allows anonymous users to read available cafe products without auth.users access';

COMMENT ON POLICY "pousada_rooms_public_read" ON public.pousada_rooms IS 
'Allows anonymous users to read available pousada rooms without auth.users access';

COMMENT ON POLICY "menu_categories_public_read" ON public.menu_categories IS 
'Allows anonymous users to read all menu categories';

COMMENT ON POLICY "blog_posts_public_read" ON public.blog_posts IS 
'Allows anonymous users to read published blog posts';

COMMIT;