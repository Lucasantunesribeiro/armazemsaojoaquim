-- Fix: Function Search Path Mutable - Public Schema (Part 1/4)
-- Add SECURITY DEFINER SET search_path = '' to public functions
-- Priority: CRITICAL
-- Issue: Functions have role mutable search_path

BEGIN;

-- 1. check_admin_by_email
CREATE OR REPLACE FUNCTION public.check_admin_by_email(user_email text)
RETURNS boolean
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    admin_exists boolean := false;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM auth.users u
        JOIN public.profiles p ON u.id = p.id
        WHERE u.email = user_email 
        AND p.role = 'admin'
    ) INTO admin_exists;
    
    RETURN admin_exists;
END;
$$;

-- 2. check_admin_role  
CREATE OR REPLACE FUNCTION public.check_admin_role(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    user_role text;
BEGIN
    IF user_id IS NULL THEN
        RETURN false;
    END IF;
    
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = user_id;
    
    RETURN COALESCE(user_role = 'admin', false);
END;
$$;

-- 3. is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$;

-- 4. is_admin_user
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$;

-- 5. is_current_user_admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    current_user_id uuid;
    user_role text;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = current_user_id;
    
    RETURN COALESCE(user_role = 'admin', false);
END;
$$;

-- 6. update_updated_at_column (trigger function)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 7. update_user_last_sign_in
CREATE OR REPLACE FUNCTION public.update_user_last_sign_in()
RETURNS trigger
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    UPDATE public.profiles
    SET 
        last_sign_in = NOW(),
        sign_in_count = COALESCE(sign_in_count, 0) + 1,
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;

-- 8. safe_handle_new_user
CREATE OR REPLACE FUNCTION public.safe_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'user',
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Add comments
COMMENT ON FUNCTION public.check_admin_by_email(text) IS 'Check if user with email has admin role. Fixed search_path for security.';
COMMENT ON FUNCTION public.check_admin_role(uuid) IS 'Check if user has admin role. Fixed search_path for security.';
COMMENT ON FUNCTION public.is_admin() IS 'Check if current user is admin. Fixed search_path for security.';
COMMENT ON FUNCTION public.is_admin_user() IS 'Check if current user is admin. Fixed search_path for security.';
COMMENT ON FUNCTION public.is_current_user_admin() IS 'Check if current user is admin. Fixed search_path for security.';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger to update updated_at column. Fixed search_path for security.';
COMMENT ON FUNCTION public.update_user_last_sign_in() IS 'Trigger to update last sign in. Fixed search_path for security.';
COMMENT ON FUNCTION public.safe_handle_new_user() IS 'Trigger to handle new user creation. Fixed search_path for security.';

COMMIT;