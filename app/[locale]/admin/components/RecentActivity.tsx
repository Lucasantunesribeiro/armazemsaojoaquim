'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { 
  Clock, 
  Users, 
  FileText, 
  Calendar, 
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ActivityItem {
  id: string
  type: 'user' | 'blog' | 'reservation' | 'system'
  title: string
  description: string
  time: string
  status: 'success' | 'info' | 'warning'
}

export default function RecentActivity() {
  const { adminFetch, isAuthenticated, isLoading: authLoading, error: authError, refreshSession } = useAdminApi()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!authLoading) {
      loadRecentActivity()
    }
  }, [authLoading, isAuthenticated])

  const loadRecentActivity = async () => {
    // Se não estiver autenticado, mostrar dados de fallback
    if (!isAuthenticated) {
      console.log('⚠️ Usuário não autenticado, usando dados de fallback')
      setActivities(getFallbackActivities())
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      
      console.log('🔄 Carregando atividade recente...')
      const response = await adminFetch('/api/admin/dashboard/recent-activity')
      setActivities(response.data || [])
      setRetryCount(0) // Reset retry count on success
    } catch (error) {
      console.error('❌ Erro ao carregar atividade recente:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(errorMessage)
      
      // Se for erro de autenticação e ainda não tentou renovar, tentar renovar
      if ((errorMessage.includes('session') || errorMessage.includes('auth')) && retryCount === 0) {
        console.log('🔄 Tentando renovar sessão...')
        const refreshed = await refreshSession()
        
        if (refreshed) {
          setRetryCount(1)
          // Tentar novamente após renovar
          setTimeout(() => {
            loadRecentActivity()
          }, 1000)
          return
        }
      }
      
      // Usar dados de fallback após falha
      console.log('📋 Usando dados de fallback após erro')
      setActivities(getFallbackActivities())
    } finally {
      setLoading(false)
    }
  }

  const getFallbackActivities = (): ActivityItem[] => [
    {
      id: '1',
      type: 'user',
      title: 'Novo usuário cadastrado',
      description: 'João Silva se cadastrou no sistema',
      time: 'há 2 horas',
      status: 'success'
    },
    {
      id: '2',
      type: 'blog',
      title: 'Post publicado',
      description: 'Artigo "História da Pousada" foi publicado',
      time: 'há 4 horas',
      status: 'info'
    },
    {
      id: '3',
      type: 'reservation',
      title: 'Nova reserva',
      description: 'Reserva para o quarto Deluxe em março',
      time: 'há 6 horas',
      status: 'success'
    },
    {
      id: '4',
      type: 'system',
      title: 'Backup realizado',
      description: 'Backup automático do sistema concluído',
      time: 'há 12 horas',
      status: 'info'
    },
    {
      id: '5',
      type: 'user',
      title: 'Perfil atualizado',
      description: 'Maria Santos atualizou suas informações',
      time: 'há 1 dia',
      status: 'info'
    }
  ]

  const handleRetry = async () => {
    setRetryCount(0)
    setError('')
    await loadRecentActivity()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4" />
      case 'blog':
        return <FileText className="h-4 w-4" />
      case 'reservation':
        return <Calendar className="h-4 w-4" />
      case 'system':
        return <Settings className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20'
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20'
    }
  }

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription>
            Verificando autenticação...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mostrar erro de autenticação
  if (authError && !isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription className="text-destructive">
            {authError}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Erro de autenticação</p>
              <Button
                onClick={refreshSession}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription>
            Carregando atividades...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription className="text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Erro ao carregar atividades</p>
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Atividade Recente
        </CardTitle>
        <CardDescription>
          Últimas ações realizadas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium truncate">
                    {activity.title}
                  </p>
                  {getStatusIcon(activity.status)}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
        
        {activities.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Nenhuma atividade recente</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}