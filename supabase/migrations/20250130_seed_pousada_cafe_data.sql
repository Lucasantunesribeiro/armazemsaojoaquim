-- Dados iniciais para quartos da pousada
INSERT INTO pousada_rooms (name, type, price_refundable, price_non_refundable, description, amenities, max_guests, image_url) VALUES
('Quarto Standard 1', 'STANDARD', 180.00, 150.00, 'Quarto aconchegante com vista para o pátio interno. Ideal para casais que buscam tranquilidade no coração de Santa Teresa.', 
 ARRAY['WiFi gratuita', 'TV a cabo', 'Frigobar', 'Cofre', 'Ar-condicionado'], 2, '/images/rooms/standard-1.jpg'),

('Quarto Standard 2', 'STANDARD', 180.00, 150.00, 'Ambiente confortável com decoração rústica preservando o charme histórico do casarão de 1854.', 
 ARRAY['WiFi gratuita', 'TV a cabo', 'Frigobar', 'Cofre', 'Ar-condicionado'], 2, '/images/rooms/standard-2.jpg'),

('Quarto Deluxe 1', 'DELUXE', 250.00, 210.00, 'Suíte espaçosa com móveis de época e vista privilegiada para o Largo dos Guimarães.', 
 ARRAY['WiFi gratuita', 'TV a cabo', 'Frigobar', 'Cofre', 'Ar-condicionado', 'Varanda', 'Banheira'], 2, '/images/rooms/deluxe-1.jpg'),

('Quarto Deluxe 2', 'DELUXE', 250.00, 210.00, 'Ambiente refinado que combina o histórico com o moderno, oferecendo máximo conforto.', 
 ARRAY['WiFi gratuita', 'TV a cabo', 'Frigobar', 'Cofre', 'Ar-condicionado', 'Varanda', 'Banheira'], 2, '/images/rooms/deluxe-2.jpg'),

('Suíte Master', 'SUITE', 350.00, 300.00, 'Nossa suíte premium com área de estar separada, ideal para estadias especiais. Vista panorâmica de Santa Teresa.', 
 ARRAY['WiFi gratuita', 'TV a cabo', 'Frigobar', 'Cofre', 'Ar-condicionado', 'Varanda ampla', 'Banheira de hidromassagem', 'Área de estar'], 3, '/images/rooms/suite-master.jpg'),

('Suíte Romântica', 'SUITE', 350.00, 300.00, 'Ambiente intimista perfeito para lua de mel, com decoração especial e serviço diferenciado.', 
 ARRAY['WiFi gratuita', 'TV a cabo', 'Frigobar', 'Cofre', 'Ar-condicionado', 'Varanda', 'Banheira de hidromassagem', 'Champanhe de boas-vindas'], 2, '/images/rooms/suite-romantica.jpg'),

('Suíte Família', 'SUITE', 380.00, 320.00, 'Suíte ampla ideal para famílias, com espaço adicional e comodidades pensadas para crianças.', 
 ARRAY['WiFi gratuita', 'TV a cabo', 'Frigobar', 'Cofre', 'Ar-condicionado', 'Sofá-cama', 'Banheira', 'Kit família'], 4, '/images/rooms/suite-familia.jpg');

-- Dados iniciais para produtos do café
INSERT INTO cafe_products (name, category, price, description, image_url) VALUES
-- CAFÉS
('Café Espresso', 'CAFE', 8.00, 'Café espresso tradicional da casa, blend especial selecionado.', '/images/cafe/espresso.jpg'),
('Café Duplo', 'CAFE', 12.00, 'Espresso duplo para quem precisa de mais energia.', '/images/cafe/cafe-duplo.jpg'),
('Cappuccino', 'CAFE', 15.00, 'Cappuccino cremoso com espuma de leite e canela.', '/images/cafe/cappuccino.jpg'),
('Café com Leite', 'CAFE', 10.00, 'Café com leite quente, receita tradicional.', '/images/cafe/cafe-com-leite.jpg'),
('Latte Macchiato', 'CAFE', 18.00, 'Latte com leite vaporizado e toque de caramelo.', '/images/cafe/latte.jpg'),
('Café Gelado', 'CAFE', 14.00, 'Café gelado refrescante para dias quentes.', '/images/cafe/cafe-gelado.jpg'),

-- SORVETES (Parceria Sorvete Itália)
('Sorvete Chocolate', 'SORVETE', 12.00, 'Sorvete artesanal de chocolate belga da Sorvete Itália.', '/images/cafe/sorvete-chocolate.jpg'),
('Sorvete Morango', 'SORVETE', 12.00, 'Sorvete de morango com pedaços da fruta, receita italiana.', '/images/cafe/sorvete-morango.jpg'),
('Sorvete Baunilha', 'SORVETE', 12.00, 'Clássico sorvete de baunilha com fava natural.', '/images/cafe/sorvete-baunilha.jpg'),
('Sorvete Pistache', 'SORVETE', 15.00, 'Sorvete gourmet de pistache siciliano.', '/images/cafe/sorvete-pistache.jpg'),
('Gelato Limão Siciliano', 'SORVETE', 14.00, 'Gelato tradicional italiano de limão siciliano.', '/images/cafe/gelato-limao.jpg'),
('Açaí na Tigela', 'SORVETE', 18.00, 'Açaí batido com banana, granola e mel.', '/images/cafe/acai-tigela.jpg'),

-- DOCES
('Tiramisù', 'DOCE', 16.00, 'Tiramisù italiano tradicional feito na casa.', '/images/cafe/tiramisu.jpg'),
('Cannoli Siciliano', 'DOCE', 14.00, 'Cannoli recheado com ricota doce e pistache.', '/images/cafe/cannoli.jpg'),
('Brownie Gelato', 'DOCE', 20.00, 'Brownie quente com bola de sorvete vanilla.', '/images/cafe/brownie-gelato.jpg'),
('Cheesecake Frutas Vermelhas', 'DOCE', 18.00, 'Cheesecake cremoso com calda de frutas vermelhas.', '/images/cafe/cheesecake.jpg'),
('Panna Cotta', 'DOCE', 15.00, 'Sobremesa italiana cremosa com calda de frutas.', '/images/cafe/panna-cotta.jpg'),

-- SALGADOS
('Croissant Presunto e Queijo', 'SALGADO', 12.00, 'Croissant francês com presunto parma e queijo brie.', '/images/cafe/croissant-presunto.jpg'),
('Sanduíche Caprese', 'SALGADO', 16.00, 'Pão italiano com mozzarella, tomate e manjericão.', '/images/cafe/sanduiche-caprese.jpg'),
('Focaccia', 'SALGADO', 14.00, 'Focaccia italiana com ervas e azeite extravirgem.', '/images/cafe/focaccia.jpg'),
('Quiche Lorraine', 'SALGADO', 18.00, 'Quiche francesa com bacon e queijo gruyère.', '/images/cafe/quiche.jpg'),
('Bruschetta', 'SALGADO', 10.00, 'Bruschetta com tomate, manjericão e azeite.', '/images/cafe/bruschetta.jpg'),

-- BEBIDAS
('Água Mineral', 'BEBIDA', 5.00, 'Água mineral natural gelada.', '/images/cafe/agua.jpg'),
('Suco de Laranja', 'BEBIDA', 8.00, 'Suco de laranja natural espremido na hora.', '/images/cafe/suco-laranja.jpg'),
('Limonada Italiana', 'BEBIDA', 10.00, 'Limonada com limão siciliano e hortelã.', '/images/cafe/limonada.jpg'),
('Chá Gelado', 'BEBIDA', 7.00, 'Chá gelado de pêssego ou limão.', '/images/cafe/cha-gelado.jpg'),
('Água com Gás', 'BEBIDA', 6.00, 'Água com gás italiana San Pellegrino.', '/images/cafe/agua-gas.jpg');