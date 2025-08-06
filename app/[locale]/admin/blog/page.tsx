'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { Database } from '@/types/database.types'
import { useAdmin } from '@/hooks/useAdmin'

type BlogPost = Database['public']['Tables']['blog_posts']['Row']

interface BlogManagementPageProps {
  params: Promise<{ locale: string }>
}

export default function BlogManagementPage({ params }: BlogManagementPageProps) {
  // Desempacotar params usando React.use()
  const resolvedParams = use(params)

  const { supabase } = useSupabase()
  const { adminFetch } = useAdminApi()
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin, loading: adminLoading } = useAdmin()
  const [locale, setLocale] = useState<string>('pt')

  // Definir locale diretamente dos params
  useEffect(() => {
    setLocale(resolvedParams.locale || 'pt')
  }, [resolvedParams.locale])
  
  // Fetch blog posts usando API admin para evitar problemas com RLS
  const fetchBlogPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      // Usar adminFetch para garantir autenticação
      const data = await adminFetch('/api/admin/blog')
      setBlogPosts(data.posts || [])
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido ao carregar posts')
      setBlogPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      fetchBlogPosts()
    }
  }, [adminLoading, isAdmin])

  if (adminLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Verificando permissões...</span>
      </div>
    )
  }
  if (!isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Acesso negado</h2>
        <p className="text-red-700">Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  const handleDelete = async (postId: string, postTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir o post "${postTitle}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      await adminFetch(`/api/admin/blog/${postId}`, {
        method: 'DELETE'
      })

      // Refresh the blog posts list
      await fetchBlogPosts()
      alert('Post excluído com sucesso!')
    } catch (err) {
      console.error('Error deleting blog post:', err)
      alert('Erro ao excluir post: ' + (err instanceof Error ? err.message : 'Erro desconhecido'))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Carregando posts...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Erro</h2>
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchBlogPosts}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gerenciar Blog
        </h1>
        <Link
          href={`/${locale}/admin/blog/new`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Post
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estatísticas
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {blogPosts.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total de Posts
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {blogPosts.filter(post => post.published).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Posts Publicados
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {blogPosts.filter(post => !post.published).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Rascunhos
              </div>
            </div>
          </div>
        </div>
        
        {/* Blog Posts List */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Posts do Blog
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              {blogPosts && blogPosts.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Post
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {blogPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {post.featured_image && (
                              <div className="flex-shrink-0 h-12 w-12 mr-4">
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={post.featured_image}
                                  alt={post.title}
                                />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {post.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {post.excerpt || truncateContent(post.content)}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Slug: /{post.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            post.published 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {post.published ? 'Publicado' : 'Rascunho'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div>
                            {post.published_at 
                              ? formatDate(post.published_at)
                              : formatDate(post.created_at)
                            }
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {post.published_at ? 'Publicado' : 'Criado'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link
                            href={`/${locale}/admin/blog/edit/${post.id}`}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Editar
                          </Link>
                          {post.published && (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Ver
                            </Link>
                          )}
                          <button 
                            onClick={() => handleDelete(post.id, post.title)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    Nenhum post encontrado
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Comece criando seu primeiro post no blog.
                  </p>
                  <div className="mt-6">
                    <Link
                      href={`/${locale}/admin/blog/new`}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Criar Post
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}