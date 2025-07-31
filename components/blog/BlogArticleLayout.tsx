'use client'

import { ReactNode } from 'react'
import { Calendar, User, Clock, Tag } from 'lucide-react'
import { formatDate, estimateReadingTime } from '@/lib/utils'

interface BlogArticleLayoutProps {
  children: ReactNode
  title: string
  excerpt?: string
  author?: string
  publishedAt: string
  tags?: string[]
  featuredImage?: string
  readingTime?: number
}

export default function BlogArticleLayout({
  children,
  title,
  excerpt,
  author = 'Armazém São Joaquim',
  publishedAt,
  tags = [],
  featuredImage,
  readingTime
}: BlogArticleLayoutProps) {
  
  // Calcular tempo de leitura se não fornecido
  const estimatedTime = readingTime || estimateReadingTime(typeof children === 'string' ? children : '')

  return (
    <article className="blog-article-premium">
      {/* Article Header */}
      <header className="article-header mb-16">
        {/* Article Meta */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-stone-600 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <time dateTime={publishedAt} className="font-medium">
              {formatDate(publishedAt)}
            </time>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-medium">{author}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{estimatedTime} min de leitura</span>
          </div>
        </div>

        {/* Article Title */}
        <h1 className="article-title">
          {title}
        </h1>

        {/* Article Excerpt */}
        {excerpt && (
          <p className="article-excerpt">
            {excerpt}
          </p>
        )}

        {/* Article Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-3 mt-8">
            <Tag className="w-4 h-4 text-amber-600" />
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Article Content */}
      <div className="article-content">
        {children}
      </div>
    </article>
  )
}