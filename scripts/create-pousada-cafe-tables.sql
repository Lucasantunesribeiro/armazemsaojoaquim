-- Script para criar tabelas da pousada e café no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Tabela de quartos da pousada
CREATE TABLE IF NOT EXISTS pousada_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('STANDARD', 'DELUXE', 'SUITE')),
    price_refundable DECIMAL(10,2) NOT NULL,
    price_non_refundable DECIMAL(10,2) NOT NULL,
    description TEXT,
    amenities TEXT[] DEFAULT '{}',
    max_guests INTEGER NOT NULL DEFAULT 2,
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de reservas da pousada
CREATE TABLE IF NOT EXISTS pousada_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES pousada_rooms(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests_count INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada', 'cancelada', 'concluida')),
    refundable BOOLEAN DEFAULT true,
    special_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de produtos do café
CREATE TABLE IF NOT EXISTS cafe_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('cafes', 'sorvetes', 'doces', 'salgados', 'bebidas')),
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    ingredients TEXT[] DEFAULT '{}',
    allergens TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de pedidos do café
CREATE TABLE IF NOT EXISTS cafe_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    products JSONB NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    order_date TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'preparando', 'pronto', 'entregue', 'cancelado')),
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pousada_rooms_updated_at BEFORE UPDATE ON pousada_rooms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_pousada_bookings_updated_at BEFORE UPDATE ON pousada_bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_cafe_products_updated_at BEFORE UPDATE ON cafe_products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_cafe_orders_updated_at BEFORE UPDATE ON cafe_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_pousada_rooms_type ON pousada_rooms(type);
CREATE INDEX IF NOT EXISTS idx_pousada_rooms_available ON pousada_rooms(available);
CREATE INDEX IF NOT EXISTS idx_pousada_bookings_room_id ON pousada_bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_pousada_bookings_status ON pousada_bookings(status);
CREATE INDEX IF NOT EXISTS idx_pousada_bookings_dates ON pousada_bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_cafe_products_category ON cafe_products(category);
CREATE INDEX IF NOT EXISTS idx_cafe_products_available ON cafe_products(available);
CREATE INDEX IF NOT EXISTS idx_cafe_products_featured ON cafe_products(featured);
CREATE INDEX IF NOT EXISTS idx_cafe_orders_status ON cafe_orders(status);
CREATE INDEX IF NOT EXISTS idx_cafe_orders_order_date ON cafe_orders(order_date);

-- 7. RLS (Row Level Security) Policies
ALTER TABLE pousada_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE pousada_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_orders ENABLE ROW LEVEL SECURITY;

-- Políticas para pousada_rooms
CREATE POLICY "Quartos visíveis para todos" ON pousada_rooms FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar quartos" ON pousada_rooms FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (auth.users.raw_user_meta_data->>'role' = 'admin' OR auth.users.email = 'admin@armazemsaojoaquim.com')
    )
);

-- Políticas para pousada_bookings
CREATE POLICY "Reservas visíveis para todos" ON pousada_bookings FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode criar reserva" ON pousada_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin pode gerenciar reservas" ON pousada_bookings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (auth.users.raw_user_meta_data->>'role' = 'admin' OR auth.users.email = 'admin@armazemsaojoaquim.com')
    )
);

-- Políticas para cafe_products
CREATE POLICY "Produtos visíveis para todos" ON cafe_products FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar produtos" ON cafe_products FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (auth.users.raw_user_meta_data->>'role' = 'admin' OR auth.users.email = 'admin@armazemsaojoaquim.com')
    )
);

-- Políticas para cafe_orders
CREATE POLICY "Pedidos visíveis para todos" ON cafe_orders FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode criar pedido" ON cafe_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin pode gerenciar pedidos" ON cafe_orders FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (auth.users.raw_user_meta_data->>'role' = 'admin' OR auth.users.email = 'admin@armazemsaojoaquim.com')
    )
);

-- 8. Dados iniciais para quartos da pousada
INSERT INTO pousada_rooms (name, type, price_refundable, price_non_refundable, description, amenities, max_guests, image_url) VALUES
('Quarto Standard', 'STANDARD', 280.00, 220.00, 'Quarto aconchegante com vista para Santa Teresa, ideal para casais que buscam conforto e autenticidade.', 
 ARRAY['WiFi gratuita', 'TV a cabo', 'Frigobar', 'Cofre', 'Ar-condicionado'], 2, '/images/pousada/standard-room.jpg'),
('Quarto Deluxe', 'DELUXE', 380.00, 320.00, 'Espaço amplo com decoração refinada, oferecendo maior conforto e comodidades premium.',
 ARRAY['WiFi gratuita', 'TV a cabo', 'Frigobar', 'Cofre', 'Ar-condicionado', 'Varanda privativa'], 3, '/images/pousada/deluxe-room.jpg'),
('Suíte Master', 'SUITE', 580.00, 480.00, 'Nossa suíte mais luxuosa com sala de estar separada e vista panorâmica de Santa Teresa.',
 ARRAY['WiFi gratuita', 'TV a cabo', 'Frigobar', 'Cofre', 'Ar-condicionado', 'Varanda privativa', 'Sala de estar', 'Banheira'], 4, '/images/pousada/suite-room.jpg');

-- 9. Dados iniciais para produtos do café
INSERT INTO cafe_products (name, category, price, description, featured, ingredients, image_url) VALUES
('Café Armazém', 'cafes', 8.50, 'Blend especial da casa, torrado artesanalmente com notas de chocolate e caramelo', true, 
 ARRAY['Café 100% arábica', 'Açúcar demerara'], '/images/cafe/cafe-armazem.jpg'),
('Cappuccino Tradicional', 'cafes', 12.00, 'Café espresso com leite vaporizado e espuma cremosa, polvilhado com canela', false,
 ARRAY['Café espresso', 'Leite integral', 'Canela em pó'], '/images/cafe/cappuccino.jpg'),
('Café Gelado Santa Teresa', 'cafes', 14.00, 'Café gelado com toque de baunilha e chantilly, inspirado no clima do bairro', true,
 ARRAY['Café espresso', 'Leite gelado', 'Essência de baunilha', 'Chantilly'], '/images/cafe/cafe-gelado.jpg'),
('Sorvete Italiano Tradicional', 'sorvetes', 16.00, 'Autêntico gelato italiano em sabores clássicos: chocolate, baunilha, morango', true,
 ARRAY['Leite integral', 'Creme de leite', 'Açúcar', 'Saborizantes naturais'], '/images/cafe/gelato-tradicional.jpg'),
('Gelato Artesanal Premium', 'sorvetes', 22.00, 'Gelato premium com sabores únicos: pistache, tiramisu, limão siciliano', true,
 ARRAY['Ingredientes importados', 'Nozes premium', 'Frutas selecionadas'], '/images/cafe/gelato-premium.jpg'),
('Affogato al Caffè', 'sorvetes', 18.00, 'Sorvete de baunilha "afogado" em café espresso quente - o melhor dos dois mundos', true,
 ARRAY['Gelato de baunilha', 'Café espresso duplo'], '/images/cafe/affogato.jpg'),
('Tiramisu da Casa', 'doces', 15.00, 'Tradicional tiramisu italiano com camadas de mascarpone e café', false,
 ARRAY['Mascarpone', 'Café', 'Biscoitos savoiardi', 'Cacau em pó'], '/images/cafe/tiramisu.jpg'),
('Cannoli Siciliano', 'doces', 12.00, 'Massa crocante recheada com ricota doce e gotas de chocolate', false,
 ARRAY['Ricota fresca', 'Açúcar', 'Gotas de chocolate', 'Massa italiana'], '/images/cafe/cannoli.jpg'),
('Panini Italiano', 'salgados', 18.00, 'Pão italiano grelhado com presunto parma, mussarela de búfala e tomate seco', false,
 ARRAY['Pão ciabatta', 'Presunto parma', 'Mussarela de búfala', 'Tomate seco'], '/images/cafe/panini.jpg'),
('Focaccia Artesanal', 'salgados', 14.00, 'Pão italiano com azeite, alecrim e sal grosso, servido quentinho', false,
 ARRAY['Farinha italiana', 'Azeite extravirgem', 'Alecrim fresco', 'Sal grosso'], '/images/cafe/focaccia.jpg');

-- Comentários das tabelas
COMMENT ON TABLE pousada_rooms IS 'Quartos disponíveis na pousada Lobie Armazém São Joaquim';
COMMENT ON TABLE pousada_bookings IS 'Reservas dos quartos da pousada';
COMMENT ON TABLE cafe_products IS 'Produtos disponíveis no Café do Armazém - Parceria Sorvete Itália';
COMMENT ON TABLE cafe_orders IS 'Pedidos realizados no Café do Armazém';

-- Sucesso!
SELECT 'Tabelas da pousada e café criadas com sucesso!' as resultado;