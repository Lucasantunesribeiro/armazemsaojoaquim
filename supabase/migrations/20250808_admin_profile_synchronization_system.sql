-- Admin Profile Synchronization System
-- This migration implements a comprehensive system to automatically sync admin profiles
-- between auth.users and public.profiles tables, ensuring admin access is always available

-- Requirements addressed:
-- 5.1: Implement function to automatically sync admin profile between auth.users and profiles
-- 5.2: Create trigger to ensure admin profile exists when admin user is created/updated
-- 5.3: Add function to ensure admin profile exists with correct role
-- 5.4: Test synchronization works for admin user creation and updates

-- ============================================================================
-- 1. Enhanced Admin Profile Synchronization Function
-- ============================================================================

-- Function to sync admin profile between auth.users and profiles
-- This addresses requirement 5.1
CREATE OR REPLACE FUNCTION sync_admin_profile_comprehensive()
RETURNS TRIGGER AS $
DECLARE
  admin_email CONSTANT TEXT := 'armazemsaojoaquimoficial@gmail.com';
  admin_full_name CONSTANT TEXT := 'Administrador Armazém São Joaquim';
  profile_exists BOOLEAN := FALSE;
BEGIN
  -- Only process if this is the admin user
  IF NEW.email = admin_email THEN
    
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.id) INTO profile_exists;
    
    -- Insert or update the admin profile
    INSERT INTO public.profiles (
      id, 
      email, 
      full_name, 
      role,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        admin_full_name
      ),
      'admin',
      COALESCE(NEW.created_at, NOW()),
      NOW()
    )
    ON CONFLICT (id) 
    DO UPDATE SET 
      email = EXCLUDED.email,
      full_name = COALESCE(
        EXCLUDED.full_name, 
        profiles.full_name,
        admin_full_name
      ),
      role = 'admin', -- Always ensure admin role
      updated_at = NOW();
    
    -- Log the synchronization
    RAISE NOTICE 'Admin profile synchronized for user ID: %, Email: %, Profile existed: %', 
      NEW.id, NEW.email, profile_exists;
      
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. Function to Ensure Admin Profile Exists with Correct Role
-- ============================================================================

-- Function to ensure admin profile exists with correct role
-- This addresses requirement 5.3
CREATE OR REPLACE FUNCTION ensure_admin_profile_exists_with_role()
RETURNS TABLE(
  success BOOLEAN,
  user_id UUID,
  email TEXT,
  role TEXT,
  action_taken TEXT
) AS $
DECLARE
  admin_email CONSTANT TEXT := 'armazemsaojoaquimoficial@gmail.com';
  admin_full_name CONSTANT TEXT := 'Administrador Armazém São Joaquim';
  admin_user_id UUID;
  profile_exists BOOLEAN := FALSE;
  current_role TEXT;
  action_description TEXT;
BEGIN
  -- Find the admin user in auth.users
  SELECT id INTO admin_user_id
  FROM auth.users 
  WHERE email = admin_email
  LIMIT 1;
  
  -- If admin user doesn't exist in auth.users, return failure
  IF admin_user_id IS NULL THEN
    RETURN QUERY SELECT 
      FALSE as success,
      NULL::UUID as user_id,
      admin_email as email,
      NULL::TEXT as role,
      'Admin user not found in auth.users' as action_taken;
    RETURN;
  END IF;
  
  -- Check if profile exists and get current role
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = admin_user_id), 
         COALESCE((SELECT profiles.role FROM public.profiles WHERE id = admin_user_id), 'none')
  INTO profile_exists, current_role;
  
  -- Create or update the admin profile
  IF NOT profile_exists THEN
    -- Create new admin profile
    INSERT INTO public.profiles (
      id, 
      email, 
      full_name, 
      role,
      created_at,
      updated_at
    )
    VALUES (
      admin_user_id,
      admin_email,
      admin_full_name,
      'admin',
      NOW(),
      NOW()
    );
    action_description := 'Created new admin profile';
    
  ELSIF current_role != 'admin' THEN
    -- Update existing profile to admin role
    UPDATE public.profiles 
    SET 
      role = 'admin',
      email = admin_email,
      full_name = COALESCE(full_name, admin_full_name),
      updated_at = NOW()
    WHERE id = admin_user_id;
    action_description := FORMAT('Updated profile role from %s to admin', current_role);
    
  ELSE
    -- Profile exists and is already admin
    UPDATE public.profiles 
    SET 
      email = admin_email,
      updated_at = NOW()
    WHERE id = admin_user_id;
    action_description := 'Admin profile already exists and is correct';
  END IF;
  
  -- Return success result
  RETURN QUERY SELECT 
    TRUE as success,
    admin_user_id as user_id,
    admin_email as email,
    'admin'::TEXT as role,
    action_description as action_taken;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. Enhanced User Creation/Update Handler
-- ============================================================================

-- Update the existing handle_new_user function to use our new sync function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $
BEGIN
  -- First, run the original profile creation logic
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email = 'armazemsaojoaquimoficial@gmail.com' THEN 'admin'
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = EXCLUDED.role,
    updated_at = NOW();
  
  -- Then run the admin sync if this is the admin user
  IF NEW.email = 'armazemsaojoaquimoficial@gmail.com' THEN
    PERFORM sync_admin_profile_comprehensive();
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create enhanced user update handler that includes admin sync
CREATE OR REPLACE FUNCTION handle_user_update_with_admin_sync()
RETURNS TRIGGER AS $
BEGIN
  -- Update timestamp
  NEW.updated_at = NOW();
  
  -- If this is the admin user, ensure profile sync
  IF NEW.email = 'armazemsaojoaquimoficial@gmail.com' THEN
    -- Update the profile to ensure it's in sync
    UPDATE public.profiles 
    SET 
      email = NEW.email,
      full_name = COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        full_name,
        'Administrador Armazém São Joaquim'
      ),
      role = 'admin', -- Always ensure admin role
      updated_at = NOW()
    WHERE id = NEW.id;
    
    -- If profile doesn't exist, create it
    IF NOT FOUND THEN
      INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        role,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
          NEW.raw_user_meta_data->>'full_name',
          'Administrador Armazém São Joaquim'
        ),
        'admin',
        NOW(),
        NOW()
      );
    END IF;
  END IF;
  
  -- Audit logging for important changes
  IF OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data THEN
    -- Only log if audit_logs table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
      INSERT INTO audit_logs (
        table_name, operation, row_data, user_id, timestamp
      ) VALUES (
        'auth.users', 'METADATA_CHANGE', 
        json_build_object(
          'old_metadata', OLD.raw_user_meta_data, 
          'new_metadata', NEW.raw_user_meta_data, 
          'user_id', NEW.id
        ),
        auth.uid(), NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. Create/Update Triggers for Admin Profile Synchronization
-- ============================================================================

-- This addresses requirement 5.2: Create trigger to ensure admin profile exists when admin user is created/updated

-- Drop existing trigger and recreate with enhanced functionality
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create new trigger for user updates with admin sync
CREATE TRIGGER on_auth_user_updated_with_admin_sync
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_update_with_admin_sync();

-- Create a specific trigger for admin profile synchronization
CREATE OR REPLACE TRIGGER trigger_sync_admin_profile
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email = 'armazemsaojoaquimoficial@gmail.com')
  EXECUTE FUNCTION sync_admin_profile_comprehensive();

-- ============================================================================
-- 5. Utility Functions for Admin Profile Management
-- ============================================================================

-- Function to check admin profile synchronization status
CREATE OR REPLACE FUNCTION check_admin_profile_sync_status()
RETURNS TABLE(
  auth_user_exists BOOLEAN,
  profile_exists BOOLEAN,
  profile_has_admin_role BOOLEAN,
  emails_match BOOLEAN,
  sync_status TEXT,
  recommendations TEXT
) AS $
DECLARE
  admin_email CONSTANT TEXT := 'armazemsaojoaquimoficial@gmail.com';
  auth_user_found BOOLEAN := FALSE;
  profile_found BOOLEAN := FALSE;
  profile_is_admin BOOLEAN := FALSE;
  emails_synchronized BOOLEAN := FALSE;
  status_message TEXT;
  recommendation_message TEXT;
BEGIN
  -- Check if admin user exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = admin_email) INTO auth_user_found;
  
  -- Check if admin profile exists in profiles
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE email = admin_email) INTO profile_found;
  
  -- Check if profile has admin role
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE email = admin_email AND role = 'admin'
  ) INTO profile_is_admin;
  
  -- Check if emails are synchronized
  SELECT EXISTS(
    SELECT 1 FROM auth.users au
    JOIN public.profiles p ON au.id = p.id
    WHERE au.email = admin_email AND p.email = admin_email
  ) INTO emails_synchronized;
  
  -- Determine sync status
  IF auth_user_found AND profile_found AND profile_is_admin AND emails_synchronized THEN
    status_message := 'FULLY_SYNCHRONIZED';
    recommendation_message := 'Admin profile is properly synchronized';
  ELSIF auth_user_found AND profile_found AND NOT profile_is_admin THEN
    status_message := 'ROLE_MISMATCH';
    recommendation_message := 'Run ensure_admin_profile_exists_with_role() to fix role';
  ELSIF auth_user_found AND NOT profile_found THEN
    status_message := 'PROFILE_MISSING';
    recommendation_message := 'Run ensure_admin_profile_exists_with_role() to create profile';
  ELSIF NOT auth_user_found THEN
    status_message := 'AUTH_USER_MISSING';
    recommendation_message := 'Admin user needs to be created in Supabase Auth first';
  ELSE
    status_message := 'PARTIAL_SYNC';
    recommendation_message := 'Run ensure_admin_profile_exists_with_role() to complete sync';
  END IF;
  
  RETURN QUERY SELECT 
    auth_user_found,
    profile_found,
    profile_is_admin,
    emails_synchronized,
    status_message,
    recommendation_message;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to force admin profile synchronization
CREATE OR REPLACE FUNCTION force_admin_profile_sync()
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  details JSONB
) AS $
DECLARE
  admin_email CONSTANT TEXT := 'armazemsaojoaquimoficial@gmail.com';
  sync_result RECORD;
  status_result RECORD;
BEGIN
  -- First, ensure admin profile exists with correct role
  SELECT * FROM ensure_admin_profile_exists_with_role() INTO sync_result;
  
  -- Then check the sync status
  SELECT * FROM check_admin_profile_sync_status() INTO status_result;
  
  -- Return comprehensive result
  RETURN QUERY SELECT 
    sync_result.success,
    FORMAT('Admin profile sync completed: %s', sync_result.action_taken),
    jsonb_build_object(
      'sync_action', sync_result.action_taken,
      'user_id', sync_result.user_id,
      'email', sync_result.email,
      'role', sync_result.role,
      'final_status', status_result.sync_status,
      'auth_user_exists', status_result.auth_user_exists,
      'profile_exists', status_result.profile_exists,
      'profile_has_admin_role', status_result.profile_has_admin_role,
      'emails_match', status_result.emails_match
    );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. Grant Permissions
-- ============================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION sync_admin_profile_comprehensive() TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_admin_profile_exists_with_role() TO authenticated;
GRANT EXECUTE ON FUNCTION check_admin_profile_sync_status() TO authenticated;
GRANT EXECUTE ON FUNCTION force_admin_profile_sync() TO authenticated;

-- Grant permissions to service role for system operations
GRANT EXECUTE ON FUNCTION sync_admin_profile_comprehensive() TO service_role;
GRANT EXECUTE ON FUNCTION ensure_admin_profile_exists_with_role() TO service_role;
GRANT EXECUTE ON FUNCTION check_admin_profile_sync_status() TO service_role;
GRANT EXECUTE ON FUNCTION force_admin_profile_sync() TO service_role;

-- ============================================================================
-- 7. Initial Synchronization and Testing
-- ============================================================================

-- Ensure admin profile exists immediately after migration
SELECT ensure_admin_profile_exists_with_role();

-- Check synchronization status
SELECT * FROM check_admin_profile_sync_status();

-- Create a test log to verify the migration completed successfully
DO $
DECLARE
  sync_status_result RECORD;
  test_passed BOOLEAN := FALSE;
BEGIN
  -- Get sync status
  SELECT * FROM check_admin_profile_sync_status() INTO sync_status_result;
  
  -- Test passes if we have either FULLY_SYNCHRONIZED or admin user exists with profile
  test_passed := (
    sync_status_result.sync_status = 'FULLY_SYNCHRONIZED' OR
    (sync_status_result.auth_user_exists AND sync_status_result.profile_exists AND sync_status_result.profile_has_admin_role)
  );
  
  IF test_passed THEN
    RAISE NOTICE 'SUCCESS: Admin profile synchronization system deployed successfully. Status: %', sync_status_result.sync_status;
  ELSE
    RAISE NOTICE 'WARNING: Admin profile synchronization system deployed but sync status is: %. Recommendation: %', 
      sync_status_result.sync_status, sync_status_result.recommendations;
  END IF;
  
  -- Log the deployment
  RAISE NOTICE 'Admin Profile Synchronization System Migration Completed:';
  RAISE NOTICE '- Auth user exists: %', sync_status_result.auth_user_exists;
  RAISE NOTICE '- Profile exists: %', sync_status_result.profile_exists;
  RAISE NOTICE '- Profile has admin role: %', sync_status_result.profile_has_admin_role;
  RAISE NOTICE '- Emails synchronized: %', sync_status_result.emails_match;
  RAISE NOTICE '- Overall status: %', sync_status_result.sync_status;
END;
$;