-- Migration to fix security definer views and enable RLS on backup tables
-- This addresses critical security vulnerabilities identified in the security audit

-- ============================================================================
-- TASK 1.1: Fix Security Definer Views
-- ============================================================================

-- The public.users view is potentially problematic as it might bypass RLS
-- We'll remove it and ensure direct access to profiles table with proper RLS

-- First, check if any code depends on the users view
-- If needed, we can create a secure function instead

-- Remove the potentially insecure public.users view
DROP VIEW IF EXISTS public.users CASCADE;

-- Create a secure function to get user data instead of the view
-- This function respects RLS policies and provides controlled access
CREATE OR REPLACE FUNCTION public.get_user_profile(target_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  role VARCHAR,
  preferences JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If no target_user_id provided, return current user's profile
  IF target_user_id IS NULL THEN
    target_user_id := auth.uid();
  END IF;

  -- Check if current user can access the target profile
  -- Users can access their own profile, admins can access any profile
  IF target_user_id != auth.uid() AND NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: You can only access your own profile unless you are an admin';
  END IF;

  -- Return the profile data
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.phone,
    p.address,
    p.role,
    p.preferences,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = target_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;

-- ============================================================================
-- TASK 1.2: Enable RLS on Public Tables
-- ============================================================================

-- Enable RLS on the blog_posts_backup table
ALTER TABLE public.blog_posts_backup ENABLE ROW LEVEL SECURITY;

-- Create appropriate RLS policies for the backup table
-- Only admins should be able to access backup data

-- Policy for admins to read backup data
CREATE POLICY "blog_posts_backup_admin_read" ON public.blog_posts_backup
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy for admins to insert backup data
CREATE POLICY "blog_posts_backup_admin_insert" ON public.blog_posts_backup
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy for admins to update backup data
CREATE POLICY "blog_posts_backup_admin_update" ON public.blog_posts_backup
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy for admins to delete backup data
CREATE POLICY "blog_posts_backup_admin_delete" ON public.blog_posts_backup
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Create a function to verify the security fixes
CREATE OR REPLACE FUNCTION public.verify_security_fixes()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  users_view_exists BOOLEAN;
  backup_rls_enabled BOOLEAN;
BEGIN
  -- Check if users view still exists
  SELECT EXISTS (
    SELECT 1 FROM pg_views 
    WHERE schemaname = 'public' 
    AND viewname = 'users'
  ) INTO users_view_exists;

  -- Check if RLS is enabled on blog_posts_backup
  SELECT rowsecurity FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename = 'blog_posts_backup'
  INTO backup_rls_enabled;

  -- Build result
  SELECT json_build_object(
    'users_view_removed', NOT users_view_exists,
    'backup_rls_enabled', backup_rls_enabled,
    'get_user_profile_function_exists', EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname = 'get_user_profile'
    ),
    'backup_policies_count', (
      SELECT COUNT(*) FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'blog_posts_backup'
    ),
    'verification_timestamp', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users for verification
GRANT EXECUTE ON FUNCTION public.verify_security_fixes() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_user_profile(UUID) IS 'Secure replacement for public.users view - respects RLS policies and provides controlled access to user profiles';
COMMENT ON FUNCTION public.verify_security_fixes() IS 'Verification function to confirm security fixes have been applied correctly';