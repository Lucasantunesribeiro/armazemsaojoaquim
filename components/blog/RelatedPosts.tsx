'use client'

import { BlogPostCard } from './BlogPostCard'
import { BlogPostMultilingual } from '@/lib/api'

interface RelatedPostsProps {
  posts: BlogPostMultilingual[]
  locale: string
}

export function RelatedPosts({ posts, locale }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null

  return (
    <section className="bg-gray-50 dark:bg-slate-800/50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white font-playfair mb-8 text-center">
            {locale === 'en' ? 'Related Stories' : 'Histórias Relacionadas'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogPostCard 
                key={post.id} 
                post={post} 
                locale={locale} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}