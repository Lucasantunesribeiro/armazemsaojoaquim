-- 🔒 SOLUÇÃO ALTERNATIVA: Usar Service Role para Admin
-- Execute este script no Supabase SQL Editor

-- 1. DESABILITAR RLS temporariamente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservas DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER políticas existentes
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_simple_select_policy" ON users;
DROP POLICY IF EXISTS "users_simple_insert_policy" ON users;
DROP POLICY IF EXISTS "users_simple_update_policy" ON users;
DROP POLICY IF EXISTS "users_no_recursion_select" ON users;
DROP POLICY IF EXISTS "users_no_recursion_insert" ON users;
DROP POLICY IF EXISTS "users_no_recursion_update" ON users;

DROP POLICY IF EXISTS "blog_posts_select_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_insert_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_update_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_delete_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_no_recursion_select" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_no_recursion_insert" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_no_recursion_update" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_no_recursion_delete" ON blog_posts;

-- 3. CRIAR políticas PUBLIC para consultas básicas
-- Permitir leitura de posts publicados para todos
CREATE POLICY "blog_posts_public_select" ON blog_posts
    FOR SELECT
    TO authenticated
    USING (published = true);

-- Permitir que usuários vejam apenas seus próprios dados
CREATE POLICY "users_own_data_select" ON users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- 4. REABILITAR RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- 5. GARANTIR que o usuário admin existe
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

-- 6. TESTE: Verificar políticas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd
FROM pg_policies 
WHERE tablename IN ('users', 'blog_posts', 'reservas')
ORDER BY tablename, policyname;

-- 7. CONFIRMAÇÃO
SELECT 'Políticas RLS configuradas para usar Service Role para admin!' as status;

-- INSTRUÇÕES PARA O CÓDIGO:
-- Para operações admin, use o Service Role no backend:
-- const supabase = createClient(
--   process.env.NEXT_PUBLIC_SUPABASE_URL!,
--   process.env.SUPABASE_SERVICE_ROLE_KEY!
-- )
-- 
-- O Service Role bypassa COMPLETAMENTE o RLS
-- Use apenas para operações admin autenticadas 