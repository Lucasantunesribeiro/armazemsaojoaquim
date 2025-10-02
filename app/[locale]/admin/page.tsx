'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
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
  Activity,
  BarChart3,
  Settings,
  PlusCircle,
  Edit,
  Eye
} from 'lucide-react'


interface DashboardStats {
  totalUsers: number
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

interface AdminDashboardProps {
  params: Promise<{ locale: string }>
}

export default function AdminDashboard({ params }: AdminDashboardProps) {
  const router = useRouter()
  const { adminFetch, isAuthorized, isLoading: adminLoading } = useAdminApi()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBlogPosts: 0,
    totalMenuItems: 0
  })
  const [loading, setLoading] = useState(true)
  const [locale, setLocale] = useState<string>('pt')

  // Desempacotar params usando React.use()
  const resolvedParams = use(params)
  
  // Definir locale diretamente dos params
  useEffect(() => {
    setLocale(resolvedParams.locale || 'pt')
  }, [resolvedParams.locale])
  const [error, setError] = useState('')
  const [navigating, setNavigating] = useState<string | null>(null)

  useEffect(() => {
    // Aguardar o admin estar pronto antes de carregar stats
    if (!adminLoading && isAuthorized) {
      loadStats()
    }
  }, [adminLoading, isAuthorized])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await adminFetch('/dashboard/stats')
      
      if (response.success && response.data) {
        setStats(response.data)
      } else {
        console.warn('API retornou dados de fallback:', response)
        setStats(response.data || {
          totalUsers: 0,
          totalBlogPosts: 0,
          totalMenuItems: 0
        })
        
        if (!response.success) {
          setError(response.error || 'Erro ao carregar estatísticas')
        }
      }
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
      route: `/${locale}/admin/usuarios`,
      description: "Total cadastrados",
      color: "blue"
    }
  ]

  const contentCards: DashboardCard[] = [
    {
      title: "Posts do Blog",
      value: stats.totalBlogPosts,
      icon: <FileText className="h-6 w-6" />,
      route: `/${locale}/admin/blog`,
      description: "Artigos publicados",
      color: "purple"
    },
    {
      title: "Restaurante",
      value: stats.totalMenuItems,
      icon: <ChefHat className="h-6 w-6" />,
      route: `/${locale}/admin/menu`,
      description: "Menu do restaurante",
      color: "orange"
    },
    {
      title: "Café",
      value: 0, // TODO: adicionar contagem específica do café
      icon: <ChefHat className="h-6 w-6" />,
      route: `/${locale}/admin/cafe`,
      description: "Menu do café",
      color: "orange"
    },
    {
      title: "Galeria",
      value: 0, // TODO: adicionar contagem de imagens
      icon: <FileText className="h-6 w-6" />,
      route: `/${locale}/admin/galeria`,
      description: "Imagens da galeria",
      color: "purple"
    }
  ]

  if (loading || adminLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {adminLoading ? 'Verificando permissões...' : 'Carregando dashboard...'}
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Acesso Negado</h2>
            <p className="text-red-700 dark:text-red-300">Você não tem permissão para acessar esta página.</p>
          </div>
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
          <StatsCard
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
          <StatsCard
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
  route: string
  isNavigating: boolean
  onClick: () => void
  large?: boolean
}

function StatsCard({ 
  title, 
  value, 
  icon, 
  color, 
  description, 
  route, 
  isNavigating, 
  onClick, 
  large 
}: StatsCardProps) {
  const colorClasses = {
    blue: {
      icon: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      hover: 'hover:border-blue-200 dark:hover:border-blue-700'
    },
    green: {
      icon: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      hover: 'hover:border-green-200 dark:hover:border-green-700'
    },
    yellow: {
      icon: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      hover: 'hover:border-yellow-200 dark:hover:border-yellow-700'
    },
    red: {
      icon: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      hover: 'hover:border-red-200 dark:hover:border-red-700'
    },
    purple: {
      icon: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      hover: 'hover:border-purple-200 dark:hover:border-purple-700'
    },
    orange: {
      icon: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      hover: 'hover:border-orange-200 dark:hover:border-orange-700'
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
    <Card 
      className={`cursor-pointer transition-all duration-200 ${colorClasses[color].hover} ${isNavigating ? 'opacity-75' : 'hover:shadow-md'}`}
      role="button"
      tabIndex={0}
      aria-label={`Navegar para ${title} - ${description}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${colorClasses[color].icon}`}>
              {isNavigating ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                icon
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className={`font-bold ${large ? 'text-3xl' : 'text-2xl'}`}>
                {value}
              </p>
              <p className="text-xs text-muted-foreground">
                {isNavigating ? 'Carregando...' : description}
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardContent>
    </Card>
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