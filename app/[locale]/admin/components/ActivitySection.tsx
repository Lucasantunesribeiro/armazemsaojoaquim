'use client'

import { 
  Calendar, 
  TrendingUp,
  CheckCircle
} from 'lucide-react'

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

export default function ActivitySection() {
  return (
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
  )
}