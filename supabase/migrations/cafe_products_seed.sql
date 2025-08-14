-- Script de seed para cafe_products
-- Apaga todos os dados existentes e insere os novos produtos extraídos do Cardapio.pdf

BEGIN;

-- Limpar tabela existente
DELETE FROM cafe_products;

-- CAFÉS
INSERT INTO cafe_products (name, category, price, description, image_url, available) VALUES
('ESPRESSO', 'CAFE', 9.00, 'Café espresso tradicional', null, true),
('B 43', 'CAFE', 32.00, 'Licor 43, bayles, xarope de canela e espresso', null, true),
('CARAJILLO', 'CAFE', 32.00, 'Café especial com licor', null, true),

-- SOBREMESAS (DOCES)
('MARQUISE AU CHOCOLAT', 'DOCE', 25.00, 'Saborosa sobremesa Francesa clássica e requintada com ganache de chocolate meio amargo, sorvete de creme e coulis do dia', null, true),
('DELICIA DE MANGA', 'DOCE', 25.00, 'Saborosa sobremesa brasileira feita de mousse de manga e coco, com molho de maracuja decorada com fatias de manga e coco ralado', null, true),
('TARTE AUX POMMES', 'DOCE', 25.00, 'Deliciosa sobremesa Francesa atemporal de massa sablée recheada com purê fino de maçã, e laminas de maçã, guarnecida de sorvete de creme e coulis do dia', null, true),

-- BEBIDAS (do restaurante que fazem sentido para café)
('ÁGUA MINERAL COM GAS', 'BEBIDA', 9.00, 'Água mineral com gás', null, true),
('ÁGUA MINERAL SEM GAS', 'BEBIDA', 9.00, 'Água mineral sem gás', null, true),
('ÁGUA DE COCO', 'BEBIDA', 16.00, 'Água de coco 500ml', null, true),
('REFRIGERANTE COCA-COLA TRADICIONAL', 'BEBIDA', 9.00, 'Coca-Cola tradicional', null, true),
('REFRIGERANTE COCA-COLA ZERO', 'BEBIDA', 9.00, 'Coca-Cola zero', null, true),
('REFRIGERANTE GUARANÁ TRADICIONAL', 'BEBIDA', 9.00, 'Guaraná tradicional', null, true),
('REFRIGERANTE GUARANÁ ZERO', 'BEBIDA', 9.00, 'Guaraná zero', null, true),
('SODAS ARTESANAIS', 'BEBIDA', 14.00, 'Hibisco, Gengibre, Capim-limão e Maracujá', null, true),
('LIMONADA', 'BEBIDA', 14.00, 'Suíça sem açúcar e coada', null, true),
('PINK LEMONADE', 'BEBIDA', 14.00, 'Limonada da casa, adoçada com xarope de hibisco', null, true),
('LARANJA MIX', 'BEBIDA', 14.00, 'Suco de laranja pera e bahia', null, true),
('OLHA O MATE!', 'BEBIDA', 14.00, 'Mate adoçado com xarope artesanal. Opção: maracujá ou limão', null, true),

-- SALGADOS (alguns petiscos que fazem sentido para café)
('PÃO DE ALHO', 'SALGADO', 12.00, 'Porção aperitiva de pão de alho (02 un)', null, true),
('PASTÉIS DE QUEIJO', 'SALGADO', 29.00, 'Porção aperitiva de pastel de queijo (06 un)', null, true),
('BOLINHO DE BACALHAU', 'SALGADO', 29.00, 'Porção aperitiva de bolinho de bacalhau (06 un)', null, true),
('PASTÉIS DE PUPUNHA', 'SALGADO', 35.00, 'Porção aperitiva de pastel de palmito pupunha com leve toque de catupiry (06 un)', null, true);

-- Nota: SORVETE não foi encontrado especificamente no PDF, mas a categoria existe no schema
-- Se houver sorvetes, podem ser adicionados posteriormente

COMMIT;
