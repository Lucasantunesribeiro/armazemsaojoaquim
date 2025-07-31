'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Search, BookOpen, ArrowRight } from 'lucide-react'
import { formatDate } from '../../lib/utils'

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string | null
  featured_image: string | null
  published: boolean
  author_id: string | null
  slug: string
  published_at: string | null
  created_at: string
  updated_at: string
}

interface BlogPageClientProps {
  initialPosts: BlogPost[]
}

export default function BlogPageClient({ initialPosts }: BlogPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPosts = useMemo(() => {
    // A lista de posts já vem sem o post de destaque
    const displayPosts = initialPosts.slice(1);

    if (!searchTerm.trim()) {
      return displayPosts;
    }

    return displayPosts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [initialPosts, searchTerm])

  if (initialPosts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10 text-amber-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4 font-playfair">
          Em Breve, Novas Histórias
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Estamos preparando conteúdos especiais sobre nossa história e tradições. 
          Volte em breve para descobrir mais sobre o Armazém São Joaquim!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar artigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-sm text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Nenhum artigo encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar sua busca ou explore outros termos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-amber-200 via-orange-200 to-red-200">
                {post.featured_image ? (
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    priority={true}
                    loading="eager"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="w-12 h-12 text-amber-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Meta */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.created_at}>
                      {formatDate(post.created_at)}
                    </time>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>5 min</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors font-playfair leading-tight">
                  {post.title}
                </h3>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                )}

                {/* Read More */}
                <div className="flex items-center space-x-2 text-amber-600 font-medium group-hover:space-x-3 transition-all pt-2">
                  <span className="text-sm">Ler mais</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load More Button (for future pagination) */}
      {filteredPosts.length > 0 && filteredPosts.length >= 6 && (
        <div className="text-center pt-8">
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl">
            Carregar Mais Artigos
          </button>
        </div>
      )}
    </div>
  )
} 