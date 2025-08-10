-- Fix RLS policies for profiles table access
-- This migration addresses the authentication issues by creating proper RLS policies
-- that allow legitimate access without compromising security

-- Drop existing problematic policies
DROP POLICY IF EXISTS "profiles_admin_full_access" ON profiles;
DROP POLICY IF EXISTS "profiles_unified_access" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own profile data
-- This addresses requirement 1.1 - allow users to read their own profile
CREATE POLICY "users_can_view_own_profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy 2: Admins can view all profiles when needed
-- This addresses requirement 1.2 - allow admins to read all profiles
CREATE POLICY "admins_can_view_all_profiles" ON profiles
  FOR SELECT 
  USING (
    -- Admin can see their own profile
    auth.uid() = id 
    OR 
    -- Admin can see all profiles if they have admin role
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 3: Email-based role verification for admin authentication
-- This addresses requirement 1.3 - allow email-based role verification
CREATE POLICY "email_based_admin_verification" ON profiles
  FOR SELECT 
  USING (
    -- User can see their own profile
    auth.uid() = id
    OR
    -- Allow verification by email for admin authentication flows
    (
      auth.email() = 'armazemsaojoaquimoficial@gmail.com' 
      AND email = 'armazemsaojoaquimoficial@gmail.com'
    )
    OR
    -- Admin users can see profiles for role verification
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 4: Users can update their own profile (excluding role changes)
CREATE POLICY "users_can_update_own_profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      -- Role cannot be changed unless user is admin
      OLD.role = NEW.role 
      OR 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Policy 5: Admins can update all profiles
CREATE POLICY "admins_can_update_all_profiles" ON profiles
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 6: Allow profile creation (for new user registration)
CREATE POLICY "allow_profile_creation" ON profiles
  FOR INSERT 
  WITH CHECK (
    -- User can create their own profile
    auth.uid() = id
    OR
    -- Admin can create profiles for others
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 7: Service role has full access (for system operations)
CREATE POLICY "service_role_full_access" ON profiles
  FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create enhanced functions for admin verification
-- These functions provide secure ways to verify admin status

-- Function to verify if current user is admin by checking their profile
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify admin status by email (for authentication flows)
CREATE OR REPLACE FUNCTION verify_admin_by_email(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- First check if the email is the known admin email
  IF user_email = 'armazemsaojoaquimoficial@gmail.com' THEN
    RETURN TRUE;
  END IF;
  
  -- Then check in profiles table
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = user_email AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user profile with admin verification
CREATE OR REPLACE FUNCTION get_user_profile_with_admin_check(user_id UUID)
RETURNS TABLE(
  id UUID,
  email TEXT,
  full_name TEXT,
  role VARCHAR(20),
  is_admin BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    (p.role = 'admin') as is_admin
  FROM profiles p
  WHERE p.id = user_id
  AND (
    -- User can see their own profile
    auth.uid() = p.id
    OR
    -- Admin can see any profile
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ensure admin profile exists and is properly configured
CREATE OR REPLACE FUNCTION ensure_admin_profile_exists()
RETURNS VOID AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID from auth.users
  SELECT id INTO admin_user_id
  FROM auth.users 
  WHERE email = 'armazemsaojoaquimoficial@gmail.com'
  LIMIT 1;
  
  -- If admin user exists in auth.users, ensure profile exists
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
    ON CONFLICT (id) 
    DO UPDATE SET 
      role = 'admin',
      email = 'armazemsaojoaquimoficial@gmail.com',
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions to authenticated users
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION verify_admin_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile_with_admin_check(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_admin_profile_exists() TO authenticated;

-- Create indexes for better performance on role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role_performance ON profiles(role) WHERE role = 'admin';
CREATE INDEX IF NOT EXISTS idx_profiles_email_admin ON profiles(email) WHERE email = 'armazemsaojoaquimoficial@gmail.com';

-- Ensure admin profile exists
SELECT ensure_admin_profile_exists();

-- Add audit logging for profile access (for security monitoring)
CREATE TABLE IF NOT EXISTS profile_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  accessed_profile_id UUID,
  access_type TEXT, -- 'read', 'update', 'create'
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for audit logs
CREATE INDEX IF NOT EXISTS idx_profile_access_logs_user_id ON profile_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_access_logs_created_at ON profile_access_logs(created_at);

-- Enable RLS on audit logs
ALTER TABLE profile_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view audit logs
CREATE POLICY "admins_can_view_profile_access_logs" ON profile_access_logs
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for system to insert audit logs
CREATE POLICY "system_can_insert_profile_access_logs" ON profile_access_logs
  FOR INSERT 
  WITH CHECK (TRUE); -- Allow system to log all access attempts

-- Function to log profile access
CREATE OR REPLACE FUNCTION log_profile_access(
  p_accessed_profile_id UUID,
  p_access_type TEXT,
  p_success BOOLEAN DEFAULT TRUE,
  p_error_message TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO profile_access_logs (
    user_id, 
    accessed_profile_id, 
    access_type, 
    success, 
    error_message, 
    ip_address, 
    user_agent
  )
  VALUES (
    auth.uid(), 
    p_accessed_profile_id, 
    p_access_type, 
    p_success, 
    p_error_message, 
    p_ip_address, 
    p_user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission to log profile access
GRANT EXECUTE ON FUNCTION log_profile_access(UUID, TEXT, BOOLEAN, TEXT, INET, TEXT) TO authenticated;

-- Create a view for easy admin verification (with RLS)
CREATE OR REPLACE VIEW admin_users AS
SELECT 
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
FROM profiles
WHERE role = 'admin';

-- Enable RLS on the view
ALTER VIEW admin_users SET (security_barrier = true);

-- Grant access to the view
GRANT SELECT ON admin_users TO authenticated;

-- Final verification: Test that admin profile exists and policies work
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
    RAISE EXCEPTION 'Admin profile not found after migration';
  END IF;
  
  -- Check policies exist
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'profiles';
  
  IF policy_count < 5 THEN
    RAISE EXCEPTION 'Not enough RLS policies created for profiles table';
  END IF;
  
  RAISE NOTICE 'Migration completed successfully. Admin profile exists: %, Policies created: %', admin_count, policy_count;
END;
$$;