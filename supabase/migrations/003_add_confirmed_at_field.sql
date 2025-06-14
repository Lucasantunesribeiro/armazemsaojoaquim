-- Migração: Adicionar campo confirmado_em
-- Migration: 003_add_confirmed_at_field
-- Created: 2024-12-20

-- Verificar se a coluna já existe antes de adicionar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reservations' 
        AND column_name = 'confirmado_em'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar coluna confirmado_em
        ALTER TABLE public.reservations 
        ADD COLUMN confirmado_em TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        
        -- Comentário da nova coluna
        COMMENT ON COLUMN public.reservations.confirmado_em IS 'Data/hora em que a reserva foi confirmada via email';
        
        -- Índice para performance
        CREATE INDEX idx_reservations_confirmado_em ON public.reservations(confirmado_em);
        
        RAISE NOTICE 'Coluna confirmado_em adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna confirmado_em já existe, pulando migração';
    END IF;
END $$; 