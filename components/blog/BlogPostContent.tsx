'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Share2, BookOpen, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { BlogPostMultilingual } from '@/lib/api'

interface BlogPostContentProps {
  post: BlogPostMultilingual
  locale: string
}

export function BlogPostContent({ post, locale }: BlogPostContentProps) {
  const readTime = Math.max(1, Math.ceil(post.content.length / 1000))

  const handleShare = async () => {
    const url = window.location.href
    const title = post.title
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: post.excerpt || '',
          url,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url)
      // You could show a toast notification here
    }
  }

  return (
    <article className="container mx-auto px-4 py-16">
      {/* Back Button */}
      <div className="mb-8">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center space-x-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === 'en' ? 'Back to stories' : 'Voltar às histórias'}</span>
        </Link>
      </div>

      {/* Header */}
      <header className="max-w-4xl mx-auto mb-12">
        <div className="space-y-6">
          {/* Category */}
          <div className="flex items-center justify-between">
            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium px-3 py-1 rounded-full">
              {post.category}
            </span>
            
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">{locale === 'en' ? 'Share' : 'Compartilhar'}</span>
            </button>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white font-playfair leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 dark:text-slate-300 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-gray-500 dark:text-slate-400 text-sm">
            {/* Author */}
            {post.author_name && (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{post.author_name}</span>
              </div>
            )}
            
            {/* Date */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.published_at || post.created_at}>
                {formatDate(post.published_at || post.created_at)}
              </time>
            </div>
            
            {/* Reading Time */}
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{readTime} {locale === 'en' ? 'min read' : 'min de leitura'}</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-sm px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {post.image_url && (
        <div className="max-w-5xl mx-auto mb-12">
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        <div 
          className="prose prose-lg prose-amber dark:prose-invert max-w-none
            prose-headings:font-playfair prose-headings:text-gray-800 dark:prose-headings:text-white
            prose-p:text-gray-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed
            prose-a:text-amber-600 dark:prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-800 dark:prose-strong:text-white
            prose-blockquote:border-amber-500 prose-blockquote:bg-amber-50 dark:prose-blockquote:bg-amber-900/20
            prose-code:bg-gray-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-900 dark:prose-pre:bg-slate-900"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto mt-16 pt-8 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-slate-400">
            {locale === 'en' ? 'Published on' : 'Publicado em'} {' '}
            <time dateTime={post.published_at || post.created_at}>
              {formatDate(post.published_at || post.created_at)}
            </time>
          </div>
          
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>{locale === 'en' ? 'Share story' : 'Compartilhar história'}</span>
          </button>
        </div>
      </footer>
    </article>
  )
}