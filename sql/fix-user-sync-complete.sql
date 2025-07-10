-- Complete User Synchronization Fix
-- This script addresses the critical gap where auth.users and public.users are not synchronized

-- Step 1: Create or ensure public.users table exists with correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NULL,
  phone VARCHAR(20) NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Step 3: Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, created_at, updated_at, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'phone',
    NEW.created_at,
    NEW.updated_at,
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger to automatically sync new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 5: Create function to handle user updates
CREATE OR REPLACE FUNCTION handle_user_update() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users SET
    email = NEW.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', public.users.name),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', public.users.phone),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger to sync user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_update();

-- Step 7: Sync existing auth.users to public.users
INSERT INTO public.users (id, email, name, phone, created_at, updated_at, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name') as name,
  au.raw_user_meta_data->>'phone' as phone,
  au.created_at,
  au.updated_at,
  CASE 
    WHEN au.email = 'armazemsaojoaquimoficial@gmail.com' THEN 'admin'
    ELSE 'user'
  END as role
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, public.users.name),
  phone = COALESCE(EXCLUDED.phone, public.users.phone),
  updated_at = NOW();

-- Step 8: Update RLS policies for public.users
DROP POLICY IF EXISTS "users_own_data" ON public.users;
DROP POLICY IF EXISTS "users_admin_access" ON public.users;

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for users to access their own data
CREATE POLICY "users_own_data" ON public.users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id);

-- Policy for admin access to all users
CREATE POLICY "users_admin_access" ON public.users
  FOR ALL
  TO authenticated
  USING (auth.email() = 'armazemsaojoaquimoficial@gmail.com');

-- Step 9: Create helper function for admin operations
CREATE OR REPLACE FUNCTION admin_get_users(
  page_num INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  email VARCHAR,
  name VARCHAR,
  phone VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  role VARCHAR,
  total_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  offset_val INTEGER;
  total_users BIGINT;
BEGIN
  -- Check if user is admin
  IF NOT (auth.email() = 'armazemsaojoaquimoficial@gmail.com') THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Calculate offset
  offset_val := (page_num - 1) * page_size;
  
  -- Get total count
  SELECT COUNT(*) INTO total_users FROM public.users;
  
  -- Return paginated results with total count
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.phone,
    u.created_at,
    u.updated_at,
    u.role,
    total_users
  FROM public.users u
  ORDER BY u.created_at DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$;

-- Step 10: Create function to get user count
CREATE OR REPLACE FUNCTION admin_get_users_count()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count BIGINT;
BEGIN
  -- Check if user is admin
  IF NOT (auth.email() = 'armazemsaojoaquimoficial@gmail.com') THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  SELECT COUNT(*) INTO user_count FROM public.users;
  RETURN user_count;
END;
$$;

-- Step 11: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_users(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_users_count() TO authenticated;

-- Step 12: Log completion
DO $$
DECLARE
  user_count BIGINT;
  auth_user_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;
  SELECT COUNT(*) INTO auth_user_count FROM auth.users;
  
  RAISE NOTICE 'User synchronization completed successfully!';
  RAISE NOTICE 'Total auth.users: %', auth_user_count;
  RAISE NOTICE 'Total public.users: %', user_count;
  RAISE NOTICE 'Triggers created: handle_new_user, handle_user_update';
  RAISE NOTICE 'Functions created: admin_get_users, admin_get_users_count';
END $$;