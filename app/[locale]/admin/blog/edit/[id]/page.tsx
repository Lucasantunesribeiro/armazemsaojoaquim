'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { BlogPostForm } from '../../components/BlogPostForm'
import { Card } from '@/components/ui/Card'

interface EditBlogPostPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const resolvedParams = use(params)
  const { locale = 'pt', id } = resolvedParams
  
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    loadPost()
  }, [id])
  
  const loadPost = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/blog/posts/${id}`)
      
      if (!response.ok) {
        throw new Error('Post não encontrado')
      }
      
      const data = await response.json()
      setPost(data)
    } catch (error) {
      console.error('Error loading post:', error)
      setError('Erro ao carregar post')
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando post...</p>
        </div>
      </div>
    )
  }
  
  if (error || !post) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Post não encontrado
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          O post que você está tentando editar não foi encontrado.
        </p>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      <BlogPostForm 
        initialData={post} 
        postId={id} 
        locale={locale} 
      />
    </div>
  )
}