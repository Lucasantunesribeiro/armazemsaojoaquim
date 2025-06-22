-- =======================================
-- CORREÇÃO DE IMAGENS FALTANTES NO MENU
-- =======================================
-- Este script atualiza as URLs de imagens que não existem no Supabase Storage
-- para usar placeholders SVG locais até que as imagens sejam carregadas

-- Arquivos que NÃO existem no Supabase Storage (causa dos erros 400)
UPDATE public.menu_items 
SET image_url = '/images/placeholder.svg'
WHERE SUBSTRING(image_url FROM '/([^/]+)$') IN (
  'bife_a_milanesa.png',
  'ceviche_carioca.png',
  'envelopado_de_acelga.png', 
  'farofa.png',
  'feijoada_da_casa_buffet.png',
  'feijoada_da_casa_individual.png',
  'feijoada_da_casa_para_dois.png',
  'hamburguer_vegetariano.png',
  'legumes_na_brasa.png',
  'linguica_na_brasa.png',
  'marquise_au_chocolat.png',
  'mix_vegetariano.png',
  'pasteis_de_pupunha.png',
  'patatas_brava.png',
  'patatas_bravas.png',
  'pure_de_batata.png',
  'sobrecoxa_ao_carvao.png',
  'vinagrete_de_polvo.png'
);

-- Verificar resultados
SELECT 
  name, 
  image_url,
  CASE 
    WHEN image_url = '/images/placeholder.svg' THEN 'USANDO_PLACEHOLDER'
    WHEN image_url LIKE '%supabase.co%' THEN 'SUPABASE_URL'
    ELSE 'OUTRO'
  END as status
FROM public.menu_items
ORDER BY status, name; 