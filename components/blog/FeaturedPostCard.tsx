'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight, BookOpen, Star } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { BlogPostMultilingual } from '@/lib/api'

interface FeaturedPostCardProps {
  post: BlogPostMultilingual
  locale: string
}

export function FeaturedPostCard({ post, locale }: FeaturedPostCardProps) {
  const readTime = Math.max(1, Math.ceil(post.content.length / 1000))
  
  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="group bg-white dark:bg-slate-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-amber-200 dark:border-amber-800/30 relative"
    >
      {/* Featured Badge */}
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center space-x-2 bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-bold">
            {locale === 'en' ? 'Featured Story' : 'História em Destaque'}
          </span>
        </div>
      </div>

      {/* Image */}
      <div className="relative h-80 bg-gradient-to-br from-amber-200 via-orange-200 to-red-200">
        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="w-16 h-16 text-amber-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Overlay Content */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white">
          <div className="space-y-2 sm:space-y-3">
            {/* Category */}
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full">
              {post.category}
            </span>
            
            {/* Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-playfair leading-tight">
              {post.title}
            </h2>
            
            {/* Meta */}
            <div className="flex items-center space-x-4 text-sm text-white/90">
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
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8 space-y-4 sm:space-y-6">
        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 dark:text-slate-300 leading-relaxed text-base sm:text-lg">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 4 && (
              <span className="text-gray-400 dark:text-slate-500 text-sm">
                +{post.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Author and Read More */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
          {/* Author */}
          {post.author_name && (
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {locale === 'en' ? 'By' : 'Por'} <span className="font-medium">{post.author_name}</span>
            </div>
          )}
          
          {/* Read More */}
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-semibold group-hover:space-x-3 transition-all">
            <span>
              {locale === 'en' ? 'Read story' : 'Ler história'}
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}