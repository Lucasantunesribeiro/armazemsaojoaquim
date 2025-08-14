-- Script de seed para menu_categories
-- Apaga todos os dados existentes e insere as novas categorias extraídas do Cardapio.pdf

BEGIN;

-- Limpar tabela existente
DELETE FROM menu_categories;

-- Inserir novas categorias do restaurante
INSERT INTO menu_categories (name, description, display_order) VALUES
('PETISCOS', 'Aperitivos e entradas para compartilhar', 1),
('SALADAS', 'Saladas frescas e nutritivas', 2),
('PRATOS PRINCIPAIS', 'Pratos principais preparados na churrasqueira e cozinha', 3),
('SANDUÍCHES', 'Hambúrgueres e sanduíches artesanais', 4),
('SOBREMESAS', 'Sobremesas tradicionais francesas e brasileiras', 5),
('BEBIDAS SEM ÁLCOOL', 'Águas, refrigerantes, sucos e sodas artesanais', 6),
('CERVEJAS', 'Cervejas nacionais e importadas', 7),
('COQUETÉIS', 'Drinks autorais do Armazém com cachaça, vodka, gin, rum, whiskey e pisco', 8),
('CAIPIRINHAS', 'Caipirinhas exclusivas e tradicionais do Armazém', 9),
('DESTILADOS', 'Doses de cachaça, whiskey, vodka, gin, rum, tequila, pisco e licores', 10),
('VINHOS', 'Vinhos tintos, brancos, rosés e espumantes', 11),
('GUARNIÇÕES', 'Acompanhamentos e porções', 12),
('SUGESTÃO DO CHEF', 'Pratos especiais e criações exclusivas do chef', 13);

COMMIT;
