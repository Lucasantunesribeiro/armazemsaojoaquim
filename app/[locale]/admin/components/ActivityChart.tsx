'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { Activity, TrendingUp, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ActivityData {
  name: string
  usuarios: number
  reservas: number
  posts: number
}

export default function ActivityChart() {
  const { adminFetch, isAuthenticated, isLoading: authLoading, error: authError, refreshSession } = useAdminApi()
  const [data, setData] = useState<ActivityData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!authLoading) {
      loadActivityData()
    }
  }, [authLoading, isAuthenticated])

  const loadActivityData = async () => {
    // Se não estiver autenticado, mostrar dados de fallback
    if (!isAuthenticated) {
      console.log('⚠️ Usuário não autenticado, usando dados de fallback')
      setData(getFallbackData())
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      
      console.log('🔄 Carregando dados de atividade...')
      const response = await adminFetch('/api/admin/dashboard/activity')
      setData(response.data || [])
      setRetryCount(0) // Reset retry count on success
    } catch (error) {
      console.error('❌ Erro ao carregar dados de atividade:', error)
      
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
            loadActivityData()
          }, 1000)
          return
        }
      }
      
      // Usar dados de fallback após falha
      console.log('📋 Usando dados de fallback após erro')
      setData(getFallbackData())
    } finally {
      setLoading(false)
    }
  }

  const getFallbackData = (): ActivityData[] => [
    { name: 'Jan', usuarios: 12, reservas: 8, posts: 3 },
    { name: 'Fev', usuarios: 19, reservas: 15, posts: 5 },
    { name: 'Mar', usuarios: 25, reservas: 22, posts: 7 },
    { name: 'Abr', usuarios: 31, reservas: 28, posts: 4 },
    { name: 'Mai', usuarios: 28, reservas: 25, posts: 6 },
    { name: 'Jun', usuarios: 35, reservas: 30, posts: 8 },
  ]

  const handleRetry = async () => {
    setRetryCount(0)
    setError('')
    await loadActivityData()
  }

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade dos Últimos Meses
          </CardTitle>
          <CardDescription>
            Verificando autenticação...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            <Activity className="h-5 w-5" />
            Atividade dos Últimos Meses
          </CardTitle>
          <CardDescription className="text-destructive">
            {authError}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
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
            <Activity className="h-5 w-5" />
            Atividade dos Últimos Meses
          </CardTitle>
          <CardDescription>
            Carregando dados de atividade...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            <Activity className="h-5 w-5" />
            Atividade dos Últimos Meses
          </CardTitle>
          <CardDescription className="text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Erro ao carregar dados</p>
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
          <Activity className="h-5 w-5" />
          Atividade dos Últimos Meses
        </CardTitle>
        <CardDescription>
          Crescimento de usuários, reservas e posts do blog
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis 
                className="text-muted-foreground"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))'
                }}
              />
              <Bar 
                dataKey="usuarios" 
                fill="hsl(var(--primary))" 
                name="Usuários"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="reservas" 
                fill="hsl(var(--secondary))" 
                name="Reservas"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="posts" 
                fill="hsl(var(--accent))" 
                name="Posts"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Trend indicator */}
        <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
          Crescimento consistente nos últimos meses
        </div>
      </CardContent>
    </Card>
  )
}