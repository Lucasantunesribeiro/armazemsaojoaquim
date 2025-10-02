-- Migration: Atualizar itens do café
-- Data: 2025-02-02
-- Descrição: Remove itens antigos e adiciona novos itens ao menu do café

BEGIN;

-- Remover itens antigos do café
DELETE FROM menu_items
WHERE name IN ('BOLINHO DE BACALHAU', 'PASTÉIS DE PUPUNHA', 'PASTÉIS QUEIJO', 'PASTÉIS CARNE SECA E CREME DE QUEIJO')
AND category IN ('PETISCOS', 'cafe');

-- Adicionar novos itens ao café
INSERT INTO menu_items (name, description, price, category, available, featured) VALUES
('Hambúrguer da Casa', 'Carne selecionada com queijo cheddar, cebola caramelizada, alface, tomate e batata da casa', 55.00, 'cafe', true, false),
('Hambúrguer Vegetariano', 'Grão de bico com ervas, tomate confit, alface, cebola caramelizada e molho pesto acompanhado de batatas rústicas', 55.00, 'cafe', true, false),
('Sorvetes Itália', 'Sorvetes artesanais italianos em sabores variados', NULL, 'cafe', true, false);

COMMIT;
