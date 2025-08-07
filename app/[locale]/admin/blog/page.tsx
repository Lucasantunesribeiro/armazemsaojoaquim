'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
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
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

interface BlogPageProps {
  params: Promise<{ locale: string }>
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  status: 'draft' | 'published' | 'scheduled'
  author: string
  category: string
  tags: string[]
  published_at: string
  created_at: string
  updated_at: string
  views: number
}

export default function BlogPage({ params }: BlogPageProps) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale || 'pt'
  const { adminFetch } = useAdminApi()
  
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [searchTerm, filterStatus, filterCategory, locale])

  const loadPosts = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterCategory !== 'all') params.append('category', filterCategory)
      
      const data = await adminFetch(`/api/admin/blog/posts?${params.toString()}`)
      
      // Transform API data to match component interface
      const transformedPosts = data.posts.map((post: any) => ({
        id: post.id,
        title: locale === 'pt' ? post.title_pt : post.title_en,
        slug: locale === 'pt' ? post.slug_pt : post.slug_en,
        excerpt: locale === 'pt' ? post.excerpt_pt : post.excerpt_en,
        content: locale === 'pt' ? post.content_pt : post.content_en,
        featured_image: post.image_url,
        status: post.published 
          ? 'published' 
          : post.published_at 
            ? 'scheduled' 
            : 'draft',
        author: post.author_name || 'Admin',
        category: locale === 'pt' ? post.category_pt : post.category_en,
        tags: locale === 'pt' ? post.tags_pt : post.tags_en,
        published_at: post.published_at || '',
        created_at: post.created_at,
        updated_at: post.updated_at,
        views: 0 // TODO: Implement view tracking
      }))
      
      setPosts(transformedPosts)
    } catch (error) {
      console.error('Erro ao carregar posts:', error)
      // Keep empty array on error
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleDeletePost = async (postId: string) => {
    if (confirm('Tem certeza que deseja excluir este post?')) {
      try {
        const response = await fetch(`/api/admin/blog/posts/${postId}`, { 
          method: 'DELETE' 
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete post')
        }
        
        setPosts(posts.filter(post => post.id !== postId))
      } catch (error) {
        console.error('Erro ao excluir post:', error)
        alert('Erro ao excluir post. Tente novamente.')
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: 'Publicado', class: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
      draft: { label: 'Rascunho', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      scheduled: { label: 'Agendado', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não definido'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando posts...</p>
        </div>
      </div>
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

      {/* Posts List */}
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
                      ? `Publicado em ${formatDate(post.published_at)}`
                      : post.status === 'scheduled'
                      ? `Agendado para ${formatDate(post.published_at)}`
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
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum post encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece criando seu primeiro post do blog.'}
          </p>
          <Link href={`/${locale}/admin/blog/new`}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeiro Post
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}