'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Search, BookOpen, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useTranslations } from '@/hooks/useTranslations'

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
  const { t, language } = useTranslations()

  // Temporary solution: Static translations for existing posts
  const postTranslations: Record<string, { title: { pt: string, en: string }, excerpt: { pt: string, en: string } }> = {
    // Add translations for existing posts here when they exist
    // This is a temporary solution until we implement proper multilingual database structure
  }

  const translatePost = (post: BlogPost) => {
    const translation = postTranslations[post.slug]
    if (translation) {
      return {
        ...post,
        title: translation.title[language],
        excerpt: translation.excerpt[language]
      }
    }
    return post
  }

  const filteredPosts = useMemo(() => {
    // A lista de posts já vem sem o post de destaque
    const displayPosts = initialPosts.slice(1).map(translatePost);

    if (!searchTerm.trim()) {
      return displayPosts;
    }

    return displayPosts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [initialPosts, searchTerm, language])

  if (initialPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
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
              <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 px-4 py-2 rounded-full">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">{t('blog.badge')}</span>
              </div>
              
              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-800 dark:text-white font-playfair leading-tight">
                  {t('blog.heroTitle').split(' ').slice(0, -2).join(' ')}
                  <span className="block text-amber-600 dark:text-amber-400">{t('blog.heroSubtitle')}</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  {t('blog.heroDescription')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Empty State */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 font-playfair">
                {t('blog.emptyState.title')}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {t('blog.emptyState.message')}
              </p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
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
            <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 px-4 py-2 rounded-full">
              <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-300">{t('blog.badge')}</span>
            </div>
            
            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-800 dark:text-white font-playfair leading-tight">
                {t('blog.heroTitle').split(' ').slice(0, -2).join(' ')}
                <span className="block text-amber-600 dark:text-amber-400">{t('blog.heroSubtitle')}</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                {t('blog.heroDescription')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('blog.searchPlaceholder')}
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
            {t('blog.noPostsFound')}
          </h3>
          <p className="text-gray-600">
            {t('blog.noPostsMessage')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/${language}/blog/${post.slug}`}
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
                    sizes="100vw"
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
                    <span>5 {t('blog.readTime')}</span>
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
                  <span className="text-sm">{t('blog.readMore')}</span>
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
            {t('blog.loadMore')}
          </button>
        </div>
      )}
          </div>
        </div>
      </section>
    </div>
  )
} 