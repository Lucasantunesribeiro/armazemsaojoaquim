-- Correção dos URLs das imagens do menu para corresponder aos arquivos disponíveis

-- Atualizar imagens que têm nomes diferentes localmente
UPDATE public.menu_items 
SET image_url = 'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/caesar_salad_com_frango.png'
WHERE name = 'Caesar Salad com Fatias de Frango';

UPDATE public.menu_items 
SET image_url = 'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/caesar_salad_sem_frango.png'
WHERE name = 'Caesar Salad sem Fatias de Frango';

UPDATE public.menu_items 
SET image_url = 'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/picanha_ao_carvao.png'
WHERE name = 'Picanha ao Carvão (2 pessoas)';

UPDATE public.menu_items 
SET image_url = 'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/salada_da_casa.png'
WHERE name = 'Saladinha da Casa';

-- Corrigir URL do arroz que tem uma barra extra
UPDATE public.menu_items 
SET image_url = 'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/arroz.png'
WHERE name = 'Arroz';

-- Atualizar outras correções de nomenclatura conhecidas
UPDATE public.menu_items 
SET image_url = 'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/sobrecoxa_ao_carvao.png'
WHERE name = 'Sobrecoxa ao Carvão (1 pessoa)';

-- Verificar o resultado
SELECT name, image_url 
FROM public.menu_items 
WHERE image_url LIKE '%caesar_salad%' 
   OR image_url LIKE '%picanha%' 
   OR image_url LIKE '%salada%'
   OR image_url LIKE '%//arroz%'
ORDER BY name; 