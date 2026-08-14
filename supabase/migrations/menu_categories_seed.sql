-- Script de seed para menu_categories
-- Apaga todos os dados existentes e insere as categorias do cardápio "CARDAPIO BR 2026"

BEGIN;

-- Limpar tabela existente
DELETE FROM menu_categories;

-- Inserir categorias do restaurante
INSERT INTO menu_categories (name, description, display_order) VALUES
('PETISCOS', 'Aperitivos e entradas para compartilhar', 1),
('SALADAS', 'Saladas frescas e nutritivas', 2),
('PRATOS PRINCIPAIS', 'Carnes, frango e peixes preparados na parrilla e na cozinha', 3),
('VEGANO / VEGETARIANO', 'Pratos vegetarianos e veganos', 4),
('SANDUÍCHES', 'Hambúrgueres e sanduíches artesanais', 5),
('GUARNIÇÕES', 'Acompanhamentos e porções', 6),
('SOBREMESAS', 'Sobremesas francesas e brasileiras', 7),
('CAFÉS', 'Cafés e drinks à base de café', 8),
('BEBIDAS SEM ÁLCOOL', 'Águas, refrigerantes, sucos e sodas artesanais', 9),
('CERVEJAS', 'Cervejas nacionais, importadas e chopp', 10),
('COQUETÉIS', 'Coquetéis do Armazém, autorais e clássicos', 11),
('CAIPIRINHAS', 'Caipirinhas exclusivas e tradicionais do Armazém', 12),
('DESTILADOS', 'Doses de cachaça, whiskey, gin, vodka, rum, tequila e licores', 13),
('VINHOS', 'Vinhos tintos, brancos, rosés e espumantes', 14);

COMMIT;
