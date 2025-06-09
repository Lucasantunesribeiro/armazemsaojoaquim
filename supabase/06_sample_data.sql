-- Insert sample data
-- Execute this last

-- APERITIVOS, SALADAS, PRATOS INDIVIDUAIS, GUARNIÇÕES, FEIJOADA, SANDUÍCHES, SOBREMESAS
INSERT INTO menu_items (nome, descricao, preco, categoria, disponivel, ingredientes, alergenos) VALUES
('Patatas Bravas', 'Batatas douradas com aioli de páprica levemente picante', 25.00, 'Aperitivos', true, ARRAY['Batatas', 'Aioli', 'Páprica'], ARRAY['Ovos']),
('Croqueta de Costela', 'Costela bovina cozida em baixa temperatura refogada com tempero da casa - 4 unidades', 39.00, 'Aperitivos', true, ARRAY['Costela bovina', 'Temperos especiais', 'Farinha'], ARRAY['Glúten']),
('Linguiça na Brasa', 'Porção aperitiva, fatiada com cebola caramelizada - 2 unidades', 18.00, 'Aperitivos', true, ARRAY['Linguiça artesanal', 'Cebola caramelizada'], null),
('Bolinho de Feijoada', 'Bolinho de feijoada à moda da casa acompanhado com geleia de pimenta - 4 unidades', 39.00, 'Aperitivos', true, ARRAY['Feijão preto', 'Carnes', 'Geleia de pimenta'], ARRAY['Glúten']),
('Pão de Alho', 'Porção aperitiva de pão de alho - 2 unidades', 12.00, 'Aperitivos', true, ARRAY['Pão', 'Alho', 'Manteiga'], ARRAY['Glúten', 'Lactose']),
('Bolinho de Bacalhau', 'Bolinhos tradicionais de bacalhau - 6 unidades', 29.00, 'Aperitivos', true, ARRAY['Bacalhau', 'Batata', 'Ovos'], ARRAY['Glúten', 'Ovos', 'Peixe']),
('Pastéis de Pupunha', 'Porção aperitiva de pastel de palmito pupunha com leve toque de catupiry - 6 unidades', 35.00, 'Aperitivos', true, ARRAY['Palmito pupunha', 'Catupiry', 'Massa'], ARRAY['Glúten', 'Lactose']),
('Íscas de Peixe', 'Porção aperitiva frita, dourada com molho aioli - 120g de carne in natura', 32.00, 'Aperitivos', true, ARRAY['Peixe fresco', 'Molho aioli'], ARRAY['Peixe', 'Ovos']),
('Pastéis de Queijo', 'Porção aperitiva de pastel de queijo - 6 unidades', 29.00, 'Aperitivos', true, ARRAY['Queijo', 'Massa'], ARRAY['Glúten', 'Lactose']),
('Pastéis de Carne Seca e Creme de Queijo', 'Porção aperitiva de pastel de carne seca com creme de queijo - 6 unidades', 35.00, 'Aperitivos', true, ARRAY['Carne seca', 'Creme de queijo', 'Massa'], ARRAY['Glúten', 'Lactose']),
('Íscas de Frango', 'Porção aperitiva frita, dourada com molho aioli - 120g de carne in natura', 29.00, 'Aperitivos', true, ARRAY['Frango', 'Molho aioli'], ARRAY['Ovos']),
('Torresmo', 'Porção aperitiva frita, dourada - 150g', 12.00, 'Aperitivos', true, ARRAY['Barriga suína'], null),
('Palmito Pupunha', 'Palmito assado na parrilla guarnecido com molho pesto', 39.00, 'Aperitivos', true, ARRAY['Palmito pupunha', 'Molho pesto'], ARRAY['Nozes']),
('Ceviche Carioca', 'Tilápia marinada em suco de limão, gengibre, leite de coco, cebola roxa, pimenta dedo de moça, coentro, milho e chips de batata frita', 49.00, 'Aperitivos', true, ARRAY['Tilápia', 'Limão', 'Gengibre', 'Leite de coco', 'Cebola roxa', 'Pimenta', 'Coentro', 'Milho'], ARRAY['Peixe']),
('Vinagrete de Polvo', 'Polvo fatiado com vinagrete, suco de limão, azeite, cebola, tomate e chips de banana da terra', 49.00, 'Aperitivos', true, ARRAY['Polvo', 'Vinagrete', 'Limão', 'Azeite', 'Cebola', 'Tomate', 'Banana da terra'], null),
('Caprese Mineira', 'Salada de tomate, queijo minas frescal, pesto de manjericão e torradas finas', 40.00, 'Saladas', true, ARRAY['Tomate', 'Queijo minas frescal', 'Pesto de manjericão', 'Torradas'], ARRAY['Lactose', 'Glúten', 'Nozes']),
('Caesar Salad com Fatias de Frango', 'Alface americana, croutons, parmesão ralado e molho Caesar com frango', 37.00, 'Saladas', true, ARRAY['Alface americana', 'Croutons', 'Parmesão', 'Molho Caesar', 'Frango'], ARRAY['Glúten', 'Lactose', 'Ovos']),
('Caesar Salad', 'Alface americana, croutons, parmesão ralado e molho Caesar', 30.00, 'Saladas', true, ARRAY['Alface americana', 'Croutons', 'Parmesão', 'Molho Caesar'], ARRAY['Glúten', 'Lactose', 'Ovos']),
('Salada de Grãos com Tilápia', 'Tabule com grãos, pepino, coentro, alface crespa, cenoura e iscas de tilápia crocante', 55.00, 'Saladas', true, ARRAY['Grãos', 'Pepino', 'Coentro', 'Alface crespa', 'Cenoura', 'Tilápia'], ARRAY['Peixe', 'Glúten']),
('Salada de Grãos com Frango', 'Tabule com grãos, pepino, coentro, alface crespa, cenoura e iscas de frango à milanesa', 50.00, 'Saladas', true, ARRAY['Grãos', 'Pepino', 'Coentro', 'Alface crespa', 'Cenoura', 'Frango'], ARRAY['Glúten']),
('Sobrecoxa ao Carvão', 'Sobrecoxa assada na brasa com molho de mostarda, legumes grelhados, farofa e vinagrete - 300g de carne in natura', 70.00, 'Pratos Individuais', true, ARRAY['Sobrecoxa', 'Molho de mostarda', 'Legumes', 'Farofa', 'Vinagrete'], null),
('Moqueca de Banana da Terra', 'Moqueca com palmito, mix de pimentões, tomate cereja, arroz branco e farofa de dendê', 65.00, 'Pratos Individuais', true, ARRAY['Banana da terra', 'Palmito', 'Pimentões', 'Tomate cereja', 'Arroz', 'Dendê'], null),
('Bife Ancho', 'Corte argentino com molho chimichurri, legumes na brasa e batatas bravas - 250g de carne in natura', 98.00, 'Pratos Individuais', true, ARRAY['Bife ancho', 'Molho chimichurri', 'Legumes', 'Batatas'], null),
('Risoto de Bacalhau', 'Risoto com lascas de bacalhau, tomate cereja frito, cebola caramelizada e azeitonas', 95.00, 'Pratos Individuais', true, ARRAY['Arroz arbóreo', 'Bacalhau', 'Tomate cereja', 'Cebola', 'Azeitonas'], ARRAY['Peixe', 'Lactose']),
('Tilápia Grelhada', 'Filé de tilápia grelhada com legumes e limão grelhados', 75.00, 'Pratos Individuais', true, ARRAY['Tilápia', 'Legumes', 'Limão'], ARRAY['Peixe']),
('Atum em Crosta', 'Atum selado em crosta de gergelim, espaguete de legumes, molho à base de shoyu e tomate cereja frito', 130.00, 'Pratos Individuais', true, ARRAY['Atum', 'Gergelim', 'Legumes', 'Shoyu', 'Tomate cereja'], ARRAY['Peixe', 'Gergelim', 'Soja']),
('Posta de Salmão Grelhado', 'Salmão grelhado com purê de batata, molho de maracujá e legumes', 75.00, 'Pratos Individuais', true, ARRAY['Salmão', 'Purê de batata', 'Molho de maracujá', 'Legumes'], ARRAY['Peixe', 'Lactose']),
('Polvo Grelhado com Arroz Negro', 'Polvo grelhado na parrilla com arroz negro, tomate e limão assado', 130.00, 'Pratos Individuais', true, ARRAY['Polvo', 'Arroz negro', 'Tomate', 'Limão'], null),
('Envelopado de Acelga', 'Acelga branqueada com palmito, banana da terra e couve-flor, purê de cenoura e gengibre', 75.00, 'Pratos Individuais', true, ARRAY['Acelga', 'Palmito', 'Banana da terra', 'Couve-flor', 'Cenoura', 'Gengibre'], null),
('Feijão (Guarnição)', 'Feijão temperado da casa', 15.00, 'Guarnições', true, ARRAY['Feijão'], null),
('Arroz (Guarnição)', 'Arroz branco soltinho', 14.00, 'Guarnições', true, ARRAY['Arroz'], null),
('Patatas Bravas (Guarnição)', 'Batatas douradas temperadas', 25.00, 'Guarnições', true, ARRAY['Batatas', 'Temperos'], null),
('Legumes na Brasa', 'Mix de legumes grelhados na parrilla', 15.00, 'Guarnições', true, ARRAY['Legumes variados'], null),
('Farofa (Guarnição)', 'Farofa temperada da casa', 10.00, 'Guarnições', true, ARRAY['Farinha de mandioca', 'Temperos'], null),
('Purê de Batata (Guarnição)', 'Purê cremoso de batata', 15.00, 'Guarnições', true, ARRAY['Batata', 'Leite', 'Manteiga'], ARRAY['Lactose']),
('Saladinha da Casa', 'Mix de folhas da estação', 15.00, 'Guarnições', true, ARRAY['Mix de folhas', 'Temperos'], null),
('Feijoada Individual', 'Feijoada típica com farofa, arroz branco, carnes selecionadas, linguiça, torresmo, couve refogada e laranja fatiada', 75.00, 'Feijoada', true, ARRAY['Feijão preto', 'Carnes suínas', 'Linguiça', 'Torresmo', 'Arroz', 'Farofa', 'Couve', 'Laranja'], null),
('Feijoada para Dois', 'Feijoada típica para duas pessoas com todos os acompanhamentos', 135.00, 'Feijoada', true, ARRAY['Feijão preto', 'Carnes suínas', 'Linguiça', 'Torresmo', 'Arroz', 'Farofa', 'Couve', 'Laranja'], null),
('Feijoada Buffet Livre', 'Buffet livre de feijoada por pessoa', 100.00, 'Feijoada', true, ARRAY['Feijão preto', 'Carnes variadas', 'Acompanhamentos diversos'], null),
('Hambúrguer da Casa', 'Carne selecionada com queijo cheddar, cebola caramelizada, alface, tomate e batata da casa', 55.00, 'Sanduíches', true, ARRAY['Carne bovina', 'Queijo cheddar', 'Cebola caramelizada', 'Alface', 'Tomate', 'Batatas'], ARRAY['Glúten', 'Lactose']),
('Hambúrguer Vegetariano', 'Grão de bico com ervas, tomate confit, alface, cebola caramelizada e molho pesto, acompanhado de batatas rústicas', 55.00, 'Sanduíches', true, ARRAY['Grão de bico', 'Ervas', 'Tomate confit', 'Alface', 'Cebola caramelizada', 'Molho pesto', 'Batatas'], ARRAY['Glúten', 'Nozes']),
('Chori-Pão', 'Pão baguete, linguiça de pernil e molho chimichurri', 32.00, 'Sanduíches', true, ARRAY['Pão baguete', 'Linguiça de pernil', 'Molho chimichurri'], ARRAY['Glúten']),
('Marquise au Chocolat', 'Ganache de chocolate meio amargo, sorvete de creme e coulis do dia', 25.00, 'Sobremesas', true, ARRAY['Chocolate meio amargo', 'Sorvete de creme', 'Coulis de frutas'], ARRAY['Lactose', 'Ovos']),
('Delícia de Manga', 'Mousse de manga e coco com molho de maracujá, decorada com fatias de manga e coco ralado', 22.00, 'Sobremesas', true, ARRAY['Manga', 'Coco', 'Mousse', 'Molho de maracujá'], ARRAY['Lactose']);

-- Sample blog posts
INSERT INTO blog_posts (titulo, conteudo, resumo, publicado, author_id, slug) VALUES
('A História do Armazém São Joaquim', 
'O Armazém São Joaquim iniciou a sua jornada somando história, autenticidade e diversidade no bairro mais charmoso do Rio de Janeiro, Santa Teresa. 

Construído em 1854, com fachada de pedra feita à mão, foi armazém com 150 anos de funcionamento ininterrupto, até a morte de sua última herdeira, Stella Cruz em 2000.

A casa permaneceu fechada por mais de 20 anos, até ser descoberta pelos atuais proprietários em 2020. Após dois anos de reforma respeitosa que preservou cada detalhe histórico, o Armazém São Joaquim renasce como restaurante e pousada.

Nossa missão é manter viva a memória deste lugar único, onde cada pedra conta uma história e cada prato carrega a tradição de Santa Teresa.', 
'Conheça a história fascinante do Armazém São Joaquim, um patrimônio histórico de 170 anos em Santa Teresa que renasceu como restaurante após décadas fechado.', 
true, 
'00000000-0000-0000-0000-000000000000', 
'historia-armazem-sao-joaquim'),

('Os Segredos dos Nossos Drinks', 
'No Armazém São Joaquim, cada drink conta uma história. Nossa carta de bebidas é cuidadosamente elaborada para honrar tanto a tradição quanto a inovação.

A Caipirinha da Casa, por exemplo, utiliza cachaça artesanal mineira e limões galegos selecionados. O segredo está no equilíbrio perfeito entre doce e azedo, e na técnica de maceração que desenvolvemos.

Nosso Gin Tônica Premium leva especiarias que remetem às antigas rotas comerciais que passavam por Santa Teresa. Gengibre, cardamomo e um toque de pimenta rosa criam uma experiência única.

O Negroni do Armazém ganhou uma releitura especial com vermute nacional e bitter artesanal, mantendo a essência italiana mas com a alma brasileira.', 
'Descubra os segredos por trás dos drinks artesanais do Armazém São Joaquim e como cada receita carrega história e tradição.', 
true, 
'00000000-0000-0000-0000-000000000000', 
'segredos-dos-drinks'),

('Santa Teresa: O Bairro dos Artistas', 
'Santa Teresa sempre foi um refúgio para artistas, intelectuais e boêmios. Nas ruas de paralelepípedo do bairro, encontramos ateliês, galerias e casas que respiram arte.

O Armazém São Joaquim sempre esteve inserido neste contexto cultural. Durante seus 150 anos como armazém, serviu café para pintores que vinham buscar inspiração no Largo do Guimarães, vendeu materiais para escultores e foi ponto de encontro de músicos.

Hoje, como restaurante, continuamos esta tradição sendo palco de saraus, exposições e apresentações musicais. Nossa programação cultural valoriza tanto artistas consagrados quanto talentos emergentes de Santa Teresa.

É emocionante ver como o bairro se reinventa constantemente, mas mantém sua essência artística e sua hospitalidade única.', 
'Explore a rica tradição artística de Santa Teresa e como o Armazém São Joaquim continua sendo parte importante da cultura do bairro.', 
true, 
'00000000-0000-0000-0000-000000000000', 
'santa-teresa-bairro-artistas');