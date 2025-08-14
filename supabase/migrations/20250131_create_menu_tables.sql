-- Criar tabelas para o sistema de menu
-- Baseado nas estruturas fornecidas pelo usuário

BEGIN;

-- Criar tabela menu_categories se não existir
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  name text NOT NULL,
  description text NULL,
  display_order integer NULL DEFAULT 0,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT menu_categories_pkey PRIMARY KEY (id),
  CONSTRAINT menu_categories_name_key UNIQUE (name)
);

-- Criar tabela menu_items se não existir
CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  name text NOT NULL,
  description text NULL,
  price numeric(10, 2) NOT NULL,
  category text NOT NULL,
  available boolean NULL DEFAULT true,
  featured boolean NULL DEFAULT false,
  allergens text[] NULL,
  image_url text NULL,
  preparation_time integer NULL,
  ingredients text[] NULL,
  nutritional_info jsonb NULL,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT menu_items_pkey PRIMARY KEY (id)
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items USING btree (category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items USING btree (available);
CREATE INDEX IF NOT EXISTS idx_menu_items_featured ON public.menu_items USING btree (featured);

-- Inserir categorias padrão se não existirem
INSERT INTO public.menu_categories (name, description, display_order) VALUES
  ('PETISCOS', 'Aperitivos e petiscos', 1),
  ('SALADAS', 'Saladas frescas e nutritivas', 2),
  ('PRATOS PRINCIPAIS', 'Pratos principais tradicionais', 3),
  ('SANDUÍCHES', 'Sanduíches e lanches', 4),
  ('SOBREMESAS', 'Doces e sobremesas', 5),
  ('BEBIDAS SEM ÁLCOOL', 'Sucos, refrigerantes e bebidas naturais', 6),
  ('CERVEJAS', 'Cervejas nacionais e artesanais', 7),
  ('COQUETÉIS', 'Drinks e coquetéis especiais', 8),
  ('CAIPIRINHAS', 'Caipirinhas tradicionais e especiais', 9),
  ('DESTILADOS', 'Cachaças, whisky e destilados', 10),
  ('VINHOS', 'Vinhos nacionais e importados', 11),
  ('GUARNIÇÕES', 'Acompanhamentos e guarnições', 12),
  ('SUGESTÃO DO CHEF', 'Pratos especiais do chef', 13)
ON CONFLICT (name) DO NOTHING;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_menu_categories_updated_at ON public.menu_categories;
CREATE TRIGGER update_menu_categories_updated_at
    BEFORE UPDATE ON public.menu_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON public.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para menu_categories
DROP POLICY IF EXISTS "Public can view menu categories" ON public.menu_categories;
CREATE POLICY "Public can view menu categories" ON public.menu_categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage menu categories" ON public.menu_categories;
CREATE POLICY "Admins can manage menu categories" ON public.menu_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
        OR
        auth.jwt() ->> 'email' = 'armazemsaojoaquimoficial@gmail.com'
    );

-- Políticas RLS para menu_items
DROP POLICY IF EXISTS "Public can view available menu items" ON public.menu_items;
CREATE POLICY "Public can view available menu items" ON public.menu_items
    FOR SELECT USING (available = true);

DROP POLICY IF EXISTS "Admins can view all menu items" ON public.menu_items;
CREATE POLICY "Admins can view all menu items" ON public.menu_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
        OR
        auth.jwt() ->> 'email' = 'armazemsaojoaquimoficial@gmail.com'
    );

DROP POLICY IF EXISTS "Admins can manage menu items" ON public.menu_items;
CREATE POLICY "Admins can manage menu items" ON public.menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
        OR
        auth.jwt() ->> 'email' = 'armazemsaojoaquimoficial@gmail.com'
    );

COMMIT;
