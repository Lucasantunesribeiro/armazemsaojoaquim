-- Create RLS policies
-- Execute this after enabling RLS

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Reservas policies
CREATE POLICY "Users can view own reservations" ON reservas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reservations" ON reservas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations" ON reservas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reservations" ON reservas
  FOR DELETE USING (auth.uid() = user_id);

-- Menu items are public for reading
CREATE POLICY "Anyone can view available menu items" ON menu_items
  FOR SELECT USING (disponivel = true);

-- Blog posts are public for reading if published
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
  FOR SELECT USING (publicado = true);