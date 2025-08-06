'use client'

import Link from 'next/link'
import { 
  Users, 
  FileText, 
  ChefHat,
  Plus
} from 'lucide-react'

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
    <Link href={href} prefetch={false}>
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

interface QuickActionsProps {
  locale: string
}

export default function QuickActions({ locale }: QuickActionsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
        Ações Rápidas
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <ActionCard
          title="Nova Reserva"
          description="Adicionar reserva manual"
          href={`/${locale}/admin/reservas`}
          icon={<Plus className="h-5 w-5" />}
          color="blue"
        />
        <ActionCard
          title="Novo Post"
          description="Criar artigo do blog"
          href={`/${locale}/admin/blog/new`}
          icon={<FileText className="h-5 w-5" />}
          color="green"
        />
        <ActionCard
          title="Novo Prato"
          description="Adicionar ao menu"
          href={`/${locale}/admin/menu/new`}
          icon={<ChefHat className="h-5 w-5" />}
          color="purple"
        />
        <ActionCard
          title="Ver Usuários"
          description="Gerenciar usuários"
          href={`/${locale}/admin/usuarios`}
          icon={<Users className="h-5 w-5" />}
          color="yellow"
        />
      </div>
    </div>
  )
}