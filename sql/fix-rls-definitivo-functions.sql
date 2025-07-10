-- 🔒 SOLUÇÃO DEFINITIVA SUPABASE: Funções SECURITY DEFINER
-- Baseado na recomendação oficial para resolver recursão RLS
-- Execute este script no Supabase SQL Editor

-- 1. DESABILITAR RLS temporariamente para limpeza
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservas DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS as políticas problemáticas
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_simple_select_policy" ON users;
DROP POLICY IF EXISTS "users_simple_insert_policy" ON users;
DROP POLICY IF EXISTS "users_simple_update_policy" ON users;
DROP POLICY IF EXISTS "users_no_recursion_select" ON users;
DROP POLICY IF EXISTS "users_no_recursion_insert" ON users;
DROP POLICY IF EXISTS "users_no_recursion_update" ON users;
DROP POLICY IF EXISTS "users_own_data_select" ON users;

DROP POLICY IF EXISTS "blog_posts_select_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_insert_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_update_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_delete_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_no_recursion_select" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_no_recursion_insert" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_no_recursion_update" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_no_recursion_delete" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_public_select" ON blog_posts;

-- 3. REMOVER funções existentes se houver
DROP FUNCTION IF EXISTS get_user_role(uuid);
DROP FUNCTION IF EXISTS is_admin_user();
DROP FUNCTION IF EXISTS admin_get_blog_posts();
DROP FUNCTION IF EXISTS admin_create_blog_post(jsonb);
DROP FUNCTION IF EXISTS admin_update_blog_post(uuid, jsonb);
DROP FUNCTION IF EXISTS admin_delete_blog_post(uuid);

-- 4. CRIAR função para verificar role do usuário (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role
    FROM users
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, 'user');
END;
$$;

-- 5. CRIAR função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_email text;
BEGIN
    -- Verificar por email (funciona sempre)
    user_email := auth.email();
    
    IF user_email = 'armazemsaojoaquimoficial@gmail.com' THEN
        RETURN true;
    END IF;
    
    -- Verificar por role (usando função SECURITY DEFINER)
    IF get_user_role(auth.uid()) = 'admin' THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$;

-- 6. CRIAR funções admin para blog_posts (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION admin_get_blog_posts()
RETURNS TABLE (
    id uuid,
    title text,
    content text,
    excerpt text,
    featured_image text,
    published boolean,
    author_id uuid,
    slug text,
    published_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se é admin
    IF NOT is_admin_user() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    -- Retornar todos os posts (bypassa RLS)
    RETURN QUERY
    SELECT 
        bp.id,
        bp.title,
        bp.content,
        bp.excerpt,
        bp.featured_image,
        bp.published,
        bp.author_id,
        bp.slug,
        bp.published_at,
        bp.created_at,
        bp.updated_at
    FROM blog_posts bp
    ORDER BY bp.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION admin_create_blog_post(post_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_post_id uuid;
BEGIN
    -- Verificar se é admin
    IF NOT is_admin_user() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    -- Inserir post (bypassa RLS)
    INSERT INTO blog_posts (
        title,
        content,
        excerpt,
        featured_image,
        published,
        author_id,
        slug,
        published_at
    )
    VALUES (
        (post_data->>'title')::text,
        (post_data->>'content')::text,
        (post_data->>'excerpt')::text,
        (post_data->>'featured_image')::text,
        COALESCE((post_data->>'published')::boolean, false),
        auth.uid(),
        (post_data->>'slug')::text,
        CASE 
            WHEN COALESCE((post_data->>'published')::boolean, false) THEN NOW()
            ELSE NULL
        END
    )
    RETURNING id INTO new_post_id;
    
    RETURN new_post_id;
END;
$$;

CREATE OR REPLACE FUNCTION admin_update_blog_post(post_id uuid, post_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se é admin
    IF NOT is_admin_user() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    -- Atualizar post (bypassa RLS)
    UPDATE blog_posts
    SET
        title = COALESCE((post_data->>'title')::text, title),
        content = COALESCE((post_data->>'content')::text, content),
        excerpt = COALESCE((post_data->>'excerpt')::text, excerpt),
        featured_image = COALESCE((post_data->>'featured_image')::text, featured_image),
        published = COALESCE((post_data->>'published')::boolean, published),
        slug = COALESCE((post_data->>'slug')::text, slug),
        published_at = CASE 
            WHEN (post_data->>'published')::boolean = true AND published_at IS NULL THEN NOW()
            WHEN (post_data->>'published')::boolean = false THEN NULL
            ELSE published_at
        END,
        updated_at = NOW()
    WHERE id = post_id;
    
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION admin_delete_blog_post(post_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se é admin
    IF NOT is_admin_user() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    -- Deletar post (bypassa RLS)
    DELETE FROM blog_posts WHERE id = post_id;
    
    RETURN FOUND;
END;
$$;

-- 7. CRIAR políticas SIMPLES sem recursão
CREATE POLICY "users_basic_select" ON users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "blog_posts_public_read" ON blog_posts
    FOR SELECT
    TO authenticated
    USING (published = true);

-- 8. REABILITAR RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- 9. GARANTIR que o usuário admin existe
INSERT INTO users (id, email, role, created_at, updated_at)
VALUES (
    '3ddbfb5e-eddf-4e39-983d-d3ff2f10eded'::uuid,
    'armazemsaojoaquimoficial@gmail.com',
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = 'armazemsaojoaquimoficial@gmail.com',
    role = 'admin',
    updated_at = NOW();

-- 10. TESTAR as funções
SELECT 'Testando função is_admin_user()...' as test;
SELECT is_admin_user() as is_admin_result;

SELECT 'Testando função admin_get_blog_posts()...' as test;
SELECT COUNT(*) as total_posts FROM admin_get_blog_posts();

-- 11. CONFIRMAR
SELECT 'SOLUÇÃO DEFINITIVA APLICADA - Funções SECURITY DEFINER criadas!' as status; 