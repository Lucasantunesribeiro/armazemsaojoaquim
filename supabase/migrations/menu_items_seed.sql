-- Script de seed para menu_items
-- Apaga todos os dados existentes e insere os itens do cardápio "CARDAPIO BR 2026"
-- Total: 210 itens em 14 categorias

BEGIN;

-- Limpar tabela existente
DELETE FROM menu_items;

-- PETISCOS (18)
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('PATATAS BRAVAS', 'Batatas douradas com aioli de páprica levemente picante', 25.00, 'PETISCOS', true, false),
('PÃO DE ALHO', 'Porção aperitiva de pão de alho (02 un)', 12.00, 'PETISCOS', true, false),
('LINGUIÇA NA BRASA', 'Porção aperitiva de linguiça de churrasco, assada na parrilha e fatiada com cebola caramelizada (02 un)', 18.00, 'PETISCOS', true, false),
('TORRESMO', 'Porção aperitiva frita, dourada (150g)', 18.00, 'PETISCOS', true, false),
('PASTÉIS DE PUPUNHA', 'Porção aperitiva de pastel de palmito pupunha com leve toque de catupiry (06 un)', 42.00, 'PETISCOS', true, false),
('PASTÉIS DE QUEIJO', 'Porção aperitiva de pastel de queijo (06 un)', 35.00, 'PETISCOS', true, false),
('PASTÉIS CARNE SECA E CREME DE QUEIJO', 'Porção aperitiva de pastel de carne seca com creme de queijo (06 un)', 42.00, 'PETISCOS', true, false),
('ÍSCAS DE FRANGO', 'Porção aperitiva de frango empanada na farinha de Panko, frita e servida com molho aiole (≅120g de carne in natura)', 32.00, 'PETISCOS', true, false),
('ÍSCAS DE PEIXE', 'Porção aperitiva de peixe empanada na farinha de Panko, frita e servida com molho aiole (≅120g de carne in natura)', 39.00, 'PETISCOS', true, false),
('ATUM AVOCADO', 'Tartare de atum, temperado com teriyaki e mostarda sobre uma pasta de guacamole (avocado)', 58.00, 'PETISCOS', true, false),
('CEVICHE CARIOCA', 'Tilápia marinada em suco de limão, gengibre, leite de coco, sal, cebola roxa, pimenta dedo de moça, coentro, milho peruano e chips de batata frita', 58.00, 'PETISCOS', true, false),
('VINAGRETE DE POLVO', 'Vinagrete, suco de limão, azeite, cebola, sal e pimenta, tomate e polvo fatiado com chips de banana da terra', 58.00, 'PETISCOS', true, false),
('PALMITO PUPUNHA', 'Palmito assado na parrilha guarnecido com molho pesto', 39.00, 'PETISCOS', true, false),
('LINGUIÇA ARTESANAL DE CALABRESA', 'Corte em fita da linguiça feita de carne de porco e temperos, pré-cozida e assada diretamente na parrilla, garantindo sabor defumado e textura macia. Servida com (02) pães de alho (500g)', 70.00, 'PETISCOS', true, false),
('LULINHAS DO ARMAZÉM', 'Anéis de lulinha empanados e temperados com vinho branco e ervas', 52.00, 'PETISCOS', true, false),
('BOLINHO DE BACALHAU', 'Porção aperitiva de bolinho de bacalhau (06 un)', 32.00, 'PETISCOS', true, false),
('CROQUETA DE COSTELA', 'Costela bovina cozida em baixa temperatura refogada com tempero da casa (04 un)', 45.00, 'PETISCOS', true, false),
('BOLINHO DE FEIJOADA', 'Bolinho de feijoada à moda da casa acompanhado com geleia de pimenta (04 un)', 42.00, 'PETISCOS', true, false);

-- SALADAS (5)
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('CAPRESE MINEIRA', 'Salada de tomate, queijo minas frescal, pesto de manjericão e torradas finas', 55.00, 'SALADAS', true, false),
('CAESAR SALAD COM FATIAS DE FRANGO', 'Alface americana, croutons e parmesão ralado, acompanha molho Caesar', 39.00, 'SALADAS', true, false),
('CAESAR SALAD SEM FATIAS DE FRANGO', 'Alface americana, croutons e parmesão ralado, acompanha molho Caesar', 30.00, 'SALADAS', true, false),
('SALADA DE GRÃOS COM TILÁPIA', 'Tabule à base de grão com pepino, coentro, alface crespa e cenoura, servida com iscas de tilápia crocante', 58.00, 'SALADAS', true, false),
('SALADA DE GRÃOS COM FRANGO', 'Tabule à base de grão com pepino, coentro, alface crespa e cenoura, servida com iscas de frango à milanesa', 50.00, 'SALADAS', true, false);

-- PRATOS PRINCIPAIS (22)
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('BIFE ANCHO', 'Carne — corte tradicional argentino, com molho chimichurri, acompanha legumes na brasa e batatas bravas (≅250g de carne in natura). Para 01 pessoa', 98.00, 'PRATOS PRINCIPAIS', true, false),
('FILÉ MIGNON COM MOLHO DE COGUMELOS E POLENTA CREMOSA', 'Carne — medalhões de filé mignon, perfeitamente selados e suculentos, servidos sobre uma aveludada polenta cremosa de queijo parmesão. O prato é finalizado com um molho rústico e aromático de cogumelos frescos. Para 01 pessoa', 95.00, 'PRATOS PRINCIPAIS', true, false),
('PASTEL DE CHOCLO', 'Carne — prato típico do Chile. Camadas de carne moída temperada, azeitonas e ovos, cobertas por um cremoso purê de milho verde e manjericão, gratinado ao forno. Servido em cumbuca individual. Para 01 pessoa', 65.00, 'PRATOS PRINCIPAIS', true, false),
('CHORIZO À MODA DA CASA (INDIVIDUAL)', 'Carne — corte tradicional argentino de sabor intenso e maciez excepcional, acompanhado de alho confitado, batatas e cebolas grelhadas, farofa de ovo e chimichurri', 120.00, 'PRATOS PRINCIPAIS', true, false),
('PICANHA AO CARVÃO', 'Carne — picanha assada na parrilla, com molho chimichurri, batatas bravas, farofa e vinagrete (≅500g de carne in natura). Para 02 pessoas', 195.00, 'PRATOS PRINCIPAIS', true, false),
('MIX NA BRASA', 'Carne — carne, linguiça (2), sobrecoxa, queijo coalho (2), pão de alho (2), vinagrete, farofa, patatas bravas e molho chimichurri. Para 02 pessoas', 150.00, 'PRATOS PRINCIPAIS', true, false),
('BIFE À MILANESA', 'Carne — corte tradicional à milanesa envolvido por farinha panko e ovos batidos, purê de batata e acompanha legumes na brasa. Para 02 pessoas', 95.00, 'PRATOS PRINCIPAIS', true, false),
('CHORIZO À MODA DA CASA (PARA DOIS)', 'Carne — corte tradicional argentino de sabor intenso e maciez excepcional, acompanhado de alho confitado, batatas e cebolas grelhadas, farofa de ovo e chimichurri. Para 02 pessoas', 220.00, 'PRATOS PRINCIPAIS', true, false),
('FEIJOADA DA CASA (INDIVIDUAL)', 'Culinária tradicional brasileira: feijoada típica, servida com farofa, arroz branco, carnes selecionadas, linguiça, torresmo, couve refogada e laranja fatiada, acompanhada de tigela de feijoada', 80.00, 'PRATOS PRINCIPAIS', true, false),
('FEIJOADA DA CASA (PARA DOIS)', 'Culinária tradicional brasileira: feijoada típica, servida com farofa, arroz branco, carnes selecionadas, linguiça, torresmo, couve refogada e laranja fatiada, acompanhada de tigela de feijoada. Para 02 pessoas', 140.00, 'PRATOS PRINCIPAIS', true, false),
('BUFFET DE FEIJOADA LIVRE', 'Buffet de feijoada livre por pessoa, com farofa, arroz branco, carnes selecionadas, linguiça, torresmo, couve refogada e laranja fatiada', 110.00, 'PRATOS PRINCIPAIS', true, false),
('SOBRECOXA AO CARVÃO', 'Frango — sobrecoxa assada na brasa com molho de mostarda, guarnecida de legumes grelhados na churrasqueira, farofa e vinagrete (≅300g de carne in natura). Para 01 pessoa', 70.00, 'PRATOS PRINCIPAIS', true, false),
('FRANGO COM ARROZ BASMATI', 'Frango — sobrecoxa desossada assada e recheada, acompanha arroz basmati e ratatouille de legumes. Para 01 pessoa', 75.00, 'PRATOS PRINCIPAIS', true, false),
('FRANGO A PARMEGIANA', 'Frango — filé de frango à milanesa, ao molho pomodoro e queijo gratinado, acompanha massa italiana. Para 01 pessoa', 80.00, 'PRATOS PRINCIPAIS', true, false),
('RISOTO DE BACALHAU', 'Peixes — risoto com lascas de bacalhau e tomate cereja frito, servido em cama de cebola caramelizada e azeitonas. Para 01 pessoa', 95.00, 'PRATOS PRINCIPAIS', true, false),
('TILÁPIA GRELHADA', 'Peixes — filé de tilápia grelhada com legumes e limão grelhados. Para 01 pessoa', 75.00, 'PRATOS PRINCIPAIS', true, false),
('DOURADO À MODA DO AIPO', 'Peixes — filé de dourado grelhado com purê de aipo, acompanha crispy de alho poró. Para 01 pessoa', 85.00, 'PRATOS PRINCIPAIS', true, false),
('POSTA DE SALMÃO GRELHADO', 'Peixes — salmão grelhado com purê de batata, molho de maracujá, legumes e tomate cereja frito (≅170g de carne in natura). Para 01 pessoa', 90.00, 'PRATOS PRINCIPAIS', true, false),
('ATUM EM CROSTA', 'Peixes — atum selado em crosta de gergelim, acompanhado de espaguete de legumes, molho à base de shoyu e tomate cereja frito (≅170g de carne in natura). Para 01 pessoa', 95.00, 'PRATOS PRINCIPAIS', true, false),
('CALAMARES À LA PRANCHA', 'Peixes — calamares temperados com vinho branco e ervas, servidos com batatas bravas temperadas com páprica picante. Para 01 pessoa', 75.00, 'PRATOS PRINCIPAIS', true, false),
('POLVO GRELHADO COM ARROZ NEGRO', 'Peixes — polvo cozido temperado e grelhado na parrilha com arroz negro, tomate e limão assado na brasa. Para 01 pessoa', 130.00, 'PRATOS PRINCIPAIS', true, false),
('TILÁPIA NA BRASA', 'Peixes — tilápia inteira assada na brasa e guarnecida de legumes (≅800g de carne in natura). Para 02 pessoas', 150.00, 'PRATOS PRINCIPAIS', true, false);

-- VEGANO / VEGETARIANO (3)
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('MOQUECA BANANA DA TERRA', 'Moqueca de banana da terra com palmito e mix de pimentões, acompanhada de tomate cereja, arroz branco e farofa de dendê', 75.00, 'VEGANO / VEGETARIANO', true, false),
('RISOTO DE COGUMELO', 'Delicioso e reconfortante risoto arbóreo, cozido "al dente". Combinação perfeita de cogumelos frescos salteados, finalizado com um toque de vinho branco, manteiga e parmesão cremoso', 90.00, 'VEGANO / VEGETARIANO', true, false),
('HAMBÚRGUER VEGETARIANO', 'Grão de bico com ervas, tomate confit, alface, cebola caramelizada e molho pesto, acompanhado de batatas rústicas', 60.00, 'VEGANO / VEGETARIANO', true, false);

-- SANDUÍCHES (3)
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('HAMBÚRGUER DA CASA', 'Carne selecionada com queijo cheddar, cebola caramelizada, alface, tomate e batata da casa', 65.00, 'SANDUÍCHES', true, false),
('CHORI-PÃO', 'Famoso choripan argentino na nossa versão carioca: pão baguete, linguiça de pernil e molho chimichurri', 35.00, 'SANDUÍCHES', true, false),
('PANINNI DE CARNE', 'Pão ciabata com carne, tomate e molho pesto. Tostado na parrilha, acompanhado de batatas rústicas', 55.00, 'SANDUÍCHES', true, false);

-- GUARNIÇÕES (7)
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('FEIJÃO', 'Porção de feijão', 15.00, 'GUARNIÇÕES', true, false),
('ARROZ', 'Porção de arroz', 14.00, 'GUARNIÇÕES', true, false),
('PATATAS BRAVA', 'Porção de patatas bravas', 25.00, 'GUARNIÇÕES', true, false),
('LEGUMES NA BRASA', 'Porção de legumes na brasa', 15.00, 'GUARNIÇÕES', true, false),
('FAROFA', 'Porção de farofa', 10.00, 'GUARNIÇÕES', true, false),
('PURÊ DE BATATA', 'Porção de purê de batata', 15.00, 'GUARNIÇÕES', true, false),
('SALADINHA DA CASA', 'Porção de saladinha da casa', 15.00, 'GUARNIÇÕES', true, false);

-- SOBREMESAS (3)
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('MARQUISE AU CHOCOLAT', 'Saborosa sobremesa francesa clássica e requintada com ganache de chocolate meio amargo, sorvete de creme e coulis do dia', 28.00, 'SOBREMESAS', true, false),
('DELÍCIA DE MANGA', 'Saborosa sobremesa brasileira feita de mousse de manga e coco, com molho de maracujá, decorada com fatias de manga e coco ralado', 28.00, 'SOBREMESAS', true, false),
('TARTE AUX POMMES', 'Deliciosa sobremesa francesa atemporal de massa sablée recheada com purê fino de maçã e lâminas de maçã, guarnecida de sorvete de creme e coulis do dia', 28.00, 'SOBREMESAS', true, false);

-- CAFÉS (3)
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('ESPRESSO', 'Café espresso', 9.00, 'CAFÉS', true, false),
('B43', 'Licor 43, baileys, xarope de canela e espresso', 32.00, 'CAFÉS', true, false),
('CARAJILLO', 'Drink clássico à base de café espresso e licor', 32.00, 'CAFÉS', true, false);

-- BEBIDAS SEM ÁLCOOL (14)
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('ÁGUA MINERAL COM GÁS', 'Água mineral com gás', 9.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('ÁGUA MINERAL SEM GÁS', 'Água mineral sem gás', 9.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('ÁGUA DE COCO', 'Água de coco (500ml)', 18.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('ÁGUA TÔNICA', 'Água tônica tradicional ou zero', 9.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('SHOT DE LIMÃO', 'Shot de limão', 2.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('REFRIGERANTE', 'Coca-Cola tradicional, Coca-Cola Zero, Guaraná tradicional ou Guaraná Zero', 9.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('SODAS ARTESANAIS', 'Hibisco, gengibre, capim-limão e maracujá', 14.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('LIMONADA', 'Limonada suíça sem açúcar e coada', 14.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('PINK LEMONADE', 'Limonada da casa, adoçada com xarope de hibisco', 14.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('LARANJA MIX', 'Suco de laranja pera e bahia', 14.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('OLHA O MATE!', 'Mate adoçado com xarope artesanal. Opção: maracujá ou limão', 14.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('RED BULL TROPICAL', 'Energético Red Bull Tropical', 18.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('RED BULL SUGAR FREE', 'Energético Red Bull Sugar Free', 18.00, 'BEBIDAS SEM ÁLCOOL', true, false),
('RED BULL MELANCIA', 'Energético Red Bull Melancia', 18.00, 'BEBIDAS SEM ÁLCOOL', true, false);

-- CERVEJAS (26)
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('AMSTEL 600ML', 'Cerveja Amstel (600ml)', 18.00, 'CERVEJAS', true, false),
('EISENBAHN 600ML', 'Cerveja Eisenbahn (600ml)', 20.00, 'CERVEJAS', true, false),
('HEINEKEN 600ML', 'Cerveja Heineken (600ml)', 22.00, 'CERVEJAS', true, false),
('PRAYA 600ML', 'Cerveja Praya (600ml)', 25.00, 'CERVEJAS', true, false),
('BADEN BADEN CRISTAL 600ML', 'Cerveja Baden Baden Cristal (600ml)', 28.00, 'CERVEJAS', true, false),
('BADEN BADEN GOLDEN 600ML', 'Cerveja Baden Baden Golden (600ml)', 28.00, 'CERVEJAS', true, false),
('BADEN BADEN WITBEER 600ML', 'Cerveja Baden Baden Witbeer (600ml)', 28.00, 'CERVEJAS', true, false),
('BADEN BADEN PEACH 600ML', 'Cerveja Baden Baden Peach (600ml)', 28.00, 'CERVEJAS', true, false),
('BADEN BADEN AMERICAN IPA 600ML', 'Cerveja Baden Baden American IPA (600ml)', 28.00, 'CERVEJAS', true, false),
('PRAYA LONG NECK', 'Cerveja Praya (long neck)', 16.00, 'CERVEJAS', true, false),
('PRAYA SEM GLÚTEN LONG NECK', 'Cerveja Praya sem glúten (long neck)', 16.00, 'CERVEJAS', true, false),
('AMSTEL LONG NECK', 'Cerveja Amstel (long neck)', 12.00, 'CERVEJAS', true, false),
('EISENBAHN PILSEN LONG NECK', 'Cerveja Eisenbahn Pilsen (long neck)', 15.00, 'CERVEJAS', true, false),
('EISENBAHN WEISS LONG NECK', 'Cerveja Eisenbahn Weiss (long neck)', 15.00, 'CERVEJAS', true, false),
('EISENBAHN IPA LONG NECK', 'Cerveja Eisenbahn IPA (long neck)', 15.00, 'CERVEJAS', true, false),
('HEINEKEN LONG NECK', 'Cerveja Heineken (long neck)', 15.00, 'CERVEJAS', true, false),
('HEINEKEN ZERO LONG NECK', 'Cerveja Heineken Zero (long neck)', 15.00, 'CERVEJAS', true, false),
('SOL LONG NECK', 'Cerveja Sol, sem glúten (long neck)', 15.00, 'CERVEJAS', true, false),
('SOL ZERO LONG NECK', 'Cerveja Sol Zero, sem glúten (long neck)', 15.00, 'CERVEJAS', true, false),
('LAGUNITAS LONG NECK', 'Cerveja Lagunitas (long neck)', 25.00, 'CERVEJAS', true, false),
('BLUE MOON LONG NECK', 'Cerveja Blue Moon (long neck)', 25.00, 'CERVEJAS', true, false),
('FAZENDINHA PILSEN', 'Cerveja carioca do Complexo do Alemão (500ml)', 32.00, 'CERVEJAS', true, false),
('MICHELADA', 'Caneca com suco de tomate, molho inglês, suco de limão, Tabasco e sal na borda. Não inclusa a cerveja', 16.00, 'CERVEJAS', true, false),
('CHELADA', 'Caneca com suco de limão, Tabasco e sal na borda. Não inclusa a cerveja', 10.00, 'CERVEJAS', true, false),
('CHOPP AMSTEL', 'Chopp Amstel (350ml)', 13.00, 'CERVEJAS', true, false),
('CHOPP HEINEKEN', 'Chopp Heineken (350ml)', 15.00, 'CERVEJAS', true, false);

-- COQUETÉIS (25)
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('CAJUEIRO', 'Cachaça Magnífica Cristal, caju, limão, açúcar, compota de caju e borda de castanha', 32.00, 'COQUETÉIS', true, false),
('DILMA CANTA', 'Cachaça Magnífica Tradicional Ipê, chá mate, polpa de maracujá, suco de abacaxi e xarope de coco', 32.00, 'COQUETÉIS', true, false),
('RÚCULA', 'Cachaça Magnífica Cristal infusionada, folhas de rúcula, suco de limão siciliano e açúcar', 32.00, 'COQUETÉIS', true, false),
('SEGREDO ENVELHECIDO', 'Cachaça Magnífica Extra Premium, cynar, bitter de cacau e xarope de caramelo salgado', 32.00, 'COQUETÉIS', true, false),
('FEITIÇO BRASILEIRO', 'Cachaça Magnífica Extra Premium, chá mate, cynar, xarope de especiarias e suco de laranja', 32.00, 'COQUETÉIS', true, false),
('O MON DA RAFA', 'Vodka, jambuzada de banana, limão siciliano, folhas de hortelã e xarope simples', 32.00, 'COQUETÉIS', true, false),
('AMARE COFFER', 'Vodka, amareto, espresso e açúcar', 32.00, 'COQUETÉIS', true, false),
('CARIOQUÍSSIMA', 'Vodka, limão siciliano, manjericão, açúcar e extrato de gengibre', 32.00, 'COQUETÉIS', true, false),
('JAMBU TREME', 'Jambuzada, caju, limão, gengibre e mel', 32.00, 'COQUETÉIS', true, false),
('MARAJAMBU', 'Jambuzada de abacaxi, maracujá, suco de laranja, xarope de melaço e suco de abacaxi', 32.00, 'COQUETÉIS', true, false),
('HELENA', 'Gin, morango, tangerina, limão taiti, açúcar, mel picante e tônica', 32.00, 'COQUETÉIS', true, false),
('RUBI SELVAGEM', 'Gin, chá de amora com framboesa, frutas vermelhas, suco de limão, xarope de hibisco e tônica', 32.00, 'COQUETÉIS', true, false),
('DOCE FRESCOR', 'Gin, manga, suco de laranja, suco de limão, xarope de maracujá e tônica', 32.00, 'COQUETÉIS', true, false),
('DOCE NÁUFRAGO', 'Rum ouro, suco de abacaxi, amareto, suco de limão siciliano e xarope de melaço', 32.00, 'COQUETÉIS', true, false),
('O CAÇADOR AMARGO', 'Rum prata, Jagermeister, fatias de hortelã, tangerina, suco de limão e açúcar', 32.00, 'COQUETÉIS', true, false),
('PIÑA COLADA DO ARMAZÉM', 'Rum, leite condensado, abacaxi e xarope de coco', 32.00, 'COQUETÉIS', true, false),
('PISCO DO SOL', 'Pisco, suco de abacaxi, xarope de melaço e suco de limão', 32.00, 'COQUETÉIS', true, false),
('ÁGUAS DE MARÇO', 'Tequila prata, cupuaçu, xarope de coco e suco de limão', 32.00, 'COQUETÉIS', true, false),
('A PAIXÃO DO MERCADO', 'Whiskey Jim Beam, polpa de maracujá, cachaça Gabrielinha, xarope de gengibre, suco de limão siciliano e xarope de canela', 32.00, 'COQUETÉIS', true, false),
('CHERRY COLA', 'Jim Beam Black Cherry, refrigerante de cola e limão', 32.00, 'COQUETÉIS', true, false),
('JIM BEAM MULE', 'Whiskey Jim Beam, xarope de gengibre, água com gás e suco de limão', 32.00, 'COQUETÉIS', true, false),
('VERSÃO SEM ÁLCOOL', 'Consulte as versões sem álcool dos nossos coquetéis autorais', 28.00, 'COQUETÉIS', true, false),
('CLÁSSICOS — STANDARD', 'Clássicos que nunca saem de moda: Bloody Mary, Espresso Martini, Cosmopolitan, Moscow Mule, Mojito, Porn Star Martini, Boulevardier, Old Fashioned, Whiskey Sour, Manhattan, Gin Tônica, Rabo de Galo, Tequila Sunrise, Margarita, Daiquiri, Mimosa, Aperol Spritz, Basil Smash, Negroni, Dry Martini, Fitzgerald, Pisco Sour e Cuba Libre. Destilado standard', 38.00, 'COQUETÉIS', true, false),
('CLÁSSICOS — PREMIUM', 'Os mesmos clássicos da casa preparados com destilado premium', 42.00, 'COQUETÉIS', true, false),
('CLÁSSICOS — SUPER PREMIUM', 'Os mesmos clássicos da casa preparados com destilado super premium', 52.00, 'COQUETÉIS', true, false);

-- CAIPIRINHAS (8)
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('VALENTINA', 'Caipirinha exclusiva do Armazém: cachaça, tangerina, açúcar e gengibre. 300ml com cachaça prateada R$ 24 ou vodka R$ 26 | Caipirão 500ml com cachaça R$ 30 ou vodka R$ 35', 24.00, 'CAIPIRINHAS', true, false),
('DA PÁ VIRADA', 'Caipirinha exclusiva do Armazém: cachaça, mel, limão siciliano e limão taití. 300ml com cachaça prateada R$ 24 ou vodka R$ 26 | Caipirão 500ml com cachaça R$ 30 ou vodka R$ 35', 24.00, 'CAIPIRINHAS', true, false),
('GORÓ', 'Caipirinha exclusiva do Armazém: cachaça, maracujá e xarope de especiarias. 300ml com cachaça prateada R$ 24 ou vodka R$ 26 | Caipirão 500ml com cachaça R$ 30 ou vodka R$ 35', 24.00, 'CAIPIRINHAS', true, false),
('LEVE E SOLTA', 'Caipirinha exclusiva do Armazém: cachaça, abacaxi, melaço e limão taití. 300ml com cachaça prateada R$ 24 ou vodka R$ 26 | Caipirão 500ml com cachaça R$ 30 ou vodka R$ 35', 24.00, 'CAIPIRINHAS', true, false),
('CAIPIRINHA MAGNÍFICA', 'Versões exclusivas (Valentina, Da Pá Virada, Goró ou Leve e Solta) feitas com cachaça Magnífica. 300ml R$ 26 | Caipirão 450ml R$ 32', 26.00, 'CAIPIRINHAS', true, false),
('TRIO CAIPIRA MAGNÍFICA', 'Clássico trio degustação com os sabores mais pedidos da casa em copos de 200ml: Dois Irmãos (cachaça cristal, limão taití, limão siciliano e xarope de especiarias), São Joaquim (cachaça bica do alambique, abacaxi e xarope de mel) e Vem Cá Minha Flor (cachaça tradicional ipê, maracujá, manjericão e xarope de baunilha)', 38.00, 'CAIPIRINHAS', true, false),
('CAIPIRINHA DE LIMÃO', 'Caipirinha tradicional de limão (300ml). Feita com cachaça prateada R$ 22, vodka R$ 24 ou saquê R$ 24', 22.00, 'CAIPIRINHAS', true, false),
('FRUTAS DA ESTAÇÃO', 'Caipirinha tradicional com a fruta do dia (300ml). Feita com cachaça prateada, vodka ou saquê. Consulte a disponibilidade da fruta do dia', 26.00, 'CAIPIRINHAS', true, false);

-- DESTILADOS (43)
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('CACHAÇA PRATEADA', 'Cachaça — dose', 12.00, 'DESTILADOS', true, false),
('JAMBUZADA ABACAXI', 'Cachaça — dose', 18.00, 'DESTILADOS', true, false),
('JAMBUZADA BANANA', 'Cachaça — dose', 18.00, 'DESTILADOS', true, false),
('JAMBUZADA TRADICIONAL', 'Cachaça — dose', 18.00, 'DESTILADOS', true, false),
('MAGNÍFICA CRISTAL', 'Cachaça — dose', 15.00, 'DESTILADOS', true, false),
('MAGNÍFICA BICA DO ALAMBIQUE', 'Cachaça — dose', 18.00, 'DESTILADOS', true, false),
('MAGNÍFICA TRADICIONAL IPÊ', 'Cachaça — dose', 20.00, 'DESTILADOS', true, false),
('MAGNÍFICA EXTRA PREMIUM', 'Cachaça — dose', 24.00, 'DESTILADOS', true, false),
('MAGNÍFICA SOLEIRA', 'Cachaça — dose', 55.00, 'DESTILADOS', true, false),
('JIM BEAM', 'Whiskey — dose', 25.00, 'DESTILADOS', true, false),
('JIM BEAM BLACK CHERRY', 'Whiskey — dose', 28.00, 'DESTILADOS', true, false),
('JIM BEAM HONEY', 'Whiskey — dose', 25.00, 'DESTILADOS', true, false),
('JIM BEAM BLACK', 'Whiskey — dose', 35.00, 'DESTILADOS', true, false),
('JIM BEAM RYE', 'Whiskey — dose', 30.00, 'DESTILADOS', true, false),
('MAKER''S MARK', 'Whiskey — dose', 45.00, 'DESTILADOS', true, false),
('JACK DANIEL''S', 'Whiskey — dose', 32.00, 'DESTILADOS', true, false),
('JACK DANIEL''S HONEY', 'Whiskey — dose', 30.00, 'DESTILADOS', true, false),
('JAMESON', 'Whiskey — dose', 28.00, 'DESTILADOS', true, false),
('CHIVAS 12', 'Whiskey — dose', 32.00, 'DESTILADOS', true, false),
('BULLEIT', 'Whiskey — dose', 54.00, 'DESTILADOS', true, false),
('BOMBAY SAPPHIRE', 'Gin — dose', 28.00, 'DESTILADOS', true, false),
('TANQUERAY', 'Gin — dose', 30.00, 'DESTILADOS', true, false),
('BEEFEATER', 'Gin — dose', 28.00, 'DESTILADOS', true, false),
('HENDRICK''S', 'Gin — dose', 48.00, 'DESTILADOS', true, false),
('ROKU', 'Gin — dose', 40.00, 'DESTILADOS', true, false),
('TANQUERAY TEN', 'Gin — dose', 45.00, 'DESTILADOS', true, false),
('ABSOLUT', 'Vodka — dose', 20.00, 'DESTILADOS', true, false),
('HAKU', 'Vodka — dose', 42.00, 'DESTILADOS', true, false),
('KETEL ONE', 'Vodka — dose', 28.00, 'DESTILADOS', true, false),
('GREY GOOSE', 'Vodka — dose', 34.00, 'DESTILADOS', true, false),
('ABSOLUT CITRON', 'Vodka — dose', 24.00, 'DESTILADOS', true, false),
('BACARDI AÑEJO 4', 'Rum — dose', 20.00, 'DESTILADOS', true, false),
('BACARDI RESERVA OCHO', 'Rum — dose', 30.00, 'DESTILADOS', true, false),
('HAVANA CLUB 3 AÑOS', 'Rum — dose', 26.00, 'DESTILADOS', true, false),
('HAVANA CLUB 7 AÑOS', 'Rum — dose', 30.00, 'DESTILADOS', true, false),
('JOSE CUERVO PRATA', 'Tequila — dose', 30.00, 'DESTILADOS', true, false),
('JOSE CUERVO OURO', 'Tequila — dose', 35.00, 'DESTILADOS', true, false),
('JAGERMEISTER', 'Licor — dose', 40.00, 'DESTILADOS', true, false),
('LICOR 43', 'Licor — dose', 35.00, 'DESTILADOS', true, false),
('CAMPARI', 'Licor — dose', 18.00, 'DESTILADOS', true, false),
('FERNET BRANCA', 'Licor — dose', 29.00, 'DESTILADOS', true, false),
('BAILEYS', 'Licor — dose', 32.00, 'DESTILADOS', true, false),
('AMARULA', 'Licor — dose', 28.00, 'DESTILADOS', true, false);

-- VINHOS (30)
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('CHAMARMUYO ESTATE MALBEC', 'Vinho tinto — Malbec, Argentina', 130.00, 'VINHOS', true, false),
('CORDERO EN PIEL DE LOBO (TINTO)', 'Vinho tinto — Malbec, Argentina, 2022', 110.00, 'VINHOS', true, false),
('CUESTA DEL MADERO (TINTO)', 'Vinho tinto — Bonarda Malbec, Argentina, 2022', 95.00, 'VINHOS', true, false),
('FINCA LA LINDA (TINTO)', 'Vinho tinto — Malbec, Argentina, 2025', 130.00, 'VINHOS', true, false),
('FLORES NEGRAS', 'Vinho tinto — Cabernet Franc, Argentina', 140.00, 'VINHOS', true, false),
('LUIGI BOSCA', 'Vinho tinto — Malbec, Argentina, 2024', 260.00, 'VINHOS', true, false),
('MINIMALISTA RED BLEND', 'Vinho tinto — Red Blend, Argentina, 2020', 95.00, 'VINHOS', true, false),
('MORANDÉ SINGLE VINEYARD', 'Vinho tinto — Pinot Noir, Chile, 2022', 150.00, 'VINHOS', true, false),
('ZORZAL TERROIR ÚNICO (TINTO)', 'Vinho tinto — Malbec, Argentina, 2024', 150.00, 'VINHOS', true, false),
('ABRAS MALBEC', 'Vinho tinto — Malbec, Argentina, 2023', 220.00, 'VINHOS', true, false),
('AMALAYA (TINTO)', 'Vinho tinto — Gran Corte Tinto Malbec, Argentina', 160.00, 'VINHOS', true, false),
('ENRIQUE FOSTER IQUE', 'Vinho tinto — Cabernet Sauvignon, Argentina, 2023', 100.00, 'VINHOS', true, false),
('CORDERO EN PIEL DE LOBO (BRANCO)', 'Vinho branco — Blend de blancas, Argentina, 2022', 110.00, 'VINHOS', true, false),
('CUESTA DEL MADERO (BRANCO)', 'Vinho branco — Reserva Orgânico Chardonnay Chenin, Argentina, 2022', 95.00, 'VINHOS', true, false),
('FINCA LA LINDA (BRANCO)', 'Vinho branco — Chardonnay, Argentina, 2025', 130.00, 'VINHOS', true, false),
('PACHECO PEREDA', 'Vinho branco — Chardonnay, Argentina', 100.00, 'VINHOS', true, false),
('ZORZAL TERROIR ÚNICO (BRANCO)', 'Vinho branco — Sauvignon Blanc, Argentina, 2024', 150.00, 'VINHOS', true, false),
('MINIMALISTA BRANCO', 'Vinho branco — Pinot Grigio, Argentina, 2023', 95.00, 'VINHOS', true, false),
('MORANDÉ BRANCO', 'Vinho branco — Gewürztraminer, Chile, 2023', 180.00, 'VINHOS', true, false),
('LATITUDE', 'Vinho branco — Sauvignon Blanc, Chile', 90.00, 'VINHOS', true, false),
('CORDERO EN PIEL DE LOBO (ROSÉ)', 'Vinho rosé — Malbec rosé, Argentina, 2023', 110.00, 'VINHOS', true, false),
('VIUMANET ROSE', 'Vinho rosé — Malbec rosé, Chile', 125.00, 'VINHOS', true, false),
('PEREZ CRUZ LINGAL', 'Vinho rosé — Grenache Mouvedre, Argentina', 140.00, 'VINHOS', true, false),
('MINIMALISTA ROSE', 'Vinho rosé — Mendoza, Argentina, 2023', 95.00, 'VINHOS', true, false),
('ZORZAL TERROIR ÚNICO (ROSÉ)', 'Vinho rosé — Pinot Noir rosé, Argentina, 2024', 150.00, 'VINHOS', true, false),
('AMALAYA (ROSÉ)', 'Vinho rosé — Blend Malbec, Argentina', 140.00, 'VINHOS', true, false),
('CHANDON RÉSERVE BRUT', 'Espumante — Chandon Réserve Brut', 180.00, 'VINHOS', true, false),
('CAVA OPHICUS BRANCO', 'Espumante — Cava Ophicus Branco', 120.00, 'VINHOS', true, false),
('CAVA OPHICUS ROSÉ', 'Espumante — Cava Ophicus Rosé', 120.00, 'VINHOS', true, false),
('TAÇA DE VINHO', 'Taça de vinho (01 unidade). Consulte sobre os rótulos disponíveis', 28.00, 'VINHOS', true, false);

COMMIT;
