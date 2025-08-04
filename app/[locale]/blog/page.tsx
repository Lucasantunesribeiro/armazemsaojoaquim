import { Metadata } from 'next'
import { Suspense } from 'react'
import { blogApi } from '@/lib/api'
import BlogPageClient from './BlogPageClient'

// Note: metadata should be set in layout.tsx or individual page components without 'use client'

async function getBlogPosts() {
  try {
    const posts = await blogApi.getAllPosts()
    return posts || []
  } catch (error) {
    console.error('Erro ao carregar posts:', error)
    return []
  }
}

function BlogLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
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
    <BlogPageContent posts={posts} />
  )
}

function BlogPageContent({ posts }: { posts: any[] }) {
  return (
    <BlogPageClient initialPosts={posts} />
  )
}