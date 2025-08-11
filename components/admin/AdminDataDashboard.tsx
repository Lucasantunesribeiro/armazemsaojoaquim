'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Activity,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react'
import { useAdminData } from '@/hooks/useAdminData'
import { 
  UserData, 
  BlogPostData,
  UserDataTransformer, 
  BlogPostDataTransformer,
  transformApiResponse,
  formatDateTime
} from '@/lib/data-transformers'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'
import { DataExporter } from '@/lib/data-export'
import { adminDataCache } from '@/lib/cache-manager'
import { toast } from 'sonner'

interface DashboardStats {
  users: {
    total: number
    admins: number
    recent: number
    active: number
  }
  blog: {
    total: number
    published: number
    drafts: number
    scheduled: number
  }
  system: {
    cacheHits: number
    errors: number
    uptime: string
  }
}

export function AdminDataDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('7d')

  // Load users data
  const { 
    data: users, 
    loading: usersLoading, 
    error: usersError, 
    refresh: refreshUsers 
  } = useAdminData<UserData>('/users', {
    transform: (response) => transformApiResponse(response.data?.users || response, new UserDataTransformer()),
    cacheConfig: { ttl: 5 * 60 * 1000 }, // 5 minutes cache
    errorConfig: { maxRetries: 2, showFallback: false }
  })

  // Load blog posts data
  const { 
    data: posts, 
    loading: postsLoading, 
    error: postsError, 
    refresh: refreshPosts 
  } = useAdminData<BlogPostData>('/blog/posts', {
    transform: (response) => transformApiResponse(response.posts || [], new BlogPostDataTransformer()),
    cacheConfig: { ttl: 3 * 60 * 1000 }, // 3 minutes cache
    errorConfig: { maxRetries: 1, showFallback: false }
  })

  // Calculate dashboard statistics
  const stats: DashboardStats = {
    users: {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      recent: users.filter(u => {
        const createdAt = new Date(u.created_at)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return createdAt > weekAgo
      }).length,
      active: users.filter(u => {
        if (!u.last_sign_in) return false
        const lastSignIn = new Date(u.last_sign_in)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return lastSignIn > weekAgo
      }).length
    },
    blog: {
      total: posts.length,
      published: posts.filter(p => p.status === 'published').length,
      drafts: posts.filter(p => p.status === 'draft').length,
      scheduled: posts.filter(p => p.status === 'scheduled').length
    },
    system: {
      cacheHits: adminDataCache.getStats().size,
      errors: 0, // Would be populated from error tracking
      uptime: '99.9%' // Would be calculated from system metrics
    }
  }

  const refreshAll = async () => {
    try {
      await Promise.all([refreshUsers(), refreshPosts()])
      toast.success('Dados atualizados com sucesso')
    } catch (error) {
      toast.error('Erro ao atualizar dados')
    }
  }

  const exportDashboardData = () => {
    try {
      const dashboardData = {
        timestamp: new Date().toISOString(),
        stats,
        users: users.map(u => ({
          email: u.email,
          nome: u.full_name,
          role: u.role,
          cadastro: formatDateTime(u.created_at),
          ultimo_acesso: u.last_sign_in ? formatDateTime(u.last_sign_in) : 'Nunca'
        })),
        posts: posts.map(p => ({
          titulo: p.title,
          status: p.status,
          autor: p.author,
          categoria: p.category,
          criado_em: formatDateTime(p.created_at),
          visualizacoes: p.views
        }))
      }

      DataExporter.exportToJSON([dashboardData], {
        format: 'json',
        filename: `dashboard_${new Date().toISOString().split('T')[0]}`
      })

      toast.success('Dados do dashboard exportados')
    } catch (error) {
      toast.error('Erro ao exportar dados')
    }
  }

  const isLoading = usersLoading || postsLoading
  const hasError = usersError || postsError

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visão geral dos dados do sistema
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTimeRange('24h')}
              className={selectedTimeRange === '24h' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            >
              24h
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTimeRange('7d')}
              className={selectedTimeRange === '7d' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            >
              7d
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTimeRange('30d')}
              className={selectedTimeRange === '30d' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            >
              30d
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Error State */}
      {hasError && (
        <ErrorState
          message={usersError || postsError || 'Erro ao carregar dados'}
          onRetry={refreshAll}
          showRetry={true}
        />
      )}

      {/* Loading State */}
      {isLoading && !hasError && (
        <LoadingState message="Carregando dados do dashboard..." />
      )}

      {/* Stats Grid */}
      {!isLoading && !hasError && (
        <>
          {/* Users Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Usuários
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.users.recent} novos esta semana
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Administradores
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.admins}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.users.admins / stats.users.total) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuários Ativos
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.active}</div>
                <p className="text-xs text-muted-foreground">
                  Últimos 7 dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Atividade
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.users.total > 0 
                    ? ((stats.users.active / stats.users.total) * 100).toFixed(1)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Usuários ativos vs total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Blog Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Posts do Blog
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.blog.total}</div>
                <p className="text-xs text-muted-foreground">
                  Total de posts criados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Publicados
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.blog.published}</div>
                <p className="text-xs text-muted-foreground">
                  Posts públicos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Rascunhos
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.blog.drafts}</div>
                <p className="text-xs text-muted-foreground">
                  Em desenvolvimento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Agendados
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.blog.scheduled}</div>
                <p className="text-xs text-muted-foreground">
                  Para publicação futura
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Uptime
                    </p>
                    <p className="text-lg font-bold text-green-900 dark:text-green-100">
                      {stats.system.uptime}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Cache Ativo
                    </p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {stats.system.cacheHits} itens
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Erros Recentes
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {stats.system.errors}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usuários Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
                    .map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.full_name || user.email}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTime(user.created_at)}
                          </p>
                        </div>
                        <Badge 
                          className={user.role === 'admin' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                          }
                        >
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                  
                  {users.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      Nenhum usuário encontrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posts Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {posts.length > 0 ? (
                    posts
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .slice(0, 5)
                      .map((post) => (
                        <div key={post.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{post.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {post.author} • {formatDateTime(post.created_at)}
                            </p>
                          </div>
                          <Badge 
                            className={
                              post.status === 'published' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                : post.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }
                          >
                            {post.status}
                          </Badge>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Sistema de blog em desenvolvimento
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Em breve você poderá gerenciar posts
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}