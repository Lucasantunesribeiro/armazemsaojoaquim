-- Tabela de usuários personalizada (complementa auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  phone TEXT,
  address TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de monitoramento de queries lentas
CREATE TABLE IF NOT EXISTS slow_queries_monitor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query_text TEXT NOT NULL,
  execution_time_ms DECIMAL(10,3) NOT NULL,
  database_name TEXT,
  user_name TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  additional_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de cache de timezone
CREATE TABLE IF NOT EXISTS timezone_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timezone_name TEXT UNIQUE NOT NULL,
  utc_offset INTEGER NOT NULL, -- offset em minutos
  is_dst BOOLEAN DEFAULT false,
  region TEXT,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW() + INTERVAL '30 days') NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_slow_queries_timestamp ON slow_queries_monitor(timestamp);
CREATE INDEX IF NOT EXISTS idx_slow_queries_execution_time ON slow_queries_monitor(execution_time_ms);
CREATE INDEX IF NOT EXISTS idx_timezone_cache_name ON timezone_cache(timezone_name);
CREATE INDEX IF NOT EXISTS idx_timezone_cache_expires ON timezone_cache(expires_at);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE slow_queries_monitor ENABLE ROW LEVEL SECURITY;
ALTER TABLE timezone_cache ENABLE ROW LEVEL SECURITY;

-- Policies para users
CREATE POLICY "Usuários podem ver seu próprio perfil" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os usuários" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins podem atualizar qualquer usuário" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policies para slow_queries_monitor
CREATE POLICY "Apenas admins podem ver queries lentas" ON slow_queries_monitor
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Sistema pode inserir queries lentas" ON slow_queries_monitor
  FOR INSERT WITH CHECK (true);

-- Policies para timezone_cache
CREATE POLICY "Todos podem ver cache de timezone" ON timezone_cache
  FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem gerenciar cache de timezone" ON timezone_cache
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para limpar cache de timezone expirado
CREATE OR REPLACE FUNCTION cleanup_expired_timezone_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM timezone_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();