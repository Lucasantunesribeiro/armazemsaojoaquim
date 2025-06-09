-- Create indexes for performance
-- Execute this after creating tables

-- Indexes for reservas table
CREATE INDEX IF NOT EXISTS idx_reservas_data ON reservas(data);
CREATE INDEX IF NOT EXISTS idx_reservas_user_id ON reservas(user_id);
CREATE INDEX IF NOT EXISTS idx_reservas_status ON reservas(status);
CREATE INDEX IF NOT EXISTS idx_reservas_data_horario ON reservas(data, horario);

-- Indexes for menu_items table
CREATE INDEX IF NOT EXISTS idx_menu_items_categoria ON menu_items(categoria);
CREATE INDEX IF NOT EXISTS idx_menu_items_disponivel ON menu_items(disponivel);
CREATE INDEX IF NOT EXISTS idx_menu_items_categoria_disponivel ON menu_items(categoria, disponivel);

-- Indexes for blog_posts table
CREATE INDEX IF NOT EXISTS idx_blog_posts_publicado ON blog_posts(publicado);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);