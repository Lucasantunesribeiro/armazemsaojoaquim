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
import { formatDate } from '@/lib/utils'
import { trackDatabaseError, trackApiError } from '@/lib/error-tracking'
import { supabase } from '@/lib/supabase'
import { blogCache } from '@/lib/cache-manager'
import { blogApi } from '@/lib/api'
import { Tables } from '@/types/database.types'

type BlogPost = Tables<'blog_posts'>;

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return blogApi.getPostBySlug(slug)
}

async function getOtherPosts(currentSlug: string): Promise<BlogPost[]> {
  const allPosts = await blogApi.getAllPosts()
  // Filtra o post atual e pega os 3 mais recentes
  return allPosts.filter(p => p.slug !== currentSlug).slice(0, 3)
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug)
  
  if (!post) {
    return {
      title: 'Post não encontrado - Armazém São Joaquim',
      description: 'O post solicitado não foi encontrado.'
    }
  }

  return {
    title: `${post.title} - Blog | Armazém São Joaquim`,
    description: post.excerpt || 'Um artigo do blog do Armazém São Joaquim.',
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      images: post.featured_image ? [post.featured_image] : [],
      type: 'article',
      publishedTime: post.published_at || undefined,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug)
  const otherPosts = await getOtherPosts(params.slug)

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
              </ol>
            </nav>

            {/* Title and Meta */}
            <div className="max-w-4xl">
                <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair leading-tight mb-4">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center space-x-6 text-sm text-white/90">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>Armazém São Joaquim</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <article
          className="prose lg:prose-xl max-w-4xl mx-auto"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Other posts section */}
        {otherPosts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12 font-playfair">
              Outros Artigos do Blog
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherPosts.map((otherPost) => (
                <Link
                  key={otherPost.id}
                  href={`/blog/${otherPost.slug}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="relative h-48 bg-gradient-to-br from-amber-200 to-orange-200">
                    {otherPost.featured_image && (
                      <Image
                        src={otherPost.featured_image}
                        alt={otherPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={true}
                        loading="eager"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-amber-600 transition-colors font-playfair">
                      {otherPost.title}
                    </h3>
                    {otherPost.excerpt && <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">{otherPost.excerpt}</p>}
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <time dateTime={otherPost.created_at}>
                        {formatDate(otherPost.created_at)}
                      </time>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export async function generateStaticParams() {
    try {
        const posts = await blogApi.getAllPosts();
        return posts.map((post) => ({
            slug: post.slug,
        }));
    } catch (error) {
        console.error("Failed to generate static params for blog posts:", error);
        return [];
    }
}