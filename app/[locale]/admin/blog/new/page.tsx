'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Database } from '@/types/database.types'
import ImageUpload from '@/components/admin/ImageUpload'

type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert']

interface NewBlogPostPageProps {
  params: Promise<{ locale: string }>
}

export default function NewBlogPostPage({ params }: NewBlogPostPageProps) {
  // Desempacotar params usando React.use()
  const resolvedParams = use(params)

  const { supabase, user } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [locale, setLocale] = useState<string>('pt')
  const [formData, setFormData] = useState<BlogPostInsert>({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    published: false,
    author_id: user?.id || null,
    slug: '',
    published_at: null
  })

  // Definir locale diretamente dos params
  useEffect(() => {
    setLocale(resolvedParams.locale || 'pt')
  }, [resolvedParams.locale])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Generate slug if not provided
      const slug = formData.slug || generateSlug(formData.title)
      
      // Set published_at if publishing
      const published_at = formData.published ? new Date().toISOString() : null

      const { error } = await supabase
        .from('blog_posts')
        .insert([{
          ...formData,
          slug,
          published_at,
          author_id: user?.id || null
        }])

      if (error) {
        console.error('Error creating blog post:', error)
        alert('Erro ao criar post: ' + error.message)
      } else {
        alert('Post criado com sucesso!')
        router.push(`/${locale}/admin/blog`)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Erro inesperado ao criar post')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
      
      // Auto-generate slug when title changes
      if (name === 'title' && !formData.slug) {
        setFormData(prev => ({ ...prev, slug: generateSlug(value) }))
      }
    }
  }

  const handlePublish = () => {
    setFormData(prev => ({ ...prev, published: true }))
    // Form will be submitted with published: true
  }

  const saveDraft = () => {
    setFormData(prev => ({ ...prev, published: false }))
    // Form will be submitted with published: false
  }

  // Handler para mudança de imagem
  const handleImageChange = (imagePath: string) => {
    setFormData(prev => ({
      ...prev,
      featured_image: imagePath
    }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Novo Post do Blog
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Crie um novo artigo para o blog do restaurante
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título do Post *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-base sm:text-lg"
                placeholder="Digite o título do post..."
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL (Slug) *
              </label>
              <div className="flex flex-col sm:flex-row">
                <span className="inline-flex items-center px-3 py-2 border border-b-0 sm:border-b sm:border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm rounded-t-md sm:rounded-t-none sm:rounded-l-md">
                  /blog/
                </span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-b-md sm:rounded-b-none sm:rounded-r-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="url-amigavel-do-post"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resumo
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white resize-y"
                placeholder="Breve descrição do post (opcional)..."
              />
            </div>

            {/* Featured Image */}
            <ImageUpload
              currentImage={formData.featured_image || ''}
              onImageChange={handleImageChange}
              label="Imagem de Destaque"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Conteúdo do Post *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white font-mono text-sm resize-y"
              placeholder="Escreva o conteúdo do post em Markdown..."
            />
            <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Você pode usar Markdown para formatar o texto (** para negrito, * para itálico, # para títulos, etc.)
            </p>
          </div>
        </div>

        {/* Publish Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900 dark:text-white">
                Publicar imediatamente
              </label>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => router.push(`/${locale}/admin/blog`)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                onClick={saveDraft}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Salvando...' : 'Salvar Rascunho'}
              </button>
              
              <button
                type="submit"
                onClick={handlePublish}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}