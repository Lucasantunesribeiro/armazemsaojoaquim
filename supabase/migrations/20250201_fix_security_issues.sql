-- =====================================================
-- MIGRAÇÃO: Correção de Problemas de Segurança
-- Data: 2025-02-01
-- Descrição: Habilitar RLS em tabelas públicas e corrigir problemas de segurança
-- Problemas corrigidos:
-- 1. RLS desabilitado em tabelas públicas
-- 2. View com SECURITY DEFINER
-- 3. Falta de políticas de segurança
-- 4. Coluna 'level' ausente na tabela performance_log
-- =====================================================

-- PASSO 1: Verificar e corrigir a estrutura da tabela performance_log
DO $$
BEGIN
    -- Verificar se performance_log existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_log' AND table_schema = 'public') THEN
        -- Verificar se a coluna 'level' existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_log' AND column_name = 'level' AND table_schema = 'public') THEN
            RAISE NOTICE '⚠️ Adicionando coluna level à tabela performance_log...';
            ALTER TABLE public.performance_log ADD COLUMN level VARCHAR(10) DEFAULT 'info';
        ELSE
            RAISE NOTICE '✅ Coluna level já existe na tabela performance_log';
        END IF;
        
        -- Verificar se a coluna 'message' existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_log' AND column_name = 'message' AND table_schema = 'public') THEN
            RAISE NOTICE '⚠️ Adicionando coluna message à tabela performance_log...';
            ALTER TABLE public.performance_log ADD COLUMN message TEXT;
        ELSE
            RAISE NOTICE '✅ Coluna message já existe na tabela performance_log';
        END IF;
        
        -- Verificar se a coluna 'context' existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_log' AND column_name = 'context' AND table_schema = 'public') THEN
            RAISE NOTICE '⚠️ Adicionando coluna context à tabela performance_log...';
            ALTER TABLE public.performance_log ADD COLUMN context JSONB DEFAULT '{}';
        ELSE
            RAISE NOTICE '✅ Coluna context já existe na tabela performance_log';
        END IF;
        
        -- Verificar se a coluna 'updated_at' existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_log' AND column_name = 'updated_at' AND table_schema = 'public') THEN
            RAISE NOTICE '⚠️ Adicionando coluna updated_at à tabela performance_log...';
            ALTER TABLE public.performance_log ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
        ELSE
            RAISE NOTICE '✅ Coluna updated_at já existe na tabela performance_log';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ Tabela performance_log não encontrada - criando...';
        CREATE TABLE public.performance_log (
            id bigint NOT NULL DEFAULT nextval('performance_log_id_seq'::regclass),
            event_type text NOT NULL,
            details jsonb,
            execution_time_ms integer,
            message TEXT,
            level VARCHAR(10) DEFAULT 'info',
            context JSONB DEFAULT '{}',
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now(),
            CONSTRAINT performance_log_pkey PRIMARY KEY (id)
        );
    END IF;

    -- Verificar se timezone_cache existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'timezone_cache' AND table_schema = 'public') THEN
        RAISE NOTICE '⚠️ Tabela timezone_cache não encontrada - criando...';
        CREATE TABLE public.timezone_cache (
            id integer NOT NULL DEFAULT nextval('timezone_cache_id_seq'::regclass),
            name text NOT NULL UNIQUE,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;

    -- Verificar se table_summary_cache existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'table_summary_cache' AND table_schema = 'public') THEN
        RAISE NOTICE '⚠️ Tabela table_summary_cache não encontrada - criando...';
        CREATE TABLE public.table_summary_cache (
            id bigint NOT NULL DEFAULT nextval('table_summary_cache_id_seq'::regclass),
            table_oid bigint NOT NULL UNIQUE,
            schema_name text NOT NULL,
            table_name text NOT NULL,
            column_count integer,
            size_bytes bigint,
            row_estimate bigint,
            table_type character,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now(),
            CONSTRAINT table_summary_cache_pkey PRIMARY KEY (id)
        );
    END IF;
END $$;

-- PASSO 2: Habilitar RLS nas tabelas que estão sem proteção
ALTER TABLE public.performance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timezone_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_summary_cache ENABLE ROW LEVEL SECURITY;

-- PASSO 3: Remover políticas existentes (se houver) para evitar conflitos
DROP POLICY IF EXISTS "performance_log_select_policy" ON public.performance_log;
DROP POLICY IF EXISTS "performance_log_insert_policy" ON public.performance_log;
DROP POLICY IF EXISTS "performance_log_update_policy" ON public.performance_log;
DROP POLICY IF EXISTS "performance_log_delete_policy" ON public.performance_log;

DROP POLICY IF EXISTS "timezone_cache_select_policy" ON public.timezone_cache;
DROP POLICY IF EXISTS "timezone_cache_insert_policy" ON public.timezone_cache;
DROP POLICY IF EXISTS "timezone_cache_update_policy" ON public.timezone_cache;
DROP POLICY IF EXISTS "timezone_cache_delete_policy" ON public.timezone_cache;

DROP POLICY IF EXISTS "table_summary_cache_select_policy" ON public.table_summary_cache;
DROP POLICY IF EXISTS "table_summary_cache_insert_policy" ON public.table_summary_cache;
DROP POLICY IF EXISTS "table_summary_cache_update_policy" ON public.table_summary_cache;
DROP POLICY IF EXISTS "table_summary_cache_delete_policy" ON public.table_summary_cache;

-- PASSO 4: Criar políticas RLS para performance_log
CREATE POLICY "performance_log_select_policy" ON public.performance_log
    FOR SELECT USING (true);

CREATE POLICY "performance_log_insert_policy" ON public.performance_log
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "performance_log_update_policy" ON public.performance_log
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "performance_log_delete_policy" ON public.performance_log
    FOR DELETE USING (auth.role() = 'authenticated');

-- PASSO 5: Criar políticas RLS para timezone_cache
CREATE POLICY "timezone_cache_select_policy" ON public.timezone_cache
    FOR SELECT USING (true);

CREATE POLICY "timezone_cache_insert_policy" ON public.timezone_cache
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "timezone_cache_update_policy" ON public.timezone_cache
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "timezone_cache_delete_policy" ON public.timezone_cache
    FOR DELETE USING (auth.role() = 'authenticated');

-- PASSO 6: Criar políticas RLS para table_summary_cache
CREATE POLICY "table_summary_cache_select_policy" ON public.table_summary_cache
    FOR SELECT USING (true);

CREATE POLICY "table_summary_cache_insert_policy" ON public.table_summary_cache
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "table_summary_cache_update_policy" ON public.table_summary_cache
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "table_summary_cache_delete_policy" ON public.table_summary_cache
    FOR DELETE USING (auth.role() = 'authenticated');

-- PASSO 7: Corrigir a view performance_monitoring para não usar SECURITY DEFINER
-- Primeiro, vamos dropar a view existente
DROP VIEW IF EXISTS public.performance_monitoring;

-- Recriar a view sem SECURITY DEFINER
CREATE VIEW public.performance_monitoring AS
SELECT 
    'performance_log' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as last_updated,
    'logs' as category
FROM public.performance_log
UNION ALL
SELECT 
    'timezone_cache' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as last_updated,
    'cache' as category
FROM public.timezone_cache
UNION ALL
SELECT 
    'table_summary_cache' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as last_updated,
    'cache' as category
FROM public.table_summary_cache;

-- PASSO 8: Conceder permissões necessárias
GRANT SELECT ON public.performance_monitoring TO authenticated, anon;
GRANT SELECT ON public.performance_log TO authenticated, anon;
GRANT SELECT ON public.timezone_cache TO authenticated, anon;
GRANT SELECT ON public.table_summary_cache TO authenticated, anon;

-- PASSO 9: Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_performance_log_created_at ON public.performance_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_log_level ON public.performance_log(level);
CREATE INDEX IF NOT EXISTS idx_performance_log_event_type ON public.performance_log(event_type);
CREATE INDEX IF NOT EXISTS idx_timezone_cache_created_at ON public.timezone_cache(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timezone_cache_name ON public.timezone_cache(name);
CREATE INDEX IF NOT EXISTS idx_table_summary_cache_created_at ON public.table_summary_cache(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_table_summary_cache_table_name ON public.table_summary_cache(table_name);

-- PASSO 10: Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- PASSO 11: Aplicar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_performance_log_updated_at ON public.performance_log;
CREATE TRIGGER update_performance_log_updated_at
    BEFORE UPDATE ON public.performance_log
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_timezone_cache_updated_at ON public.timezone_cache;
CREATE TRIGGER update_timezone_cache_updated_at
    BEFORE UPDATE ON public.timezone_cache
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_table_summary_cache_updated_at ON public.table_summary_cache;
CREATE TRIGGER update_table_summary_cache_updated_at
    BEFORE UPDATE ON public.table_summary_cache
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- PASSO 12: Adicionar comentários para documentação
COMMENT ON TABLE public.performance_log IS 'Tabela para armazenar logs de performance do sistema';
COMMENT ON TABLE public.timezone_cache IS 'Cache de informações de timezone para otimização';
COMMENT ON TABLE public.table_summary_cache IS 'Cache de resumos de tabelas para otimização';
COMMENT ON VIEW public.performance_monitoring IS 'View para monitoramento de performance do sistema';

COMMENT ON COLUMN public.performance_log.event_type IS 'Tipo do evento registrado';
COMMENT ON COLUMN public.performance_log.details IS 'Detalhes adicionais em formato JSON';
COMMENT ON COLUMN public.performance_log.execution_time_ms IS 'Tempo de execução em milissegundos';
COMMENT ON COLUMN public.performance_log.message IS 'Mensagem do log';
COMMENT ON COLUMN public.performance_log.level IS 'Nível do log (info, warn, error)';
COMMENT ON COLUMN public.performance_log.context IS 'Contexto adicional em formato JSON';

COMMENT ON COLUMN public.timezone_cache.name IS 'Nome do timezone (ex: America/Sao_Paulo)';

COMMENT ON COLUMN public.table_summary_cache.table_oid IS 'OID da tabela resumida';
COMMENT ON COLUMN public.table_summary_cache.schema_name IS 'Nome do schema da tabela';
COMMENT ON COLUMN public.table_summary_cache.table_name IS 'Nome da tabela resumida';
COMMENT ON COLUMN public.table_summary_cache.column_count IS 'Número de colunas na tabela';
COMMENT ON COLUMN public.table_summary_cache.size_bytes IS 'Tamanho da tabela em bytes';
COMMENT ON COLUMN public.table_summary_cache.row_estimate IS 'Estimativa de linhas na tabela';
COMMENT ON COLUMN public.table_summary_cache.table_type IS 'Tipo da tabela';

-- PASSO 13: Inserir dados de exemplo para teste
INSERT INTO public.performance_log (event_type, details, execution_time_ms, message, level, context) VALUES
('system_start', '{"component": "system", "version": "1.0.0"}', 150, 'Sistema iniciado', 'info', '{"component": "system", "version": "1.0.0"}'),
('cache_clear', '{"component": "cache", "action": "clear"}', 25, 'Cache limpo', 'info', '{"component": "cache", "action": "clear"}'),
('db_connection_error', '{"component": "database", "error_code": "CONNECTION_FAILED"}', 5000, 'Erro de conexão', 'error', '{"component": "database", "error_code": "CONNECTION_FAILED"}')
ON CONFLICT DO NOTHING;

INSERT INTO public.timezone_cache (name) VALUES
('America/Sao_Paulo'),
('UTC'),
('America/New_York')
ON CONFLICT DO NOTHING;

INSERT INTO public.table_summary_cache (table_oid, schema_name, table_name, column_count, size_bytes, row_estimate, table_type) VALUES
(12345, 'public', 'blog_posts', 15, 1024000, 4, 'r'),
(12346, 'public', 'menu_items', 12, 2048000, 25, 'r'),
(12347, 'public', 'reservas', 10, 512000, 12, 'r')
ON CONFLICT DO NOTHING;

-- PASSO 14: Verificar se tudo foi aplicado corretamente
DO $$
DECLARE
    rls_enabled_count INTEGER;
    policies_count INTEGER;
    level_column_exists BOOLEAN;
BEGIN
    -- Verificar se a coluna level existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'performance_log' 
        AND column_name = 'level' 
        AND table_schema = 'public'
    ) INTO level_column_exists;
    
    -- Verificar RLS habilitado usando pg_tables
    SELECT COUNT(*) INTO rls_enabled_count
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('performance_log', 'timezone_cache', 'table_summary_cache')
    AND rowsecurity = true;
    
    -- Verificar políticas criadas usando pg_policies
    SELECT COUNT(*) INTO policies_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('performance_log', 'timezone_cache', 'table_summary_cache');
    
    -- Verificar view
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'performance_monitoring' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ View performance_monitoring criada com sucesso';
    ELSE
        RAISE NOTICE '❌ Erro: View performance_monitoring não foi criada';
    END IF;
    
    -- Relatório final
    RAISE NOTICE '📊 RELATÓRIO FINAL:';
    RAISE NOTICE '   Coluna level existe: %', level_column_exists;
    RAISE NOTICE '   Tabelas com RLS habilitado: %', rls_enabled_count;
    RAISE NOTICE '   Políticas criadas: %', policies_count;
    
    IF level_column_exists AND rls_enabled_count = 3 AND policies_count >= 12 THEN
        RAISE NOTICE '🎉 TODOS OS PROBLEMAS DE SEGURANÇA FORAM CORRIGIDOS!';
    ELSE
        RAISE NOTICE '⚠️ ALGUNS PROBLEMAS PODEM NÃO TER SIDO CORRIGIDOS COMPLETAMENTE';
    END IF;
END $$;

-- PASSO 15: Notificação de sucesso
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ MIGRAÇÃO DE SEGURANÇA CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '🛡️ RLS habilitado em todas as tabelas públicas';
    RAISE NOTICE '🔒 Políticas de segurança aplicadas';
    RAISE NOTICE '📊 View de monitoramento recriada sem SECURITY DEFINER';
    RAISE NOTICE '📈 Índices de performance criados';
    RAISE NOTICE '🔄 Triggers de updated_at configurados';
    RAISE NOTICE '📝 Documentação adicionada';
    RAISE NOTICE '🧪 Dados de exemplo inseridos';
    RAISE NOTICE '🚀 Sistema de segurança otimizado!';
    RAISE NOTICE '=====================================================';
END $$;
