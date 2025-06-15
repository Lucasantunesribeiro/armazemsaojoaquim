/**
 * Página de Post Individual do Blog
 * 
 * Este arquivo implementa o sistema de roteamento baseado em slugs para o blog.
 * URLs seguem o padrão: /blog/[slug] onde slug é uma string amigável como "historia-do-armazem"
 * 
 * Principais funcionalidades:
 * - Busca posts por slug (não por ID)
 * - Geração de metadata dinâmica
 * - Cache inteligente usando slugs como chave
 * - Fallback para dados mockados
 * - Geração estática de parâmetros
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, User, Clock, Share2, BookOpen, Tag } from 'lucide-react'
import { formatDate } from '../../../lib/utils'
import { trackDatabaseError, trackApiError } from '../../../lib/error-tracking'
import { supabase } from '../../../lib/supabase'
import { blogCache } from '../../../lib/cache-manager'
import { blogApi } from '@/lib/api'

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string | null
  featured_image: string | null
  slug: string
  published_at: string | null
  created_at: string
  updated_at: string
  author_id: string | null
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
    featured_image: '/images/blog/segredos-feijoada.jpg',
    slug: 'segredos-da-nossa-feijoada',
    published_at: '2025-06-08T20:51:57.634362+00:00',
    created_at: '2025-06-08T20:51:57.634362+00:00',
    updated_at: '2025-06-08T20:51:57.634362+00:00',
    author_id: 'Armazém São Joaquim',
    published: true
  },
  {
    id: '5ea5f6d7-589e-4135-a5c2-a493f93c7eb5',
    title: 'A Arte da Mixologia no Armazém',
    content: '<p>Nossos drinks são muito mais que simples coquetéis - são obras de arte líquidas que contam histórias. Cada receita é cuidadosamente desenvolvida pela nossa equipe de bartenders, combinando técnicas tradicionais com inovação.</p><p>Utilizamos apenas ingredientes premium: cachaças artesanais, frutas frescas da estação e especiarias selecionadas. Nosso gin tônica, por exemplo, é preparado com gin importado e água tônica premium, finalizado com especiarias que realçam os sabores únicos.</p><p>A caipirinha de jabuticaba, nossa especialidade da casa, utiliza a fruta fresca e cachaça envelhecida, criando uma experiência sensorial única que representa a essência brasileira.</p>',
    excerpt: 'Conheça o cuidado e a paixão por trás de cada drink servido no Armazém São Joaquim.',
    featured_image: '/images/blog/drinks.jpg',
    slug: 'arte-da-mixologia-no-armazem',
    published_at: '2025-06-09T02:14:03.040244+00:00',
    created_at: '2025-06-09T02:14:03.040244+00:00',
    updated_at: '2025-06-09T02:14:03.040244+00:00',
    author_id: 'Armazém São Joaquim',
    published: true
  },
  {
    id: '686bf363-dfb6-4972-96d7-245f93f2d857',
    title: 'Eventos e Celebrações no Armazém',
    content: '<p>O Armazém São Joaquim é o lugar perfeito para celebrar momentos especiais. Nossa atmosfera única, combinada com a hospitalidade carioca, cria o ambiente ideal para aniversários, encontros de amigos e celebrações familiares.</p><p>Oferecemos opções personalizadas para grupos, desde menus especiais até decoração temática. Nossa equipe trabalha junto com você para tornar cada evento uma experiência memorável.</p><p>Aos finais de semana, frequentemente recebemos apresentações de música ao vivo, fortalecendo nossa conexão com a cultura boêmia de Santa Teresa.</p>',
    excerpt: 'Descubra como transformar seus momentos especiais em memórias inesquecíveis no Armazém.',
    featured_image: '/images/blog/eventos.jpg',
    slug: 'eventos-e-celebracoes-no-armazem',
    published_at: '2025-06-09T02:14:03.040244+00:00',
    created_at: '2025-06-09T02:14:03.040244+00:00',
    updated_at: '2025-06-09T02:14:03.040244+00:00',
    author_id: 'Armazém São Joaquim',
    published: true
  },
  {
    id: 'a0dbcfb7-aa55-4b7f-b081-4525b57f54c8',
    title: 'A História do Armazém São Joaquim',
    content: '<p>O Armazém São Joaquim tem uma rica história de 170 anos no coração de Santa Teresa. Desde 1854, este espaço histórico tem sido um ponto de encontro para moradores e visitantes, preservando a autenticidade e o charme do bairro mais boêmio do Rio de Janeiro.</p><p>Nossa jornada começou como um simples armazém, servindo a comunidade local com produtos essenciais. Com o passar dos anos, evoluímos para nos tornar um restaurante e bar que celebra as tradições culinárias brasileiras com um toque contemporâneo.</p>',
    excerpt: 'Conheça a fascinante história de 170 anos do nosso restaurante histórico no coração de Santa Teresa.',
    featured_image: '/images/armazem-historia.jpg',
    slug: 'historia-do-armazem-sao-joaquim',
    published_at: '2024-01-15T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    author_id: 'Armazém São Joaquim',
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
        .eq('published', true)
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
          id: (data as any).id || 'mock-id',
          title: (data as any).title || 'Mock Title',
          content: (data as any).content || 'Mock content',
          excerpt: (data as any).excerpt || null,
          featured_image: (data as any).featured_image || null,
          slug: (data as any).slug || slug,
          published_at: (data as any).published_at || null,
          created_at: (data as any).created_at || new Date().toISOString(),
          updated_at: (data as any).updated_at || new Date().toISOString(),
          author_id: (data as any).author_id || null,
          published: (data as any).published || true
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

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const post = await blogApi.getPostBySlug(params.slug)
    
    if (!post) {
      return {
        title: 'Post não encontrado - Armazém São Joaquim',
        description: 'O post solicitado não foi encontrado.'
      }
    }

    return {
      title: `${post.title} - Armazém São Joaquim`,
      description: post.excerpt || 'Blog do Armazém São Joaquim',
      openGraph: {
        title: post.title,
        description: post.excerpt || '',
        images: post.featured_image ? [post.featured_image] : [],
        type: 'article',
        publishedTime: post.published_at || undefined,
      },
    }
  } catch (error) {
    console.error('Erro ao gerar metadata:', error)
    return {
      title: 'Erro - Armazém São Joaquim',
      description: 'Erro ao carregar o post.'
    }
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const post = await blogApi.getPostBySlug(params.slug)
    
    if (!post) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        {/* Hero Section com Imagem */}
        <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            {post.featured_image ? (
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-200 via-orange-200 to-red-200" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex items-end">
            <div className="container mx-auto px-4 pb-16">
              {/* Breadcrumb */}
              <nav className="mb-6">
                <ol className="flex items-center space-x-2 text-sm text-white/80">
                  <li>
                    <Link href="/" className="hover:text-amber-300 transition-colors flex items-center">
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Início
                    </Link>
                  </li>
                  <li className="text-white/60">/</li>
                  <li>
                    <Link href="/blog" className="hover:text-amber-300 transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li className="text-white/60">/</li>
                  <li className="text-amber-300 font-medium">
                    {post.title}
                  </li>
                </ol>
              </nav>

              {/* Title and Meta */}
              <div className="max-w-4xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-playfair leading-tight">
                  {post.title}
                </h1>
                
                {post.excerpt && (
                  <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl">
                    {post.excerpt}
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-white/80">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{post.author_id || 'Armazém São Joaquim'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <time dateTime={post.created_at}>
                      {formatDate(post.created_at)}
                    </time>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>5 min de leitura</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Article Body */}
              <article className="prose prose-lg prose-amber max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
                />
              </article>

              {/* Share Section */}
              <div className="mt-16 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Share2 className="w-5 h-5" />
                    <span className="font-medium">Compartilhe este artigo</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Facebook
                    </button>
                    <button className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors">
                      Twitter
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-16 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <Link 
                    href="/blog"
                    className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Ver Todos os Posts</span>
                  </Link>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <Tag className="w-5 h-5" />
                    <span className="text-sm">Categoria: Cultura & História</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Posts Section */}
        <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-12 font-playfair">
                Outros Artigos do Blog
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mockPosts.filter(p => p.slug !== post.slug).slice(0, 3).map((relatedPost) => (
                  <Link 
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-amber-200 to-orange-200">
                      {relatedPost.featured_image ? (
                        <Image
                          src={relatedPost.featured_image}
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <BookOpen className="w-12 h-12 text-amber-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-amber-600 transition-colors font-playfair">
                        {relatedPost.title}
                      </h3>
                      
                      {relatedPost.excerpt && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {relatedPost.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        <time dateTime={relatedPost.created_at}>
                          {formatDate(relatedPost.created_at)}
                        </time>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  } catch (error) {
    console.error('Erro ao renderizar página do blog:', error)
    notFound()
  }
}

function formatContent(content: string): string {
  // Converter quebras de linha simples em parágrafos se não houver HTML
  if (!content.includes('<p>') && !content.includes('<div>')) {
    return content
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => `<p class="mb-6">${paragraph}</p>`)
      .join('')
  }
  
  // Se já tem HTML, apenas adicionar classes para estilização
  return content
    .replace(/<p>/g, '<p class="mb-6">')
    .replace(/<h1>/g, '<h1 class="text-3xl font-bold mb-6 mt-8">')
    .replace(/<h2>/g, '<h2 class="text-2xl font-bold mb-4 mt-6">')
    .replace(/<h3>/g, '<h3 class="text-xl font-bold mb-3 mt-4">')
    .replace(/<ul>/g, '<ul class="list-disc list-inside mb-6">')
    .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-6">')
    .replace(/<li>/g, '<li class="mb-2">')
}

export async function generateStaticParams() {
  try {
    const posts = await blogApi.getAllPosts()
    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('Erro ao gerar parâmetros estáticos:', error)
    return mockPosts.map((post) => ({
      slug: post.slug,
    }))
  }
}