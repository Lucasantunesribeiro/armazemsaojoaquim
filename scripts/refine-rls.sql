-- Disable timing for this script as it will be short transactions

\unset timing



DO $$

BEGIN

    RAISE NOTICE '=================================================';

    RAISE NOTICE '  ARMAZEM SÃO JOAQUIM - RLS POLICY REFINEMENT';

    RAISE NOTICE '=================================================';

    RAISE NOTICE 'This script will:';

    RAISE NOTICE '1. Ensure only one RLS policy exists per action/role on public.blog_posts.';

    RAISE NOTICE '2. Confirm RLS policy optimization pattern (SELECT auth.uid()/email())';

    RAISE NOTICE '=================================================';

END $$;



---

## Step 1: Refine RLS Policies for `public.blog_posts`



-- Temporarily disable RLS to drop policies without conflicts

ALTER TABLE public.blog_posts DISABLE ROW LEVEL SECURITY;



-- Drop ALL potentially conflicting permissive policies on blog_posts for 'authenticated' role

-- This is a more aggressive cleanup to ensure no duplicates remain.

-- Please REVIEW these names carefully against your actual policies.

DROP POLICY IF EXISTS "Política Final de Blog Posts" ON public.blog_posts;

DROP POLICY IF EXISTS blog_posts_public_select ON public.blog_posts;

DROP POLICY IF EXISTS blog_posts_select_optimized ON public.blog_posts;

DROP POLICY IF EXISTS blog_posts_insert_admin_only ON public.blog_posts;

DROP POLICY IF EXISTS blog_posts_update_admin_only ON public.blog_posts;

DROP POLICY IF EXISTS blog_posts_delete_admin_only ON public.blog_posts;



RAISE NOTICE 'All old and previously "optimized" policies for public.blog_posts dropped.';



-- Re-enable RLS

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;



-- Recreate the consolidated policies for blog_posts

-- Policy for SELECT: Authenticated users can see 'published' posts, admins can see all posts.

CREATE POLICY blog_posts_select_final

ON public.blog_posts

FOR SELECT

TO authenticated

USING (

    status = 'published' OR (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com'

);

RAISE NOTICE 'Policy blog_posts_select_final for public.blog_posts (SELECT) created.';



-- Policy for INSERT: Only admins can insert.

CREATE POLICY blog_posts_insert_final

ON public.blog_posts

FOR INSERT

TO authenticated

WITH CHECK (

    (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com'

);

RAISE NOTICE 'Policy blog_posts_insert_final for public.blog_posts (INSERT) created.';



-- Policy for UPDATE: Only admins can update.

CREATE POLICY blog_posts_update_final

ON public.blog_posts

FOR UPDATE

TO authenticated

USING (

    (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com'

)

WITH CHECK (

    (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com'

);

RAISE NOTICE 'Policy blog_posts_update_final for public.blog_posts (UPDATE) created.';



-- Policy for DELETE: Only admins can delete.

CREATE POLICY blog_posts_delete_final

ON public.blog_posts

FOR DELETE

TO authenticated

USING (

    (SELECT auth.email()) = 'armazemsaojoaquimoficial@gmail.com'

);

RAISE NOTICE 'Policy blog_posts_delete_final for public.blog_posts (DELETE) created.';



---

DO $$

BEGIN

    RAISE NOTICE '=================================================';

    RAISE NOTICE '  RLS Policy Refinement Completed!';

    RAISE NOTICE '=================================================';

END $$;