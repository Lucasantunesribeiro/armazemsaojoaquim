'use client'

import React from 'react'
import { useToast, useAuthMessages, useAdminNotifications, useWelcomeMessage, useNotifications } from '@/components/providers/NotificationProvider'
import { Bell, Calendar, Users, ChefHat, AlertTriangle, Sparkles } from 'lucide-react'

export default function NotificationsDemoPage() {
  const toast = useToast()
  const authMessages = useAuthMessages()
  const adminNotifications = useAdminNotifications()
  const { showWelcome } = useWelcomeMessage()
  const { showProgress, hideProgress } = useNotifications()

  const testToasts = () => {
    toast.success('Operação concluída com sucesso!')
    setTimeout(() => {
      toast.error('Erro ao processar solicitação')
    }, 1000)
    setTimeout(() => {
      toast.warning('Atenção: alguns dados podem estar desatualizados')
    }, 2000)
    setTimeout(() => {
      toast.info('Nova atualização disponível')
    }, 3000)
  }

  const testAuthMessages = () => {
    authMessages.error('invalid-credentials')
    setTimeout(() => {
      authMessages.success('Login realizado com sucesso!')
    }, 2000)
    setTimeout(() => {
      authMessages.warning('Sua sessão expirará em 5 minutos')
    }, 4000)
  }

  const testAdminNotifications = () => {
    adminNotifications.reservationCreated({
      name: 'João Silva',
      date: '25/01/2025',
      time: '19:30',
      people: 4
    })

    setTimeout(() => {
      adminNotifications.menuItemAdded({
        name: 'Feijoada Especial',
        category: 'Pratos Principais'
      })
    }, 2000)

    setTimeout(() => {
      adminNotifications.systemError('Falha na conexão com o servidor de email')
    }, 4000)
  }

  const testWelcomeModal = () => {
    showWelcome({
      show: true,
      type: 'first-visit',
      content: {
        title: '👋 Bem-vindo ao Sistema de Demo!',
        subtitle: 'Teste das Notificações',
        message: 'Esta é uma demonstração completa do sistema de notificações implementado.',
        features: [
          '🎯 Notificações toast elegantes',
          '🔔 Central de notificações admin',
          '💬 Mensagens contextuais de auth',
          '⭐ Modal de boas-vindas interativo'
        ],
        actions: [
          { label: 'Explorar Dashboard', href: '/admin', variant: 'primary' },
          { label: 'Ver Documentação', href: '#docs', variant: 'secondary' }
        ]
      }
    })
  }

  const testProgressModal = () => {
    showProgress('creating', 'Iniciando processo...', 10)
    
    setTimeout(() => {
      showProgress('creating', 'Criando conta...', 30)
    }, 1000)

    setTimeout(() => {
      showProgress('sending', 'Enviando email de confirmação...', 60)
    }, 2500)

    setTimeout(() => {
      showProgress('confirming', 'Finalizando cadastro...', 90)
    }, 4000)

    setTimeout(() => {
      showProgress('completed', 'Processo concluído com sucesso!', 100)
    }, 5500)

    setTimeout(() => {
      hideProgress()
    }, 7000)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Sparkles className="h-8 w-8 text-yellow-500 mr-3" />
          Demo: Sistema de Notificações
        </h1>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Demonstração completa do sistema de mensagens e notificações implementado. 
          Teste todas as funcionalidades disponíveis abaixo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Toast Messages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Toast Messages
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Notificações toast modernas com animações suaves, diferentes tipos e posicionamento responsivo.
          </p>
          <button
            onClick={testToasts}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Testar Toasts
          </button>
        </div>

        {/* Auth Messages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Mensagens de Auth
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Mensagens contextuais para diferentes cenários de autenticação com sugestões de ações.
          </p>
          <button
            onClick={testAuthMessages}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Testar Auth Messages
          </button>
        </div>

        {/* Admin Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <ChefHat className="h-6 w-6 text-orange-600 dark:text-orange-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notificações Admin
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Sistema avançado de notificações para administradores com categorização e ações rápidas.
          </p>
          <button
            onClick={testAdminNotifications}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Testar Admin Notifications
          </button>
        </div>

        {/* Welcome Modal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Modal de Welcome
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Modal atrativo de boas-vindas para novos usuários com recursos destacados e CTAs estratégicos.
          </p>
          <button
            onClick={testWelcomeModal}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Testar Welcome Modal
          </button>
        </div>

        {/* Progress Modal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Modal de Progresso
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Feedback visual durante operações longas como criação de conta, com indicadores de progresso e etapas.
          </p>
          <button
            onClick={testProgressModal}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Testar Progress Modal
          </button>
        </div>
      </div>

      {/* Features Summary */}
      <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-amber-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          ✨ Recursos Implementados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 dark:text-gray-200">Sistema Base:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>✅ NotificationProvider com Context API</li>
              <li>✅ Hooks personalizados (useToast, useAuthMessages, etc)</li>
              <li>✅ Persistência no localStorage</li>
              <li>✅ Sistema de categorização</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 dark:text-gray-200">Componentes UI:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>✅ Toast com animações CSS personalizadas</li>
              <li>✅ Modal de Welcome responsivo</li>
              <li>✅ AdminNotificationCenter com dropdown</li>
              <li>✅ ProgressModal com etapas visuais</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 