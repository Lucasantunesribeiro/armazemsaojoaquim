-- Create tables for Armazem São Joaquim
-- Execute this first

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  horario TIME NOT NULL,
  pessoas INTEGER NOT NULL CHECK (pessoas > 0),
  status VARCHAR(50) DEFAULT 'pendente',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sequência para menu_items
CREATE SEQUENCE IF NOT EXISTS menu_items_id_seq;

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY DEFAULT nextval('menu_items_id_seq'),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  preco DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
  categoria VARCHAR(100) NOT NULL,
  disponivel BOOLEAN DEFAULT true,
  imagem VARCHAR(500),
  ingredientes TEXT[],
  alergenos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Associar a sequência à tabela
ALTER SEQUENCE menu_items_id_seq OWNED BY menu_items.id;

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  resumo TEXT NOT NULL,
  imagem VARCHAR(500),
  publicado BOOLEAN DEFAULT false,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);