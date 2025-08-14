-- Fix: Function Search Path Mutable - Auth Ext Schema
-- Add SECURITY DEFINER SET search_path = '' to auth_ext functions
-- Priority: CRITICAL
-- Issue: Functions have role mutable search_path

BEGIN;

-- Fix auth_ext.update_profiles function
CREATE OR REPLACE FUNCTION auth_ext.update_profiles()
RETURNS trigger
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    last_sign_in = COALESCE(NEW.last_sign_in, OLD.last_sign_in),
    sign_in_count = COALESCE(NEW.sign_in_count, OLD.sign_in_count),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Fix auth_ext.update_last_sign_in function
CREATE OR REPLACE FUNCTION auth_ext.update_last_sign_in()
RETURNS trigger
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Atualizar na tabela real
  UPDATE public.profiles 
  SET 
    last_sign_in = NOW(),
    sign_in_count = COALESCE(sign_in_count, 0) + 1,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Add comments explaining the security improvements
COMMENT ON FUNCTION auth_ext.update_profiles() IS 
'Trigger function to update profiles table. Uses SECURITY DEFINER with fixed search_path for security.';

COMMENT ON FUNCTION auth_ext.update_last_sign_in() IS 
'Trigger function to update last sign in data. Uses SECURITY DEFINER with fixed search_path for security.';

COMMIT;