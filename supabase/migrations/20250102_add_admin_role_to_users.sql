-- Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have the 'user' role
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Add check constraint to ensure valid roles
ALTER TABLE users
ADD CONSTRAINT check_valid_role CHECK (role IN ('user', 'admin', 'moderator'));

-- Set the admin user
UPDATE users 
SET role = 'admin' 
WHERE email = 'armazemsaojoaquim@gmail.com';

-- Create a function to check if a user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for admin access
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Policy for admins to read all user data
CREATE POLICY "Admins can view all profiles" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to update all user data
CREATE POLICY "Admins can update all profiles" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for users to update their own data
-- Note: Role changes are handled by the trigger below
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create a trigger to prevent role changes for non-admin users
CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed
  IF OLD.role != NEW.role THEN
    -- Check if the user making the change is admin
    IF NOT EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      -- If not admin, keep the old role
      NEW.role := OLD.role;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_prevent_role_change ON users;
CREATE TRIGGER trigger_prevent_role_change
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_change();