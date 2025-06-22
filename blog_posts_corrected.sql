-- Blog posts corrected with proper image paths
-- Using INSERT ... ON CONFLICT to update existing posts or insert new ones
INSERT INTO blog_posts (
  title, content, excerpt, featured_image, slug, published_at, created_at, updated_at
) VALUES 
(
  'A História do Armazém São Joaquim',
  '<p>O Armazém São Joaquim tem uma rica história de 170 anos no coração de Santa Teresa. Desde 1854, este espaço histórico tem sido um ponto de encontro para moradores e visitantes, preservando a autenticidade e o charme do bairro mais boêmio do Rio de Janeiro.</p><p>Nossa jornada começou como um simples armazém, servindo a comunidade local com produtos essenciais. Com o passar dos anos, evoluímos para nos tornar um restaurante e bar que celebra as tradições culinárias brasileiras com um toque contemporâneo.</p>',
  'Conheça a fascinante história de 170 anos do nosso restaurante histórico no coração de Santa Teresa.',
  '/images/blog/historia-armazem.jpg',
  'historia-do-armazem-sao-joaquim',
  '2024-01-15 10:00:00',
  NOW(),
  NOW()
),
(
  'Os Segredos da Nossa Feijoada',
  '<p>A feijoada é muito mais que um prato típico brasileiro - é uma tradição que une famílias e amigos em torno da mesa. No Armazém São Joaquim, nossa feijoada é preparada seguindo uma receita centenária, com ingredientes selecionados e muito amor.</p><p>O segredo está no tempo de cozimento lento, que permite que todos os sabores se integrem perfeitamente. Utilizamos feijão preto de primeira qualidade, carnes nobres e temperos especiais que fazem toda a diferença.</p>',
  'Descubra os segredos por trás da nossa famosa feijoada, uma receita que atravessa gerações.',
  '/images/blog/segredos-feijoada.jpg',
  'segredos-feijoada-tradicional',
  '2024-01-18 10:00:00',
  NOW(),
  NOW()
),
(
  'Drinks Especiais da Casa',
  '<p>Nossa carta de drinks é uma celebração da criatividade e dos sabores brasileiros. Cada bebida é cuidadosamente elaborada pelos nossos bartenders, utilizando ingredientes frescos e técnicas artesanais.</p><p>Desde caipirinhas autorais com frutas da estação até coquetéis exclusivos inspirados na história de Santa Teresa, nossa seleção de drinks complementa perfeitamente a experiência gastronômica do Armazém São Joaquim.</p>',
  'Conheça nossa seleção exclusiva de drinks artesanais e caipirinhas especiais.',
  '/images/blog/drinks.jpg',
  'drinks-especiais-casa',
  '2024-01-20 10:00:00',
  NOW(),
  NOW()
),
(
  'Eventos Especiais no Armazém',
  '<p>O Armazém São Joaquim é o local perfeito para celebrar momentos especiais. Nossa atmosfera acolhedora e histórica proporciona o cenário ideal para aniversários, comemorações e encontros inesquecíveis.</p><p>Oferecemos serviços personalizados para eventos privados, com cardápios especiais e um atendimento diferenciado. Nosso espaço histórico adiciona um charme único a qualquer celebração.</p>',
  'Descubra como tornar seus eventos ainda mais especiais em nosso ambiente histórico e acolhedor.',
  '/images/blog/eventos.jpg',
  'eventos-especiais-armazem',
  '2024-01-22 10:00:00',
  NOW(),
  NOW()
),
(
  'História de Santa Teresa: Berço da Boemia Carioca',
  '<p>Santa Teresa é um dos bairros mais charmosos e históricos do Rio de Janeiro, conhecido por sua arquitetura colonial preservada, ruas de paralelepípedo e atmosfera boêmia única. Localizado no alto de uma colina, o bairro oferece vistas deslumbrantes da cidade e da Baía de Guanabara.</p><p>Desde o século XIX, Santa Teresa tem sido um refúgio para artistas, intelectuais e boêmios. Suas casas coloniais, muitas transformadas em ateliês e galerias de arte, contam a história de um Rio de Janeiro mais intimista e cultural.</p>',
  'Descubra como o bairro se tornou um dos mais charmosos do Rio de Janeiro, preservando suas tradições e cultura secular.',
  '/images/santa-teresa-vista-panoramica.jpg',
  'historia-santa-teresa-berco-boemia-carioca',
  '2024-01-12 10:00:00',
  NOW(),
  NOW()
),
(
  'Receitas Centenárias: Os Segredos da Culinária Colonial',
  '<p>A culinária colonial brasileira é um tesouro de sabores e técnicas que atravessaram séculos. No Armazém São Joaquim, preservamos essas receitas tradicionais, passadas de geração em geração, mantendo viva a autenticidade dos sabores de nossa terra.</p><p>Nossos pratos são preparados seguindo métodos tradicionais: o feijão tropeiro é refogado em panela de ferro, a linguiça é defumada artesanalmente, e nossos doces seguem receitas que datam do período colonial.</p>',
  'Conheça as receitas tradicionais que atravessaram gerações e continuam encantando nossos clientes.',
  '/images/armazem-interior-aconchegante.jpg',
  'receitas-centenarias-segredos-culinaria-colonial',
  '2024-01-10 10:00:00',
  NOW(),
  NOW()
),
(
  'Bondinho de Santa Teresa: Uma Viagem no Tempo',
  '<p>O bondinho de Santa Teresa é muito mais que um meio de transporte - é uma viagem no tempo que conecta o presente ao passado glorioso do Rio de Janeiro. Inaugurado em 1896, este sistema de bondes é um dos últimos do mundo ainda em funcionamento.</p><p>A linha do bondinho serpenteia pelas ruas estreitas de Santa Teresa, passando por casarões históricos, ateliês de artistas e oferecendo vistas espetaculares da cidade. É uma experiência única que permite aos visitantes sentir a atmosfera romântica e nostálgica do bairro.</p>',
  'A história do transporte mais charmoso do Rio e sua importância para o desenvolvimento do bairro.',
  '/images/bondinho.jpg',
  'bondinho-santa-teresa-viagem-tempo',
  '2024-01-05 10:00:00',
  NOW(),
  NOW()
)
ON CONFLICT (slug) 
DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  excerpt = EXCLUDED.excerpt,
  featured_image = EXCLUDED.featured_image,
  published_at = EXCLUDED.published_at,
  updated_at = NOW(); 