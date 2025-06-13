-- ============================================
-- SCRIPT DE CONFIGURAÇÃO COMPLETA - VERSÃO LIMPA
-- Armazém São Joaquim - Banco de Dados
-- ============================================

-- IMPORTANTE: Este script limpa TODOS os dados existentes
-- Execute apenas se quiser recriar tudo do zero

-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE IF EXISTS public.blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.menu_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.availability_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_messages DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Published blog posts are viewable by everyone" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Menu categories are viewable by everyone" ON public.menu_categories;
DROP POLICY IF EXISTS "Authenticated users can manage menu categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Menu items are viewable by everyone" ON public.menu_items;
DROP POLICY IF EXISTS "Authenticated users can manage menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Availability settings are viewable by everyone" ON public.availability_settings;
DROP POLICY IF EXISTS "Authenticated users can manage availability" ON public.availability_settings;
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated users can read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservas;
DROP POLICY IF EXISTS "Allow guest reservations" ON public.reservas;

-- Remover todas as tabelas existentes (em ordem correta devido às dependências)
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.availability_settings CASCADE;
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.menu_categories CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.reservas CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Remover função se existir
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- ============================================
-- CRIAÇÃO DAS ESTRUTURAS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = '';

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de reservas
CREATE TABLE public.reservas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    pessoas INTEGER NOT NULL CHECK (pessoas > 0),
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada', 'cancelada', 'concluida')),
    observacoes TEXT,
    telefone_confirmacao TEXT,
    codigo_confirmacao TEXT,
    confirmado_em TIMESTAMP WITH TIME ZONE,
    cancelado_em TIMESTAMP WITH TIME ZONE,
    cancelado_por UUID REFERENCES auth.users(id),
    motivo_cancelamento TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de posts do blog
CREATE TABLE public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    published BOOLEAN DEFAULT false,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    slug TEXT UNIQUE NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias do menu
CREATE TABLE public.menu_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens do menu
CREATE TABLE public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    available BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    allergens TEXT[],
    image_url TEXT,
    preparation_time INTEGER,
    ingredients TEXT[],
    nutritional_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações de disponibilidade
CREATE TABLE public.availability_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    max_capacity INTEGER DEFAULT 50,
    is_closed BOOLEAN DEFAULT false,
    special_hours JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de mensagens de contato
CREATE TABLE public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'lido', 'respondido')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON public.reservas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON public.blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at 
    BEFORE UPDATE ON public.menu_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_settings_updated_at 
    BEFORE UPDATE ON public.availability_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HABILITAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS DE SEGURANÇA
-- ============================================

-- Políticas para profiles: usuários só veem seus próprios dados
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para reservas: usuários gerenciam suas próprias reservas + reservas de convidados
CREATE POLICY "Users can view their own reservations" ON public.reservas
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create reservations" ON public.reservas
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own reservations" ON public.reservas
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow guest reservations" ON public.reservas
    FOR ALL USING (user_id IS NULL);

-- Políticas para blog_posts: posts publicados são públicos, gerenciamento requer autenticação
CREATE POLICY "Published blog posts are viewable by everyone" ON public.blog_posts
    FOR SELECT USING (published = true);

CREATE POLICY "Authenticated users can manage blog posts" ON public.blog_posts
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para menu_categories: leitura pública, edição apenas autenticados
CREATE POLICY "Menu categories are viewable by everyone" ON public.menu_categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage menu categories" ON public.menu_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para menu_items: leitura pública, edição apenas autenticados
CREATE POLICY "Menu items are viewable by everyone" ON public.menu_items
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage menu items" ON public.menu_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para availability_settings: leitura pública, edição apenas autenticados
CREATE POLICY "Availability settings are viewable by everyone" ON public.availability_settings
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage availability" ON public.availability_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para contact_messages: inserção pública, leitura/edição apenas autenticados
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read contact messages" ON public.contact_messages
    FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- INSERÇÃO DE DADOS
-- ============================================

-- Inserir categorias do menu
INSERT INTO menu_categories (name, description, display_order) VALUES
('Petiscos', 'Aperitivos e petiscos para compartilhar', 1),
('Saladas', 'Saladas frescas e nutritivas', 2),
('Pratos Principais', 'Pratos principais da casa', 3),
('Sanduíches', 'Sanduíches artesanais', 4),
('Sobremesas', 'Doces e sobremesas especiais', 5),
('Bebidas sem Álcool', 'Bebidas não alcoólicas', 6),
('Cervejas', 'Seleção de cervejas nacionais e importadas', 7),
('Coquetéis', 'Drinks autorais da casa', 8),
('Caipirinhas', 'Caipirinhas tradicionais e especiais', 9),
('Destilados', 'Cachaças, vodkas e whiskies', 10),
('Vinhos', 'Carta de vinhos selecionados', 11);

-- Inserir itens do menu usando CROSS JOIN para evitar problemas de UUID
INSERT INTO menu_items (name, description, price, category, available, allergens)
SELECT 
  item.name,
  item.description,
  item.price,
  item.category_name,
  item.available,
  item.allergens
FROM menu_categories cat
CROSS JOIN (VALUES
  -- Petiscos
  ('Petiscos', 'Bolinho de Bacalhau', 'Tradicional bolinho de bacalhau (6 unidades)', 32.00, true, ARRAY['Glúten', 'Ovos']),
  ('Petiscos', 'Dadinho de Tapioca', 'Dadinho de tapioca com geleia de pimenta (8 unidades)', 28.00, true, null),
  ('Petiscos', 'Coxinha de Frango', 'Coxinha artesanal de frango (4 unidades)', 24.00, true, ARRAY['Glúten', 'Ovos']),
  ('Petiscos', 'Pastel de Queijo', 'Pastel de queijo coalho (4 unidades)', 22.00, true, ARRAY['Glúten', 'Laticínios']),
  ('Petiscos', 'Torresmo', 'Torresmo crocante da casa', 18.00, true, null),
  
  -- Saladas
  ('Saladas', 'Salada Caesar', 'Alface americana, croutons, parmesão e molho caesar', 28.00, true, ARRAY['Glúten', 'Laticínios', 'Ovos']),
  ('Saladas', 'Salada Tropical', 'Mix de folhas, manga, abacaxi e castanhas', 26.00, true, ARRAY['Castanhas']),
  ('Saladas', 'Salada Caprese', 'Tomate, mussarela de búfala, manjericão e azeite', 24.00, true, ARRAY['Laticínios']),
  
  -- Pratos Principais
  ('Pratos Principais', 'Feijoada Completa', 'Feijoada tradicional com acompanhamentos (sábados)', 45.00, true, null),
  ('Pratos Principais', 'Picanha Grelhada', 'Picanha grelhada com arroz, feijão e farofa', 52.00, true, null),
  ('Pratos Principais', 'Salmão Grelhado', 'Salmão grelhado com legumes e arroz de brócolis', 48.00, true, ARRAY['Peixes']),
  ('Pratos Principais', 'Frango à Parmegiana', 'Frango empanado com molho de tomate e queijo', 38.00, true, ARRAY['Glúten', 'Laticínios', 'Ovos']),
  ('Pratos Principais', 'Bobó de Camarão', 'Bobó de camarão tradicional com dendê', 42.00, true, ARRAY['Crustáceos']),
  
  -- Sanduíches
  ('Sanduíches', 'Hambúrguer Armazém', 'Hambúrguer artesanal com queijo, bacon e molho especial', 32.00, true, ARRAY['Glúten', 'Laticínios', 'Ovos']),
  ('Sanduíches', 'Sanduíche de Costela', 'Costela desfiada com cebola caramelizada', 28.00, true, ARRAY['Glúten']),
  ('Sanduíches', 'Bauru Tradicional', 'Presunto, queijo, tomate e orégano', 24.00, true, ARRAY['Glúten', 'Laticínios']),
  
  -- Sobremesas
  ('Sobremesas', 'Pudim de Leite', 'Pudim de leite condensado tradicional', 16.00, true, ARRAY['Laticínios', 'Ovos']),
  ('Sobremesas', 'Brigadeiro Gourmet', 'Brigadeiro gourmet (3 unidades)', 14.00, true, ARRAY['Laticínios']),
  ('Sobremesas', 'Mousse de Maracujá', 'Mousse de maracujá da casa', 15.00, true, ARRAY['Laticínios', 'Ovos']),
  ('Sobremesas', 'Petit Gateau', 'Petit gateau com sorvete de baunilha', 22.00, true, ARRAY['Glúten', 'Laticínios', 'Ovos']),
  
  -- Bebidas sem Álcool
  ('Bebidas sem Álcool', 'Água Mineral com Gás', 'Água mineral com gás 500ml', 8.00, true, null),
  ('Bebidas sem Álcool', 'Refrigerante Coca-Cola', 'Coca-Cola tradicional', 9.00, true, null),
  ('Bebidas sem Álcool', 'Guaraná Tradicional', 'Guaraná tradicional', 14.00, true, null),
  ('Bebidas sem Álcool', 'Sodas Artesanais', 'Hibisco, Gengibre, Capim-limão e Maracujá', 16.00, true, null),
  ('Bebidas sem Álcool', 'Pink Lemonade', 'Limonada da casa, adoçada com xarope de hibisco', 16.00, true, null),
  ('Bebidas sem Álcool', 'Espresso', 'Café espresso', 7.00, true, null),
  
  -- Cervejas
  ('Cervejas', 'Baden Baden Cristal', 'Cerveja Baden Baden Cristal 600ml', 28.00, true, ARRAY['Glúten']),
  ('Cervejas', 'Eisenbahn Pilsen', 'Cerveja Eisenbahn Pilsen long neck', 15.00, true, ARRAY['Glúten']),
  ('Cervejas', 'Heineken', 'Cerveja Heineken long neck', 15.00, true, ARRAY['Glúten']),
  
  -- Coquetéis
  ('Coquetéis', 'Helena', 'Vodka, limão siciliano, manjericão, açúcar e extrato de gengibre', 32.00, true, null),
  ('Coquetéis', 'Morena Tropicana', 'Gin, morango, tangerina, limão taití, açúcar, mel picante, tônica', 32.00, true, null),
  ('Coquetéis', 'Carioquíssima', 'Cachaça Magnifica tradicional ipê, maracujá, xarope de baunilha, xarope de coco, limão taití e clara de ovo desidratado', 32.00, true, ARRAY['Ovos']),
  
  -- Caipirinhas
  ('Caipirinhas', 'Trio Caipira', 'Clássico trio degustação com os sabores mais pedidos da casa em copos de 200ml', 36.00, true, null),
  ('Caipirinhas', 'Caipirão', 'Cachaça, mel, limão siciliano, limão taití (500ml)', 32.00, true, null),
  ('Caipirinhas', 'Caipirinha de Limão - Cachaça Prateada', 'Caipirinha tradicional com cachaça prateada (300ml)', 22.00, true, null),
  
  -- Destilados
  ('Destilados', 'Cachaça Prateada', 'Cachaça Prateada dose', 12.00, true, null),
  ('Destilados', 'Vodka Absolut', 'Vodka Absolut dose', 28.00, true, null),
  ('Destilados', 'Whisky Red Label', 'Whisky Red Label dose', 28.00, true, null),
  
  -- Vinhos
  ('Vinhos', 'Adobe Emiliana Cabernet Sauvignon', 'Reserva Orgânico - Cabernet Sauvignon - Chile - 2022', 130.00, true, null),
  ('Vinhos', 'Chandon Réserve Brut', 'Espumante Réserve Brut', 180.00, true, null),
  ('Vinhos', 'Taça de Vinho', 'Taça de vinho (consulte rótulos disponíveis)', 25.00, true, null)
) AS item(category_name, name, description, price, available, allergens)
WHERE cat.name = item.category_name;

-- Inserir posts do blog com slugs únicos
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, published, published_at) VALUES
('A História do Armazém São Joaquim', 'historia-do-armazem-sao-joaquim', 
'Conheça a fascinante história de 170 anos do nosso restaurante histórico no coração de Santa Teresa.', 
'# A História do Armazém São Joaquim

"En esta casa tenemos memoria"

O Armazém São Joaquim tem uma rica história de 170 anos no coração de Santa Teresa. Desde 1854, este espaço histórico tem sido um ponto de encontro para moradores e visitantes, preservando a autenticidade e o charme do bairro mais boêmio do Rio de Janeiro.

## Nossa Jornada

Nossa jornada começou como um simples armazém, servindo a comunidade local com produtos essenciais. Com o passar dos anos, evoluímos para nos tornar um restaurante e bar que celebra as tradições culinárias brasileiras com um toque contemporâneo.

## Santa Teresa: Um Bairro que Parou no Tempo

Santa Teresa parece ter parado no tempo, preservando aspectos do Rio Antigo e guardando uma história em cada esquina. O bairro, carinhosamente chamado pelos cariocas de "Santa", é composto de várias ladeiras tortuosas.

## O Bondinho: Uma História de Resistência

Com a aceleração do processo de loteamento das chácaras, a partir dos anos 1850, e a consequente aglomeração de moradores, o bonde, hoje tão vinculado à identidade de Santa Teresa, chegou ao bairro em 1872.

Um plano inclinado partia da Rua do Riachuelo e subia a Ladeira do Castro até o Largo dos Guimarães, de onde partiam os carris para o Silvestre e o morro de Paula Matos (região do bairro voltada para o Catumbi). Na época, em editorial para a revista Ilustração Brasileira, Machado de Assis preconizou que, com os bondes, o bairro viraria moda.

Em clima festivo e com a presença do então presidente da República Prudente de Morais, inaugurou-se, em 1º de setembro de 1896, a linha de bonde eletrificada que ligava Santa Teresa ao Centro através do antigo Aqueduto da Carioca. Desde então, o bonde virou ícone do bairro.

Em 1963, um decreto do governador do estado da Guanabara, Carlos Lacerda, extinguiu as linhas de bonde da cidade, mas Santa Teresa resistiu.

## O Armazém: Uma Relíquia Histórica

Santa Teresa carrega a alma carioca por suas ruas de paralelepípedo e casarões históricos. Em um desses casarões localiza-se o ARMAZÉM SÃO JOAQUIM. Relíquia do bairro e tombada pela União que ainda sobrevive.

Construído em 1854, com fachada de pedra feita à mão, foi armazém com 150 anos de funcionamento ininterrupto, até a morte de sua última herdeira, Stella Cruz em 2000.

Nosso famoso prédio amarelinho de janelas e portas vermelhas, foi restaurado há quase 03 anos com muito carinho e cuidado. É um ícone e uma história viva pelas ruas do Rio. Estamos localizados no Largo dos Guimarães.

## Mais que um Restaurante

O Armazém e Pousada São Joaquim é muito mais do que um simples bar de drinks e restaurante em Santa Teresa. É um refúgio convidativo para os amantes de coquetéis, onde os drinks são muito bem executados. Uma atmosfera acolhedora de uma casa histórica que se une à criatividade de uma POUSADA, criando um destino imperdível para os apreciadores do RIO DE JANEIRO, do Brasil e visitantes do mundo todo.

O destaque inegável do @armazemsaojoaquim cai sobre o bom gosto excepcional idealizado pelo habilidoso Patricio Avalos, numa casa democrática que transita entre os cenários cariocas.

O ARMAZÉM é uma ótima opção pela estrutura, beleza, charme, tranquilidade e atendimento. Ah, o restaurante é Pet friendly! 🐕 Um ótimo roteiro para curtir um dia lindo em Santa! 💛 A localização também é boa, e fica no centro do Largo do Guimarães.', 
'/images/blog/historia-armazem.jpg', true, '2024-01-15 10:00:00'::timestamp),

('Os Segredos da Nossa Feijoada', 'os-segredos-da-nossa-feijoada',
'Descubra os segredos por trás da nossa famosa feijoada tradicional',
'# Os Segredos da Nossa Feijoada

A feijoada do Armazém São Joaquim é mais que um prato - é uma tradição que passa de geração em geração, carregando consigo os sabores autênticos da culinária brasileira.

## A Receita Tradicional

Nossa feijoada segue a receita tradicional da casa, desenvolvida ao longo de décadas de experiência. Utilizamos feijão preto selecionado, carnes nobres como costela, lombo, linguiça calabresa e paio, além do tradicional torresmo crocante.

## O Segredo do Tempero

O grande diferencial da nossa feijoada está no tempero especial da casa. Uma mistura única de especiarias que inclui louro, alho, cebola e um toque secreto que só nós conhecemos. O cozimento lento em fogo baixo por mais de 4 horas garante que todos os sabores se integrem perfeitamente.

## Acompanhamentos Tradicionais

Servimos nossa feijoada com os acompanhamentos clássicos: arroz branco soltinho, farofa crocante feita na hora, couve refogada no alho, torresmo dourado e laranja fatiada para equilibrar o paladar.

## Quando Servimos

Nossa feijoada está disponível aos sábados, seguindo a tradição brasileira. É o momento perfeito para reunir família e amigos em torno da mesa, celebrando os sabores que definem nossa identidade culinária.

## Dica do Chef

Para apreciar melhor nossa feijoada, recomendamos acompanhá-la com uma caipirinha de limão ou uma cerveja gelada. A combinação é perfeita e realça ainda mais os sabores do prato.

Venha saborear a tradição no Armazém São Joaquim!', 
'/images/blog/segredos-feijoada.jpg', true, '2025-06-07 14:00:00'::timestamp),

('A Arte da Mixologia no Armazém', 'a-arte-da-mixologia-no-armazem',
'Conheça o cuidado e a paixão por trás de cada drink servido no Armazém São Joaquim.',
'# A Arte da Mixologia no Armazém

No Armazém São Joaquim, cada drink é uma obra de arte. Nossa mixologia combina técnicas clássicas com ingredientes brasileiros, criando experiências únicas que capturam a essência do Rio de Janeiro.

## Ingredientes Selecionados

Trabalhamos exclusivamente com ingredientes frescos e de alta qualidade. Nossas cachaças são artesanais, selecionadas de pequenos produtores que mantêm viva a tradição da destilação brasileira. Frutas frescas, ervas aromáticas e especiarias compõem nossa paleta de sabores.

## Drinks Autorais

### Helena
Nosso drink mais famoso combina vodka premium com limão siciliano, manjericão fresco, açúcar demerara e um toque de extrato de gengibre. O resultado é uma bebida refrescante e aromática que conquistou o paladar carioca.

### Morena Tropicana
Uma criação que celebra os sabores tropicais do Brasil. Gin artesanal, morango fresco, tangerina, limão taití, açúcar, mel picante e água tônica premium se unem em uma sinfonia de sabores.

### Carioquíssima
Nossa homenagem ao Rio de Janeiro. Cachaça Magnífica tradicional ipê, polpa de maracujá, xarope de baunilha, xarope de coco, limão taití e clara de ovo desidratado criam um drink cremoso e tropical.

## Técnicas Especiais

Utilizamos técnicas modernas de mixologia como clarificação, infusões, xaropes caseiros e garnishes elaborados. Cada drink é preparado com precisão e apresentado de forma única, criando uma experiência sensorial completa.

## O Bar

Nosso bar histórico, com mais de 170 anos, foi cuidadosamente restaurado mantendo sua autenticidade. O ambiente acolhedor e a vista privilegiada de Santa Teresa criam o cenário perfeito para apreciar nossos drinks especiais.

## Harmonização

Nossos bartenders são especialistas em harmonização e podem sugerir o drink perfeito para acompanhar cada prato do nosso menu. A combinação certa potencializa tanto os sabores da comida quanto da bebida.

Venha descobrir a arte da mixologia no coração de Santa Teresa!', 
'/images/blog/drinks.jpg', true, '2025-06-08 16:00:00'::timestamp),

('Eventos e Celebrações no Armazém', 'eventos-e-celebracoes-no-armazem',
'Descubra como transformar seus momentos especiais em memórias inesquecíveis no Armazém.',
'# Eventos e Celebrações no Armazém

O Armazém São Joaquim é o cenário perfeito para celebrar os momentos mais especiais da vida. Nossa casa histórica oferece um ambiente único e acolhedor para eventos inesquecíveis.

## Espaços Únicos

### Salão Principal
Nosso salão principal, com arquitetura original de 1854, acomoda até 80 pessoas. As paredes de pedra e os detalhes históricos criam uma atmosfera única e elegante.

### Terraço
Com vista privilegiada de Santa Teresa, nosso terraço é perfeito para eventos ao ar livre. Capacidade para 50 pessoas em um ambiente romântico e charmoso.

### Área VIP
Para eventos mais íntimos, nossa área VIP oferece privacidade e exclusividade para até 20 pessoas, mantendo o charme histórico do Armazém.

## Tipos de Eventos

### Casamentos
Celebre o amor em um dos locais mais românticos do Rio. Oferecemos pacotes completos com decoração, menu personalizado e serviço de primeira qualidade.

### Aniversários
Desde festas íntimas até grandes celebrações, criamos experiências personalizadas para tornar seu aniversário inesquecível.

### Eventos Corporativos
Impressione clientes e colaboradores com eventos corporativos em um ambiente histórico e sofisticado. Oferecemos estrutura completa para apresentações e networking.

### Lançamentos
Nosso espaço é ideal para lançamentos de produtos, livros ou projetos. A atmosfera única do Armazém adiciona charme e exclusividade ao seu evento.

## Serviços Inclusos

- Menu personalizado com nossa gastronomia premiada
- Drinks autorais e carta de vinhos selecionada
- Decoração temática
- Serviço de garçons especializados
- Sistema de som e iluminação
- Coordenação completa do evento

## Pacotes Especiais

Oferecemos pacotes personalizados para cada tipo de evento, incluindo opções para diferentes orçamentos. Nossa equipe trabalha junto com você para criar a celebração perfeita.

## Reservas

Para reservar seu evento, entre em contato conosco com antecedência mínima de 30 dias. Nossa equipe de eventos estará pronta para transformar sua visão em realidade.

Celebre a vida no Armazém São Joaquim - onde cada momento se torna história!', 
'/images/blog/eventos.jpg', true, '2025-06-08 18:00:00'::timestamp);

-- Mensagem de sucesso
SELECT 'Banco de dados limpo e reconfigurado com sucesso! Todas as tabelas foram recriadas, dados inseridos e blog posts adicionados com slugs únicos.' as status; 