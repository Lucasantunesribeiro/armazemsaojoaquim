-- ============================
-- MIGRAÇÃO: BLOG MULTILÍNGUE COMPLETO
-- Data: 2025-01-31
-- Objetivo: Reestruturar sistema de blog para suporte multilíngue
-- ============================

-- PASSO 1: Backup da tabela atual (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_posts') THEN
        -- Criar backup antes de modificar
        CREATE TABLE IF NOT EXISTS blog_posts_backup AS 
        SELECT * FROM blog_posts;
        
        RAISE NOTICE 'Backup da tabela blog_posts criado como blog_posts_backup';
    END IF;
END $$;

-- PASSO 2: Remover tabela antiga e criar nova estrutura multilíngue
DROP TABLE IF EXISTS public.blog_posts CASCADE;

-- PASSO 3: Criar nova tabela blog_posts com suporte multilíngue
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Conteúdo em Português
  title_pt TEXT NOT NULL,
  slug_pt TEXT NOT NULL UNIQUE,
  content_pt TEXT NOT NULL,
  excerpt_pt TEXT,
  meta_title_pt TEXT,
  meta_description_pt TEXT,
  category_pt TEXT DEFAULT 'geral',
  tags_pt TEXT[] DEFAULT '{}',
  
  -- Conteúdo em Inglês
  title_en TEXT NOT NULL,
  slug_en TEXT NOT NULL UNIQUE,
  content_en TEXT NOT NULL,
  excerpt_en TEXT,
  meta_title_en TEXT,
  meta_description_en TEXT,
  category_en TEXT DEFAULT 'general',
  tags_en TEXT[] DEFAULT '{}',
  
  -- Campos compartilhados
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PASSO 4: Criar índices para performance
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published, published_at DESC NULLS LAST);
CREATE INDEX idx_blog_posts_featured ON public.blog_posts(featured, published);
CREATE INDEX idx_blog_posts_slug_pt ON public.blog_posts(slug_pt);
CREATE INDEX idx_blog_posts_slug_en ON public.blog_posts(slug_en);
CREATE INDEX idx_blog_posts_category_pt ON public.blog_posts(category_pt);
CREATE INDEX idx_blog_posts_category_en ON public.blog_posts(category_en);
CREATE INDEX idx_blog_posts_author ON public.blog_posts(author_id);

-- PASSO 5: Função para buscar posts por idioma
CREATE OR REPLACE FUNCTION public.get_blog_posts_by_language(p_language TEXT DEFAULT 'pt')
RETURNS TABLE(
  id UUID,
  title TEXT,
  slug TEXT,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  category TEXT,
  tags TEXT[],
  published BOOLEAN,
  featured BOOLEAN,
  author_name TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_language = 'en' THEN
    RETURN QUERY
    SELECT 
      bp.id,
      bp.title_en as title,
      bp.slug_en as slug,
      bp.content_en as content,
      bp.excerpt_en as excerpt,
      bp.image_url,
      bp.meta_title_en as meta_title,
      bp.meta_description_en as meta_description,
      bp.category_en as category,
      bp.tags_en as tags,
      bp.published,
      bp.featured,
      bp.author_name,
      bp.published_at,
      bp.created_at,
      bp.updated_at
    FROM blog_posts bp
    WHERE bp.published = true
    ORDER BY bp.published_at DESC NULLS LAST, bp.created_at DESC;
  ELSE
    RETURN QUERY
    SELECT 
      bp.id,
      bp.title_pt as title,
      bp.slug_pt as slug,
      bp.content_pt as content,
      bp.excerpt_pt as excerpt,
      bp.image_url,
      bp.meta_title_pt as meta_title,
      bp.meta_description_pt as meta_description,
      bp.category_pt as category,
      bp.tags_pt as tags,
      bp.published,
      bp.featured,
      bp.author_name,
      bp.published_at,
      bp.created_at,
      bp.updated_at
    FROM blog_posts bp
    WHERE bp.published = true
    ORDER BY bp.published_at DESC NULLS LAST, bp.created_at DESC;
  END IF;
END;
$$;

-- PASSO 6: Função para buscar post por slug
CREATE OR REPLACE FUNCTION public.get_blog_post_by_slug(p_slug TEXT, p_language TEXT DEFAULT 'pt')
RETURNS TABLE(
  id UUID,
  title TEXT,
  slug TEXT,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  category TEXT,
  tags TEXT[],
  published BOOLEAN,
  featured BOOLEAN,
  author_name TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_language = 'en' THEN
    RETURN QUERY
    SELECT 
      bp.id,
      bp.title_en as title,
      bp.slug_en as slug,
      bp.content_en as content,
      bp.excerpt_en as excerpt,
      bp.image_url,
      bp.meta_title_en as meta_title,
      bp.meta_description_en as meta_description,
      bp.category_en as category,
      bp.tags_en as tags,
      bp.published,
      bp.featured,
      bp.author_name,
      bp.published_at,
      bp.created_at,
      bp.updated_at
    FROM blog_posts bp
    WHERE bp.slug_en = p_slug AND bp.published = true;
  ELSE
    RETURN QUERY
    SELECT 
      bp.id,
      bp.title_pt as title,
      bp.slug_pt as slug,
      bp.content_pt as content,
      bp.excerpt_pt as excerpt,
      bp.image_url,
      bp.meta_title_pt as meta_title,
      bp.meta_description_pt as meta_description,
      bp.category_pt as category,
      bp.tags_pt as tags,
      bp.published,
      bp.featured,
      bp.author_name,
      bp.published_at,
      bp.created_at,
      bp.updated_at
    FROM blog_posts bp
    WHERE bp.slug_pt = p_slug AND bp.published = true;
  END IF;
END;
$$;

-- PASSO 7: Configurar RLS (Row Level Security)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Política para visualização pública de posts publicados
CREATE POLICY "Blog posts are viewable by everyone" ON public.blog_posts
FOR SELECT TO anon, authenticated
USING (published = true);

-- Política para administradores gerenciarem todos os posts
CREATE POLICY "Admins can manage all blog posts" ON public.blog_posts
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- PASSO 8: Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_posts_updated_at();

-- PASSO 9: Inserir posts de exemplo multilíngue
INSERT INTO public.blog_posts (
  title_pt, title_en,
  slug_pt, slug_en,
  content_pt, content_en,
  excerpt_pt, excerpt_en,
  category_pt, category_en,
  tags_pt, tags_en,
  published, featured,
  author_name,
  published_at,
  image_url
) VALUES 
(
  'A Arte da Mixologia no Armazém',
  'The Art of Mixology at Armazém',
  'a-arte-da-mixologia-no-armazem',
  'the-art-of-mixology-at-armazem',
  '<h2>Uma Jornada pelos Sabores Únicos</h2><p>Descubra os segredos por trás dos nossos coquetéis artesanais, preparados com ingredientes selecionados e técnicas tradicionais que fazem de cada drink uma experiência única.</p><p>No coração de Santa Teresa, nosso bar oferece uma carta de drinks que combina a tradição brasileira com toques contemporâneos. Cada coquetel conta uma história, cada ingrediente foi cuidadosamente escolhido para criar harmonias de sabor que despertam os sentidos.</p><h3>A Filosofia por Trás dos Nossos Drinks</h3><p>Nossa mixologia vai além da simples mistura de ingredientes. É uma arte que honra as tradições cariocas enquanto abraça a inovação. Utilizamos cachaças artesanais, frutas frescas do mercado local e ervas cultivadas em nosso próprio jardim.</p><p>Venha descobrir como cada gole transporta você para uma jornada sensorial única, onde o passado e o presente se encontram em perfeita harmonia.</p>',
  '<h2>A Journey Through Unique Flavors</h2><p>Discover the secrets behind our artisanal cocktails, prepared with selected ingredients and traditional techniques that make each drink a unique experience.</p><p>In the heart of Santa Teresa, our bar offers a drinks menu that combines Brazilian tradition with contemporary touches. Each cocktail tells a story, each ingredient has been carefully chosen to create flavor harmonies that awaken the senses.</p><h3>The Philosophy Behind Our Drinks</h3><p>Our mixology goes beyond simply mixing ingredients. It is an art that honors Carioca traditions while embracing innovation. We use artisanal cachaças, fresh fruits from the local market and herbs grown in our own garden.</p><p>Come discover how each sip transports you on a unique sensory journey, where past and present meet in perfect harmony.</p>',
  'Uma jornada pelos sabores únicos dos nossos coquetéis artesanais, onde tradição e inovação se encontram.',
  'A journey through the unique flavors of our artisanal cocktails, where tradition and innovation meet.',
  'bebidas',
  'drinks',
  ARRAY['mixologia', 'coquetéis', 'santa teresa', 'tradição'],
  ARRAY['mixology', 'cocktails', 'santa teresa', 'tradition'],
  true,
  true,
  'Chef Bartender',
  now(),
  '/images/blog/a_arte_da_mixologia_no_armazem.avif'
),
(
  'Culinária Tradicional Carioca',
  'Traditional Carioca Cuisine',
  'culinaria-tradicional-carioca',
  'traditional-carioca-cuisine',
  '<h2>Os Sabores que Definem a Alma Carioca</h2><p>Explore os pratos que contam a história do Rio de Janeiro através dos sabores autênticos que servimos no Armazém São Joaquim. Cada receita carrega consigo a tradição e o carinho de gerações de cozinheiros cariocas.</p><p>Nossa cozinha é um reflexo da rica diversidade cultural do Rio, onde influências africanas, portuguesas e indígenas se misturam para criar pratos únicos e saborosos.</p><h3>Tradições que Atravessam Gerações</h3><p>Do feijão tropeiro ao bobó de camarão, cada prato em nosso cardápio tem uma história para contar. Utilizamos técnicas tradicionais de preparo, temperos especiais e ingredientes frescos para manter viva a essência da culinária carioca.</p><p>Venha saborear a história do Rio em cada garfada, onde cada prato é uma celebração da nossa rica herança gastronômica.</p>',
  '<h2>The Flavors that Define the Carioca Soul</h2><p>Explore the dishes that tell the story of Rio de Janeiro through the authentic flavors we serve at Armazém São Joaquim. Each recipe carries with it the tradition and care of generations of Carioca cooks.</p><p>Our kitchen is a reflection of Rio''s rich cultural diversity, where African, Portuguese and indigenous influences mix to create unique and flavorful dishes.</p><h3>Traditions that Cross Generations</h3><p>From feijão tropeiro to bobó de camarão, each dish on our menu has a story to tell. We use traditional preparation techniques, special seasonings and fresh ingredients to keep the essence of Carioca cuisine alive.</p><p>Come taste the history of Rio in every bite, where each dish is a celebration of our rich gastronomic heritage.</p>',
  'Os sabores que definem a alma carioca através de pratos tradicionais cheios de história e tradição.',
  'The flavors that define the Carioca soul through traditional dishes full of history and tradition.',
  'gastronomia',
  'gastronomy',
  ARRAY['culinária', 'carioca', 'tradição', 'receitas'],
  ARRAY['cuisine', 'carioca', 'tradition', 'recipes'],
  true,
  false,
  'Chef Executivo',
  now() - interval '1 day',
  '/images/blog/culinaria_tradicional_carioca.avif'
),
(
  'Santa Teresa: História e Charme',
  'Santa Teresa: History and Charm',
  'santa-teresa-historia-e-charme',
  'santa-teresa-history-and-charm',
  '<h2>O Bairro que Inspira Nossa Essência</h2><p>Conheça a rica história do bairro boêmio que abraça nosso restaurante, suas ruas de paralelepípedo e a atmosfera única que inspira nossa cozinha. Santa Teresa é mais que um bairro, é um estado de espírito que reflete em cada detalhe do Armazém.</p><p>Localizado nas colinas do Rio de Janeiro, Santa Teresa preserva a arquitetura colonial e o charme de uma época passada, enquanto pulsa com a energia criativa de artistas, músicos e boêmios.</p><h3>Uma História de Resistência e Arte</h3><p>Desde os tempos do bondinho até os dias atuais, Santa Teresa sempre foi um refúgio para aqueles que buscam autenticidade e inspiração. Suas casas coloridas, ateliês de artistas e pequenos bares criam uma atmosfera única no Rio.</p><p>É neste cenário mágico que o Armazém São Joaquim encontrou seu lar, absorvendo toda a energia criativa e histórica do bairro para oferecer uma experiência gastronômica única.</p>',
  '<h2>The Neighborhood that Inspires Our Essence</h2><p>Learn about the rich history of the bohemian neighborhood that embraces our restaurant, its cobblestone streets and the unique atmosphere that inspires our kitchen. Santa Teresa is more than a neighborhood, it is a state of mind that reflects in every detail of Armazém.</p><p>Located in the hills of Rio de Janeiro, Santa Teresa preserves colonial architecture and the charm of a bygone era, while pulsing with the creative energy of artists, musicians and bohemians.</p><h3>A History of Resistance and Art</h3><p>From the days of the tram to the present day, Santa Teresa has always been a refuge for those seeking authenticity and inspiration. Its colorful houses, artist studios and small bars create a unique atmosphere in Rio.</p><p>It is in this magical setting that Armazém São Joaquim found its home, absorbing all the creative and historical energy of the neighborhood to offer a unique gastronomic experience.</p>',
  'O bairro que inspira nossa essência, com sua rica história, charme boêmio e atmosfera única.',
  'The neighborhood that inspires our essence, with its rich history, bohemian charm and unique atmosphere.',
  'cultura',
  'culture',
  ARRAY['santa teresa', 'história', 'bairro', 'rio de janeiro'],
  ARRAY['santa teresa', 'history', 'neighborhood', 'rio de janeiro'],
  true,
  false,
  'Historiador Local',
  now() - interval '2 days',
  '/images/blog/santa_teresa_historia_e_charme.avif'
),
(
  'O Sabor da Tradição: Pratos que Contam Histórias',
  'The Taste of Tradition: Dishes that Tell Stories',
  'o-sabor-da-tradicao-pratos-que-contam-historias',
  'the-taste-of-tradition-dishes-that-tell-stories',
  '<h2>Cada Prato, Uma História</h2><p>No Armazém São Joaquim, acreditamos que a comida vai muito além do sabor. Cada prato em nosso cardápio carrega consigo histórias, memórias e tradições que atravessaram gerações para chegar até sua mesa.</p><p>Nossa cozinha é um verdadeiro arquivo vivo da gastronomia carioca, onde receitas centenárias são preservadas e reinterpretadas com o carinho e respeito que merecem.</p><h3>Receitas de Família</h3><p>Muitos dos nossos pratos nasceram nas cozinhas domésticas do Rio antigo, passados de mãe para filha, de avó para neta. O famoso escondidinho da casa, por exemplo, segue a receita da bisavó do nosso chef, que chegou ao Brasil no início do século XX.</p><p>Venha descobrir os sabores que fizeram história e continue fazendo parte da nossa rica tradição gastronômica.</p>',
  '<h2>Each Dish, A Story</h2><p>At Armazém São Joaquim, we believe that food goes far beyond taste. Each dish on our menu carries with it stories, memories and traditions that have crossed generations to reach your table.</p><p>Our kitchen is a true living archive of Carioca gastronomy, where century-old recipes are preserved and reinterpreted with the care and respect they deserve.</p><h3>Family Recipes</h3><p>Many of our dishes were born in the domestic kitchens of old Rio, passed from mother to daughter, from grandmother to granddaughter. The famous house escondidinho, for example, follows the recipe of our chef''s great-grandmother, who arrived in Brazil at the beginning of the 20th century.</p><p>Come discover the flavors that made history and continue to be part of our rich gastronomic tradition.</p>',
  'Descubra como cada prato do nosso cardápio carrega histórias e tradições de gerações passadas.',
  'Discover how each dish on our menu carries stories and traditions from past generations.',
  'gastronomia',
  'gastronomy',
  ARRAY['tradição', 'receitas', 'família', 'história'],
  ARRAY['tradition', 'recipes', 'family', 'history'],
  true,
  true,
  'Chef Executivo',
  now() - interval '3 days',
  '/images/blog/sabor_da_tradicao.avif'
);

-- PASSO 10: Atualizar tipos do TypeScript (será feito em arquivo separado)
-- PASSO 11: Conceder permissões necessárias

-- Permitir que funções sejam executadas por usuários autenticados
GRANT EXECUTE ON FUNCTION public.get_blog_posts_by_language(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_blog_post_by_slug(TEXT, TEXT) TO authenticated, anon;

-- Notificação de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Migração de blog multilíngue concluída com sucesso!';
    RAISE NOTICE '📊 Posts de exemplo inseridos: 4 posts em PT e EN';
    RAISE NOTICE '🔧 Funções multilíngues criadas e configuradas';
    RAISE NOTICE '🛡️ Políticas RLS aplicadas com segurança';
    RAISE NOTICE '🚀 Sistema de blog multilíngue pronto para uso!';
END $$;