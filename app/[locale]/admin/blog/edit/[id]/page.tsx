'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { Database } from '@/types/database.types'
import ImageUpload from '@/components/admin/ImageUpload'

type BlogPost = Database['public']['Tables']['blog_posts']['Row']
type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

interface Props {
  params: { id: string; locale: string }
}

export default function EditBlogPostPage({ params }: Props) {
  const { supabase, user } = useSupabase()
  const router = useRouter()
  const { adminFetch } = useAdminApi()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [locale, setLocale] = useState<string>('pt')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    published: false,
    slug: ''
  })

  // Resolver params async
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setLocale(resolvedParams.locale || 'pt')
    }
    resolveParams()
  }, [params])

  // Load blog post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log('📝 Frontend: Iniciando busca do post para edição...')
        
        const data = await adminFetch(`/api/admin/blog/${params.id}`)
        console.log('📝 Frontend: Dados recebidos:', data)

        const postData = data.post
        setPost(postData)
        setFormData({
          title: postData.title || '',
          content: postData.content || '',
          excerpt: postData.excerpt || '',
          featured_image: postData.featured_image || '',
          published: postData.published || false,
          slug: postData.slug || ''
        })
      } catch (err) {
        console.error('Error fetching blog post:', err)
        setError(err instanceof Error ? err.message : 'Failed to load blog post')
        
        // Se o erro for de sessão, redirecionar para login
        if (err instanceof Error && (err.message.includes('No active session') || err.message.includes('401'))) {
          console.log('🔄 Frontend: Redirecionando para auth devido a erro de sessão...')
          router.push(`/${locale}/auth?error=unauthorized&message=Faça login para continuar`)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id, adminFetch, router])

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
    setSaving(true)
    setError(null)

    try {
      const data = await adminFetch(`/api/admin/blog/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      })

      alert('Post atualizado com sucesso!')
      router.push(`/${locale}/admin/blog`)
    } catch (err) {
      console.error('Error updating blog post:', err)
      setError(err instanceof Error ? err.message : 'Failed to update blog post')
      
      if (err instanceof Error && (err.message.includes('No active session') || err.message.includes('401'))) {
        router.push(`/${locale}/auth?error=unauthorized&message=Faça login para continuar`)
      }
    } finally {
      setSaving(false)
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
      
      // Auto-generate slug when title changes (only if slug is empty or matches previous title)
      if (name === 'title' && (!formData.slug || formData.slug === generateSlug(post?.title || ''))) {
        setFormData(prev => ({ ...prev, slug: generateSlug(value) }))
      }
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await adminFetch(`/api/admin/blog/${params.id}`, {
        method: 'DELETE'
      })

      alert('Post excluído com sucesso!')
      router.push(`/${locale}/admin/blog`)
    } catch (err) {
      console.error('Error deleting blog post:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete blog post')
      
      if (err instanceof Error && (err.message.includes('No active session') || err.message.includes('401'))) {
        router.push(`/${locale}/auth?error=unauthorized&message=Faça login para continuar`)
      }
    }
  }

  // Handler para mudança de imagem
  const handleImageChange = (imagePath: string) => {
    setFormData(prev => ({
      ...prev,
      featured_image: imagePath
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Carregando post...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erro</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push(`/${locale}/admin/blog`)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Editar Post do Blog
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Editando: {post?.title}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-6">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-lg"
                placeholder="Digite o título do post..."
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL (Slug) *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm rounded-l-md">
                  /blog/
                </span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
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
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Breve descrição do post (opcional)..."
              />
            </div>

            {/* Featured Image */}
            <ImageUpload
              currentImage={formData.featured_image}
              onImageChange={handleImageChange}
              label="Imagem de Destaque"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Conteúdo do Post *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
              placeholder="Escreva o conteúdo do post em Markdown..."
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Você pode usar Markdown para formatar o texto (** para negrito, * para itálico, # para títulos, etc.)
            </p>
          </div>
        </div>

        {/* Publish Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900 dark:text-white">
                Publicar post
              </label>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.push(`/${locale}/admin/blog`)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Excluir
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}