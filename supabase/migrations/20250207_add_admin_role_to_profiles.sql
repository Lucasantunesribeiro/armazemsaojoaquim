-- Add role column to profiles table for admin authentication
-- This migration ensures the profiles table has proper admin role support

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' NOT NULL;

-- Add full_name column if it doesn't exist (for better user management)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Create index for performance on role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add check constraint to ensure valid roles
ALTER TABLE profiles
ADD CONSTRAINT IF NOT EXISTS check_valid_role CHECK (role IN ('user', 'admin', 'moderator'));

-- Update existing profiles to have the 'user' role where null
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- Ensure the admin user exists and has admin role
-- First, try to update existing profile
UPDATE profiles 
SET role = 'admin', full_name = 'Administrador Armazém São Joaquim'
WHERE email = 'armazemsaojoaquimoficial@gmail.com';

-- If no profile exists for admin email, we'll handle this in the application code
-- since we need the user to exist in auth.users first

-- Create a function to check if a user is admin by email
CREATE OR REPLACE FUNCTION is_admin_by_email(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = user_email AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a user is admin by ID
CREATE OR REPLACE FUNCTION is_admin_by_id(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to ensure admin profile exists
CREATE OR REPLACE FUNCTION ensure_admin_profile(
  admin_id UUID,
  admin_email TEXT,
  admin_name TEXT DEFAULT 'Administrador Armazém São Joaquim'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (admin_id, admin_email, admin_name, 'admin', NOW(), NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    role = 'admin',
    full_name = COALESCE(admin_name, profiles.full_name),
    email = admin_email,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Policy for users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy for admins to read all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for users to update their own profile (excluding role changes)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    (OLD.role = NEW.role OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ))
  );

-- Policy for profile creation (typically handled by triggers)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a trigger to prevent unauthorized role changes
CREATE OR REPLACE FUNCTION prevent_unauthorized_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed
  IF OLD.role != NEW.role THEN
    -- Check if the user making the change is admin
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      -- If not admin, keep the old role
      NEW.role := OLD.role;
      RAISE NOTICE 'Role change prevented: Only admins can change user roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_prevent_unauthorized_role_change ON profiles;
CREATE TRIGGER trigger_prevent_unauthorized_role_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_unauthorized_role_change();

-- Create admin activity log table for audit trail
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for admin activity logs
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON admin_activity_logs(action);

-- Enable RLS on admin activity logs
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all activity logs
CREATE POLICY "Admins can view all activity logs" ON admin_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to insert activity logs
CREATE POLICY "Admins can insert activity logs" ON admin_activity_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO admin_activity_logs (
    admin_id, action, resource_type, resource_id, details, ip_address, user_agent
  )
  VALUES (
    auth.uid(), p_action, p_resource_type, p_resource_id, p_details, p_ip_address, p_user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT ON admin_activity_logs TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_by_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_admin_profile(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_activity(TEXT, TEXT, TEXT, JSONB, INET, TEXT) TO authenticated;