'use client'

import { use } from 'react'
import { BlogPostForm } from '../components/BlogPostForm'

interface NewBlogPostPageProps {
  params: Promise<{ locale: string }>
}

export default function NewBlogPostPage({ params }: NewBlogPostPageProps) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale || 'pt'
  
  return (
    <div className="space-y-6">
      <BlogPostForm locale={locale} />
    </div>
  )
}