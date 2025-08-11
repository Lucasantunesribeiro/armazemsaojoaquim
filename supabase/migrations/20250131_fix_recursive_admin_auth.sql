-- Fix recursive admin authentication issues
-- This migration removes problematic triggers and creates secure admin verification functions

-- ========================================
-- 1. REMOVE PROBLEMATIC TRIGGERS
-- ========================================

-- Drop the problematic trigger that causes recursion
DROP TRIGGER IF EXISTS trigger_prevent_unauthorized_role_change ON profiles;
DROP FUNCTION IF EXISTS prevent_unauthorized_role_change();

-- ========================================
-- 2. CREATE SECURE ADMIN VERIFICATION FUNCTION
-- ========================================

-- Create a simple, secure function to check admin role without triggering RLS
-- This function uses SECURITY DEFINER to bypass RLS restrictions
CREATE OR REPLACE FUNCTION check_admin_role(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Simple check without causing RLS recursion
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check admin by email (for authentication flows)
CREATE OR REPLACE FUNCTION check_admin_by_email(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- First check the known admin email
  IF user_email = 'armazemsaojoaquimoficial@gmail.com' THEN
    RETURN TRUE;
  END IF;
  
  -- Then check profiles table
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE email = user_email AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 3. SIMPLIFY RLS POLICIES
-- ========================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "users_can_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "admins_can_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "email_based_admin_verification" ON profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "admins_can_update_all_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_profile_creation" ON profiles;
DROP POLICY IF EXISTS "service_role_full_access" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create simplified, non-recursive policies
-- Policy 1: Users can read their own profile
CREATE POLICY "profiles_select_own" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Policy 2: Admins can read all profiles (using the secure function)
CREATE POLICY "profiles_select_admin" ON profiles
FOR SELECT USING (check_admin_role());

-- Policy 3: Users can update their own profile (role changes require admin)
CREATE POLICY "profiles_update_own" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Policy 4: Admins can update any profile
CREATE POLICY "profiles_update_admin" ON profiles
FOR UPDATE USING (check_admin_role());

-- Policy 5: Allow profile creation for new users
CREATE POLICY "profiles_insert_own" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy 6: Admins can create profiles for others
CREATE POLICY "profiles_insert_admin" ON profiles
FOR INSERT WITH CHECK (check_admin_role());

-- ========================================
-- 4. SAFE ROLE PROTECTION TRIGGER
-- ========================================

-- Create a safe trigger function to prevent unauthorized role changes
-- This replaces the problematic trigger but is designed to avoid recursion
CREATE OR REPLACE FUNCTION safe_prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check role changes, not other updates
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Use a simple check without causing RLS recursion
    -- Only allow role changes if the current user is already known to be admin
    IF NOT (
      -- Allow if user is updating their own profile and is admin
      (auth.uid() = NEW.id AND OLD.role = 'admin') OR
      -- Allow if email is the known admin email
      auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    ) THEN
      -- Prevent the role change by keeping the old role
      NEW.role := OLD.role;
      -- Log the attempt but don't raise an exception to avoid blocking the update
      RAISE NOTICE 'Role change prevented for user %: only admins can change roles', NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger (this is safe because it doesn't query the profiles table)
CREATE TRIGGER safe_role_protection_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION safe_prevent_role_change();

-- ========================================
-- 5. BLOG POSTS RLS FIX
-- ========================================

-- Fix blog_posts RLS to allow admins to see all posts
DROP POLICY IF EXISTS "blog_posts_select_public" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_select_admin" ON blog_posts;

-- Create policies for blog_posts
CREATE POLICY "blog_posts_select_published" ON blog_posts
FOR SELECT USING (published = true);

CREATE POLICY "blog_posts_select_admin_all" ON blog_posts
FOR SELECT USING (check_admin_role());

CREATE POLICY "blog_posts_manage_admin" ON blog_posts
FOR ALL USING (check_admin_role());

-- ========================================
-- 6. GRANT PERMISSIONS
-- ========================================

-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION check_admin_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_admin_by_email(TEXT) TO authenticated;

-- ========================================
-- 7. ENSURE ADMIN PROFILE EXISTS
-- ========================================

-- Create a safe function to ensure admin profile exists
CREATE OR REPLACE FUNCTION ensure_admin_profile_safe()
RETURNS VOID AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get admin user ID from auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'armazemsaojoaquimoficial@gmail.com'
  LIMIT 1;
  
  -- If admin user exists, ensure profile exists
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (
      admin_user_id,
      'armazemsaojoaquimoficial@gmail.com',
      'Administrador Armazém São Joaquim',
      'admin',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      email = 'armazemsaojoaquimoficial@gmail.com',
      updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to ensure admin profile exists
SELECT ensure_admin_profile_safe();

-- ========================================
-- 8. VERIFICATION
-- ========================================

-- Verify the setup works
DO $$
DECLARE
  admin_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Check admin profile exists
  SELECT COUNT(*) INTO admin_count
  FROM profiles
  WHERE email = 'armazemsaojoaquimoficial@gmail.com' AND role = 'admin';
  
  IF admin_count = 0 THEN
    RAISE WARNING 'Admin profile not found after migration';
  ELSE
    RAISE NOTICE 'Admin profile exists: %', admin_count;
  END IF;
  
  -- Check policies exist
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'profiles';
  
  RAISE NOTICE 'RLS policies created for profiles: %', policy_count;
END;
$$;
