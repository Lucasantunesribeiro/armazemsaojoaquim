import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('lang') || 'pt'
    
    console.log(`📝 Blog Post API: Buscando post com slug "${slug}" em ${language}...`)

    const supabase = await createSupabaseServerClient()
    
    // Usar nova função multilingual do Supabase
    const { data: posts, error } = await supabase
      .rpc('get_blog_post_by_slug', { 
        p_slug: slug, 
        p_language: language 
      })

    if (error) {
      console.error('💥 Erro ao buscar post do blog:', error)
      
      // Fallback para mock data
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
            
            <h3>Descobertas Arqueológicas</h3>
            <p>Durante as escavações para a reforma, foram encontrados objetos históricos que hoje fazem parte da decoração do restaurante, incluindo moedas antigas, utensílios domésticos e fragmentos de cerâmica portuguesa.</p>
            
            <h3>Preservação do Patrimônio</h3>
            <p>Todo o processo de restauração foi acompanhado pelo Instituto do Patrimônio Histórico, garantindo que as características originais do edifício fossem mantidas para as futuras gerações.</p>
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
          reading_time: 3,
          related_posts: ['segredos-feijoada-armazem', 'arte-mixologia-armazem']
        }
      ]

      const post = mockPosts.find(p => p.slug === slug && p.published)

      if (!post) {
        console.log(`❌ Blog Post API: Post com slug "${slug}" não encontrado`)
        return NextResponse.json(
          { error: 'Post não encontrado' },
          { status: 404 }
        )
      }

      console.log(`✅ Blog Post API: Post "${post.title}" encontrado (mock data)`)

      return NextResponse.json({
        success: true,
        data: {
          ...post,
          related_posts: []
        }
      })
    }

    if (!posts || posts.length === 0) {
      console.log(`❌ Blog Post API: Post com slug "${slug}" não encontrado`)
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    const post = posts[0]
    
    // A função já retorna os dados no idioma correto
    const transformedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      image_url: post.image_url,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      category: post.category,
      tags: post.tags || [],
      published: post.published,
      featured: post.featured,
      author_name: post.author_name,
      published_at: post.published_at,
      created_at: post.created_at,
      updated_at: post.updated_at
    }
    
    console.log(`✅ Blog Post API: Post "${transformedPost.title}" encontrado no banco de dados`)

    // Buscar posts relacionados (mesmo idioma) usando nova função
    const { data: relatedPosts } = await supabase
      .rpc('get_blog_posts_by_language', { p_language: language })
      .neq('id', post.id)
      .limit(3)

    const related = relatedPosts?.map((rp: any) => ({
      id: rp.id,
      title: rp.title,
      slug: rp.slug,
      excerpt: rp.excerpt,
      image_url: rp.image_url,
      category: rp.category,
      published_at: rp.published_at,
      created_at: rp.created_at
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        ...transformedPost,
        related_posts: related
      }
    })
  } catch (error) {
    console.error('💥 Erro na API de post individual do blog:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}