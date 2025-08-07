'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  PlusCircle, 
  Edit, 
  Settings, 
  Users, 
  FileText, 
  ChefHat,
  Calendar,
  BarChart3
} from 'lucide-react'

interface QuickActionsProps {
  locale: string
}

interface QuickAction {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

export default function QuickActions({ locale }: QuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      title: "Novo Post",
      description: "Criar artigo para o blog",
      href: `/${locale}/admin/blog/novo`,
      icon: <PlusCircle className="h-5 w-5" />,
      color: "blue"
    },
    {
      title: "Gerenciar Quartos",
      description: "Editar informações dos quartos",
      href: `/${locale}/admin/pousadas`,
      icon: <Edit className="h-5 w-5" />,
      color: "green"
    },
    {
      title: "Ver Usuários",
      description: "Listar usuários cadastrados",
      href: `/${locale}/admin/usuarios`,
      icon: <Users className="h-5 w-5" />,
      color: "purple"
    },
    {
      title: "Configurações",
      description: "Ajustar configurações do site",
      href: `/${locale}/admin/configuracoes`,
      icon: <Settings className="h-5 w-5" />,
      color: "orange"
    },
    {
      title: "Relatórios",
      description: "Ver estatísticas detalhadas",
      href: `/${locale}/admin/relatorios`,
      icon: <BarChart3 className="h-5 w-5" />,
      color: "red"
    },
    {
      title: "Gerenciar Menu",
      description: "Editar cardápio do restaurante",
      href: `/${locale}/admin/menu`,
      icon: <ChefHat className="h-5 w-5" />,
      color: "blue"
    }
  ]

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-orange-200 dark:border-orange-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>
          Acesso rápido às funcionalidades mais utilizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <div className={`
                p-4 rounded-lg border transition-all duration-200 cursor-pointer
                ${colorClasses[action.color]}
              `}>
                <div className="flex items-center space-x-3">
                  {action.icon}
                  <div>
                    <h3 className="font-medium text-sm">
                      {action.title}
                    </h3>
                    <p className="text-xs opacity-80">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}