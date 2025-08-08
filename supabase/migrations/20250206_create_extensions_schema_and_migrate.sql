-- Migration to create extensions schema and migrate pg_trgm and unaccent extensions
-- This addresses requirement 1.4: Move extensions from public schema to dedicated schemas

-- ============================================================================
-- TASK 3.1: Create Extensions Schema and Migrate Extensions
-- ============================================================================

-- Create dedicated extensions schema for PostgreSQL extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on the extensions schema to necessary roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Install pg_trgm extension if it doesn't exist (for text similarity and trigram matching)
-- This extension is commonly used for fuzzy text search and similarity operations
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Install unaccent extension if it doesn't exist (for removing accents from text)
-- This extension is useful for accent-insensitive text search
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Move pg_trgm extension from public schema to extensions schema
-- This improves security by keeping extensions in a dedicated schema
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Move unaccent extension from public schema to extensions schema
ALTER EXTENSION unaccent SET SCHEMA extensions;

-- Update search paths for functions that might use these extensions
-- This ensures that functions can still find the extensions in their new location

-- Create a function to update search paths for existing functions that might use these extensions
CREATE OR REPLACE FUNCTION public.update_function_search_paths_for_extensions()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  func_record RECORD;
  updated_count INTEGER := 0;
BEGIN
  -- Find functions that might need updated search paths for extensions
  -- We'll look for functions that might use text search or similarity operations
  FOR func_record IN 
    SELECT 
      n.nspname as schema_name,
      p.proname as function_name,
      p.oid as function_oid
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND (
      pg_get_functiondef(p.oid) ILIKE '%similarity%' OR
      pg_get_functiondef(p.oid) ILIKE '%unaccent%' OR
      pg_get_functiondef(p.oid) ILIKE '%pg_trgm%' OR
      pg_get_functiondef(p.oid) ILIKE '%show_trgm%' OR
      pg_get_functiondef(p.oid) ILIKE '%word_similarity%'
    )
  LOOP
    -- Update the search path for functions that use these extensions
    EXECUTE format('ALTER FUNCTION %I.%I SET search_path = public, extensions', 
                   func_record.schema_name, func_record.function_name);
    updated_count := updated_count + 1;
    
    RAISE NOTICE 'Updated search path for function: %.%', 
                 func_record.schema_name, func_record.function_name;
  END LOOP;

  RETURN format('Updated search paths for %s functions to include extensions schema', updated_count);
END;
$$;

-- Execute the function to update search paths
SELECT public.update_function_search_paths_for_extensions();

-- Create helper functions to demonstrate extension usage and verify they work
-- These functions will help verify that the extensions are properly accessible

-- Function to test pg_trgm extension functionality
CREATE OR REPLACE FUNCTION public.test_pg_trgm_extension(text1 TEXT, text2 TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN jsonb_build_object(
    'similarity', extensions.similarity(text1, text2),
    'word_similarity', extensions.word_similarity(text1, text2),
    'trigrams_text1', extensions.show_trgm(text1),
    'trigrams_text2', extensions.show_trgm(text2),
    'extension_schema', 'extensions',
    'test_timestamp', NOW()
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'extension_schema', 'extensions',
      'test_timestamp', NOW()
    );
END;
$$;

-- Function to test unaccent extension functionality
CREATE OR REPLACE FUNCTION public.test_unaccent_extension(input_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN jsonb_build_object(
    'original_text', input_text,
    'unaccented_text', extensions.unaccent(input_text),
    'extension_schema', 'extensions',
    'test_timestamp', NOW()
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'original_text', input_text,
      'extension_schema', 'extensions',
      'test_timestamp', NOW()
    );
END;
$$;

-- Grant execute permissions on test functions
GRANT EXECUTE ON FUNCTION public.test_pg_trgm_extension(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_unaccent_extension(TEXT) TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Create a comprehensive verification function
CREATE OR REPLACE FUNCTION public.verify_extensions_migration()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  result JSONB;
  extensions_schema_exists BOOLEAN;
  pg_trgm_in_extensions BOOLEAN;
  unaccent_in_extensions BOOLEAN;
  pg_trgm_in_public BOOLEAN;
  unaccent_in_public BOOLEAN;
BEGIN
  -- Check if extensions schema exists
  SELECT EXISTS (
    SELECT 1 FROM pg_namespace 
    WHERE nspname = 'extensions'
  ) INTO extensions_schema_exists;

  -- Check if pg_trgm is in extensions schema
  SELECT EXISTS (
    SELECT 1 FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE e.extname = 'pg_trgm' AND n.nspname = 'extensions'
  ) INTO pg_trgm_in_extensions;

  -- Check if unaccent is in extensions schema
  SELECT EXISTS (
    SELECT 1 FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE e.extname = 'unaccent' AND n.nspname = 'extensions'
  ) INTO unaccent_in_extensions;

  -- Check if pg_trgm is still in public schema (should be false)
  SELECT EXISTS (
    SELECT 1 FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE e.extname = 'pg_trgm' AND n.nspname = 'public'
  ) INTO pg_trgm_in_public;

  -- Check if unaccent is still in public schema (should be false)
  SELECT EXISTS (
    SELECT 1 FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE e.extname = 'unaccent' AND n.nspname = 'public'
  ) INTO unaccent_in_public;

  -- Build comprehensive result
  SELECT jsonb_build_object(
    'extensions_schema_created', extensions_schema_exists,
    'pg_trgm_migrated_to_extensions', pg_trgm_in_extensions,
    'unaccent_migrated_to_extensions', unaccent_in_extensions,
    'pg_trgm_removed_from_public', NOT pg_trgm_in_public,
    'unaccent_removed_from_public', NOT unaccent_in_public,
    'migration_successful', (
      extensions_schema_exists AND 
      pg_trgm_in_extensions AND 
      unaccent_in_extensions AND 
      NOT pg_trgm_in_public AND 
      NOT unaccent_in_public
    ),
    'available_extensions', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'name', e.extname,
          'schema', n.nspname,
          'version', e.extversion
        )
      )
      FROM pg_extension e
      JOIN pg_namespace n ON e.extnamespace = n.oid
      WHERE e.extname IN ('pg_trgm', 'unaccent')
    ),
    'verification_timestamp', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permission for verification
GRANT EXECUTE ON FUNCTION public.verify_extensions_migration() TO authenticated;

-- Create a function to list all functions that now have updated search paths
CREATE OR REPLACE FUNCTION public.list_functions_with_extensions_search_path()
RETURNS TABLE (
  schema_name TEXT,
  function_name TEXT,
  search_path TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.nspname::TEXT as schema_name,
    p.proname::TEXT as function_name,
    COALESCE(p.proconfig[1], 'default')::TEXT as search_path
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proconfig IS NOT NULL
  AND p.proconfig[1] LIKE '%extensions%'
  ORDER BY n.nspname, p.proname;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.list_functions_with_extensions_search_path() TO authenticated;

-- Add helpful comments for documentation
COMMENT ON SCHEMA extensions IS 'Dedicated schema for PostgreSQL extensions to improve security and organization';
COMMENT ON FUNCTION public.test_pg_trgm_extension(TEXT, TEXT) IS 'Test function to verify pg_trgm extension functionality in extensions schema';
COMMENT ON FUNCTION public.test_unaccent_extension(TEXT) IS 'Test function to verify unaccent extension functionality in extensions schema';
COMMENT ON FUNCTION public.verify_extensions_migration() IS 'Comprehensive verification of extensions schema migration';
COMMENT ON FUNCTION public.update_function_search_paths_for_extensions() IS 'Updates search paths for functions that use migrated extensions';
COMMENT ON FUNCTION public.list_functions_with_extensions_search_path() IS 'Lists all functions with updated search paths for extensions schema';

-- Clean up the temporary function used for updating search paths
DROP FUNCTION IF EXISTS public.update_function_search_paths_for_extensions();