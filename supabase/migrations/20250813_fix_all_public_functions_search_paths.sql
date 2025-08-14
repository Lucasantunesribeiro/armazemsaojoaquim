-- Fix: Function Search Path Mutable - All Public Functions
-- Add SET search_path = '' to all remaining public functions with SECURITY DEFINER
-- Priority: CRITICAL
-- Issue: Functions have role mutable search_path

BEGIN;

-- We need to recreate these functions with SET search_path = ''
-- This is a more efficient approach using ALTER FUNCTION for existing ones

-- List of functions that need search_path fix (remaining ones)
DO $$
DECLARE
    func_name text;
    func_names text[] := ARRAY[
        'sync_admin_profile_comprehensive',
        'check_admin_profile_sync_status', 
        'force_admin_profile_sync',
        'handle_user_update_with_admin_sync',
        'verify_admin_by_email',
        'get_user_profile_with_admin_check',
        'ensure_admin_profile_safe',
        'ensure_admin_profile_exists',
        'get_table_definition_light',
        'get_table_metadata_fast',
        'cleanup_old_cache_entries',
        'validate_timezone_fast',
        'refresh_all_caches',
        'ensure_admin_profile_exists_with_role',
        'update_blog_posts_updated_at',
        'populate_table_summary_cache',
        'get_cache_performance_stats',
        'log_performance_event',
        'identify_expensive_queries',
        'daily_performance_maintenance',
        'sync_user_login',
        'get_optimization_report',
        'performance_health_check',
        'safe_prevent_role_change'
    ];
BEGIN
    FOREACH func_name IN ARRAY func_names
    LOOP
        -- Check if function exists and try to alter it
        BEGIN
            EXECUTE format('ALTER FUNCTION public.%I SET search_path = ''''', func_name);
            RAISE NOTICE 'Fixed search_path for function: %', func_name;
        EXCEPTION
            WHEN undefined_function THEN
                RAISE NOTICE 'Function % does not exist, skipping', func_name;
            WHEN others THEN
                RAISE NOTICE 'Error fixing function %: %', func_name, SQLERRM;
        END;
    END LOOP;
END;
$$;

-- For functions that couldn't be altered, we'll recreate the most critical ones manually

-- sync_admin_profile_comprehensive - Critical admin function
CREATE OR REPLACE FUNCTION public.sync_admin_profile_comprehensive()
RETURNS TABLE(success boolean, message text, details jsonb)
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    admin_user_id uuid;
    admin_email text;
    profile_exists boolean;
    result_details jsonb := '{}'::jsonb;
BEGIN
    -- Get admin user from auth.users
    SELECT id, email INTO admin_user_id, admin_email
    FROM auth.users
    WHERE email = 'lucasferreir_adev@outlook.com'
    LIMIT 1;

    IF admin_user_id IS NULL THEN
        RETURN QUERY SELECT false, 'Admin user not found in auth.users'::text, 
                     '{"error": "admin_user_not_found"}'::jsonb;
        RETURN;
    END IF;

    -- Check if profile exists
    SELECT EXISTS(
        SELECT 1 FROM public.profiles WHERE id = admin_user_id
    ) INTO profile_exists;

    IF profile_exists THEN
        -- Update existing profile
        UPDATE public.profiles
        SET 
            email = admin_email,
            role = 'admin',
            updated_at = NOW()
        WHERE id = admin_user_id;
        
        result_details := jsonb_build_object(
            'action', 'updated',
            'user_id', admin_user_id,
            'email', admin_email
        );
    ELSE
        -- Create new profile
        INSERT INTO public.profiles (
            id, email, role, full_name, created_at, updated_at
        ) VALUES (
            admin_user_id, admin_email, 'admin', 'Admin User', NOW(), NOW()
        );
        
        result_details := jsonb_build_object(
            'action', 'created',
            'user_id', admin_user_id,
            'email', admin_email
        );
    END IF;

    RETURN QUERY SELECT true, 'Admin profile synchronized successfully'::text, result_details;
END;
$$;

-- verify_admin_by_email - Critical verification function  
CREATE OR REPLACE FUNCTION public.verify_admin_by_email(user_email text)
RETURNS TABLE(is_admin boolean, user_id uuid, profile_exists boolean, message text)
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    found_user_id uuid;
    found_profile boolean;
    user_role text;
BEGIN
    -- Get user ID from auth.users
    SELECT id INTO found_user_id
    FROM auth.users
    WHERE email = user_email
    LIMIT 1;

    IF found_user_id IS NULL THEN
        RETURN QUERY SELECT false, NULL::uuid, false, 'User not found'::text;
        RETURN;
    END IF;

    -- Check profile and role
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = found_user_id),
           role
    INTO found_profile, user_role
    FROM public.profiles
    WHERE id = found_user_id;

    RETURN QUERY SELECT 
        COALESCE(user_role = 'admin', false),
        found_user_id,
        COALESCE(found_profile, false),
        CASE 
            WHEN NOT COALESCE(found_profile, false) THEN 'Profile not found'
            WHEN user_role = 'admin' THEN 'Admin verified'
            ELSE 'User is not admin'
        END;
END;
$$;

-- safe_prevent_role_change - Security function
CREATE OR REPLACE FUNCTION public.safe_prevent_role_change()
RETURNS trigger
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    -- Prevent role changes for admin users unless done by system
    IF OLD.role = 'admin' AND NEW.role != 'admin' THEN
        -- Only allow system or another admin to change admin role
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Unauthorized: Cannot change admin role';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Add comments for the recreated functions
COMMENT ON FUNCTION public.sync_admin_profile_comprehensive() IS 
'Synchronizes admin profile data. Uses SECURITY DEFINER with fixed search_path for security.';

COMMENT ON FUNCTION public.verify_admin_by_email(text) IS 
'Verifies if user email has admin privileges. Uses SECURITY DEFINER with fixed search_path for security.';

COMMENT ON FUNCTION public.safe_prevent_role_change() IS 
'Prevents unauthorized role changes. Uses SECURITY DEFINER with fixed search_path for security.';

COMMIT;