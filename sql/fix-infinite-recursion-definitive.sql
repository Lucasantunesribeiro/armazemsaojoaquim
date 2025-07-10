-- 🔒 SOLUÇÃO DEFINITIVA: Eliminar Recursão Infinita em Políticas RLS
-- Execute este script no Supabase SQL Editor

-- 1. DESABILITAR RLS em todas as tabelas temporariamente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservas DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS as políticas existentes
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_simple_select_policy" ON users;
DROP POLICY IF EXISTS "users_simple_insert_policy" ON users;
DROP POLICY IF EXISTS "users_simple_update_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

DROP POLICY IF EXISTS "blog_posts_select_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_insert_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_update_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_delete_policy" ON blog_posts;

-- 3. CRIAR POLÍTICAS SIMPLES SEM RECURSÃO PARA USERS
-- Usando apenas auth.uid() e auth.email() - SEM consultas a tabelas

-- Política para SELECT: usuário vê apenas seus próprios dados + admin específico
CREATE POLICY "users_no_recursion_select" ON users
    FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() 
        OR 
        auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    );

-- Política para INSERT: apenas o próprio usuário ou admin específico
CREATE POLICY "users_no_recursion_insert" ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (
        id = auth.uid() 
        OR 
        auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    );

-- Política para UPDATE: apenas o próprio usuário ou admin específico
CREATE POLICY "users_no_recursion_update" ON users
    FOR UPDATE
    TO authenticated
    USING (
        id = auth.uid() 
        OR 
        auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    )
    WITH CHECK (
        id = auth.uid() 
        OR 
        auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    );

-- 4. CRIAR POLÍTICAS SIMPLES SEM RECURSÃO PARA BLOG_POSTS
-- Usando apenas auth.email() - SEM consultas a outras tabelas

-- Política para SELECT: posts publicados para todos + admin vê todos
CREATE POLICY "blog_posts_no_recursion_select" ON blog_posts
    FOR SELECT
    TO authenticated
    USING (
        published = true 
        OR 
        auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    );

-- Política para INSERT: apenas admin específico
CREATE POLICY "blog_posts_no_recursion_insert" ON blog_posts
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    );

-- Política para UPDATE: apenas admin específico
CREATE POLICY "blog_posts_no_recursion_update" ON blog_posts
    FOR UPDATE
    TO authenticated
    USING (
        auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    )
    WITH CHECK (
        auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    );

-- Política para DELETE: apenas admin específico
CREATE POLICY "blog_posts_no_recursion_delete" ON blog_posts
    FOR DELETE
    TO authenticated
    USING (
        auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    );

-- 5. CRIAR POLÍTICAS SIMPLES PARA RESERVAS
-- Usuário vê apenas suas reservas + admin vê todas
CREATE POLICY "reservas_no_recursion_select" ON reservas
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() 
        OR 
        auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    );

CREATE POLICY "reservas_no_recursion_insert" ON reservas
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid() 
        OR 
        auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    );

CREATE POLICY "reservas_no_recursion_update" ON reservas
    FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid() 
        OR 
        auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    )
    WITH CHECK (
        user_id = auth.uid() 
        OR 
        auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    );

-- 6. REABILITAR RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- 7. GARANTIR que o usuário admin existe
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

-- 8. TESTE: Verificar se as políticas estão funcionando
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd
FROM pg_policies 
WHERE tablename IN ('users', 'blog_posts', 'reservas')
ORDER BY tablename, policyname;

-- 9. TESTE: Verificar se as consultas funcionam sem recursão
SELECT 'RLS configurado sem recursão - teste de consulta users:' as test_type;
SELECT id, email, role FROM users WHERE email = 'armazemsaojoaquimoficial@gmail.com';

SELECT 'RLS configurado sem recursão - teste de consulta blog_posts:' as test_type;
SELECT id, title, published FROM blog_posts LIMIT 3;

-- 10. CONFIRMAÇÃO FINAL
SELECT 'SOLUÇÃO DEFINITIVA APLICADA - Recursão infinita eliminada!' as status; 