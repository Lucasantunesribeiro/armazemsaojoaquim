-- Migration: Consolidate Duplicate RLS Policies
-- Description: Remove duplicate permissive policies and consolidate them for better performance
-- Date: 2025-02-06

-- Function to measure policy count before consolidation
CREATE OR REPLACE FUNCTION measure_policy_consolidation()
RETURNS TABLE(
  table_name text,
  policy_count bigint,
  duplicate_policies text[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::text,
    COUNT(p.policyname) as policy_count,
    ARRAY_AGG(p.policyname) as duplicate_policies
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename
  WHERE t.schemaname = 'public' 
    AND t.tablename IN ('cafe_products', 'pousada_rooms', 'cafe_orders', 'pousada_bookings', 'profiles')
  GROUP BY t.tablename
  HAVING COUNT(p.policyname) > 1;
END;
$$ LANGUAGE plpgsql;

-- Record baseline policy counts
DO $$
DECLARE
  baseline_record RECORD;
BEGIN
  RAISE NOTICE 'Baseline Policy Counts Before Consolidation:';
  FOR baseline_record IN SELECT * FROM measure_policy_consolidation() LOOP
    RAISE NOTICE 'Table: %, Policies: %, Names: %', 
      baseline_record.table_name, 
      baseline_record.policy_count, 
      baseline_record.duplicate_policies;
  END LOOP;
END $$;

-- CAFE_PRODUCTS TABLE CONSOLIDATION
-- Remove duplicate policies and create unified ones
DROP POLICY IF EXISTS "Todos podem ver produtos do café" ON public.cafe_products;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar produtos do café" ON public.cafe_products;

-- Create consolidated cafe_products policy
CREATE POLICY "cafe_products_unified_policy" ON public.cafe_products
FOR SELECT USING (available = true)
WITH CHECK (
  (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

CREATE POLICY "cafe_products_admin_management" ON public.cafe_products
FOR ALL USING (
  (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

-- POUSADA_ROOMS TABLE CONSOLIDATION
-- Remove duplicate policies and create unified ones
DROP POLICY IF EXISTS "Todos podem ver quartos disponíveis" ON public.pousada_rooms;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar quartos" ON public.pousada_rooms;

-- Create consolidated pousada_rooms policy
CREATE POLICY "pousada_rooms_unified_policy" ON public.pousada_rooms
FOR SELECT USING (available = true)
WITH CHECK (
  (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

CREATE POLICY "pousada_rooms_admin_management" ON public.pousada_rooms
FOR ALL USING (
  (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

-- CAFE_ORDERS TABLE CONSOLIDATION
-- Remove duplicate policies and create unified ones
DROP POLICY IF EXISTS "Usuários podem criar pedidos" ON public.cafe_orders;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios pedidos" ON public.cafe_orders;
DROP POLICY IF EXISTS "Apenas admins podem atualizar pedidos" ON public.cafe_orders;

-- Create consolidated cafe_orders policies
CREATE POLICY "cafe_orders_insert_policy" ON public.cafe_orders
FOR INSERT WITH CHECK (true);

CREATE POLICY "cafe_orders_unified_select_policy" ON public.cafe_orders
FOR SELECT USING (
  auth.jwt() ->> 'email' = email 
  OR (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

CREATE POLICY "cafe_orders_admin_update_policy" ON public.cafe_orders
FOR UPDATE USING (
  (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

-- POUSADA_BOOKINGS TABLE CONSOLIDATION
-- Remove duplicate policies and create unified ones
DROP POLICY IF EXISTS "Usuários podem criar reservas" ON public.pousada_bookings;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias reservas" ON public.pousada_bookings;
DROP POLICY IF EXISTS "Apenas admins podem atualizar reservas" ON public.pousada_bookings;

-- Create consolidated pousada_bookings policies
CREATE POLICY "pousada_bookings_insert_policy" ON public.pousada_bookings
FOR INSERT WITH CHECK (true);

CREATE POLICY "pousada_bookings_unified_select_policy" ON public.pousada_bookings
FOR SELECT USING (
  auth.jwt() ->> 'email' = email 
  OR (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

CREATE POLICY "pousada_bookings_admin_update_policy" ON public.pousada_bookings
FOR UPDATE USING (
  (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

-- MENU_CATEGORIES TABLE CONSOLIDATION
-- Remove duplicate policies and create unified ones
DROP POLICY IF EXISTS "Todos podem ver categorias ativas" ON public.menu_categories;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar categorias" ON public.menu_categories;

-- Create consolidated menu_categories policy
CREATE POLICY "menu_categories_unified_policy" ON public.menu_categories
FOR SELECT USING (active = true)
WITH CHECK (
  (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

CREATE POLICY "menu_categories_admin_management" ON public.menu_categories
FOR ALL USING (
  (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

-- MENU_ITEMS TABLE CONSOLIDATION
-- Remove duplicate policies and create unified ones
DROP POLICY IF EXISTS "Todos podem ver itens disponíveis" ON public.menu_items;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar itens" ON public.menu_items;

-- Create consolidated menu_items policy
CREATE POLICY "menu_items_unified_policy" ON public.menu_items
FOR SELECT USING (available = true)
WITH CHECK (
  (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

CREATE POLICY "menu_items_admin_management" ON public.menu_items
FOR ALL USING (
  (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

-- RESERVAS TABLE CONSOLIDATION
-- Remove duplicate policies and create unified ones
DROP POLICY IF EXISTS "Usuários podem criar reservas" ON public.reservas;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias reservas" ON public.reservas;
DROP POLICY IF EXISTS "Apenas admins podem atualizar reservas" ON public.reservas;

-- Create consolidated reservas policies
CREATE POLICY "reservas_insert_policy" ON public.reservas
FOR INSERT WITH CHECK (true);

CREATE POLICY "reservas_unified_select_policy" ON public.reservas
FOR SELECT USING (
  auth.jwt() ->> 'email' = email 
  OR (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

CREATE POLICY "reservas_admin_update_policy" ON public.reservas
FOR UPDATE USING (
  (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

-- CONTACT_MESSAGES TABLE CONSOLIDATION
-- Remove duplicate policies and create unified ones
DROP POLICY IF EXISTS "Usuários podem criar mensagens" ON public.contact_messages;
DROP POLICY IF EXISTS "Apenas admins podem ver mensagens" ON public.contact_messages;

-- Create consolidated contact_messages policies
CREATE POLICY "contact_messages_insert_policy" ON public.contact_messages
FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_messages_admin_select_policy" ON public.contact_messages
FOR SELECT USING (
  (SELECT auth.uid()) IN (
    SELECT p.id 
    FROM profiles p 
    WHERE p.role = 'admin'
  )
);

-- USERS TABLE CONSOLIDATION (if it exists)
-- Remove duplicate policies and create unified ones
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer usuário" ON public.users;

-- Create consolidated users policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    EXECUTE 'CREATE POLICY "users_unified_self_policy" ON public.users
    FOR ALL USING (
      (SELECT auth.uid()) = id 
      OR (SELECT auth.uid()) IN (
        SELECT p.id 
        FROM profiles p 
        WHERE p.role = ''admin''
      )
    )';
  END IF;
END $$;

-- Record final policy counts
DO $$
DECLARE
  final_record RECORD;
  total_policies_before int := 0;
  total_policies_after int := 0;
BEGIN
  RAISE NOTICE 'Final Policy Counts After Consolidation:';
  
  -- Count policies for each table
  FOR final_record IN 
    SELECT 
      t.tablename::text as table_name,
      COUNT(p.policyname) as policy_count
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename
    WHERE t.schemaname = 'public' 
      AND t.tablename IN ('cafe_products', 'pousada_rooms', 'cafe_orders', 'pousada_bookings', 'profiles', 'menu_categories', 'menu_items', 'reservas', 'contact_messages', 'users')
    GROUP BY t.tablename
  LOOP
    RAISE NOTICE 'Table: %, Policies: %', 
      final_record.table_name, 
      final_record.policy_count;
    total_policies_after := total_policies_after + final_record.policy_count;
  END LOOP;
  
  RAISE NOTICE 'Policy Consolidation Complete:';
  RAISE NOTICE '- Removed duplicate permissive policies';
  RAISE NOTICE '- Consolidated multiple policies into unified policies';
  RAISE NOTICE '- Optimized using subquery pattern for auth functions';
  RAISE NOTICE '- Total policies after consolidation: %', total_policies_after;
END $$;

-- Clean up the measurement function
DROP FUNCTION measure_policy_consolidation();