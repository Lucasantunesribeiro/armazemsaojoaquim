-- Arquivo para atualizar o cardápio com os novos dados
-- Execute este arquivo para substituir o cardápio atual

-- Limpar dados existentes
DELETE FROM menu_items;

-- Resetar a sequência
ALTER SEQUENCE menu_items_id_seq RESTART WITH 1;

-- Inserir itens do menu com ingredientes e alérgenos
INSERT INTO menu_items (nome, descricao, preco, categoria, disponivel, ingredientes, alergenos) 
VALUES 

-- APERITIVOS
('Patatas Bravas', 'Batatas douradas com aioli de páprica levemente picante', 25.00, 'Aperitivos', true, '{"Batatas", "Aioli", "Páprica"}', '{"Ovos"}'),
('Croqueta de Costela', 'Costela bovina cozida em baixa temperatura refogada com tempero da casa - 4 unidades', 39.00, 'Aperitivos', true, '{"Costela bovina", "Temperos especiais", "Farinha"}', '{"Glúten"}'),
('Linguiça na Brasa', 'Porção aperitiva, fatiada com cebola caramelizada - 2 unidades', 18.00, 'Aperitivos', true, '{"Linguiça artesanal", "Cebola caramelizada"}', null),
('Bolinho de Feijoada', 'Bolinho de feijoada à moda da casa acompanhado com geleia de pimenta - 4 unidades', 39.00, 'Aperitivos', true, '{"Feijão preto", "Carnes", "Geleia de pimenta"}', '{"Glúten"}'),
('Pão de Alho', 'Porção aperitiva de pão de alho - 2 unidades', 12.00, 'Aperitivos', true, '{"Pão", "Alho", "Manteiga"}', '{"Glúten", "Lactose"}'),
('Bolinho de Bacalhau', 'Bolinhos tradicionais de bacalhau - 6 unidades', 29.00, 'Aperitivos', true, '{"Bacalhau", "Batata", "Ovos"}', '{"Glúten", "Ovos", "Peixe"}'),
('Pastéis de Pupunha', 'Porção aperitiva de pastel de palmito pupunha com leve toque de catupiry - 6 unidades', 35.00, 'Aperitivos', true, '{"Palmito pupunha", "Catupiry", "Massa"}', '{"Glúten", "Lactose"}'),
('Íscas de Peixe', 'Porção aperitiva frita, dourada com molho aioli - 120g de carne in natura', 32.00, 'Aperitivos', true, '{"Peixe fresco", "Molho aioli"}', '{"Peixe", "Ovos"}'),
('Pastéis de Queijo', 'Porção aperitiva de pastel de queijo - 6 unidades', 29.00, 'Aperitivos', true, '{"Queijo", "Massa"}', '{"Glúten", "Lactose"}'),
('Pastéis de Carne Seca e Creme de Queijo', 'Porção aperitiva de pastel de carne seca com creme de queijo - 6 unidades', 35.00, 'Aperitivos', true, '{"Carne seca", "Creme de queijo", "Massa"}', '{"Glúten", "Lactose"}'),
('Íscas de Frango', 'Porção aperitiva frita, dourada com molho aioli - 120g de carne in natura', 29.00, 'Aperitivos', true, '{"Frango", "Molho aioli"}', '{"Ovos"}'),
('Torresmo', 'Porção aperitiva frita, dourada - 150g', 12.00, 'Aperitivos', true, '{"Barriga suína"}', null),
('Palmito Pupunha', 'Palmito assado na parrilla guarnecido com molho pesto', 39.00, 'Aperitivos', true, '{"Palmito pupunha", "Molho pesto"}', '{"Nozes"}'),
('Ceviche Carioca', 'Tilápia marinada em suco de limão, gengibre, leite de coco, cebola roxa, pimenta dedo de moça, coentro, milho e chips de batata frita', 49.00, 'Aperitivos', true, '{"Tilápia", "Limão", "Gengibre", "Leite de coco", "Cebola roxa", "Pimenta", "Coentro", "Milho"}', '{"Peixe"}'),
('Vinagrete de Polvo', 'Polvo fatiado com vinagrete, suco de limão, azeite, cebola, tomate e chips de banana da terra', 49.00, 'Aperitivos', true, '{"Polvo", "Vinagrete", "Limão", "Azeite", "Cebola", "Tomate", "Banana da terra"}', null),

-- SALADAS
('Caprese Mineira', 'Salada de tomate, queijo minas frescal, pesto de manjericão e torradas finas', 40.00, 'Saladas', true, '{"Tomate", "Queijo minas frescal", "Pesto de manjericão", "Torradas"}', '{"Lactose", "Glúten", "Nozes"}'),
('Caesar Salad com Fatias de Frango', 'Alface americana, croutons, parmesão ralado e molho Caesar com frango', 37.00, 'Saladas', true, '{"Alface americana", "Croutons", "Parmesão", "Molho Caesar", "Frango"}', '{"Glúten", "Lactose", "Ovos"}'),
('Caesar Salad', 'Alface americana, croutons, parmesão ralado e molho Caesar', 30.00, 'Saladas', true, '{"Alface americana", "Croutons", "Parmesão", "Molho Caesar"}', '{"Glúten", "Lactose", "Ovos"}'),
('Salada de Grãos com Tilápia', 'Tabule com grãos, pepino, coentro, alface crespa, cenoura e iscas de tilápia crocante', 55.00, 'Saladas', true, '{"Grãos", "Pepino", "Coentro", "Alface crespa", "Cenoura", "Tilápia"}', '{"Peixe", "Glúten"}'),
('Salada de Grãos com Frango', 'Tabule com grãos, pepino, coentro, alface crespa, cenoura e iscas de frango à milanesa', 50.00, 'Saladas', true, '{"Grãos", "Pepino", "Coentro", "Alface crespa", "Cenoura", "Frango"}', '{"Glúten"}'),

-- PRATOS INDIVIDUAIS
('Sobrecoxa ao Carvão', 'Sobrecoxa assada na brasa com molho de mostarda, legumes grelhados, farofa e vinagrete - 300g de carne in natura', 70.00, 'Pratos Individuais', true, '{"Sobrecoxa", "Molho de mostarda", "Legumes", "Farofa", "Vinagrete"}', null),
('Moqueca de Banana da Terra', 'Moqueca com palmito, mix de pimentões, tomate cereja, arroz branco e farofa de dendê', 65.00, 'Pratos Individuais', true, '{"Banana da terra", "Palmito", "Pimentões", "Tomate cereja", "Arroz", "Dendê"}', null),
('Bife Ancho', 'Corte argentino com molho chimichurri, legumes na brasa e batatas bravas - 250g de carne in natura', 98.00, 'Pratos Individuais', true, '{"Bife ancho", "Molho chimichurri", "Legumes", "Batatas"}', null),
('Risoto de Bacalhau', 'Risoto com lascas de bacalhau, tomate cereja frito, cebola caramelizada e azeitonas', 95.00, 'Pratos Individuais', true, '{"Arroz arbóreo", "Bacalhau", "Tomate cereja", "Cebola", "Azeitonas"}', '{"Peixe", "Lactose"}'),
('Tilápia Grelhada', 'Filé de tilápia grelhada com legumes e limão grelhados', 75.00, 'Pratos Individuais', true, '{"Tilápia", "Legumes", "Limão"}', '{"Peixe"}'),
('Atum em Crosta', 'Atum selado em crosta de gergelim, espaguete de legumes, molho à base de shoyu e tomate cereja frito', 130.00, 'Pratos Individuais', true, '{"Atum", "Gergelim", "Legumes", "Shoyu", "Tomate cereja"}', '{"Peixe", "Gergelim", "Soja"}'),
('Posta de Salmão Grelhado', 'Salmão grelhado com purê de batata, molho de maracujá e legumes', 75.00, 'Pratos Individuais', true, '{"Salmão", "Purê de batata", "Molho de maracujá", "Legumes"}', '{"Peixe", "Lactose"}'),
('Polvo Grelhado com Arroz Negro', 'Polvo grelhado na parrilla com arroz negro, tomate e limão assado', 130.00, 'Pratos Individuais', true, '{"Polvo", "Arroz negro", "Tomate", "Limão"}', null),
('Envelopado de Acelga', 'Acelga branqueada com palmito, banana da terra e couve-flor, purê de cenoura e gengibre', 75.00, 'Pratos Individuais', true, '{"Acelga", "Palmito", "Banana da terra", "Couve-flor", "Cenoura", "Gengibre"}', null),

-- GUARNIÇÕES
('Feijão (Guarnição)', 'Feijão temperado da casa', 15.00, 'Guarnições', true, '{"Feijão"}', null),
('Arroz (Guarnição)', 'Arroz branco soltinho', 14.00, 'Guarnições', true, '{"Arroz"}', null),
('Patatas Bravas (Guarnição)', 'Batatas douradas temperadas', 25.00, 'Guarnições', true, '{"Batatas", "Temperos"}', null),
('Legumes na Brasa', 'Mix de legumes grelhados na parrilla', 15.00, 'Guarnições', true, '{"Legumes variados"}', null),
('Farofa (Guarnição)', 'Farofa temperada da casa', 10.00, 'Guarnições', true, '{"Farinha de mandioca", "Temperos"}', null),
('Purê de Batata (Guarnição)', 'Purê cremoso de batata', 15.00, 'Guarnições', true, '{"Batata", "Leite", "Manteiga"}', '{"Lactose"}'),
('Saladinha da Casa', 'Mix de folhas da estação', 15.00, 'Guarnições', true, '{"Mix de folhas", "Temperos"}', null),

-- FEIJOADA
('Feijoada Individual', 'Feijoada típica com farofa, arroz branco, carnes selecionadas, linguiça, torresmo, couve refogada e laranja fatiada', 75.00, 'Feijoada', true, '{"Feijão preto", "Carnes suínas", "Linguiça", "Torresmo", "Arroz", "Farofa", "Couve", "Laranja"}', null),
('Feijoada para Dois', 'Feijoada típica para duas pessoas com todos os acompanhamentos', 135.00, 'Feijoada', true, '{"Feijão preto", "Carnes suínas", "Linguiça", "Torresmo", "Arroz", "Farofa", "Couve", "Laranja"}', null),
('Feijoada Buffet Livre', 'Buffet livre de feijoada por pessoa', 100.00, 'Feijoada', true, '{"Feijão preto", "Carnes variadas", "Acompanhamentos diversos"}', null),

-- SANDUÍCHES
('Hambúrguer da Casa', 'Carne selecionada com queijo cheddar, cebola caramelizada, alface, tomate e batata da casa', 55.00, 'Sanduíches', true, '{"Carne bovina", "Queijo cheddar", "Cebola caramelizada", "Alface", "Tomate", "Batatas"}', '{"Glúten", "Lactose"}'),
('Hambúrguer Vegetariano', 'Grão de bico com ervas, tomate confit, alface, cebola caramelizada e molho pesto, acompanhado de batatas rústicas', 55.00, 'Sanduíches', true, '{"Grão de bico", "Ervas", "Tomate confit", "Alface", "Cebola caramelizada", "Molho pesto", "Batatas"}', '{"Glúten", "Nozes"}'),
('Chori-Pão', 'Pão baguete, linguiça de pernil e molho chimichurri', 32.00, 'Sanduíches', true, '{"Pão baguete", "Linguiça de pernil", "Molho chimichurri"}', '{"Glúten"}'),

-- SOBREMESAS
('Marquise au Chocolat', 'Ganache de chocolate meio amargo, sorvete de creme e coulis do dia', 25.00, 'Sobremesas', true, '{"Chocolate meio amargo", "Sorvete de creme", "Coulis de frutas"}', '{"Lactose", "Ovos"}'),
('Delícia de Manga', 'Mousse de manga e coco com molho de maracujá, decorada com fatias de manga e coco ralado', 22.00, 'Sobremesas', true, '{"Manga", "Coco", "Mousse", "Molho de maracujá"}', '{"Lactose"}');

-- Confirma que a atualização foi realizada
SELECT COUNT(*) as total_itens_inseridos FROM menu_items;
SELECT categoria, COUNT(*) as quantidade FROM menu_items GROUP BY categoria ORDER BY categoria; 