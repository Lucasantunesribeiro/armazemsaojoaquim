-- Script de seed para menu_items
-- Apaga todos os dados existentes e insere os novos itens extraídos do Cardapio.pdf

BEGIN;

-- Limpar tabela existente
DELETE FROM menu_items;

-- PETISCOS
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('PATATAS BRAVAS', 'Batatas douradas com aioli de páprica levemente picante (04 un)', 25.00, 'PETISCOS', true, false),
('CROQUETA DE COSTELA', 'Costela bovina cozida em baixa temperatura refogada com tempero da casa (04 un)', 39.00, 'PETISCOS', true, false),
('LINGUIÇA NA BRASA', 'Porção aperitiva, fatiada com cebola caramelizada (02 un)', 18.00, 'PETISCOS', true, false),
('BOLINHO DE FEIJOADA', 'Bolinho de feijoada à moda da casa acompanhado com geleia de pimenta (04 un)', 39.00, 'PETISCOS', true, false),
('PÃO DE ALHO', 'Porção aperitiva de pão de alho (02 un)', 12.00, 'PETISCOS', true, false),
('BOLINHO DE BACALHAU', 'Porção aperitiva de bolinho de bacalhau (06 un)', 29.00, 'PETISCOS', true, false),
('PASTÉIS DE PUPUNHA', 'Porção aperitiva de pastel de palmito pupunha com leve toque de catupiry (06 un)', 35.00, 'PETISCOS', true, false),
('ÍSCAS DE PEIXE', 'Porção aperitiva frita, dourada com molho aiole ≅120g de carne in natura', 32.00, 'PETISCOS', true, false),
('PASTÉIS QUEIJO', 'Porção aperitiva de pastel de queijo (06 un)', 29.00, 'PETISCOS', true, false),
('ÍSCAS DE FRANGO', 'Porção aperitiva frita, dourada com molho aiole ≅120g de carne in natura', 29.00, 'PETISCOS', true, false),
('PASTÉIS CARNE SECA E CREME DE QUEIJO', 'Porção aperitiva de pastel de carne seca com creme de queijo (06 un)', 35.00, 'PETISCOS', true, false),
('PALMITO PUPUNHA', 'Palmito assado na parrilha guarnecido com molho pesto', 39.00, 'PETISCOS', true, false),
('TORRESMO', 'Porção aperitiva frita, dourada (150g)', 12.00, 'PETISCOS', true, false),
('VINAGRETE DE POLVO', 'Vinagrete, suco de limão, azeite, cebola sal e pimenta, tomate e polvo fatiado e chips banana da terra', 49.00, 'PETISCOS', true, false),
('CEVICHE CARIOCA', 'Tilápia, marinada em suco de limão, gengibre, leite de coco, sal, cebola roxa, pimenta dedo de moça, coentro, milho peruano, chips de batata frita', 49.00, 'PETISCOS', true, false),

-- SALADAS
('CAPRESE MINEIRA', 'Salada de tomate, queijo minas frescal, pesto de manjericão e torrada finas', 40.00, 'SALADAS', true, false),
('CAESER SALAD COM FATIAS DE FRANGO', 'Alface americana, croutons e parmesão ralado, acompanha molho Caesar', 37.00, 'SALADAS', true, false),
('CAESER SALAD SEM FATIAS DE FRANGO', 'Alface americana, croutons e parmesão ralado, acompanha molho Caesar', 30.00, 'SALADAS', true, false),
('SALADA DE GRÃOS COM TILÁPIA', 'Tabule a base de grão com pepino, coentro, alface crespa, cenoura, servida com iscas de tilápia crocante', 55.00, 'SALADAS', true, false),
('SALADA DE GRÃOS COM FRANGO', 'Tabule a base de grão com pepino, coentro, alface crespa, cenoura, servida com iscas de frango à milanesa', 50.00, 'SALADAS', true, false),

-- PRATOS PRINCIPAIS
('SOBRECOXA AO CARVÃO', 'Sobrecoxa assada na brasa com molho de mostarda, guarnecida de legumes grelhados na churrasqueira, farofa e vinagrete ≅300g', 70.00, 'PRATOS PRINCIPAIS', true, false),
('PICANHA AO CARVÃO', 'Picanha assada na parrilla, com molho chimichurri, batatas bravas, farofa e vinagrete ≅500g (para 2 pessoas)', 195.00, 'PRATOS PRINCIPAIS', true, false),
('MOQUECA BANANA DA TERRA', 'Moqueca de banana da terra com palmito, mix de pimentões, acompanhado de tomate cereja, arroz branco e farofa de dendê', 65.00, 'PRATOS PRINCIPAIS', true, false),
('TILÁPIA NA BRASA', 'Tilápia inteira assada na brasa e guarnecida de legumes ≅800g (para 2 pessoas)', 150.00, 'PRATOS PRINCIPAIS', true, false),
('BIFE ANCHO', 'Corte tradicional argentino, com molho chimichurri, acompanha legumes na brasa e batatas bravas ≅250g', 98.00, 'PRATOS PRINCIPAIS', true, false),
('MIX NA BRASA', 'Carne, linguiça(2), sobrecoxa, queijo coalho (2), pão de alho (2), vinagrete, farofa, patatas bravas e molho chimichurri (para 2 pessoas)', 150.00, 'PRATOS PRINCIPAIS', true, false),
('RISOTO DE BACALHAU', 'Risoto com lascas de bacalhau, tomate cereja frito, servido em cama de cebola caramelizada e azeitonas', 95.00, 'PRATOS PRINCIPAIS', true, false),
('MIX VEGETARIANO', 'Legumes na brasa, queijo coalho(2) guarnecido de farofa e vinagrete', 105.00, 'PRATOS PRINCIPAIS', true, false),
('TILÁPIA GRELHADA', 'Filé de Tilapia grelhada com legumes e limão grelhados', 75.00, 'PRATOS PRINCIPAIS', true, false),
('BIFE MILANESA', 'Corte tradicional à milanesa envolvido por farinha panko e ovos batidos, purê de batata e acompanha legumes na brasa', 95.00, 'PRATOS PRINCIPAIS', true, false),
('ATUM EM CROSTA', 'Atum selado em crosta de gergelim, acompanhado com espaguette de legumes, molho à base de shoyu e tomate cereja frito ≅170g', 89.00, 'PRATOS PRINCIPAIS', true, false),
('MILANESA DE FRANGO', 'Corte tradicional à milanesa envolvido por farinha panko e ovos batidos, acompanha saladinha mix e batatas fritas', 95.00, 'PRATOS PRINCIPAIS', true, false),
('POSTA DE SALMÃO GRELHADO', 'Salmão Grelhado com purê de batata com molho de maracujá e legumes tomate cereja frito ≅170g', 85.00, 'PRATOS PRINCIPAIS', true, false),
('POLVO GRELHADO COM ARROZ NEGRO', 'Polvo cozido temperado e grelhado na parrilha com arroz negro, tomate e limão assado na brasa', 130.00, 'PRATOS PRINCIPAIS', true, false),
('FEIJOADA DA CASA - INDIVIDUAL', 'Culinária tradicional brasileira: Feijoada típica, servida com farofa, arroz branco, carnes selecionadas, linguiça, torresmo, couve refogado, laranja fatiada acompanhada de tigela de feijoada', 75.00, 'PRATOS PRINCIPAIS', true, false),
('FEIJOADA DA CASA - PARA DOIS', 'Culinária tradicional brasileira: Feijoada típica, servida com farofa, arroz branco, carnes selecionadas, linguiça, torresmo, couve refogado, laranja fatiada acompanhada de tigela de feijoada', 135.00, 'PRATOS PRINCIPAIS', true, false),
('FEIJOADA DA CASA - BUFFET LIVRE', 'Buffet de feijoada livre por pessoa (somente em dias de evento, verificar disponibilidade)', 100.00, 'PRATOS PRINCIPAIS', true, false),

-- SANDUÍCHES
('HAMBÚRGUER DA CASA', 'Carne selecionada com queijo cheddar, cebola caramelizada, alface, tomate e batata da casa', 55.00, 'SANDUÍCHES', true, false),
('HAMBÚRGUER VEGETARIANO', 'Grão de bico com ervas, tomate confit, alface, cebola caramelizada e molho pesto acompanhado de batatas rústicas', 55.00, 'SANDUÍCHES', true, false),
('CHORI-PÃO', 'Famoso choripan argentino na nossa versão carioca: Pão baguete, linguiça de pernil e molho chimichurri', 32.00, 'SANDUÍCHES', true, false),

-- SOBREMESAS
('MARQUISE AU CHOCOLAT', 'Saborosa sobremesa Francesa clássica e requintada com ganache de chocolate meio amargo, sorvete de creme e coulis do dia', 25.00, 'SOBREMESAS', true, false),
('DELICIA DE MANGA', 'Saborosa sobremesa brasileira feita de mousse de manga e coco, com molho de maracuja decorada com fatias de manga e coco ralado', 25.00, 'SOBREMESAS', true, false),
('TARTE AUX POMMES', 'Deliciosa sobremesa Francesa atemporal de massa sablée recheada com purê fino de maçã, e laminas de maçã, guarnecida de sorvete de creme e coulis do dia', 25.00, 'SOBREMESAS', true, false),

-- BEBIDAS SEM ÁLCOOL
('ÁGUA MINERAL COM GAS', 'Água mineral com gás', 9.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('ÁGUA MINERAL SEM GAS', 'Água mineral sem gás', 9.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('ÁGUA DE COCO', 'Água de coco 500ml', 16.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('ÁGUA TÔNICA TRADICIONAL', 'Água tônica tradicional', 9.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('ÁGUA TÔNICA ZERO', 'Água tônica zero', 9.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('SHOT DE LIMÃO', 'Shot de limão', 2.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('REFRIGERANTE COCA-COLA TRADICIONAL', 'Coca-Cola tradicional', 9.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('REFRIGERANTE COCA-COLA ZERO', 'Coca-Cola zero', 9.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('REFRIGERANTE GUARANÁ TRADICIONAL', 'Guaraná tradicional', 9.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('REFRIGERANTE GUARANÁ ZERO', 'Guaraná zero', 9.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('SODAS ARTESANAIS', 'Hibisco, Gengibre, Capim-limão e Maracujá', 14.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('LIMONADA', 'Suíça sem açúcar e coada', 14.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('PINK LEMONADE', 'Limonada da casa, adoçada com xarope de hibisco', 14.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('LARANJA MIX', 'Suco de laranja pera e bahia', 14.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('OLHA O MATE!', 'Mate adoçado com xarope artesanal. Opção: maracujá ou limão', 14.00, 'BEBIDAS SEM ÁLCOOL', true, false),

-- GUARNIÇÕES
('Feijão', 'Porção de feijão', 15.00, 'GUARNIÇÕES', true, false),
('Arroz', 'Porção de arroz', 14.00, 'GUARNIÇÕES', true, false),
('Patatas Brava', 'Porção de patatas bravas', 25.00, 'GUARNIÇÕES', true, false),
('Legumes na Brasa', 'Porção de legumes na brasa', 15.00, 'GUARNIÇÕES', true, false),
('Farofa', 'Porção de farofa', 10.00, 'GUARNIÇÕES', true, false),
('Puré de Batata', 'Porção de purê de batata', 15.00, 'GUARNIÇÕES', true, false),
('Saladinha da Casa', 'Porção de saladinha da casa', 15.00, 'GUARNIÇÕES', true, false);

-- SUGESTÃO DO CHEF (Pratos em destaque)
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('ATUM AVOCADO', 'Tartare de atum, temperado com teriyaki e mostarda sobre uma pasta de guacamole (avocado)', 39.00, 'SUGESTÃO DO CHEF', true, true),
('LULINHAS DO ARMAZÉM', 'Anéis de lulinha empanadas e temperadas com vinho branco e ervas', 45.00, 'SUGESTÃO DO CHEF', true, true),
('CALAMARES À LA PRANCHA', 'Calamares temperados com vinho branco e ervas, servido com batatas bravas temperadas com páprica picante', 65.00, 'SUGESTÃO DO CHEF', true, true),
('TABULE MARROQUINO COM SALMÃO GRAVLAX', 'Cuscuz marroquinho com mini legumes, lâminas de salmão gravlax, pasta de cream cheese e dill, acompanhados de torradas da casa', 75.00, 'SUGESTÃO DO CHEF', true, true),
('SABOR MEDITERRÂNEO', 'Frutos do mar (tentáculos de polvo, tilápia grelhada e mini lulinhas), acompanhados de legumes braseados, farofa panko de ervas e molho salsa mango (picles de pimentões, manga e pimenta dedo de moça)', 130.00, 'SUGESTÃO DO CHEF', true, true);

COMMIT;
