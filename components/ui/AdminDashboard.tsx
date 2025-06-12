'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { 
  Calendar, Users, DollarSign, TrendingUp, TrendingDown, Clock, Star, 
  ChefHat, Wine, Gift, AlertTriangle, CheckCircle, XCircle, 
  Settings, RefreshCw, Bell, Download, Filter, Plus, Edit, Trash2,
  Eye, MessageSquare, Heart, Award, Target, Zap, Activity, Shield
} from 'lucide-react'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
// import { useReviews } from '@/lib/hooks/useReviews'
// import { useEvents } from '@/lib/hooks/useEvents'
// import { useLoyalty } from '@/lib/hooks/useLoyalty'
// import { useMenu } from '@/lib/hooks/useMenu'
import Button from './Button'
import { Card, CardContent, CardHeader } from './Card'
import { Badge } from './Badge'
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from './Dialog'
import { formatDistanceToNow, format, startOfWeek, endOfWeek, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AdminDashboardProps {
  className?: string
}

interface DashboardMetrics {
  overview: {
    total_revenue: number
    total_orders: number
    average_order_value: number
    customer_satisfaction: number
    monthly_growth: number
    active_reservations: number
  }
  performance: {
    page_views: number
    conversion_rate: number
    bounce_rate: number
    session_duration: number
    popular_pages: Array<{
      page: string
      views: number
      time_spent: number
    }>
  }
  customer: {
    total_customers: number
    new_customers: number
    returning_customers: number
    loyalty_members: number
    churn_rate: number
    lifetime_value: number
  }
  operational: {
    table_turnover: number
    kitchen_efficiency: number
    stock_alerts: number
    staff_performance: number
    system_uptime: number
    response_time: number
  }
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0']

const MetricCard = ({ title, value, change, icon: Icon, trend, color = 'blue' }: {
  title: string
  value: string | number
  change?: number
  icon: any
  trend?: 'up' | 'down' | 'stable'
  color?: string
}) => {
  const getTrendIcon = () => {
    if (!trend) return null
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />
    return null
  }

  const getColorClasses = () => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200'
    }
    return colors[color] || colors.blue
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">{value}</span>
              {change !== undefined && (
                <div className="flex items-center gap-1">
                  {getTrendIcon()}
                  <span className={`text-sm ${
                    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {change > 0 ? '+' : ''}{change}%
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg border ${getColorClasses()}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const QuickActions = ({ onAction }: { onAction: (action: string) => void }) => {
  const actions = [
    { id: 'new_reservation', label: 'Nova Reserva', icon: Calendar, color: 'blue' },
    { id: 'add_menu_item', label: 'Adicionar Prato', icon: ChefHat, color: 'green' },
    { id: 'create_event', label: 'Criar Evento', icon: Star, color: 'yellow' },
    { id: 'send_promotion', label: 'Enviar Promoção', icon: Gift, color: 'purple' },
    { id: 'view_reviews', label: 'Ver Avaliações', icon: MessageSquare, color: 'blue' },
    { id: 'system_settings', label: 'Configurações', icon: Settings, color: 'gray' }
  ]

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Ações Rápidas</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              onClick={() => onAction(action.id)}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <action.icon className="w-5 h-5" />
              <span className="text-xs text-center">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const SystemAlerts = () => {
  const alerts = [
    {
      id: '1',
      type: 'warning',
      title: 'Estoque baixo',
      message: 'Camarão para moqueca está acabando (5 porções restantes)',
      time: '5 min atrás',
      action: 'Reabastecer'
    },
    {
      id: '2',
      type: 'info',
      title: 'Nova avaliação',
      message: 'Cliente deixou avaliação 5 estrelas para a feijoada',
      time: '15 min atrás',
      action: 'Ver detalhes'
    },
    {
      id: '3',
      type: 'error',
      title: 'Pagamento falhado',
      message: 'Erro no processamento do pagamento da reserva #1234',
      time: '1 hora atrás',
      action: 'Resolver'
    }
  ]

  const getAlertIcon = (type: string) => {
    if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    if (type === 'error') return <XCircle className="w-4 h-4 text-red-500" />
    return <CheckCircle className="w-4 h-4 text-blue-500" />
  }

  const getAlertColor = (type: string) => {
    if (type === 'warning') return 'border-l-yellow-500 bg-yellow-50'
    if (type === 'error') return 'border-l-red-500 bg-red-50'
    return 'border-l-blue-500 bg-blue-50'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Alertas do Sistema</h3>
          <Badge variant="destructive">{alerts.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 border-l-4 rounded-r-lg ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  {alert.action}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const RecentActivity = () => {
  const activities = [
    {
      id: '1',
      type: 'reservation',
      description: 'Nova reserva para 4 pessoas',
      user: 'Maria Silva',
      time: '2 min atrás',
      icon: Calendar,
      color: 'blue'
    },
    {
      id: '2',
      type: 'review',
      description: 'Avaliação 5 estrelas recebida',
      user: 'João Santos',
      time: '15 min atrás',
      icon: Star,
      color: 'yellow'
    },
    {
      id: '3',
      type: 'order',
      description: 'Pedido de R$ 145,50 finalizado',
      user: 'Ana Costa',
      time: '32 min atrás',
      icon: DollarSign,
      color: 'green'
    },
    {
      id: '4',
      type: 'event',
      description: 'Inscrição no evento de jazz',
      user: 'Pedro Lima',
      time: '1 hora atrás',
      icon: Users,
      color: 'purple'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Atividade Recente</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-${activity.color}-100`}>
                <activity.icon className={`w-4 h-4 text-${activity.color}-600`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const PerformanceCharts = ({ data }: { data: any }) => {
  const [chartType, setChartType] = useState<'revenue' | 'orders' | 'customers'>('revenue')

  const revenueData = [
    { name: 'Jan', valor: 15000, meta: 18000 },
    { name: 'Fev', valor: 18500, meta: 18000 },
    { name: 'Mar', valor: 22000, meta: 20000 },
    { name: 'Abr', valor: 19500, meta: 20000 },
    { name: 'Mai', valor: 25000, meta: 22000 },
    { name: 'Jun', valor: 28000, meta: 25000 }
  ]

  const ordersData = [
    { name: 'Seg', pedidos: 45 },
    { name: 'Ter', pedidos: 52 },
    { name: 'Qua', pedidos: 38 },
    { name: 'Qui', pedidos: 61 },
    { name: 'Sex', pedidos: 78 },
    { name: 'Sab', pedidos: 95 },
    { name: 'Dom', pedidos: 68 }
  ]

  const customerData = [
    { name: 'Novos', value: 35 },
    { name: 'Recorrentes', value: 65 }
  ]

  const renderChart = () => {
    if (chartType === 'revenue') {
      return (
        <BarChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: any) => [`R$ ${value.toLocaleString()}`, '']} />
          <Legend />
          <Bar dataKey="valor" fill="#8884d8" name="Receita Real" />
          <Bar dataKey="meta" fill="#82ca9d" name="Meta" />
        </BarChart>
      )
    }
    
    if (chartType === 'orders') {
      return (
        <LineChart data={ordersData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="pedidos" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      )
    }
    
    if (chartType === 'customers') {
      return (
        <PieChart>
          <Pie
            data={customerData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {customerData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      )
    }
    
    // Fallback chart
    return (
      <BarChart data={revenueData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value: any) => [`R$ ${value.toLocaleString()}`, '']} />
        <Legend />
        <Bar dataKey="valor" fill="#8884d8" name="Receita Real" />
        <Bar dataKey="meta" fill="#82ca9d" name="Meta" />
      </BarChart>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Performance</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={chartType === 'revenue' ? 'primary' : 'outline'}
              onClick={() => setChartType('revenue')}
            >
              Receita
            </Button>
            <Button
              size="sm"
              variant={chartType === 'orders' ? 'primary' : 'outline'}
              onClick={() => setChartType('orders')}
            >
              Pedidos
            </Button>
            <Button
              size="sm"
              variant={chartType === 'customers' ? 'primary' : 'outline'}
              onClick={() => setChartType('customers')}
            >
              Clientes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard({ className = '' }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'management' | 'settings'>('overview')
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState<string>('')

  // Mock metrics data
  const metrics: DashboardMetrics = {
    overview: {
      total_revenue: 45280.50,
      total_orders: 326,
      average_order_value: 138.90,
      customer_satisfaction: 4.7,
      monthly_growth: 12.5,
      active_reservations: 18
    },
    performance: {
      page_views: 8432,
      conversion_rate: 3.2,
      bounce_rate: 34.8,
      session_duration: 245,
      popular_pages: [
        { page: 'Menu', views: 2341, time_spent: 180 },
        { page: 'Reservas', views: 1876, time_spent: 120 },
        { page: 'Home', views: 1543, time_spent: 90 }
      ]
    },
    customer: {
      total_customers: 1847,
      new_customers: 234,
      returning_customers: 1613,
      loyalty_members: 892,
      churn_rate: 8.3,
      lifetime_value: 458.20
    },
    operational: {
      table_turnover: 2.8,
      kitchen_efficiency: 94.2,
      stock_alerts: 3,
      staff_performance: 88.5,
      system_uptime: 99.8,
      response_time: 1.2
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simular refresh
    await new Promise(resolve => setTimeout(resolve, 2000))
    setRefreshing(false)
  }

  const handleQuickAction = (action: string) => {
    setModalContent(action)
    setShowModal(true)
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'management', label: 'Gestão', icon: Settings },
    { id: 'settings', label: 'Configurações', icon: Shield }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-1">
            Visão completa do Armazém São Joaquim - {format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white border-b-2 border-primary'
                : 'text-gray-600 hover:text-primary hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Receita do Mês"
                value={`R$ ${metrics.overview.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                change={metrics.overview.monthly_growth}
                trend="up"
                icon={DollarSign}
                color="green"
              />
              <MetricCard
                title="Pedidos Totais"
                value={metrics.overview.total_orders}
                change={8.2}
                trend="up"
                icon={Users}
                color="blue"
              />
              <MetricCard
                title="Ticket Médio"
                value={`R$ ${metrics.overview.average_order_value.toFixed(2)}`}
                change={-2.1}
                trend="down"
                icon={TrendingUp}
                color="yellow"
              />
              <MetricCard
                title="Satisfação"
                value={`${metrics.overview.customer_satisfaction}/5.0`}
                change={3.5}
                trend="up"
                icon={Star}
                color="purple"
              />
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PerformanceCharts data={metrics} />
              <div className="space-y-6">
                <QuickActions onAction={handleQuickAction} />
                <SystemAlerts />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity />
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Status Operacional</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Eficiência da Cozinha</span>
                      <Badge variant="success">{metrics.operational.kitchen_efficiency}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Uptime do Sistema</span>
                      <Badge variant="success">{metrics.operational.system_uptime}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Giro de Mesas</span>
                      <Badge>{metrics.operational.table_turnover}x</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Alertas de Estoque</span>
                      <Badge variant="warning">{metrics.operational.stock_alerts}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="text-center py-8">
            <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics Avançados</h3>
            <p className="text-gray-600">
              Relatórios detalhados de performance, comportamento do cliente e insights de negócio.
            </p>
          </div>
        )}

        {activeTab === 'management' && (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Painel de Gestão</h3>
            <p className="text-gray-600">
              Gerencie cardápio, eventos, funcionários, promoções e todos os aspectos do restaurante.
            </p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Configurações do Sistema</h3>
            <p className="text-gray-600">
              Configure integrações, permissões, notificações e parâmetros gerais do sistema.
            </p>
          </div>
        )}
      </div>

      {/* Modal for Quick Actions - Temporarily disabled */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Ação Rápida</h3>
            <div className="text-center py-8">
              <p className="text-gray-600">
                Funcionalidade "{modalContent}" será implementada em breve.
              </p>
            </div>
            <button 
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 