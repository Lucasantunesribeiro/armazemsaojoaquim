-- Atualização das imagens dos posts existentes baseado no arquivo blog_posts_rows (1).sql
-- Esta versão corrige os caminhos das imagens dos posts reais no banco

-- Post: A Arte da Mixologia no Armazém (ID: c7d5e4fd-3d36-4e48-b8d1-41fd08d2c37d)
UPDATE blog_posts 
SET featured_image = '/images/blog/drinks.jpg', updated_at = NOW()
WHERE slug = 'a-arte-da-mixologia-no-armazem';

-- Post: Eventos e Celebrações no Armazém (ID: d8e22349-f2ef-46da-be27-8c3f18ca3d3b)
UPDATE blog_posts 
SET featured_image = '/images/blog/eventos.jpg', updated_at = NOW()
WHERE slug = 'eventos-e-celebracoes-no-armazem';

-- Post: Os Segredos da Nossa Feijoada (ID: e4681889-d24a-4535-accb-54c5c5055f54)
UPDATE blog_posts 
SET featured_image = '/images/blog/segredos-feijoada.jpg', updated_at = NOW()
WHERE slug = 'os-segredos-da-nossa-feijoada';

-- Post: A História do Armazém São Joaquim (ID: eba7ad99-df5c-40e8-a3fb-597e7945c4d6)
UPDATE blog_posts 
SET featured_image = '/images/blog/historia-armazem.jpg', updated_at = NOW()
WHERE slug = 'historia-do-armazem-sao-joaquim';

-- Verificar se as atualizações foram aplicadas
SELECT id, slug, title, featured_image, updated_at 
FROM blog_posts 
WHERE slug IN (
  'a-arte-da-mixologia-no-armazem',
  'eventos-e-celebracoes-no-armazem', 
  'os-segredos-da-nossa-feijoada',
  'historia-do-armazem-sao-joaquim'
)
ORDER BY updated_at DESC; 