'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { 
  Users, 
  Calendar, 
  FileText, 
  ChefHat,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  Loader2,
  Bed,
  Coffee
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalReservas: number
  reservasHoje: number
  reservasPendentes: number
  totalBlogPosts: number
  totalMenuItems: number
}

interface DashboardCard {
  title: string
  value: number
  icon: React.ReactNode
  route: string
  description: string
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange'
}

export default function AdminDashboard() {
  const router = useRouter()
  const { adminFetch } = useAdminApi()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalReservas: 0,
    reservasHoje: 0,
    reservasPendentes: 0,
    totalBlogPosts: 0,
    totalMenuItems: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [navigating, setNavigating] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError('')
      
      const data = await adminFetch('/api/admin/dashboard/stats')
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = async (route: string, cardTitle: string) => {
    try {
      setNavigating(cardTitle)
      
      // Pequeno delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 150))
      
      router.push(route)
    } catch (error) {
      console.error('Erro na navegação:', error)
      setNavigating(null)
    }
  }

  // Configuração dos cards com rotas
  const dashboardCards: DashboardCard[] = [
    {
      title: "Usuários",
      value: stats.totalUsers,
      icon: <Users className="h-6 w-6" />,
      route: "/admin/usuarios",
      description: "Total cadastrados",
      color: "blue"
    },
    {
      title: "Reservas",
      value: stats.totalReservas,
      icon: <Calendar className="h-6 w-6" />,
      route: "/admin/reservas",
      description: "Total de reservas",
      color: "green"
    },
    {
      title: "Hoje",
      value: stats.reservasHoje,
      icon: <Clock className="h-6 w-6" />,
      route: "/admin/reservas?filter=today",
      description: "Reservas hoje",
      color: "yellow"
    },
    {
      title: "Pendentes",
      value: stats.reservasPendentes,
      icon: <AlertCircle className="h-6 w-6" />,
      route: "/admin/reservas?filter=pending",
      description: "Aguardando confirmação",
      color: "red"
    }
  ]

  const contentCards: DashboardCard[] = [
    {
      title: "Posts do Blog",
      value: stats.totalBlogPosts,
      icon: <FileText className="h-6 w-6" />,
      route: "/admin/blog",
      description: "Artigos publicados",
      color: "purple"
    },
    {
      title: "Itens do Menu",
      value: stats.totalMenuItems,
      icon: <ChefHat className="h-6 w-6" />,
      route: "/admin/menu",
      description: "Pratos disponíveis",
      color: "orange"
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Erro</h2>
        <p className="text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={loadStats}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visão geral do Armazém São Joaquim
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {dashboardCards.map((card) => (
          <NavigableStatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            description={card.description}
            route={card.route}
            isNavigating={navigating === card.title}
            onClick={() => handleCardClick(card.route, card.title)}
          />
        ))}
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {contentCards.map((card) => (
          <NavigableStatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            description={card.description}
            route={card.route}
            isNavigating={navigating === card.title}
            onClick={() => handleCardClick(card.route, card.title)}
            large
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <ActionCard
            title="Nova Reserva"
            description="Adicionar reserva manual"
            href="/admin/reservas"
            icon={<Plus className="h-5 w-5" />}
            color="blue"
          />
          <ActionCard
            title="Novo Post"
            description="Criar artigo do blog"
            href="/admin/blog/new"
            icon={<FileText className="h-5 w-5" />}
            color="green"
          />
          <ActionCard
            title="Novo Prato"
            description="Adicionar ao menu"
            href="/admin/menu/new"
            icon={<ChefHat className="h-5 w-5" />}
            color="purple"
          />
          <ActionCard
            title="Gerenciar Pousada"
            description="Quartos e reservas"
            href="/admin/pousada"
            icon={<Bed className="h-5 w-5" />}
            color="yellow"
          />
        </div>
      </div>

      {/* New Sections */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Novos Recursos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <ActionCard
            title="Café do Armazém"
            description="Produtos e pedidos do café"
            href="/admin/cafe"
            icon={<Coffee className="h-5 w-5" />}
            color="purple"
          />
          <ActionCard
            title="Ver Usuários"
            description="Gerenciar usuários"
            href="/admin/usuarios"
            icon={<Users className="h-5 w-5" />}
            color="blue"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Atividade Recente
        </h2>
        <div className="space-y-3">
          <ActivityItem
            icon={<Calendar className="h-4 w-4 text-green-600" />}
            title="Sistema funcionando normalmente"
            time="Agora"
            status="success"
          />
          <ActivityItem
            icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
            title="Dashboard carregado com sucesso"
            time="Há alguns segundos"
            status="info"
          />
          <ActivityItem
            icon={<CheckCircle className="h-4 w-4 text-green-600" />}
            title="Todas as funcionalidades disponíveis"
            time="Online"
            status="success"
          />
        </div>
      </div>
    </div>
  )
}

// Components

interface NavigableStatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange'
  description: string
  route: string
  isNavigating: boolean
  onClick: () => void
  large?: boolean
}

function NavigableStatsCard({ 
  title, 
  value, 
  icon, 
  color, 
  description, 
  route, 
  isNavigating, 
  onClick, 
  large 
}: NavigableStatsCardProps) {
  const colorClasses = {
    blue: {
      icon: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-700',
      shadow: 'hover:shadow-blue-100 dark:hover:shadow-blue-900/20'
    },
    green: {
      icon: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      hover: 'hover:bg-green-50 dark:hover:bg-green-900/10 hover:border-green-200 dark:hover:border-green-700',
      shadow: 'hover:shadow-green-100 dark:hover:shadow-green-900/20'
    },
    yellow: {
      icon: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      hover: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/10 hover:border-yellow-200 dark:hover:border-yellow-700',
      shadow: 'hover:shadow-yellow-100 dark:hover:shadow-yellow-900/20'
    },
    red: {
      icon: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      hover: 'hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 dark:hover:border-red-700',
      shadow: 'hover:shadow-red-100 dark:hover:shadow-red-900/20'
    },
    purple: {
      icon: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 dark:hover:border-purple-700',
      shadow: 'hover:shadow-purple-100 dark:hover:shadow-purple-900/20'
    },
    orange: {
      icon: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-orange-200 dark:hover:border-orange-700',
      shadow: 'hover:shadow-orange-100 dark:hover:shadow-orange-900/20'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!isNavigating) {
        onClick()
      }
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Navegar para ${title} - ${description}`}
      title={`Clique para ver ${title}`}
      className={`
        navigable-stats-card bg-white dark:bg-gray-800 rounded-lg shadow border border-transparent p-4 sm:p-6
        cursor-pointer select-none group
        ${colorClasses[color].hover}
        ${isNavigating ? 'navigating-card' : ''}
      `}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center">
        <div className={`p-2 sm:p-3 rounded-lg ${colorClasses[color].icon}`}>
          {isNavigating ? (
            <Loader2 className="h-6 w-6 animate-spin card-icon-loading" />
          ) : (
            icon
          )}
        </div>
        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </p>
            <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2" />
          </div>
          <p className={`font-bold text-gray-900 dark:text-white transition-all duration-200 ${
            large ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
          } ${isNavigating ? 'opacity-75' : ''}`}>
            {value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {isNavigating ? 'Carregando...' : description}
          </p>
        </div>
      </div>
      
      {/* Indicador visual de navegação */}
      <div className="navigation-indicator flex items-center justify-end mt-2 transition-opacity duration-200">
        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
          Clique para navegar
        </span>
        <ArrowRight className="h-3 w-3 text-gray-400 dark:text-gray-500" />
      </div>
    </div>
  )
}

interface ActionCardProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'yellow'
}

function ActionCard({ title, description, href, icon, color }: ActionCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
  }

  return (
    <Link href={href}>
      <div className={`${colorClasses[color]} p-4 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-current/20`}>
        <div className="flex items-center mb-2">
          {icon}
          <h3 className="ml-2 font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </Link>
  )
}

interface ActivityItemProps {
  icon: React.ReactNode
  title: string
  time: string
  status: 'success' | 'info' | 'warning'
}

function ActivityItem({ icon, title, time, status }: ActivityItemProps) {
  const statusClasses = {
    success: 'bg-green-100 dark:bg-green-900/20',
    info: 'bg-blue-100 dark:bg-blue-900/20',
    warning: 'bg-yellow-100 dark:bg-yellow-900/20'
  }

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className={`p-1.5 rounded-full ${statusClasses[status]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {time}
        </p>
      </div>
    </div>
  )
}