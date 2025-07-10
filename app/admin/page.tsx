'use client'

import { useState, useEffect } from 'react'
import { useDashboardStats } from '@/lib/hooks/useDashboardStats'
import { 
  Users, 
  Calendar, 
  CalendarCheck, 
  UtensilsCrossed, 
  FileText, 
  Tag,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface DashboardStats {
  users: {
    total: number
    newThisMonth: number
    adminCount: number
  }
  reservations: {
    total: number
    active: number
    today: number
    confirmed: number
    pending: number
  }
  menu: {
    totalItems: number
    categories: number
    availableItems: number
    featuredItems: number
  }
  blog: {
    totalPosts: number
    published: number
    drafts: number
    recentPosts: number
  }
}

export default function AdminDashboard() {
  const { stats, loading, error } = useDashboardStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            <p className="font-bold">Erro no Dashboard</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Administrativo</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Painel de controle do Armazém São Joaquim</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Usuários */}
          <StatsCard
            title="Usuários"
            value={stats?.users.total || 0}
            subtitle={`${stats?.users.newThisMonth || 0} novos este mês`}
            icon={<Users className="h-8 w-8" />}
            color="blue"
            href="/admin/usuarios"
          />

          {/* Reservas Totais */}
          <StatsCard
            title="Reservas"
            value={stats?.reservations.total || 0}
            subtitle={`${stats?.reservations.today || 0} hoje`}
            icon={<Calendar className="h-8 w-8" />}
            color="green"
            href="/admin/reservas"
          />

          {/* Reservas Ativas */}
          <StatsCard
            title="Reservas Ativas"
            value={stats?.reservations.active || 0}
            subtitle={`${stats?.reservations.confirmed || 0} confirmadas`}
            icon={<CalendarCheck className="h-8 w-8" />}
            color="yellow"
            href="/admin/reservas?filter=active"
          />

          {/* Itens do Menu */}
          <StatsCard
            title="Itens do Menu"
            value={stats?.menu.totalItems || 0}
            subtitle={`${stats?.menu.availableItems || 0} disponíveis`}
            icon={<UtensilsCrossed className="h-8 w-8" />}
            color="purple"
            href="/admin/menu"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Posts do Blog */}
          <StatsCard
            title="Posts do Blog"
            value={stats?.blog.totalPosts || 0}
            subtitle={`${stats?.blog.published || 0} publicados, ${stats?.blog.drafts || 0} rascunhos`}
            icon={<FileText className="h-8 w-8" />}
            color="indigo"
            href="/admin/blog"
          />

          {/* Categorias */}
          <StatsCard
            title="Categorias"
            value={stats?.menu.categories || 0}
            subtitle={`${stats?.menu.featuredItems || 0} itens em destaque`}
            icon={<Tag className="h-8 w-8" />}
            color="pink"
            href="/admin/categorias"
          />

          {/* Status Geral */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status do Sistema</h3>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sistema Online</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Banco de Dados OK</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Última atualização: {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              title="Nova Reserva"
              description="Criar reserva manual"
              href="/admin/reservas/nova"
              icon={<Calendar className="h-6 w-6" />}
            />
            <QuickActionButton
              title="Novo Post"
              description="Escrever artigo do blog"
              href="/admin/blog/new"
              icon={<FileText className="h-6 w-6" />}
            />
            <QuickActionButton
              title="Novo Item do Menu"
              description="Adicionar prato/bebida"
              href="/admin/menu/novo"
              icon={<UtensilsCrossed className="h-6 w-6" />}
            />
            <QuickActionButton
              title="Gerenciar Blog"
              description="Gerenciar artigos do blog"
              href="/admin/blog"
              icon={<FileText className="h-6 w-6" />}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de Card de Estatística
interface StatsCardProps {
  title: string
  value: number
  subtitle: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'indigo' | 'pink'
  href?: string
}

function StatsCard({ title, value, subtitle, icon, color, href }: StatsCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900',
    green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900',
    yellow: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900',
    purple: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900',
    indigo: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900',
    pink: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900'
  }

  const CardContent = (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block">
        {CardContent}
      </a>
    )
  }

  return CardContent
}

// Componente de Ação Rápida
interface QuickActionButtonProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
}

function QuickActionButton({ title, description, href, icon }: QuickActionButtonProps) {
  return (
    <a
      href={href}
      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
          {icon}
        </div>
        <div className="ml-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </a>
  )
}