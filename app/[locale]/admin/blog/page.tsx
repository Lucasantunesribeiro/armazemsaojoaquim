'use client'

import { useState, useMemo } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { useAdminData } from '@/hooks/useAdminData'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  User,
  Tag,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { 
  BlogPostData, 
  BlogPostDataTransformer, 
  transformApiResponse,
  formatDate,
  getStatusBadgeColor
} from '@/lib/data-transformers'
import { LoadingState } from '@/components/admin/LoadingState'
import { ErrorState } from '@/components/admin/ErrorState'
import { EmptyState, ComingSoon } from '@/components/admin/EmptyState'
import { useComponentLifecycle, useRenderCounter } from '@/hooks/useComponentLifecycle'

interface BlogPageProps {
  params: Promise<{ locale: string }>
}

export default function BlogPage({ params }: BlogPageProps) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale || 'pt'
  
  // Debug component lifecycle
  useComponentLifecycle('BlogPage')
  useRenderCounter('BlogPage', 3)
  
  const { makeRequest, isAuthorized, isLoading: adminLoading } = useAdminApi()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Build endpoint with filters
  const endpoint = useMemo(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.append('search', searchTerm)
    if (filterStatus !== 'all') params.append('status', filterStatus)
    if (filterCategory !== 'all') params.append('category', filterCategory)
    
    return `/blog/posts?${params.toString()}`
  }, [searchTerm, filterStatus, filterCategory])

  // Use enhanced data loading hook
  const { data: posts, loading, error, isEmpty, retry, refresh } = useAdminData<BlogPostData>(
    endpoint,
    {
      transform: (response) => {
        console.log('🔄 [BlogPage] Raw API response:', response)
        
        // Handle the blog API response format
        if (response && typeof response === 'object') {
          let postsArray: any[] = []
          
          // Handle different response formats
          if (response.success && response.data) {
            // Handle API response with success flag and data object
            if (Array.isArray(response.data)) {
              postsArray = response.data
            } else if (response.data.posts && Array.isArray(response.data.posts)) {
              postsArray = response.data.posts
            }
          } else if (Array.isArray(response)) {
            postsArray = response
          } else if (response.posts && Array.isArray(response.posts)) {
            postsArray = response.posts
          } else {
            // Blog might not exist yet, return empty array
            console.log('📝 [BlogPage] No posts found or endpoint not implemented')
            return []
          }
          
          console.log('📝 [BlogPage] Posts array length:', postsArray.length)
          
          // If no posts, return empty array (blog coming soon)
          if (postsArray.length === 0) {
            return []
          }
          
          // Transform API data to match component interface with locale support
          const transformedPosts = postsArray.map((post: any) => ({
            ...post,
            title: locale === 'pt' ? post.title_pt || post.title : post.title_en || post.title,
            excerpt: locale === 'pt' ? post.excerpt_pt || post.excerpt : post.excerpt_en || post.excerpt,
            category: locale === 'pt' ? post.category_pt || post.category : post.category_en || post.category,
            tags: locale === 'pt' ? post.tags_pt || post.tags : post.tags_en || post.tags,
            featured_image: post.image_url || post.featured_image // Map image_url to featured_image
          }))
          
          const result = transformApiResponse(transformedPosts, new BlogPostDataTransformer())
          console.log('✅ [BlogPage] Transformed posts:', result.length)
          return result
        }
        
        console.warn('⚠️ [BlogPage] Unexpected response format')
        return []
      },
      dependencies: [locale], // Only depend on locale for i18n
      errorConfig: {
        maxRetries: 1,
        retryDelay: 1000,
        showFallback: false
      }
    }
  )

  // Memoize filtered posts to prevent excessive re-calculations
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || post.status === filterStatus
      const matchesCategory = filterCategory === 'all' || post.category === filterCategory
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [posts, searchTerm, filterStatus, filterCategory])

  const handleDeletePost = async (postId: string) => {
    if (confirm('Tem certeza que deseja excluir este post?')) {
      try {
        await makeRequest(`/blog/posts/${postId}`, { 
          method: 'DELETE' 
        })
        
        refresh() // Refresh data after deletion
      } catch (error) {
        console.error('Erro ao excluir post:', error)
        alert('Erro ao excluir post. Tente novamente.')
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: 'Publicado', class: getStatusBadgeColor('published') },
      draft: { label: 'Rascunho', class: getStatusBadgeColor('draft') },
      scheduled: { label: 'Agendado', class: getStatusBadgeColor('scheduled') }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    )
  }

  if (adminLoading) {
    return <LoadingState message="Verificando permissões..." />
  }

  if (!isAuthorized) {
    return (
      <ErrorState
        message="Você não tem permissão para acessar esta página."
        showRetry={false}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gerenciamento de Blog
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Crie, edite e gerencie posts do blog
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={refresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          
          <Link href={`/${locale}/admin/blog/new`}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Todos os status</option>
                  <option value="published">Publicado</option>
                  <option value="draft">Rascunho</option>
                  <option value="scheduled">Agendado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Todas as categorias</option>
                  <option value="Culinária">Culinária</option>
                  <option value="História">História</option>
                  <option value="Eventos">Eventos</option>
                  <option value="Turismo">Turismo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Autor
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="all">Todos os autores</option>
                  <option value="chef-maria">Chef Maria Silva</option>
                  <option value="joao-santos">João Santos</option>
                  <option value="ana-costa">Ana Costa</option>
                </select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Stats Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total de Posts
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {posts.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Publicados
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {posts.filter(post => post.status === 'published').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Rascunhos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {posts.filter(post => post.status === 'draft').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total de Views
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {posts.reduce((sum, post) => sum + post.views, 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Posts List */}
      {loading ? (
        <LoadingState message="Carregando posts..." />
      ) : error ? (
        <ErrorState 
          message={error}
          onRetry={retry}
          showRetry={true}
        />
      ) : isEmpty ? (
        <ComingSoon 
          feature="Blog"
          description="O sistema de blog está sendo desenvolvido e estará disponível em breve. Você poderá criar, editar e gerenciar posts do blog."
        />
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
          <Card key={post.id} className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Featured Image */}
              <div className="lg:w-48 lg:flex-shrink-0">
                <div className="aspect-video lg:aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(post.status)}
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                  
                  {/* Actions Menu */}
                  <div className="flex items-center gap-2">
                    <Link href={`/${locale}/admin/blog/edit/${post.id}`}>
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                    </Link>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePost(post.id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {post.status === 'published' 
                      ? `Publicado em ${formatDate(post.published_at || post.created_at)}`
                      : post.status === 'scheduled'
                      ? `Agendado para ${formatDate(post.published_at || post.created_at)}`
                      : `Criado em ${formatDate(post.created_at)}`
                    }
                  </div>
                  
                  {post.status === 'published' && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {post.views} visualizações
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
          ))}
          
          {/* Empty filtered results */}
          {filteredPosts.length === 0 && posts.length > 0 && (
            <EmptyState
              icon={Search}
              title="Nenhum post encontrado"
              description="Tente ajustar os filtros de busca para encontrar os posts desejados."
              action={
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setFilterStatus('all')
                    setFilterCategory('all')
                  }}
                >
                  Limpar Filtros
                </Button>
              }
            />
          )}
        </div>
      )}
    </div>
  )
}