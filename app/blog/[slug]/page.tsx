import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react'
import { formatDate } from '../../../lib/utils'

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
    id: '1',
    title: 'A História do Armazém São Joaquim',
    content: '<p>O Armazém São Joaquim tem uma rica história de 170 anos no coração de Santa Teresa. Desde 1854, este espaço histórico tem sido um ponto de encontro para moradores e visitantes, preservando a autenticidade e o charme do bairro mais boêmio do Rio de Janeiro.</p><p>Nossa jornada começou como um simples armazém, servindo a comunidade local com produtos essenciais. Com o passar dos anos, evoluímos para nos tornar um restaurante e bar que celebra as tradições culinárias brasileiras com um toque contemporâneo.</p>',
    excerpt: 'Conheça a fascinante história de 170 anos do nosso restaurante histórico no coração de Santa Teresa.',
    image_url: '/images/armazem-historia.jpg',
    slug: 'historia-do-armazem-sao-joaquim',
    created_at: '2024-01-15T10:00:00Z',
    author: 'Armazém São Joaquim',
    published: true
  },
  {
    id: '2',
    title: 'Os Segredos da Nossa Feijoada Tradicional',
    content: '<p>Nossa feijoada segue uma receita tradicional passada de geração em geração. Preparada com feijão preto selecionado, carnes nobres e temperos especiais, nossa feijoada é um verdadeiro ritual culinário.</p><p>O segredo está no tempo de preparo e na seleção cuidadosa dos ingredientes. Cada porção conta uma história de sabor e tradição que remonta às raízes da culinária brasileira.</p>',
    excerpt: 'Descubra os segredos da nossa famosa feijoada tradicional que conquistou o paladar carioca.',
    image_url: '/images/feijoada-tradicional.jpg',
    slug: 'segredos-da-nossa-feijoada',
    created_at: '2024-01-10T10:00:00Z',
    author: 'Armazém São Joaquim',
    published: true
  },
  {
    id: '3',
    title: 'Santa Teresa: Um Bairro Histórico',
    content: '<p>Santa Teresa é um dos bairros mais charmosos do Rio de Janeiro, conhecido por sua arquitetura colonial, vida boêmia e vista privilegiada da cidade. O bairro mantém viva a essência do Rio Antigo.</p><p>Caminhar pelas ruas de Santa Teresa é como fazer uma viagem no tempo, onde cada esquina revela uma nova surpresa e cada casa conta uma história diferente.</p>',
    excerpt: 'Explore a história e charme do bairro onde nosso restaurante está localizado há quase dois séculos.',
    image_url: '/images/santa-teresa-historico.jpg',
    slug: 'santa-teresa-bairro-historico',
    created_at: '2024-01-05T10:00:00Z',
    author: 'Armazém São Joaquim',
    published: true
  }
]

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    // Tentar carregar do Supabase primeiro
    try {
      const { supabase } = await import('../../../lib/supabase')
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          image_url: data.image_url,
          slug: data.slug,
          created_at: data.created_at,
          author: data.author,
          published: data.published
        }
      }
    } catch (supabaseError) {
      console.warn('Supabase error, falling back to mock data:', supabaseError)
    }

    // Fallback para dados mock
    return mockPosts.find(post => post.slug === slug) || null
  } catch (error) {
    console.warn('Error fetching blog post:', error)
    return mockPosts.find(post => post.slug === slug) || null
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
      
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('slug')
        .eq('published', true)

      if (posts && posts.length > 0) {
        return posts.map((post: { slug: string }) => ({
          slug: post.slug,
        }))
      }
    } catch (supabaseError) {
      console.warn('Supabase error, falling back to mock data:', supabaseError)
    }

    // Fallback para dados mock
    return mockPosts.map(post => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.warn('Error generating static params:', error)
    return mockPosts.map(post => ({
      slug: post.slug,
    }))
  }
}