'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
  Plus
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalReservas: number
  reservasHoje: number
  reservasPendentes: number
  totalBlogPosts: number
  totalMenuItems: number
}

export default function AdminDashboard() {
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
        <StatsCard
          title="Usuários"
          value={stats.totalUsers}
          icon={<Users className="h-6 w-6" />}
          color="blue"
          description="Total cadastrados"
        />
        <StatsCard
          title="Reservas"
          value={stats.totalReservas}
          icon={<Calendar className="h-6 w-6" />}
          color="green"
          description="Total de reservas"
        />
        <StatsCard
          title="Hoje"
          value={stats.reservasHoje}
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
          description="Reservas hoje"
        />
        <StatsCard
          title="Pendentes"
          value={stats.reservasPendentes}
          icon={<AlertCircle className="h-6 w-6" />}
          color="red"
          description="Aguardando confirmação"
        />
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <StatsCard
          title="Posts do Blog"
          value={stats.totalBlogPosts}
          icon={<FileText className="h-6 w-6" />}
          color="purple"
          description="Artigos publicados"
          large
        />
        <StatsCard
          title="Itens do Menu"
          value={stats.totalMenuItems}
          icon={<ChefHat className="h-6 w-6" />}
          color="orange"
          description="Pratos disponíveis"
          large
        />
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
            title="Ver Usuários"
            description="Gerenciar usuários"
            href="/admin/usuarios"
            icon={<Users className="h-5 w-5" />}
            color="yellow"
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

interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange'
  description: string
  large?: boolean
}

function StatsCard({ title, value, icon, color, description, large }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center">
        <div className={`p-2 sm:p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className={`font-bold text-gray-900 dark:text-white ${large ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
            {value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {description}
          </p>
        </div>
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