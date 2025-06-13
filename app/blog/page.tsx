import { Metadata } from 'next'
import { Suspense } from 'react'
import { blogApi } from '@/lib/api'
import BlogPageClient from './BlogPageClient'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, BookOpen, Search, Tag, User } from 'lucide-react'
import { formatDate } from '../../lib/utils'

export const metadata: Metadata = {
  title: 'Blog - Armazém São Joaquim',
  description: 'Descubra histórias, receitas e curiosidades sobre o Armazém São Joaquim e Santa Teresa. 170 anos de tradição e cultura carioca.',
  openGraph: {
    title: 'Blog - Armazém São Joaquim',
    description: 'Histórias e tradições de 170 anos em Santa Teresa',
    images: ['/images/armazem-fachada-historica.jpg'],
  },
}

// Mock data para fallback
const mockPosts = [
  {
    id: 'a0dbcfb7-aa55-4b7f-b081-4525b57f54c8',
    title: 'A História do Armazém São Joaquim',
    content: 'O Armazém São Joaquim tem uma rica história de 170 anos...',
    excerpt: 'Conheça a fascinante história de 170 anos do nosso restaurante histórico no coração de Santa Teresa.',
    featured_image: '/images/armazem-fachada-historica.jpg',
    slug: 'historia-do-armazem-sao-joaquim',
    published_at: '2024-01-15T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    published: true,
    author_id: 'armazem'
  },
  {
    id: '0049d04f-ad1c-4299-9986-8bc39e06fa8c',
    title: 'Os Segredos da Nossa Feijoada',
    content: 'Nossa feijoada é preparada seguindo uma receita tradicional...',
    excerpt: 'Descubra os segredos por trás da nossa famosa feijoada tradicional',
    featured_image: '/images/armazem-interior-aconchegante.jpg',
    slug: 'segredos-da-nossa-feijoada',
    published_at: '2025-06-08T20:51:57.634362+00:00',
    created_at: '2025-06-08T20:51:57.634362+00:00',
    updated_at: '2025-06-08T20:51:57.634362+00:00',
    published: true,
    author_id: 'armazem'
  },
  {
    id: '5ea5f6d7-589e-4135-a5c2-a493f93c7eb5',
    title: 'A Arte da Mixologia no Armazém',
    content: 'Nossos drinks são muito mais que simples coquetéis...',
    excerpt: 'Conheça o cuidado e a paixão por trás de cada drink servido no Armazém São Joaquim.',
    featured_image: '/images/santa-teresa-vista-panoramica.jpg',
    slug: 'arte-da-mixologia-no-armazem',
    published_at: '2025-06-09T02:14:03.040244+00:00',
    created_at: '2025-06-09T02:14:03.040244+00:00',
    updated_at: '2025-06-09T02:14:03.040244+00:00',
    published: true,
    author_id: 'armazem'
  }
]

async function getBlogPosts() {
  try {
    const posts = await blogApi.getAllPosts()
    return posts.length > 0 ? posts : mockPosts
  } catch (error) {
    console.error('Erro ao carregar posts:', error)
    return mockPosts
  }
}

function BlogLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Hero Section Skeleton */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <div className="h-8 bg-amber-200 rounded-lg w-64 mx-auto animate-pulse" />
            <div className="h-16 bg-amber-200 rounded-lg w-96 mx-auto animate-pulse" />
            <div className="h-6 bg-amber-200 rounded-lg w-80 mx-auto animate-pulse" />
          </div>
        </div>
      </section>

      {/* Posts Grid Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-48 bg-amber-200 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-amber-200 rounded animate-pulse" />
                  <div className="h-4 bg-amber-200 rounded animate-pulse" />
                  <div className="h-4 bg-amber-200 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-500 to-red-500" />
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-amber-100 border border-amber-200 px-4 py-2 rounded-full">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Blog Cultural</span>
            </div>
            
            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-800 font-playfair leading-tight">
                Histórias de
                <span className="block text-amber-600">Santa Teresa</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Descubra 170 anos de tradição, cultura e sabores únicos no coração do bairro mais charmoso do Rio
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">{posts.length}</div>
                <div className="text-sm text-gray-600">Artigos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">170</div>
                <div className="text-sm text-gray-600">Anos de História</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">1854</div>
                <div className="text-sm text-gray-600">Fundação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {posts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-playfair">
                  Artigo em Destaque
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Mergulhe nas histórias que moldaram nossa tradição
                </p>
              </div>

              <Link 
                href={`/blog/${posts[0].slug}`}
                className="group block bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* Image */}
                  <div className="relative h-64 lg:h-96">
                    {posts[0].featured_image ? (
                      <Image
                        src={posts[0].featured_image}
                        alt={posts[0].title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-200 via-orange-200 to-red-200 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-amber-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <time dateTime={posts[0].created_at}>
                            {formatDate(posts[0].created_at)}
                          </time>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>5 min de leitura</span>
                        </div>
                      </div>

                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors font-playfair">
                        {posts[0].title}
                      </h3>

                      {posts[0].excerpt && (
                        <p className="text-gray-600 leading-relaxed text-lg">
                          {posts[0].excerpt}
                        </p>
                      )}

                      <div className="flex items-center space-x-2 text-amber-600 font-semibold group-hover:space-x-4 transition-all">
                        <span>Ler artigo completo</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* All Posts Grid */}
      <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-playfair">
                Todos os Artigos
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore nossa coleção completa de histórias e tradições
              </p>
            </div>

            <Suspense fallback={<BlogLoading />}>
              <BlogPageClient initialPosts={posts} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 via-orange-500 to-red-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair">
                Não Perca Nossas Histórias
              </h2>
              
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Receba as últimas novidades, receitas especiais e histórias exclusivas do Armazém São Joaquim
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-4">
                <input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50 text-gray-800"
                />
                <button className="bg-white text-amber-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  Inscrever-se
                </button>
              </div>

              <p className="text-sm text-white/70">
                Prometemos não enviar spam. Apenas histórias deliciosas! 🍽️
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}