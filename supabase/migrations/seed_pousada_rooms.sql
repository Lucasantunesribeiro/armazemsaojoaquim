-- Script para popular a tabela pousada_rooms com os tipos de quartos da Pousada Armazém São Joaquim
-- Baseado na descrição fornecida e mapeamento de imagens

INSERT INTO public.pousada_rooms (
  name,
  type,
  description,
  price_refundable,
  price_non_refundable,
  amenities,
  max_guests,
  image_url,
  available
) VALUES 
-- SUITE
(
  'Suíte Histórica São Joaquim',
  'SUITE',
  'O Lobie Armazém São Joaquim está localizado no coração de Santa Teresa, em frente ao Largo dos Guimarães, no Rio de Janeiro. Nosso casarão existe desde 1854 e hoje está totalmente reformado e modernizado sem perder a essência do que representa. Suíte espaçosa com decoração histórica e vista panorâmica para Santa Teresa.',
  450.00,
  390.00,
  ARRAY['Internet sem fio (gratuita)', 'TV a cabo', 'Frigobar', 'Cofre', 'Ar-condicionado', 'TV', 'Vista panorâmica', 'Banheira'],
  4,
  '/images/pousada/SUITE.jpg',
  true
),

-- DELUXE  
(
  'Quarto Deluxe Colonial',
  'DELUXE',
  'O Lobie Armazém São Joaquim está localizado no coração de Santa Teresa, em frente ao Largo dos Guimarães, no Rio de Janeiro. Nosso casarão existe desde 1854 e hoje está totalmente reformado e modernizado sem perder a essência do que representa. Quarto superior com decoração colonial e comodidades premium.',
  350.00,
  290.00,
  ARRAY['Internet sem fio (gratuita)', 'TV a cabo', 'Frigobar', 'Cofre', 'Ar-condicionado', 'TV', 'Decoração colonial'],
  3,
  '/images/pousada/DELUXE.jpg',
  true
),

-- STANDARD
(
  'Quarto Standard Histórico',
  'STANDARD',
  'O Lobie Armazém São Joaquim está localizado no coração de Santa Teresa, em frente ao Largo dos Guimarães, no Rio de Janeiro. Nosso casarão existe desde 1854 e hoje está totalmente reformado e modernizado sem perder a essência do que representa. Quarto confortável com todas as comodidades essenciais.',
  250.00,
  210.00,
  ARRAY['Internet sem fio (gratuita)', 'TV a cabo', 'Frigobar', 'Cofre', 'Ar-condicionado', 'TV'],
  2,
  '/images/pousada/STANDARD.jpg',
  true
);

-- Verificar se os dados foram inseridos corretamente
SELECT 
  name,
  type,
  price_refundable,
  price_non_refundable,
  max_guests,
  image_url,
  available
FROM public.pousada_rooms
ORDER BY 
  CASE type 
    WHEN 'SUITE' THEN 1
    WHEN 'DELUXE' THEN 2  
    WHEN 'STANDARD' THEN 3
  END;
