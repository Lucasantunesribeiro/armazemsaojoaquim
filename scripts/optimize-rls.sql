-- Disable timing for this script as it will be short transactions

\unset timing



DO $$

BEGIN

    RAISE NOTICE '=================================================';

    RAISE NOTICE '  ARMAZEM SÃO JOAQUIM - RLS OPTIMIZATION DEPLOYMENT';

    RAISE NOTICE '=================================================';

    RAISE NOTICE 'This script will:';

    RAISE NOTICE '1. Optimize RLS policies to prevent per-row re-evaluation (auth_rls_initplan).';

    RAISE NOTICE '2. Consolidate multiple permissive RLS policies for better performance.';

    RAISE NOTICE '=================================================';

END $$;



---

## Step 1: Optimize RLS Policies for `public.users`



-- Drop existing policies that cause 'auth_rls_initplan' and 'multiple_permissive_policies' warnings

-- We drop them first to ensure a clean slate before recreating combined/optimized ones.



ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;



DROP POLICY IF EXISTS users_own_data_select ON public.users;

DROP POLICY IF EXISTS users_own_data ON public.users;

DROP POLICY IF EXISTS users_admin_access ON public.users;



-- Re-enable RLS

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;



-- Recreate a single, optimized SELECT policy for 'authenticated' role on 'public.users'

-- Combining 'users_own_data_select', 'users_own_data' SELECT logic, and 'users_admin_access' SELECT logic

-- Using (SELECT auth.uid()) to ensure function is evaluated once per query, not per row.

CREATE POLICY users_access_select_optimized

ON public.users

FOR SELECT

TO authenticated

USING (

    id = (SELECT auth.uid()) OR (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com'

);

RAISE NOTICE 'Policy users_access_select_optimized for public.users (SELECT) created/updated.';



-- Recreate a single, optimized INSERT policy for 'authenticated' role on 'public.users'

-- Combining 'users_admin_access' and 'users_own_data' INSERT logic

CREATE POLICY users_access_insert_optimized

ON public.users

FOR INSERT

TO authenticated

WITH CHECK (

    id = (SELECT auth.uid()) OR (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com'

);

RAISE NOTICE 'Policy users_access_insert_optimized for public.users (INSERT) created/updated.';





-- Recreate a single, optimized UPDATE policy for 'authenticated' role on 'public.users'

-- Combining 'users_admin_access' and 'users_own_data' UPDATE logic

CREATE POLICY users_access_update_optimized

ON public.users

FOR UPDATE

TO authenticated

USING (

    id = (SELECT auth.uid()) OR (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com'

)

WITH CHECK (

    id = (SELECT auth.uid()) OR (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com'

);

RAISE NOTICE 'Policy users_access_update_optimized for public.users (UPDATE) created/updated.';



-- Recreate a single, optimized DELETE policy for 'authenticated' role on 'public.users'

-- Combining 'users_admin_access' and 'users_own_data' DELETE logic

CREATE POLICY users_access_delete_optimized

ON public.users

FOR DELETE

TO authenticated

USING (

    id = (SELECT auth.uid()) OR (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com'

);

RAISE NOTICE 'Policy users_access_delete_optimized for public.users (DELETE) created/updated.';



---

## Step 2: Consolidate RLS Policies for `public.blog_posts`



-- Drop existing policies that cause 'multiple_permissive_policies' warnings

-- Assuming 'Política Final de Blog Posts' and 'blog_posts_public_select' are the policies to combine.

-- You might need to confirm the exact names from your Supabase dashboard or previous migrations.



ALTER TABLE public.blog_posts DISABLE ROW LEVEL SECURITY;



DROP POLICY IF EXISTS "Política Final de Blog Posts" ON public.blog_posts; -- Note: double quotes for policy names with spaces/special characters

DROP POLICY IF EXISTS blog_posts_public_select ON public.blog_posts;



-- Re-enable RLS

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;



-- Recreate a single, optimized SELECT policy for 'authenticated' role on 'public.blog_posts'

-- This policy allows selecting published posts by anyone, and all posts by an admin.

CREATE POLICY blog_posts_select_optimized

ON public.blog_posts

FOR SELECT

TO authenticated

USING (

    status = 'published' OR (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com'

);

RAISE NOTICE 'Policy blog_posts_select_optimized for public.blog_posts (SELECT) created/updated.';



-- Add policies for INSERT, UPDATE, DELETE if they existed and need consolidation/optimization

-- Assuming only admins can insert/update/delete blog posts for simplicity.

-- If other specific RLS policies existed for these actions, their logic should be combined here.



CREATE POLICY blog_posts_insert_admin_only

ON public.blog_posts

FOR INSERT

TO authenticated

WITH CHECK (

    (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com'

);

RAISE NOTICE 'Policy blog_posts_insert_admin_only for public.blog_posts (INSERT) created/updated.';





CREATE POLICY blog_posts_update_admin_only

ON public.blog_posts

FOR UPDATE

TO authenticated

USING (

    (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com'

)

WITH CHECK (

    (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com'

);

RAISE NOTICE 'Policy blog_posts_update_admin_only for public.blog_posts (UPDATE) created/updated.';





CREATE POLICY blog_posts_delete_admin_only

ON public.blog_posts

FOR DELETE

TO authenticated

USING (

    (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com'

);

RAISE NOTICE 'Policy blog_posts_delete_admin_only for public.blog_posts (DELETE) created/updated.';



---

DO $$

BEGIN

    RAISE NOTICE '=================================================';

    RAISE NOTICE '  RLS Optimization Deployment Completed!';

    RAISE NOTICE '=================================================';

END $$;