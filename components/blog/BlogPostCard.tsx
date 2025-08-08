'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { BlogPostMultilingual } from '@/lib/api'

interface BlogPostCardProps {
  post: BlogPostMultilingual
  locale: string
}

export function BlogPostCard({ post, locale }: BlogPostCardProps) {
  const readTime = Math.max(1, Math.ceil(post.content.length / 1000))
  
  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-slate-700"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-amber-200 via-orange-200 to-red-200">
        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="eager"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="w-12 h-12 text-amber-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Featured Badge */}
        {post.featured && (
          <div className="absolute top-4 right-4">
            <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {locale === 'en' ? 'Featured' : 'Destaque'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {/* Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-slate-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.published_at || post.created_at}>
                {formatDate(post.published_at || post.created_at)}
              </time>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{readTime} {locale === 'en' ? 'min read' : 'min de leitura'}</span>
            </div>
          </div>
          
          {/* Category */}
          <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium px-2 py-1 rounded-full">
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-playfair leading-tight">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs px-2 py-1 rounded-md"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-gray-400 dark:text-slate-500 text-xs">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Author */}
        {post.author_name && (
          <div className="text-sm text-gray-500 dark:text-slate-400">
            {locale === 'en' ? 'By' : 'Por'} {post.author_name}
          </div>
        )}

        {/* Read More */}
        <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-medium group-hover:space-x-3 transition-all pt-2">
          <span className="text-sm">
            {locale === 'en' ? 'Read more' : 'Ler mais'}
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}