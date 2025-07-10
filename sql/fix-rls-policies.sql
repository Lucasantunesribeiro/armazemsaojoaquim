-- 🔒 CORREÇÃO DAS POLÍTICAS RLS PARA BLOG_POSTS
-- Execute este script no Supabase SQL Editor

-- 1. Verificar políticas atuais
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd, 
    roles, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'blog_posts';

-- 2. Remover políticas existentes se necessário
DROP POLICY IF EXISTS "blog_posts_select_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_insert_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_update_policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_delete_policy" ON blog_posts;

-- 3. Criar políticas para usuários admin

-- 3.1 Política para SELECT (ler posts)
-- Permite: posts publicados para todos, todos os posts para admins
CREATE POLICY "blog_posts_select_policy" ON blog_posts
    FOR SELECT
    TO authenticated
    USING (
        published = true 
        OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (
                users.role = 'admin' 
                OR 
                users.email = 'armazemsaojoaquimoficial@gmail.com'
            )
        )
    );

-- 3.2 Política para INSERT (criar novos posts - apenas admin)
CREATE POLICY "blog_posts_insert_policy" ON blog_posts
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (
                users.role = 'admin' 
                OR 
                users.email = 'armazemsaojoaquimoficial@gmail.com'
            )
        )
    );

-- 3.3 Política para UPDATE (atualizar posts - apenas admin)
CREATE POLICY "blog_posts_update_policy" ON blog_posts
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (
                users.role = 'admin' 
                OR 
                users.email = 'armazemsaojoaquimoficial@gmail.com'
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (
                users.role = 'admin' 
                OR 
                users.email = 'armazemsaojoaquimoficial@gmail.com'
            )
        )
    );

-- 3.4 Política para DELETE (deletar posts - apenas admin)
CREATE POLICY "blog_posts_delete_policy" ON blog_posts
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (
                users.role = 'admin' 
                OR 
                users.email = 'armazemsaojoaquimoficial@gmail.com'
            )
        )
    );

-- 4. Verificar se RLS está ativado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'blog_posts';

-- 5. Ativar RLS se não estiver ativo
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 6. Verificar se usuário admin existe
SELECT 
    id, 
    email, 
    role,
    created_at
FROM users 
WHERE email = 'armazemsaojoaquimoficial@gmail.com' 
   OR role = 'admin';

-- 7. Criar usuário admin se não existir
INSERT INTO users (id, email, role, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'armazemsaojoaquimoficial@gmail.com',
    'admin',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users 
    WHERE email = 'armazemsaojoaquimoficial@gmail.com'
);

-- 8. Garantir que o usuário admin tem role = 'admin'
UPDATE users 
SET role = 'admin', updated_at = NOW()
WHERE email = 'armazemsaojoaquimoficial@gmail.com';

-- 9. Verificar políticas criadas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd, 
    roles, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'blog_posts'
ORDER BY policyname;

-- 10. Teste de política - deve retornar dados se executado por admin
SELECT 
    id, 
    title, 
    published, 
    created_at
FROM blog_posts 
LIMIT 5;

-- 11. Verificar se a tabela users também tem RLS configurado
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 12. Criar política para tabela users se necessário
CREATE POLICY IF NOT EXISTS "users_select_policy" ON users
    FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() 
        OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (
                users.role = 'admin' 
                OR 
                users.email = 'armazemsaojoaquimoficial@gmail.com'
            )
        )
    );

-- 13. Ativar RLS na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 14. Verificação final
SELECT 'blog_posts RLS configurado com sucesso!' as status;