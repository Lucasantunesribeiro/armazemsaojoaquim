-- Migração: Criação da tabela de reservas
-- Migration: 001_create_reservations_table
-- Created: 2024-12-20

-- Limpar estruturas existentes
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar tabela de reservas
CREATE TABLE public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    pessoas INTEGER NOT NULL CHECK (pessoas >= 1 AND pessoas <= 20),
    observacoes TEXT,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada', 'cancelada')),
    confirmation_token VARCHAR(64) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX idx_reservations_data ON public.reservations(data);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_confirmation_token ON public.reservations(confirmation_token);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON public.reservations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias reservas
CREATE POLICY "Users can view own reservations" ON public.reservations
    FOR SELECT USING (auth.uid() = user_id);

-- Política: Usuários podem criar reservas para si mesmos
CREATE POLICY "Users can create own reservations" ON public.reservations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias reservas
CREATE POLICY "Users can update own reservations" ON public.reservations
    FOR UPDATE USING (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias reservas
CREATE POLICY "Users can delete own reservations" ON public.reservations
    FOR DELETE USING (auth.uid() = user_id);

-- Política especial: Permitir confirmação por token (para API pública)
CREATE POLICY "Allow confirmation by token" ON public.reservations
    FOR UPDATE 
    USING (confirmation_token IS NOT NULL)
    WITH CHECK (confirmation_token IS NOT NULL);

-- Comentários da tabela
COMMENT ON TABLE public.reservations IS 'Tabela de reservas do restaurante Armazém São Joaquim';
COMMENT ON COLUMN public.reservations.id IS 'ID único da reserva';
COMMENT ON COLUMN public.reservations.user_id IS 'ID do usuário que fez a reserva';
COMMENT ON COLUMN public.reservations.nome IS 'Nome completo para a reserva';
COMMENT ON COLUMN public.reservations.email IS 'Email para confirmação';
COMMENT ON COLUMN public.reservations.telefone IS 'Telefone de contato';
COMMENT ON COLUMN public.reservations.data IS 'Data da reserva';
COMMENT ON COLUMN public.reservations.horario IS 'Horário da reserva';
COMMENT ON COLUMN public.reservations.pessoas IS 'Número de pessoas (1-20)';
COMMENT ON COLUMN public.reservations.observacoes IS 'Observações especiais';
COMMENT ON COLUMN public.reservations.status IS 'Status da reserva: pendente, confirmada, cancelada';
COMMENT ON COLUMN public.reservations.confirmation_token IS 'Token único para confirmação por email';
COMMENT ON COLUMN public.reservations.created_at IS 'Data/hora de criação';
COMMENT ON COLUMN public.reservations.updated_at IS 'Data/hora da última atualização'; 