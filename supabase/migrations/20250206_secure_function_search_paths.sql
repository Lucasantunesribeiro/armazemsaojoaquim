-- Migration: Secure Function Search Paths
-- Description: Set proper search_path parameters for database functions to prevent injection attacks
-- Date: 2025-02-06

-- Set search_path for handle_new_user function
-- This function needs access to public schema for profiles table and auth schema for user data
ALTER FUNCTION public.handle_new_user() SET search_path = public, auth;

-- Set search_path for update_blog_posts_updated_at function  
-- This function only needs access to public schema
ALTER FUNCTION public.update_blog_posts_updated_at() SET search_path = public;

-- Verify the search paths have been set correctly
DO $$
DECLARE
    handle_new_user_config text[];
    update_blog_config text[];
BEGIN
    -- Get function configurations
    SELECT proconfig INTO handle_new_user_config 
    FROM pg_proc 
    WHERE proname = 'handle_new_user' AND pronamespace = 'public'::regnamespace;
    
    SELECT proconfig INTO update_blog_config 
    FROM pg_proc 
    WHERE proname = 'update_blog_posts_updated_at' AND pronamespace = 'public'::regnamespace;
    
    -- Check if search_path is properly set
    IF handle_new_user_config IS NULL OR NOT (handle_new_user_config @> ARRAY['search_path=public, auth']) THEN
        RAISE EXCEPTION 'Failed to set search_path for handle_new_user function';
    END IF;
    
    IF update_blog_config IS NULL OR NOT (update_blog_config @> ARRAY['search_path=public']) THEN
        RAISE EXCEPTION 'Failed to set search_path for update_blog_posts_updated_at function';
    END IF;
    
    RAISE NOTICE 'Function search paths secured successfully';
END $$;