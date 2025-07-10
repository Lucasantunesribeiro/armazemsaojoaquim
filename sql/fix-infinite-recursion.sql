-- 🔒 CORREÇÃO: Recursão Infinita na Política RLS da Tabela Users
-- Execute este script no Supabase SQL Editor

-- 1. Verificar políticas atuais da tabela users
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd, 
    roles, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 2. REMOVER TODAS as políticas problemáticas da tabela users
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- 3. DESABILITAR RLS na tabela users temporariamente para quebrar recursão
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 4. Criar política simples SEM recursão para tabela users
-- Esta política permite:
-- - Usuários verem apenas seus próprios dados
-- - Admin específico por email (sem consulta recursiva)
CREATE POLICY "users_simple_select_policy" ON users
    FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() 
        OR 
        auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    );

-- 5. Política para INSERT (apenas o próprio usuário ou admin por email)
CREATE POLICY "users_simple_insert_policy" ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (
        id = auth.uid() 
        OR 
        auth.email() = 'armazemsaojoaquimoficial@gmail.com'
    );

-- 6. Política para UPDATE (apenas o próprio usuário ou admin por email)
CREATE POLICY "users_simple_update_policy" ON users
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

-- 7. REABILITAR RLS na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 8. Verificar se o usuário admin existe e está configurado
SELECT 
    id, 
    email, 
    role,
    created_at
FROM users 
WHERE email = 'armazemsaojoaquimoficial@gmail.com';

-- 9. Garantir que o usuário admin existe com role correto
INSERT INTO users (id, email, role, created_at, updated_at)
SELECT 
    '3ddbfb5e-eddf-4e39-983d-d3ff2f10eded'::uuid,
    'armazemsaojoaquimoficial@gmail.com',
    'admin',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users 
    WHERE email = 'armazemsaojoaquimoficial@gmail.com'
)
ON CONFLICT (id) DO UPDATE SET
    email = 'armazemsaojoaquimoficial@gmail.com',
    role = 'admin',
    updated_at = NOW();

-- 10. Testar se a consulta funciona sem recursão
SELECT 
    id, 
    email, 
    role
FROM users 
WHERE id = '3ddbfb5e-eddf-4e39-983d-d3ff2f10eded'::uuid;

-- 11. Verificar políticas finais
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd, 
    roles
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 12. Mensagem de confirmação
SELECT 'Políticas RLS corrigidas - recursão infinita resolvida!' as status;