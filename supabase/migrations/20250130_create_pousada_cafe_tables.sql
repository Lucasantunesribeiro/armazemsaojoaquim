-- Tabela de quartos da pousada
CREATE TABLE pousada_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('STANDARD', 'DELUXE', 'SUITE')),
  price_refundable DECIMAL(10,2) NOT NULL,
  price_non_refundable DECIMAL(10,2) NOT NULL,
  description TEXT,
  amenities TEXT[],
  max_guests INTEGER DEFAULT 2,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de reservas da pousada
CREATE TABLE pousada_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES pousada_rooms(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  is_refundable BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de produtos do café
CREATE TABLE cafe_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('CAFE', 'SORVETE', 'DOCE', 'SALGADO', 'BEBIDA')),
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de pedidos do café
CREATE TABLE cafe_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  products JSONB NOT NULL, -- Array de {product_id, name, price, quantity}
  total_price DECIMAL(10,2) NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para performance
CREATE INDEX idx_pousada_bookings_dates ON pousada_bookings(check_in, check_out);
CREATE INDEX idx_pousada_rooms_type ON pousada_rooms(type);
CREATE INDEX idx_cafe_products_category ON cafe_products(category);
CREATE INDEX idx_cafe_orders_date ON cafe_orders(order_date);

-- RLS Policies
ALTER TABLE pousada_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE pousada_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_orders ENABLE ROW LEVEL SECURITY;

-- Políticas para pousada_rooms
CREATE POLICY "Todos podem ver quartos disponíveis" ON pousada_rooms
  FOR SELECT USING (available = true);

CREATE POLICY "Apenas admins podem gerenciar quartos" ON pousada_rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para pousada_bookings
CREATE POLICY "Usuários podem criar reservas" ON pousada_bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem ver suas próprias reservas" ON pousada_bookings
  FOR SELECT USING (
    auth.jwt() ->> 'email' = email OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Apenas admins podem atualizar reservas" ON pousada_bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para cafe_products
CREATE POLICY "Todos podem ver produtos do café" ON cafe_products
  FOR SELECT USING (available = true);

CREATE POLICY "Apenas admins podem gerenciar produtos do café" ON cafe_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para cafe_orders
CREATE POLICY "Usuários podem criar pedidos" ON cafe_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem ver seus próprios pedidos" ON cafe_orders
  FOR SELECT USING (
    auth.jwt() ->> 'email' = email OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Apenas admins podem atualizar pedidos" ON cafe_orders
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

CREATE TRIGGER update_pousada_rooms_updated_at BEFORE UPDATE ON pousada_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pousada_bookings_updated_at BEFORE UPDATE ON pousada_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cafe_products_updated_at BEFORE UPDATE ON cafe_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cafe_orders_updated_at BEFORE UPDATE ON cafe_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();