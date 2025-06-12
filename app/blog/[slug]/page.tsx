import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react'
import { formatDate } from '../../../lib/utils'
import { trackDatabaseError, trackApiError } from '../../../lib/error-tracking'
import { supabase } from '../../../lib/supabase'
import { blogCache } from '../../../lib/cache-manager'

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string | null
  image_url: string | null
  slug: string
  created_at: string
  author: string
  published: boolean
}

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

// Mock data para fallback durante build
const mockPosts: BlogPost[] = [
  {
    id: '0049d04f-ad1c-4299-9986-8bc39e06fa8c',
    title: 'Os Segredos da Nossa Feijoada',
    content: 'Nossa feijoada é preparada seguindo uma receita tradicional passada de geração em geração. O segredo está no tempo de cozimento e na seleção dos ingredientes...',
    excerpt: 'Descubra os segredos por trás da nossa famosa feijoada tradicional',
    image_url: '/images/blog/segredos-feijoada.jpg',
    slug: 'segredos-da-nossa-feijoada',
    created_at: '2025-06-08T20:51:57.634362+00:00',
    author: 'Armazém São Joaquim',
    published: true
  },
  {
    id: '5ea5f6d7-589e-4135-a5c2-a493f93c7eb5',
    title: 'A Arte da Mixologia no Armazém',
    content: '<p>Nossos drinks são muito mais que simples coquetéis - são obras de arte líquidas que contam histórias. Cada receita é cuidadosamente desenvolvida pela nossa equipe de bartenders, combinando técnicas tradicionais com inovação.</p><p>Utilizamos apenas ingredientes premium: cachaças artesanais, frutas frescas da estação e especiarias selecionadas. Nosso gin tônica, por exemplo, é preparado com gin importado e água tônica premium, finalizado com especiarias que realçam os sabores únicos.</p><p>A caipirinha de jabuticaba, nossa especialidade da casa, utiliza a fruta fresca e cachaça envelhecida, criando uma experiência sensorial única que representa a essência brasileira.</p>',
    excerpt: 'Conheça o cuidado e a paixão por trás de cada drink servido no Armazém São Joaquim.',
    image_url: '/images/blog/drinks.jpg',
    slug: 'arte-da-mixologia-no-armazem',
    created_at: '2025-06-09T02:14:03.040244+00:00',
    author: 'Armazém São Joaquim',
    published: true
  },
  {
    id: '686bf363-dfb6-4972-96d7-245f93f2d857',
    title: 'Eventos e Celebrações no Armazém',
    content: '<p>O Armazém São Joaquim é o lugar perfeito para celebrar momentos especiais. Nossa atmosfera única, combinada com a hospitalidade carioca, cria o ambiente ideal para aniversários, encontros de amigos e celebrações familiares.</p><p>Oferecemos opções personalizadas para grupos, desde menus especiais até decoração temática. Nossa equipe trabalha junto com você para tornar cada evento uma experiência memorável.</p><p>Aos finais de semana, frequentemente recebemos apresentações de música ao vivo, fortalecendo nossa conexão com a cultura boêmia de Santa Teresa.</p>',
    excerpt: 'Descubra como transformar seus momentos especiais em memórias inesquecíveis no Armazém.',
    image_url: '/images/blog/eventos.jpg',
    slug: 'eventos-e-celebracoes-no-armazem',
    created_at: '2025-06-09T02:14:03.040244+00:00',
    author: 'Armazém São Joaquim',
    published: true
  },
  {
    id: 'a0dbcfb7-aa55-4b7f-b081-4525b57f54c8',
    title: 'A História do Armazém São Joaquim',
    content: '<p>O Armazém São Joaquim tem uma rica história de 170 anos no coração de Santa Teresa. Desde 1854, este espaço histórico tem sido um ponto de encontro para moradores e visitantes, preservando a autenticidade e o charme do bairro mais boêmio do Rio de Janeiro.</p><p>Nossa jornada começou como um simples armazém, servindo a comunidade local com produtos essenciais. Com o passar dos anos, evoluímos para nos tornar um restaurante e bar que celebra as tradições culinárias brasileiras com um toque contemporâneo.</p>',
    excerpt: 'Conheça a fascinante história de 170 anos do nosso restaurante histórico no coração de Santa Teresa.',
    image_url: '/images/armazem-historia.jpg',
    slug: 'historia-do-armazem-sao-joaquim',
    created_at: '2024-01-15T10:00:00Z',
    author: 'Armazém São Joaquim',
    published: true
  }
]

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    // Verificar cache primeiro
    const cachedPost = blogCache.getPost(slug)
    if (cachedPost) {
      return cachedPost
    }

    // Tentar carregar do Supabase primeiro
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('publicado', true)
        .single()

      if (error) {
        trackDatabaseError(error, {
          component: 'BlogPostPage',
          action: 'Fetch Blog Post',
          additionalData: { slug, query: 'blog_posts' }
        })
        throw error
      }

      if (data) {
        const post = {
          id: data.id,
          title: data.titulo,
          content: data.conteudo,
          excerpt: data.resumo,
          image_url: data.imagem,
          slug: data.slug,
          created_at: data.created_at,
          author: data.author_id || 'Armazém São Joaquim',
          published: data.publicado
        }
        
        // Cache do resultado
        blogCache.setPost(slug, post)
        return post
      }
    } catch (supabaseError) {
      trackApiError(supabaseError, {
        component: 'BlogPostPage',
        action: 'Supabase Connection Error',
        additionalData: { slug, fallback: 'mock_data' }
      })
    }

    // Fallback para dados mock
    const mockPost = mockPosts.find(post => post.slug === slug) || null
    if (mockPost) {
      blogCache.setPost(slug, mockPost) // Cache do fallback
    }
    return mockPost
  } catch (error) {
    trackApiError(error, {
      component: 'BlogPostPage',
      action: 'Get Blog Post - Unexpected Error',
      additionalData: { slug, errorType: 'unexpected' }
    })
    const mockPost = mockPosts.find(post => post.slug === slug) || null
    if (mockPost) {
      blogCache.setPost(slug, mockPost) // Cache do fallback
    }
    return mockPost
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="min-h-screen pt-32 bg-cinza-claro">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/blog"
            className="inline-flex items-center text-amarelo-armazem font-semibold hover:text-vermelho-portas transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar para o blog
          </Link>

          {/* Featured Image */}
          {post.image_url && (
            <div className="relative h-96 rounded-lg overflow-hidden shadow-xl mb-8">
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-madeira-escura mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-cinza-medio">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>5 min de leitura</span>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            {/* Resumo */}
            {post.excerpt && (
              <div className="text-xl text-cinza-medio mb-8 p-6 bg-amarelo-armazem/10 rounded-lg border-l-4 border-amarelo-armazem">
                {post.excerpt}
              </div>
            )}

            {/* Conteúdo */}
            <div 
              className="prose prose-lg max-w-none prose-headings:font-playfair prose-headings:text-madeira-escura prose-p:text-cinza-medio prose-a:text-amarelo-armazem hover:prose-a:text-vermelho-portas"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-amarelo-armazem to-vermelho-portas rounded-lg p-8 text-center">
            <h3 className="font-playfair text-2xl font-bold text-white mb-4">
              Venha viver essa história conosco
            </h3>
            <p className="text-white/90 mb-6">
              Faça uma reserva e desfrute da autenticidade de Santa Teresa
            </p>
            <Link href="/reservas">
              <button className="bg-white text-madeira-escura px-8 py-3 rounded-lg font-semibold hover:bg-cinza-claro transition-colors">
                Fazer Reserva
              </button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export async function generateStaticParams() {
  try {
    // Tentar carregar do Supabase primeiro
    try {
      const { supabase } = await import('../../../lib/supabase')
      
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('slug')
        .eq('publicado', true)

      if (error) {
        trackDatabaseError(error, {
          component: 'BlogPostPage',
          action: 'Generate Static Params',
          additionalData: { query: 'blog_posts_slugs' }
        })
        throw error
      }

      if (posts && posts.length > 0) {
        return posts.map((post: { slug: string }) => ({
          slug: post.slug,
        }))
      }
    } catch (supabaseError) {
      trackApiError(supabaseError, {
        component: 'BlogPostPage',
        action: 'Generate Static Params - Supabase Error',
        additionalData: { fallback: 'mock_data' }
      })
    }

    // Fallback para dados mock
    return mockPosts.map(post => ({
      slug: post.slug,
    }))
  } catch (error) {
    trackApiError(error, {
      component: 'BlogPostPage',
      action: 'Generate Static Params - Unexpected Error',
      additionalData: { errorType: 'unexpected' }
    })
    return mockPosts.map(post => ({
      slug: post.slug,
    }))
  }
}