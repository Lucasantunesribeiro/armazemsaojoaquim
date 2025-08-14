import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('lang') || 'pt'
    
    console.log(`[blogApi] Buscando posts para idioma: ${language}`)
    
    const supabase = await createSupabaseServerClient()
    
    // Buscar posts diretamente da tabela
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
    
    if (error) {
      console.error('[blogApi] Erro ao buscar posts:', error)
      
      // Fallback para mock data em caso de erro
      const mockPosts = [
        {
          id: '1',
          title: language === 'en' ? 'The Art of Mixology at Armazém' : 'A Arte da Mixologia no Armazém',
          slug: language === 'en' ? 'the-art-of-mixology-at-armazem' : 'a-arte-da-mixologia-no-armazem',
          content: language === 'en' 
            ? '<h2>A Journey Through Unique Flavors</h2><p>Discover the secrets behind our artisanal cocktails, prepared with selected ingredients and traditional techniques that make each drink a unique experience.</p>'
            : '<h2>Uma Jornada pelos Sabores Únicos</h2><p>Descubra os segredos por trás dos nossos coquetéis artesanais, preparados com ingredientes selecionados e técnicas tradicionais que fazem de cada drink uma experiência única.</p>',
          excerpt: language === 'en' 
            ? 'A journey through the unique flavors of our artisanal cocktails.'
            : 'Uma jornada pelos sabores únicos dos nossos coquetéis artesanais.',
          image_url: '/images/blog/a_arte_da_mixologia_no_armazem.avif',
          category: language === 'en' ? 'drinks' : 'bebidas',
          tags: language === 'en' ? ['mixology', 'cocktails', 'santa teresa'] : ['mixologia', 'coquetéis', 'santa teresa'],
          published: true,
          featured: true,
          author_name: 'Chef Bartender',
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: language === 'en' ? 'Traditional Carioca Cuisine' : 'Culinária Tradicional Carioca',
          slug: language === 'en' ? 'traditional-carioca-cuisine' : 'culinaria-tradicional-carioca',
          content: language === 'en' 
            ? '<h2>The Flavors that Define the Carioca Soul</h2><p>Explore the dishes that tell the story of Rio de Janeiro through the authentic flavors we serve at Armazém São Joaquim.</p>'
            : '<h2>Os Sabores que Definem a Alma Carioca</h2><p>Explore os pratos que contam a história do Rio de Janeiro através dos sabores autênticos que servimos no Armazém São Joaquim.</p>',
          excerpt: language === 'en' 
            ? 'The flavors that define the Carioca soul through traditional dishes.'
            : 'Os sabores que definem a alma carioca através de pratos tradicionais.',
          image_url: '/images/blog/culinaria_tradicional_carioca.avif',
          category: language === 'en' ? 'gastronomy' : 'gastronomia',
          tags: language === 'en' ? ['cuisine', 'carioca', 'tradition'] : ['culinária', 'carioca', 'tradição'],
          published: true,
          featured: false,
          author_name: 'Chef Executivo',
          published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      console.log(`[blogApi] Retornando ${mockPosts.length} posts mock devido a erro no banco`)
      
      return NextResponse.json({
        posts: mockPosts,
        count: mockPosts.length,
        language,
        message: 'Mock data - database migration needed'
      })
    }
    
    // Verificar se posts existem
    if (!posts || posts.length === 0) {
      console.log('[blogApi] Nenhum post encontrado no banco de dados')
      return NextResponse.json({
        posts: [],
        count: 0,
        language,
        message: 'No posts found'
      })
    }
    
    // Transformar dados para o formato multilíngue esperado
    const transformedPosts = posts.map(post => {
      if (language === 'en') {
        return {
          id: post.id,
          title: post.title_en || post.title_pt || 'Untitled',
          slug: post.slug_en || post.slug_pt || 'untitled',
          content: post.content_en || post.content_pt || '',
          excerpt: post.excerpt_en || post.excerpt_pt || '',
          image_url: post.image_url,
          meta_title: post.meta_title_en || post.meta_title_pt || '',
          meta_description: post.meta_description_en || post.meta_description_pt || '',
          category: post.category_en || post.category_pt || 'general',
          tags: post.tags_en || post.tags_pt || [],
          published: post.published,
          featured: post.featured,
          author_name: post.author_name,
          published_at: post.published_at,
          created_at: post.created_at,
          updated_at: post.updated_at
        }
      } else {
        return {
          id: post.id,
          title: post.title_pt || post.title_en || 'Sem Título',
          slug: post.slug_pt || post.slug_en || 'sem-titulo',
          content: post.content_pt || post.content_en || '',
          excerpt: post.excerpt_pt || post.excerpt_en || '',
          image_url: post.image_url,
          meta_title: post.meta_title_pt || post.meta_title_en || '',
          meta_description: post.meta_description_pt || post.meta_description_en || '',
          category: post.category_pt || post.category_en || 'geral',
          tags: post.tags_pt || post.tags_en || [],
          published: post.published,
          featured: post.featured,
          author_name: post.author_name,
          published_at: post.published_at,
          created_at: post.created_at,
          updated_at: post.updated_at
        }
      }
    })
    
    console.log(`[blogApi] ${transformedPosts.length} posts encontrados no banco de dados`)
    
    return NextResponse.json({
      posts: transformedPosts,
      count: transformedPosts.length,
      language,
      message: 'Posts from database'
    })
    
  } catch (error) {
    console.error('[blogApi] Erro inesperado:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}