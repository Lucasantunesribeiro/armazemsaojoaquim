-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservas;
DROP POLICY IF EXISTS "Users can create own reservations" ON public.reservas;
DROP POLICY IF EXISTS "Users can update own reservations" ON public.reservas;
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.reservas;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_check_reserva_conflict ON public.reservas;
DROP TRIGGER IF EXISTS trigger_generate_confirmation_code ON public.reservas;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS check_reserva_conflict();
DROP FUNCTION IF EXISTS generate_confirmation_code();
DROP FUNCTION IF EXISTS confirm_reserva(UUID);
DROP FUNCTION IF EXISTS cancel_reserva(UUID, TEXT);

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.reservas_stats;

-- Criar tabela de reservas
CREATE TABLE IF NOT EXISTS public.reservas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    pessoas INTEGER NOT NULL CHECK (pessoas > 0 AND pessoas <= 20),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada', 'cancelada', 'concluida')),
    observacoes TEXT,
    email_confirmacao_enviado BOOLEAN DEFAULT FALSE,
    telefone_confirmacao VARCHAR(20),
    codigo_confirmacao VARCHAR(10),
    confirmado_em TIMESTAMP WITH TIME ZONE,
    cancelado_em TIMESTAMP WITH TIME ZONE,
    cancelado_por UUID REFERENCES auth.users(id),
    motivo_cancelamento TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_reservas_user_id;
DROP INDEX IF EXISTS idx_reservas_data;
DROP INDEX IF EXISTS idx_reservas_status;
DROP INDEX IF EXISTS idx_reservas_data_horario;

-- Índices para performance
CREATE INDEX idx_reservas_user_id ON public.reservas(user_id);
CREATE INDEX idx_reservas_data ON public.reservas(data);
CREATE INDEX idx_reservas_status ON public.reservas(status);
CREATE INDEX idx_reservas_data_horario ON public.reservas(data, horario);

-- Função para verificar conflitos de horário
CREATE OR REPLACE FUNCTION check_reserva_conflict()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se já existe reserva confirmada no mesmo horário
    IF EXISTS (
        SELECT 1 FROM public.reservas 
        WHERE data = NEW.data 
        AND horario = NEW.horario 
        AND status IN ('confirmada', 'pendente')
        AND id != COALESCE(NEW.id, gen_random_uuid())
    ) THEN
        RAISE EXCEPTION 'Já existe uma reserva para este horário';
    END IF;
    
    -- Verificar se a data não é no passado
    IF NEW.data < CURRENT_DATE THEN
        RAISE EXCEPTION 'Não é possível fazer reserva para data passada';
    END IF;
    
    -- Verificar horário de funcionamento (11:00 às 23:00)
    IF NEW.horario < '11:00'::time OR NEW.horario > '23:00'::time THEN
        RAISE EXCEPTION 'Horário deve estar entre 11:00 e 23:00';
    END IF;
    
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar conflitos
CREATE TRIGGER trigger_check_reserva_conflict
    BEFORE INSERT OR UPDATE ON public.reservas
    FOR EACH ROW
    EXECUTE FUNCTION check_reserva_conflict();

-- Função para gerar código de confirmação
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_confirmacao IS NULL THEN
        NEW.codigo_confirmacao = UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar código
CREATE TRIGGER trigger_generate_confirmation_code
    BEFORE INSERT ON public.reservas
    FOR EACH ROW
    EXECUTE FUNCTION generate_confirmation_code();

-- RLS Policies
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias reservas
CREATE POLICY "Users can view own reservations" ON public.reservas
    FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias reservas
CREATE POLICY "Users can create own reservations" ON public.reservas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias reservas
CREATE POLICY "Users can update own reservations" ON public.reservas
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin pode ver todas as reservas
CREATE POLICY "Admins can view all reservations" ON public.reservas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Função para confirmar reserva
CREATE OR REPLACE FUNCTION confirm_reserva(reserva_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.reservas 
    SET 
        status = 'confirmada',
        confirmado_em = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE id = reserva_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reserva não encontrada';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para cancelar reserva
CREATE OR REPLACE FUNCTION cancel_reserva(
    reserva_id UUID, 
    motivo TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    UPDATE public.reservas 
    SET 
        status = 'cancelada',
        cancelado_em = timezone('utc'::text, now()),
        cancelado_por = auth.uid(),
        motivo_cancelamento = motivo,
        updated_at = timezone('utc'::text, now())
    WHERE id = reserva_id
    AND (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_app_meta_data->>'role' = 'admin'
    ));
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reserva não encontrada ou sem permissão';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View para estatísticas de reservas
CREATE OR REPLACE VIEW public.reservas_stats AS
SELECT 
    DATE_TRUNC('month', data) as mes,
    COUNT(*) as total_reservas,
    COUNT(*) FILTER (WHERE status = 'confirmada') as confirmadas,
    COUNT(*) FILTER (WHERE status = 'cancelada') as canceladas,
    COUNT(*) FILTER (WHERE status = 'pendente') as pendentes,
    AVG(pessoas) as media_pessoas
FROM public.reservas
GROUP BY DATE_TRUNC('month', data)
ORDER BY mes DESC;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.reservas TO authenticated;
GRANT SELECT ON public.reservas_stats TO authenticated; 