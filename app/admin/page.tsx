'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useMonitoring } from '@/lib/monitoring'
import { useCache } from '@/lib/cache-advanced'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Database,
  Server,
  Activity,
  Clock,
  DollarSign,
  Eye,
  RefreshCw,
  Download,
  Settings,
  Shield,
  Zap
} from 'lucide-react'

interface DashboardStats {
  reservations: {
    total: number
    today: number
    pending: number
    confirmed: number
    cancelled: number
    revenue: number
  }
  performance: {
    avgResponseTime: number
    uptime: number
    errorRate: number
    cacheHitRate: number
  }
  users: {
    total: number
    active: number
    new: number
  }
  system: {
    memoryUsage: number
    cpuUsage: number
    diskUsage: number
    dbConnections: number
  }
}

interface RecentActivity {
  id: string
  type: 'reservation' | 'error' | 'user' | 'system'
  message: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export default function AdminDashboard() {
  const router = useRouter()
  const { getStats } = useMonitoring()
  const cache = useCache('general')
  const supabase = createClientComponentClient()
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth')
        return
      }

      // Verificar se é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/')
        return
      }

      setUser(user)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth')
    }
  }

  const loadDashboardData = async () => {
    try {
      setRefreshing(true)
      
      // Carregar estatísticas em paralelo
      const [reservationsData, performanceData, usersData, systemData] = await Promise.all([
        loadReservationStats(),
        loadPerformanceStats(),
        loadUserStats(),
        loadSystemStats()
      ])

      setStats({
        reservations: reservationsData,
        performance: performanceData,
        users: usersData,
        system: systemData
      })

      // Carregar atividades recentes
      await loadRecentActivities()
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  const loadReservationStats = async () => {
    const { data: reservations } = await supabase
      .from('reservas')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const today = new Date().toISOString().split('T')[0]
    const todayReservations = reservations?.filter(r => 
      r.data_reserva === today
    ) || []

    return {
      total: reservations?.length || 0,
      today: todayReservations.length,
      pending: reservations?.filter(r => r.status === 'pendente').length || 0,
      confirmed: reservations?.filter(r => r.status === 'confirmada').length || 0,
      cancelled: reservations?.filter(r => r.status === 'cancelada').length || 0,
      revenue: reservations?.reduce((sum, r) => sum + (r.valor_estimado || 0), 0) || 0
    }
  }

  const loadPerformanceStats = async () => {
    // Obter métricas de monitoramento
    const monitoringStats = getStats()
    const cacheStats = cache.getStats()

    // Simular métricas de performance (em produção, vir de APM)
    return {
      avgResponseTime: Math.random() * 200 + 100, // 100-300ms
      uptime: 99.8,
      errorRate: Math.random() * 2, // 0-2%
      cacheHitRate: cacheStats.hitRate
    }
  }

  const loadUserStats = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')

    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const newUsers = profiles?.filter(p => 
      new Date(p.created_at) > lastWeek
    ) || []

    return {
      total: profiles?.length || 0,
      active: Math.floor((profiles?.length || 0) * 0.7), // Simular usuários ativos
      new: newUsers.length
    }
  }

  const loadSystemStats = async () => {
    // Em produção, estas métricas viriam de monitoramento de infraestrutura
    return {
      memoryUsage: Math.random() * 30 + 40, // 40-70%
      cpuUsage: Math.random() * 20 + 10, // 10-30%
      diskUsage: Math.random() * 15 + 25, // 25-40%
      dbConnections: Math.floor(Math.random() * 20 + 5) // 5-25
    }
  }

  const loadRecentActivities = async () => {
    // Carregar atividades recentes do banco
    const { data: recentReservations } = await supabase
      .from('reservas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    const activities: RecentActivity[] = recentReservations?.map(r => ({
      id: r.id,
      type: 'reservation' as const,
      message: `Nova reserva para ${r.data_reserva} às ${r.horario} - ${r.numero_pessoas} pessoas`,
      timestamp: new Date(r.created_at),
      severity: 'low' as const
    })) || []

    setActivities(activities)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    checkAuth()
    loadDashboardData()
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    loadDashboardData()
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reservations', period: '30d' })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reservas_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !stats) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Administrativo
              </h1>
              <p className="text-gray-600">
                Armazém São Joaquim - Painel de Controle
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </Button>
              <Button
                onClick={handleExportData}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/settings')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reservations.today}</div>
              <p className="text-xs text-muted-foreground">
                {stats.reservations.pending} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita (30d)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.reservations.revenue.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.reservations.total} reservas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.active}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.users.new} novos esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.performance.uptime}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.performance.avgResponseTime.toFixed(0)}ms resposta
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance do Sistema</span>
                </CardTitle>
                <CardDescription>
                  Métricas de performance e saúde do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Tempo de Resposta */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Tempo de Resposta</span>
                      <span className="text-sm text-gray-600">
                        {stats.performance.avgResponseTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(stats.performance.avgResponseTime / 5, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Taxa de Erro */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Taxa de Erro</span>
                      <span className="text-sm text-gray-600">
                        {stats.performance.errorRate.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          stats.performance.errorRate < 1 ? 'bg-green-600' :
                          stats.performance.errorRate < 3 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min(stats.performance.errorRate * 20, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Cache Hit Rate */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Cache Hit Rate</span>
                      <span className="text-sm text-gray-600">
                        {stats.performance.cacheHitRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${stats.performance.cacheHitRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Uso de Memória */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Uso de Memória</span>
                      <span className="text-sm text-gray-600">
                        {stats.system.memoryUsage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          stats.system.memoryUsage < 60 ? 'bg-green-600' :
                          stats.system.memoryUsage < 80 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${stats.system.memoryUsage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Atividades Recentes */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Atividades Recentes</span>
                </CardTitle>
                <CardDescription>
                  Últimas atividades do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.severity === 'critical' ? 'bg-red-500' :
                        activity.severity === 'high' ? 'bg-orange-500' :
                        activity.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.timestamp.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status das Reservas */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Status das Reservas</span>
              </CardTitle>
              <CardDescription>
                Distribuição das reservas por status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.reservations.pending}
                  </div>
                  <div className="text-sm text-gray-600">Pendentes</div>
                  <Badge variant="secondary" className="mt-1">
                    {((stats.reservations.pending / stats.reservations.total) * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.reservations.confirmed}
                  </div>
                  <div className="text-sm text-gray-600">Confirmadas</div>
                  <Badge variant="secondary" className="mt-1">
                    {((stats.reservations.confirmed / stats.reservations.total) * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.reservations.cancelled}
                  </div>
                  <div className="text-sm text-gray-600">Canceladas</div>
                  <Badge variant="secondary" className="mt-1">
                    {((stats.reservations.cancelled / stats.reservations.total) * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.reservations.total}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                  <Badge variant="outline" className="mt-1">
                    30 dias
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 