-- Admin Password Reset Function
-- This function allows resetting the admin password when needed

-- Create a function to reset admin password (requires service role)
CREATE OR REPLACE FUNCTION reset_admin_password_direct(
  admin_email TEXT,
  new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  admin_user_id UUID;
  password_hash TEXT;
BEGIN
  -- Only allow for the specific admin email
  IF admin_email != 'armazemsaojoaquimoficial@gmail.com' THEN
    RAISE EXCEPTION 'This function can only be used for the admin email';
  END IF;
  
  -- Find the admin user ID
  SELECT id INTO admin_user_id
  FROM auth.users 
  WHERE email = admin_email
  LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found';
  END IF;
  
  -- Generate password hash using crypt function
  -- Note: This requires the pgcrypto extension
  SELECT crypt(new_password, gen_salt('bf')) INTO password_hash;
  
  -- Update the password in auth.users
  UPDATE auth.users 
  SET 
    encrypted_password = password_hash,
    updated_at = NOW(),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = admin_user_id;
  
  -- Log the password reset
  INSERT INTO auth_logs (
    user_id,
    email,
    action,
    method,
    success,
    error
  ) VALUES (
    admin_user_id,
    admin_email,
    'admin_check',
    'password_reset_function',
    true,
    'Password reset via SQL function'
  );
  
  RETURN TRUE;
END;
$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION reset_admin_password_direct(TEXT, TEXT) TO service_role;

-- Create a simpler function that just confirms the admin user exists and is properly set up
CREATE OR REPLACE FUNCTION ensure_admin_user_setup()
RETURNS TABLE(
  user_exists BOOLEAN,
  user_id UUID,
  email_confirmed BOOLEAN,
  profile_exists BOOLEAN,
  profile_role TEXT,
  recommendations TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  admin_email CONSTANT TEXT := 'armazemsaojoaquimoficial@gmail.com';
  admin_user_id UUID;
  admin_confirmed BOOLEAN := FALSE;
  profile_found BOOLEAN := FALSE;
  profile_role_found TEXT;
  recommendations TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check if admin user exists in auth.users
  SELECT id, email_confirmed_at IS NOT NULL
  INTO admin_user_id, admin_confirmed
  FROM auth.users 
  WHERE email = admin_email
  LIMIT 1;
  
  -- Check if profile exists
  IF admin_user_id IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = admin_user_id), 
           COALESCE((SELECT role FROM profiles WHERE id = admin_user_id), 'none')
    INTO profile_found, profile_role_found;
    
    -- Generate recommendations
    IF NOT admin_confirmed THEN
      recommendations := array_append(recommendations, 'Email needs to be confirmed');
    END IF;
    
    IF NOT profile_found THEN
      recommendations := array_append(recommendations, 'Profile needs to be created');
    ELSIF profile_role_found != 'admin' THEN
      recommendations := array_append(recommendations, 'Profile role needs to be set to admin');
    END IF;
    
    IF array_length(recommendations, 1) IS NULL THEN
      recommendations := array_append(recommendations, 'User setup is complete - check password manually');
    END IF;
  ELSE
    recommendations := array_append(recommendations, 'Admin user needs to be created in Supabase Auth');
  END IF;
  
  RETURN QUERY SELECT 
    admin_user_id IS NOT NULL,
    admin_user_id,
    admin_confirmed,
    profile_found,
    profile_role_found,
    recommendations;
END;
$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION ensure_admin_user_setup() TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_admin_user_setup() TO service_role;

-- Create a function to manually create admin user if needed (service role only)
CREATE OR REPLACE FUNCTION create_admin_user_if_missing()
RETURNS TABLE(
  success BOOLEAN,
  user_id UUID,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  admin_email CONSTANT TEXT := 'armazemsaojoaquimoficial@gmail.com';
  admin_user_id UUID;
  new_user_id UUID;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id
  FROM auth.users 
  WHERE email = admin_email
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, admin_user_id, 'Admin user already exists';
    RETURN;
  END IF;
  
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Insert into auth.users (this is a simplified version - in practice you'd use Supabase Admin API)
  -- Note: This is just for reference - actual user creation should be done via Supabase Admin API
  
  RETURN QUERY SELECT FALSE, NULL::UUID, 'User creation must be done via Supabase Admin API or Dashboard';
END;
$;

-- Grant execute permission to service role only
GRANT EXECUTE ON FUNCTION create_admin_user_if_missing() TO service_role;

-- Add comments for documentation
COMMENT ON FUNCTION reset_admin_password_direct IS 'Resets admin password - requires service role and only works for admin email';
COMMENT ON FUNCTION ensure_admin_user_setup IS 'Checks admin user setup and provides recommendations';
COMMENT ON FUNCTION create_admin_user_if_missing IS 'Helper function to check if admin user creation is needed';