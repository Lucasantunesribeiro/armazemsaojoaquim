-- Migração: Corrigir políticas RLS para permitir operações
-- Migration: 002_fix_rls_policies
-- Created: 2024-12-20

-- Remover políticas restritivas existentes
DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can create own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow status update by confirmation token" ON public.reservations;

-- Política mais permissiva para INSERT (criação de reservas)
-- Permite criação de reservas mesmo sem autenticação (uso comum em restaurantes)
CREATE POLICY "Allow public reservation creation" ON public.reservations
    FOR INSERT 
    WITH CHECK (true);

-- Política para SELECT (visualização)
-- Permite visualizar próprias reservas se autenticado, ou por token
CREATE POLICY "Allow reading reservations" ON public.reservations
    FOR SELECT USING (
        auth.uid() = user_id 
        OR 
        confirmation_token IS NOT NULL
    );

-- Política para UPDATE (atualização)
-- Permite update se é o próprio usuário ou via token de confirmação
CREATE POLICY "Allow updating reservations" ON public.reservations
    FOR UPDATE USING (
        auth.uid() = user_id 
        OR 
        confirmation_token IS NOT NULL
    );

-- Política para DELETE (exclusão)
-- Permite deletar apenas próprias reservas se autenticado
CREATE POLICY "Allow deleting own reservations" ON public.reservations
    FOR DELETE USING (auth.uid() = user_id);

-- Adicionar política especial para operações administrativas
-- Permite acesso total com a service role key
CREATE POLICY "Allow admin access" ON public.reservations
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Comentários das novas políticas
COMMENT ON POLICY "Allow public reservation creation" ON public.reservations IS 
'Permite criação de reservas públicas (comum em restaurantes)';

COMMENT ON POLICY "Allow reading reservations" ON public.reservations IS 
'Permite visualização de reservas próprias ou por token';

COMMENT ON POLICY "Allow updating reservations" ON public.reservations IS 
'Permite atualização por proprietário ou token de confirmação';

COMMENT ON POLICY "Allow deleting own reservations" ON public.reservations IS 
'Permite exclusão apenas pelo proprietário autenticado';

COMMENT ON POLICY "Allow admin access" ON public.reservations IS 
'Acesso administrativo total com service role key'; 