-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  pessoas INTEGER NOT NULL CHECK (pessoas >= 1 AND pessoas <= 20),
  status VARCHAR(50) DEFAULT 'confirmada' CHECK (status IN ('confirmada', 'cancelada', 'concluida')),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  preco DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
  categoria VARCHAR(100) NOT NULL,
  disponivel BOOLEAN DEFAULT true,
  imagem TEXT,
  ingredientes TEXT[],
  alergenos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  resumo TEXT NOT NULL,
  imagem TEXT,
  publicado BOOLEAN DEFAULT false,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_reservas_data ON reservas(data);
CREATE INDEX idx_reservas_user_id ON reservas(user_id);
CREATE INDEX idx_reservas_status ON reservas(status);
CREATE INDEX idx_menu_items_categoria ON menu_items(categoria);
CREATE INDEX idx_menu_items_disponivel ON menu_items(disponivel);
CREATE INDEX idx_blog_posts_publicado ON blog_posts(publicado);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and update their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own data during signup
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Reservas policies
CREATE POLICY "Users can view own reservas" ON reservas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reservas" ON reservas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservas" ON reservas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reservas" ON reservas
  FOR DELETE USING (auth.uid() = user_id);

-- Menu items are public for reading
CREATE POLICY "Anyone can view menu items" ON menu_items
  FOR SELECT USING (true);

-- Blog posts are public for reading if published
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
  FOR SELECT USING (publicado = true);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservas_updated_at BEFORE UPDATE ON reservas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample menu items
INSERT INTO menu_items (nome, descricao, preco, categoria, disponivel) VALUES
('Caipirinha Clássica', 'A tradicional caipirinha brasileira com cachaça artesanal', 18.00, 'Drinks', true),
('Gin Tônica Premium', 'Gin importado com água tônica premium e especiarias', 25.00, 'Drinks', true),
('Negroni', 'Drink clássico italiano com gin, vermute rosso e Campari', 28.00, 'Drinks', true),
('Feijoada Completa', 'Feijoada tradicional servida com acompanhamentos', 45.00, 'Pratos Principais', true),
('Bobó de Camarão', 'Bobó cremoso com camarões frescos e dendê', 38.00, 'Pratos Principais', true),
('Moqueca Baiana', 'Moqueca de peixe com leite de coco e dendê', 42.00, 'Pratos Principais', true),
('Pão de Açúcar', 'Pãozinho artesanal com geleia da casa', 8.00, 'Entradas', true),
('Bolinho de Bacalhau', 'Bolinhos crocantes de bacalhau com aioli', 15.00, 'Entradas', true),
('Torta de Limão', 'Torta cremosa de limão com merengue', 16.00, 'Sobremesas', true),
('Brigadeiro Gourmet', 'Brigadeiros artesanais com diversos sabores', 12.00, 'Sobremesas', true);

-- Insert sample blog post
INSERT INTO blog_posts (titulo, conteudo, resumo, publicado, author_id, slug) VALUES
('A História do Armazém São Joaquim', 
'O Armazém São Joaquim iniciou a sua jornada somando história, autenticidade e diversidade no bairro mais charmoso do Rio de Janeiro, Santa Teresa. 

Construído em 1854, com fachada de pedra feita à mão, foi armazém com 150 anos de funcionamento ininterrupto, até a morte de sua última herdeira, Stella Cruz em 2000.

Santa Teresa parece ter parado no tempo, preservando aspectos do Rio Antigo e guardando uma história em cada esquina. O bairro, carinhosamente chamado pelos cariocas de "Santa", é composto de várias ladeiras tortuosas.

Com a aceleração do processo de loteamento das chácaras, a partir dos anos 1850, e a consequente aglomeração de moradores, o bonde, hoje tão vinculado à identidade de Santa Teresa, chegou ao bairro em 1872.', 
'Conheça a rica história do Armazém São Joaquim, um marco histórico de Santa Teresa com mais de 170 anos de existência.',
true,
gen_random_uuid(),
'historia-armazem-sao-joaquim');