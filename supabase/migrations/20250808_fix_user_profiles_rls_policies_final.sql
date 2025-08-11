-- Corrigir políticas RLS da tabela user_profiles
-- This migration fixes RLS policies to allow authenticated users to access their profiles

BEGIN;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON user_profiles;

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Allow authenticated users to read own profile" 
ON user_profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Create policy for admins to read all profiles
CREATE POLICY "Allow admins to read all profiles" 
ON user_profiles 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND is_verified = true
  )
);

-- Grant necessary permissions
GRANT SELECT ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;

COMMIT;