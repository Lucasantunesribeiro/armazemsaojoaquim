-- Enable Row Level Security
-- Execute this after creating tables

-- Habilitar RLS (Row Level Security) para todas as tabelas

-- Habilitar RLS para a tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS para a tabela reservas
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS para a tabela menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS para a tabela blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;