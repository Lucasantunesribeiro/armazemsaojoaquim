-- Tabela de quadros da galeria de arte
CREATE TABLE art_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('SANTA_TERESA_HISTORICA', 'RIO_ANTIGO', 'ARTE_CONTEMPORANEA', 'RETRATOS_BAIRRO')),
  dimensions TEXT, -- Ex: "50x70cm"
  year_created INTEGER,
  historical_context TEXT,
  stock_quantity INTEGER DEFAULT 1,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de pedidos de arte
CREATE TABLE art_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  artwork_ids UUID[] NOT NULL, -- Array de IDs dos quadros
  artwork_details JSONB NOT NULL, -- Detalhes dos quadros no momento da compra
  total_price DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL, -- {street, city, state, zip, country}
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  order_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW') NOT NULL
);

-- Índices para performance
CREATE INDEX idx_art_gallery_category ON art_gallery(category);
CREATE INDEX idx_art_gallery_featured ON art_gallery(featured);
CREATE INDEX idx_art_gallery_price ON art_gallery(price);
CREATE INDEX idx_art_orders_status ON art_orders(status);
CREATE INDEX idx_art_orders_date ON art_orders(order_date);
CREATE INDEX idx_art_orders_email ON art_orders(email);

-- RLS Policies
ALTER TABLE art_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_orders ENABLE ROW LEVEL SECURITY;

-- Políticas para art_gallery
CREATE POLICY "Todos podem ver quadros disponíveis" ON art_gallery
  FOR SELECT USING (stock_quantity > 0);

CREATE POLICY "Apenas admins podem gerenciar quadros" ON art_gallery
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para art_orders
CREATE POLICY "Usuários podem criar pedidos" ON art_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem ver seus próprios pedidos" ON art_orders
  FOR SELECT USING (
    auth.jwt() ->> 'email' = email OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Apenas admins podem atualizar pedidos" ON art_orders
  FOR UPDATE USING (
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

CREATE TRIGGER update_art_gallery_updated_at BEFORE UPDATE ON art_gallery
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_art_orders_updated_at BEFORE UPDATE ON art_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();