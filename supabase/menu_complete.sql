-- Inserções completas para o menu do Armazém São Joaquim - Julho 2024
-- Estrutura: id, name, description, price, category, allergens

-- Limpar tabela existente
DELETE FROM public.menu_items;

-- PETISCOS
INSERT INTO public.menu_items (id, name, description, price, category, allergens, available, featured) VALUES
('f16b0add-8704-4620-8ddf-b9b86bbb185e', 'Tabule com Frango à Milanesa', 'Tabule de grão com pepino, coentro, alface crespa, cenoura, servido com iscas de frango à milanesa', 29.00, 'Petiscos', ARRAY['glúten'], true, false),
('f3399207-bd90-44d6-8f36-ff299ecfcd5d', 'Tabule com Tilápia Crocante', 'Tabule de grão com pepino, coentro, alface crespa, cenoura, servido com iscas de tilápia crocante', 29.00, 'Petiscos', ARRAY['peixe', 'glúten'], true, false),
('bf73205f-5055-4286-8e06-6b536d7decbb', 'Caprese Mineira', 'Salada de tomate, queijo minas frescal, pesto de manjericão e torradas finas', 39.00, 'Petiscos', ARRAY['laticínios', 'glúten'], true, true),
('72dbfc2e-eeb6-4bc5-8c0b-2a237c32f5d2', 'Bolinho de Bacalhau', 'Porção com 6 unidades de bolinho de bacalhau', 39.00, 'Petiscos', ARRAY['peixe', 'glúten'], true, true),
('a2c4b278-5ae3-4a6c-bf9b-3c716e0088ef', 'Bolinho de Feijoada', 'Bolinho de feijoada à moda da casa com geleia de pimenta', 35.00, 'Petiscos', ARRAY['glúten'], true, false),
('5fce0e18-393e-45a3-b83d-c5e3c6743b38', 'Croqueta de Costela', 'Costela bovina cozida lentamente, temperada e frita', 29.00, 'Petiscos', ARRAY['glúten'], true, false),
('1de0a74d-2782-4984-bf7e-e22dd14b5c8e', 'Pastel de Queijo', 'Porção com 6 unidades de pastel de queijo', 35.00, 'Petiscos', ARRAY['laticínios', 'glúten'], true, false),
('c1de7816-e273-4b39-b71c-3721b6db6f43', 'Patatas Bravas', 'Batatas douradas com aioli de páprica levemente picante', 25.00, 'Petiscos', ARRAY['glúten'], true, false),
('be460abf-ea3b-4465-885c-946e50206dbb', 'Íscas de Frango', 'Porção aperitiva de frango empanado frito com molho aioli', 32.00, 'Petiscos', ARRAY['glúten'], true, false),
('68e474d5-6220-4718-b87a-1d79f49e34d1', 'Íscas de Peixe', 'Porção aperitiva de peixe empanado frito com molho aioli', 32.00, 'Petiscos', ARRAY['peixe', 'glúten'], true, false),
('8d649a79-300e-4b25-b5df-4ff930e7ce70', 'Pastel de Carne Seca e Creme de Queijo', 'Pastel recheado com carne seca e creme de queijo', 35.00, 'Petiscos', ARRAY['laticínios', 'glúten'], true, false),
('f50b41f5-8121-4e3d-b44e-8f5b499f67e0', 'Ceviche Carioca', 'Tilápia marinada no limão com leite de coco, cebola roxa, pimenta dedo de moça, milho peruano, chips de batata', 49.00, 'Petiscos', ARRAY['peixe'], true, true),
('29d1e676-e3ee-4232-a5de-0b3e6ed59468', 'Torresmo', 'Porção aperitiva frita e dourada', 12.00, 'Petiscos', ARRAY[]::text[], true, false),
('0a54d84b-cb3a-43b8-8817-94cd51a2c805', 'Palmito Pupunha na Brasa', 'Palmito assado na parrilha com molho pesto', 40.00, 'Petiscos', ARRAY[]::text[], true, true),
('ee3fe340-33d4-4a2c-bf82-7c6de8653648', 'Pastel de Pupunha com Catupiry', 'Porção com 2 unidades de pastel de palmito pupunha com toque de catupiry', 18.00, 'Petiscos', ARRAY['laticínios', 'glúten'], true, false),
('9d2d1c5d-763b-4662-b208-cbe5bc7f55fd', 'Pão de Alho', 'Porção aperitiva de pão de alho', 12.00, 'Petiscos', ARRAY['glúten'], true, false),
('bc6cb205-e9e4-4c9b-b592-8f42f56a7c59', 'Linguiça na Brasa', 'Linguiça fatiada com cebola caramelizada', 30.00, 'Petiscos', ARRAY[]::text[], true, false);

-- PRATOS PRINCIPAIS
INSERT INTO public.menu_items (id, name, description, price, category, allergens, available, featured) VALUES
('441f421e-50cf-4b87-bd3a-fdd67cf22b69', 'Tilápia na Brasa', 'Tilápia inteira assada na brasa, servida com legumes grelhados.', 100.00, 'Pratos Principais', ARRAY['peixe'], true, true),
('5e9b67c2-24a5-4569-8c4c-764d12e26c4f', 'Picanha ao Carvão', 'Picanha assada na parrilla com molho chimichurri, batatas bravas, farofa e vinagrete.', 195.00, 'Pratos Principais', ARRAY['glúten'], true, true),
('a4e927d4-28ff-47e1-8cbe-f1a63c18fa94', 'Moqueca de Banana da Terra', 'Moqueca de banana da terra com palmito, pimentões, arroz branco e farofa de dendê.', 65.00, 'Pratos Principais', ARRAY[]::text[], true, false),
('82f7aa2b-005e-46a2-bc8d-baa4295db44e', 'Mix na Brasa', 'Carne, linguiça, sobrecoxa, queijo coalho, pão de alho, vinagrete, farofa, patatas bravas e chimichurri.', 150.00, 'Pratos Principais', ARRAY['glúten', 'laticínios'], true, true),
('bdf1ae66-c7ee-4aa2-82a7-0a582d455c1b', 'Bife Ancho', 'Corte argentino com legumes grelhados e batatas bravas.', 130.00, 'Pratos Principais', ARRAY[]::text[], true, false),
('73e00b4f-1d0a-45dc-921c-0509c3858e9b', 'Risoto de Bacalhau', 'Risoto com lascas de bacalhau, tomate cereja frito, cebola caramelizada e azeitonas.', 95.00, 'Pratos Principais', ARRAY['peixe'], true, false),
('b0026484-c769-40c2-98be-30b85980dd36', 'Posta de Salmão Grelhado', 'Salmão grelhado com purê de batata, molho de maracujá e legumes.', 105.00, 'Pratos Principais', ARRAY['peixe', 'laticínios'], true, false),
('0ea59d89-df76-4437-a00c-0a54f7a10487', 'Atum em Crosta', 'Atum selado em crosta de gergelim, espaguete de legumes, molho shoyu e tomate cereja frito.', 130.00, 'Pratos Principais', ARRAY['peixe', 'soja'], true, true),
('3cdd05d9-f702-4d10-8b12-df805b353f4f', 'Feijoada da Casa', 'Feijoada completa com arroz, farofa, couve, torresmo, laranja e carnes.', 135.00, 'Pratos Principais', ARRAY['glúten'], true, true),
('9a621f0e-0e8c-4868-90b5-034b36d502e4', 'Tilápia Grelhada', 'Filé de tilápia grelhada com legumes e limão grelhado.', 75.00, 'Pratos Principais', ARRAY['peixe'], true, false),
('3ab28b11-6f55-49ec-8f2c-eac3c0cf1bc6', 'Polvo Grelhado com Arroz Negro', 'Polvo grelhado na parrilha com arroz negro e limão assado.', 150.00, 'Pratos Principais', ARRAY['molusco'], true, true),
('d301a241-2f35-48c4-93a9-64e60fd4cf41', 'Sobrecoxa ao Carvão', 'Sobrecoxa assada na brasa com mostarda, legumes grelhados, farofa e vinagrete.', 75.00, 'Pratos Principais', ARRAY[]::text[], true, false),
('d62a18d7-7ed5-456e-a9c5-65f87a9c7b68', 'Envelopado de Acelga', 'Acelga recheada com palmito, banana da terra e couve-flor, servida com purê de cenoura e gengibre.', 70.00, 'Pratos Principais', ARRAY[]::text[], true, false),
('fe958e7f-4d1a-4746-8e36-6c8b3f564e91', 'Bife à Milanesa', 'Corte à milanesa com farinha panko, ovos batidos, purê de batata e legumes.', 95.00, 'Pratos Principais', ARRAY['glúten', 'laticínios'], true, false);

-- SANDUÍCHES
INSERT INTO public.menu_items (id, name, description, price, category, allergens, available, featured) VALUES
('8a865961-f1f1-4eb4-91f6-c3103e0a1249', 'Hambúrguer da Casa', 'Carne selecionada com queijo cheddar, cebola caramelizada, alface, tomate e batata da casa.', 55.00, 'Sanduíches', ARRAY['glúten', 'laticínios'], true, true),
('89cb0f31-bfbb-4b9d-962e-f5613d224b45', 'Chori-Pão', 'Choripan argentino no pão baguete com linguiça de pernil e molho chimichurri.', 32.00, 'Sanduíches', ARRAY['glúten'], true, false),
('f7799e1d-54c6-4b7a-b4e4-295be38e294f', 'Hambúrguer Vegetariano', 'Grão de bico com ervas, tomate confit, alface, cebola caramelizada e molho pesto com batatas rústicas.', 55.00, 'Sanduíches', ARRAY['glúten'], true, false);

-- SOBREMESAS
INSERT INTO public.menu_items (id, name, description, price, category, allergens, available, featured) VALUES
('671960d0-5b4e-4872-b3b0-6e003b3e20a1', 'Tarte aux Pommes', 'Sobremesa francesa com massa sablée, purê e lâminas de maçã, sorvete de creme e coulis do dia.', 25.00, 'Sobremesas', ARRAY['glúten', 'laticínios'], true, true),
('b8a7b474-87fa-4c3e-b8ff-6df0549dc82f', 'Marquise au Chocolat', 'Ganache de chocolate meio amargo com sorvete de creme e coulis do dia.', 25.00, 'Sobremesas', ARRAY['laticínios'], true, true),
('41e31f49-5442-4264-b626-2f50b4b6b849', 'Delícia de Manga', 'Mousse de manga e coco com molho de maracujá, fatias de manga e coco ralado.', 25.00, 'Sobremesas', ARRAY['laticínios'], true, false);

-- BEBIDAS SEM ÁLCOOL
INSERT INTO public.menu_items (id, name, description, price, category, allergens, available, featured) VALUES
('e1acb10f-fd5e-4dc2-a683-678109bb3c4d', 'Água Mineral com Gás', '500ml', 8.00, 'Bebidas Sem Álcool', ARRAY[]::text[], true, false),
('1db18b5e-1660-4f3b-a6e5-e2a90c6bd331', 'Água Mineral sem Gás', '500ml', 8.00, 'Bebidas Sem Álcool', ARRAY[]::text[], true, false),
('64aa9472-dfb1-4f96-b160-3482e0bba8b0', 'Shot de Limão', '', 2.00, 'Bebidas Sem Álcool', ARRAY[]::text[], true, false),
('ce2d0cf7-10ae-4341-bda5-21372c25c7c0', 'Coca-Cola Tradicional', '', 9.00, 'Bebidas Sem Álcool', ARRAY[]::text[], true, false),
('b2a8b5ae-dc44-4e2b-8c9a-25a95c1aa9d3', 'Coca-Cola Zero', '', 9.00, 'Bebidas Sem Álcool', ARRAY[]::text[], true, false),
('72fe211f-7657-4ed1-a708-bc3fc1974710', 'Guaraná Tradicional', '', 9.00, 'Bebidas Sem Álcool', ARRAY[]::text[], true, false),
('b117e935-ecf8-4f39-aaf3-4c8d7d46a3bb', 'Guaraná Zero', '', 9.00, 'Bebidas Sem Álcool', ARRAY[]::text[], true, false),
('32cde26a-14a4-4e4a-aab7-ecc9271c1dc3', 'Água de Coco', 'Natural, 500ml', 14.00, 'Bebidas Sem Álcool', ARRAY[]::text[], true, false),
('12a0ab38-08df-4d7e-83f6-23c1d57a3dc5', 'Pink Lemonade', 'Limonada da casa adoçada com xarope de hibisco.', 14.00, 'Bebidas Sem Álcool', ARRAY[]::text[], true, true),
('f05d5e62-12df-4c5e-bdf6-e69f95a9f1a4', 'Laranja Mix', 'Suco de laranja pera e bahia.', 14.00, 'Bebidas Sem Álcool', ARRAY[]::text[], true, false),
('55d31984-bce4-409a-8abf-7bcd9b4729cb', 'Olha o Mate!', 'Mate com xarope artesanal.', 14.00, 'Bebidas Sem Álcool', ARRAY[]::text[], true, false),
('a6d23796-6e0e-4ed3-a689-40e255fc89fd', 'Limonada Suíça', 'Sem açúcar, coada.', 14.00, 'Bebidas Sem Álcool', ARRAY[]::text[], true, false);

-- CERVEJAS
INSERT INTO public.menu_items (id, name, description, price, category, allergens, available, featured) VALUES
('a22115a0-1c62-4f0f-ae56-4cd5ce3cf263', 'Baden Baden Cristal', 'Cerveja artesanal - 600ml', 28.00, 'Cervejas', ARRAY['glúten'], true, true),
('633f72c2-09a0-45f6-b469-118b5a15997d', 'Baden Baden Golden', 'Cerveja artesanal - 600ml', 28.00, 'Cervejas', ARRAY['glúten'], true, false),
('9d383f29-dafe-4b8f-8dd0-ece7ff862f8f', 'Eisenbahn', 'Cerveja Pilsen - 600ml', 18.00, 'Cervejas', ARRAY['glúten'], true, false),
('1eaf90c3-169f-4557-9464-6a062ca3d7ce', 'Heineken', 'Cerveja Premium - 600ml', 20.00, 'Cervejas', ARRAY['glúten'], true, false),
('ea403c44-705c-4ec2-803c-d5433b80b8bc', 'Heineken Zero', 'Versão sem álcool - Long neck', 15.00, 'Cervejas', ARRAY['glúten'], true, false),
('d987b4db-eec3-4cfa-8a28-d9b6c6f3d4e7', 'Lagunitas', 'IPA Americana - Long neck', 25.00, 'Cervejas', ARRAY['glúten'], true, false),
('96f154fd-8e10-43dc-aee6-799b60ce71d9', 'Fazendinha Pilsen', 'Cerveja artesanal carioca - 500ml', 30.00, 'Cervejas', ARRAY['glúten'], true, true);

-- DRINKS E COQUETÉIS
INSERT INTO public.menu_items (id, name, description, price, category, allergens, available, featured) VALUES
('65e1ff3a-3430-42b4-93bc-60138fd6d3d5', 'Morena Tropicana', 'Gin, manga, limão taití, amaretto, açúcar e clara de ovo', 32.00, 'Drinks', ARRAY['ovo'], true, true),
('a742dd2c-81a1-47ff-b6e6-ef0636209b08', 'Helena', 'Vodka, limão siciliano, manjericão, açúcar e gengibre', 32.00, 'Drinks', ARRAY[]::text[], true, false),
('f7ee4568-b25d-44f5-bca2-80e36a8cb230', 'Samba de Verão', 'Gin, morango, tangerina, limão, mel picante e tônica', 32.00, 'Drinks', ARRAY[]::text[], true, true),
('e9a82d55-401c-4c0f-9298-34a0ee2fc385', 'Selarón', 'Jim Beam Apple, kiwi, limão, canela e laranja', 32.00, 'Drinks', ARRAY[]::text[], true, false),
('0aaae291-3a3b-4143-a2ae-e5584f1c57e5', 'Céu da Boca', 'Pisco, uvas, limão siciliano, clara de ovo', 32.00, 'Drinks', ARRAY['ovo'], true, false),
('f7c3bd6e-c65f-4e95-85ed-26e6a3015128', 'Carijó', 'Cachaça Magnífica, maracujá, baunilha, coco e clara de ovo', 32.00, 'Drinks', ARRAY['ovo'], true, true);

-- VINHOS
INSERT INTO public.menu_items (id, name, description, price, category, allergens, available, featured) VALUES
('4ecdc7bb-9474-4d91-9d5e-71f7e7d77d35', 'Adobe Emiliana Cabernet Sauvignon', 'Reserva Orgânico - Chile - 2022', 130.00, 'Vinhos', ARRAY[]::text[], true, true),
('a861d486-dff6-4428-b4d4-fd3f902abf67', 'Cordero en Piel de Lobo Malbec Rosé', 'Argentina - 2023', 95.00, 'Vinhos', ARRAY[]::text[], true, false),
('74a72df9-ecf4-46b1-92d2-1d29b32e22ae', 'Lions in Love Malbec', 'Mendoza - Argentina - 2022', 125.00, 'Vinhos', ARRAY[]::text[], true, false),
('bbfe2db1-36d8-4621-b07e-bf09b5ef87d3', 'Minimalista Red Blend', 'Argentina - 2020', 80.00, 'Vinhos', ARRAY[]::text[], true, false);

-- ESPUMANTES
INSERT INTO public.menu_items (id, name, description, price, category, allergens, available, featured) VALUES
('a39be9f8-7333-4adf-b17e-4a8b0ed17344', 'Chandon Réserve Brut', 'Espumante Francês', 180.00, 'Espumantes', ARRAY[]::text[], true, true),
('e816e8e1-1cf3-4b29-b44e-92ee15fcd15b', 'Don Simon', 'Espumante Espanhol', 90.00, 'Espumantes', ARRAY[]::text[], true, false);

-- DESTILADOS E DOSES
INSERT INTO public.menu_items (id, name, description, price, category, allergens, available, featured) VALUES
('bd5ae202-7098-496f-8a48-40ea9c6b91bc', 'Gin Bombay Saphire', 'Dose de gin importado', 28.00, 'Destilados', ARRAY[]::text[], true, false),
('eaa2e13e-f3aa-4c95-a05e-2e759781e76f', 'Cachaça Magnífica Tradicional Ipê', 'Dose', 18.00, 'Destilados', ARRAY[]::text[], true, false),
('089a67c3-4163-4717-98f5-32c0fd9a3a4c', 'Jim Beam White', 'Dose de bourbon americano', 26.00, 'Destilados', ARRAY[]::text[], true, false),
('3ef13d55-55f4-44b6-a31b-7d09f68b0a29', 'Licor 43', 'Dose de licor espanhol', 28.00, 'Destilados', ARRAY[]::text[], true, false),
('3bc1d5ea-f9f3-49f0-a4ef-316ba5b59f34', 'Jagermeister', 'Dose de licor de ervas alemão', 25.00, 'Destilados', ARRAY[]::text[], true, false); 