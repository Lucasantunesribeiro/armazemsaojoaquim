import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('📝 Blog API Público: Iniciando busca de posts...')

    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'pt'
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Usar nova função multilingual do Supabase
    const { data: posts, error } = await supabase
      .rpc('get_blog_posts_by_language', { p_language: locale })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('💥 Erro ao buscar posts do blog:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    // Transformar dados para formato esperado pelo frontend
    const transformedPosts = posts?.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      image_url: post.image_url,
      published: post.published,
      featured: post.featured,
      author_name: post.author_name || 'Equipe Armazém',
      published_at: post.published_at || post.created_at,
      created_at: post.created_at,
      updated_at: post.updated_at,
      tags: post.tags || ['Blog', 'Armazém São Joaquim'],
      category: post.category || 'Geral',
      language: locale === 'en' ? 'en-US' : 'pt-BR',
      reading_time: Math.max(1, Math.ceil((post.content?.length || 0) / 1000))
    })) || []

    console.log(`✅ Blog API Público: ${transformedPosts.length} posts encontrados`)

    return NextResponse.json({
      success: true,
      data: transformedPosts,
      count: transformedPosts.length,
      total: transformedPosts.length,
      categories: ['Geral', 'História', 'Gastronomia', 'Bebidas', 'Eventos'],
      pagination: {
        limit,
        offset,
        hasNext: transformedPosts.length === limit,
        hasPrev: offset > 0
      }
    })

  } catch (error) {
    console.error('💥 Erro na API pública do blog:', error)
    
    // Fallback para mock data em caso de erro do banco
    const mockPosts = [
      {
        id: '1',
        title: 'A História do Armazém São Joaquim',
        slug: 'historia-armazem-sao-joaquim',
        excerpt: 'Descubra como um antigo armazém do século XIX se transformou em um dos pontos gastronômicos mais charmosos de Santa Teresa.',
        content: `
          <p>O Armazém São Joaquim tem uma história rica que remonta ao século XIX. Localizado no coração do bairro histórico de Santa Teresa, o edifício já serviu como ponto de encontro para comerciantes e moradores locais.</p>
          
          <p>Durante a reforma cuidadosa, foram preservados elementos arquitetônicos originais como as vigas de madeira de lei, os tijolos aparentes e os azulejos portugueses encontrados nas paredes internas.</p>
          
          <p>Hoje, o espaço mantém viva essa tradição histórica, oferecendo uma experiência gastronômica única que honra o passado enquanto abraça o presente.</p>
        `,
        image_url: '/images/blog/historia-armazem.avif',
        published: true,
        featured: false,
        author_name: 'Equipe Armazém',
        published_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        tags: ['História', 'Santa Teresa', 'Patrimônio'],
        category: 'História',
        language: 'pt-BR',
        reading_time: 3
      },
      {
        id: '2',
        title: 'Os Segredos da Nossa Feijoada',
        slug: 'segredos-feijoada-armazem',
        excerpt: 'Conheça os ingredientes especiais e o preparo tradicional que tornam nossa feijoada única no Rio de Janeiro.',
        content: `
          <p>Nossa feijoada é preparada seguindo uma receita tradicional mineira, passada de geração em geração. O segredo está na seleção criteriosa dos ingredientes e no tempo de cozimento.</p>
          
          <p>Utilizamos feijão preto especial, carnes defumadas artesanalmente e temperos frescos colhidos na própria horta. O resultado é um prato que desperta todos os sentidos.</p>
          
          <p>Servida tradicionalmente aos sábados, nossa feijoada vem acompanhada de arroz, farofa crocante, couve refogada e laranja para complementar perfeitamente a experiência.</p>
        `,
        image_url: '/images/blog/segredos-feijoada.avif',
        published: true,
        featured: true,
        author_name: 'Chef da Casa',
        published_at: '2024-02-01T14:00:00Z',
        created_at: '2024-02-01T13:00:00Z',
        updated_at: '2024-02-01T14:00:00Z',
        tags: ['Culinária', 'Feijoada', 'Receitas'],
        category: 'Gastronomia',
        language: 'pt-BR',
        reading_time: 4
      },
      {
        id: '3',
        title: 'A Arte da Mixologia no Armazém',
        slug: 'arte-mixologia-armazem',
        excerpt: 'Nossos bartenders criam drinks especiais inspirados na cultura carioca e na história do bairro de Santa Teresa.',
        content: `
          <p>No Armazém São Joaquim, a coquetelaria é uma arte. Nossos bartenders especializados criam drinks únicos que contam histórias através de sabores e aromas.</p>
          
          <p>Utilizamos ingredientes frescos locais, cachaças artesanais e técnicas modernas para criar experiências únicas. Cada drink tem uma história e uma conexão com o bairro.</p>
          
          <p>Experimente nosso "Bondinho Dourado", um coquetel exclusivo que homenageia o famoso transporte histórico de Santa Teresa, ou o "Pôr do Sol Teresa", inspirado nas vistas deslumbrantes do bairro.</p>
        `,
        image_url: '/images/blog/drinks.avif',
        published: true,
        featured: false,
        author_name: 'Bartender Chefe',
        published_at: '2024-02-10T16:00:00Z',
        created_at: '2024-02-10T15:00:00Z',
        updated_at: '2024-02-10T16:00:00Z',
        tags: ['Drinks', 'Mixologia', 'Coquetéis'],
        category: 'Bebidas',
        language: 'pt-BR',
        reading_time: 3
      },
      {
        id: '4',
        title: 'Eventos Especiais no Armazém',
        slug: 'eventos-especiais-armazem',
        excerpt: 'Descubra como nosso espaço histórico pode ser o cenário perfeito para seus eventos especiais e celebrações.',
        content: `
          <p>O Armazém São Joaquim oferece um ambiente único para eventos especiais. Nosso espaço histórico proporciona uma atmosfera inesquecível para celebrações íntimas e corporativas.</p>
          
          <p>Com capacidade para até 80 pessoas, oferecemos pacotes personalizados que incluem menu degustação, drinks especiais e decoração temática que respeita o charme histórico do local.</p>
          
          <p>Seja um aniversário, casamento, lançamento de produto ou confraternização empresarial, nossa equipe se dedica a criar experiências memoráveis para seus convidados.</p>
        `,
        image_url: '/images/blog/eventos.avif',
        published: true,
        featured: true,
        author_name: 'Coordenação de Eventos',
        published_at: '2024-02-20T12:00:00Z',
        created_at: '2024-02-20T11:00:00Z',
        updated_at: '2024-02-20T12:00:00Z',
        tags: ['Eventos', 'Celebrações', 'Espaços'],
        category: 'Eventos',
        language: 'pt-BR',
        reading_time: 2
      }
    ]

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const published = searchParams.get('published')
    
    let filteredPosts = mockPosts

    // Apenas posts publicados por padrão para API pública
    if (published !== 'false') {
      filteredPosts = filteredPosts.filter(post => post.published)
    }

    // Filtros
    if (category && category !== 'all') {
      filteredPosts = filteredPosts.filter(post => 
        post.category.toLowerCase() === category.toLowerCase()
      )
    }

    if (tag) {
      filteredPosts = filteredPosts.filter(post => 
        post.tags.some(postTag => 
          postTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    }

    // Ordenar por data de publicação (mais recentes primeiro)
    filteredPosts.sort((a, b) => 
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )

    // Aplicar limit e offset
    const paginatedPosts = filteredPosts.slice(offset, offset + limit)

    console.log(`🔄 Blog API Público: ${paginatedPosts.length} posts encontrados (fallback mock data)`)

    return NextResponse.json({
      success: true,
      data: paginatedPosts,
      count: paginatedPosts.length,
      total: filteredPosts.length,
      categories: ['História', 'Gastronomia', 'Bebidas', 'Eventos'],
      pagination: {
        limit,
        offset,
        hasNext: (offset + limit) < filteredPosts.length,
        hasPrev: offset > 0
      }
    })
  }
}
