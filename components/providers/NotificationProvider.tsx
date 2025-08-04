'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// Simple UUID generator
const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  persistent?: boolean
  icon?: ReactNode
  timestamp: Date
  action?: {
    label: string
    onClick: () => void
    href?: string
  }
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'top-left'
  category?: 'auth' | 'reservation' | 'user' | 'menu' | 'blog' | 'system' | 'general'
}

export interface AdminNotification extends Notification {
  actions?: Array<{
    label: string
    onClick?: () => void
    href?: string
    variant?: 'primary' | 'secondary' | 'danger'
  }>
  category: 'reservation' | 'user' | 'menu' | 'blog' | 'system'
}


interface NotificationContextType {
  // Notifications
  notifications: Notification[]
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string
  removeNotification: (id: string) => void
  clearAll: () => void
  clearByCategory: (category: string) => void
  
  // Admin Notifications  
  adminNotifications: AdminNotification[]
  showAdminNotification: (notification: Omit<AdminNotification, 'id' | 'timestamp'>) => string
  removeAdminNotification: (id: string) => void
  clearAdminNotifications: () => void
  
  // Auth Messages
  showAuthSuccess: (message: string, action?: { label: string; onClick: () => void }) => void
  showAuthError: (errorType: string, customMessage?: string) => void
  showAuthWarning: (message: string, action?: { label: string; onClick: () => void }) => void
  
  // Progress Messages
  showProgress: (stage: string, message: string, progress?: number) => void
  hideProgress: () => void
  progressState: { visible: boolean; stage: string; message: string; progress: number } | null
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([])
  const [progressState, setProgressState] = useState<{ 
    visible: boolean
    stage: string
    message: string
    progress: number 
  } | null>(null)

  // Auto-remove notifications
  const autoRemove = useCallback((id: string, duration?: number) => {
    if (duration && duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
  }, [])

  // Regular notifications
  const showNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = generateId()
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? 5000,
      position: notification.position ?? 'top-right'
    }
    
    setNotifications(prev => [...prev, newNotification])
    
    if (!notification.persistent) {
      autoRemove(id, newNotification.duration)
    }
    
    return id
  }, [autoRemove])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const clearByCategory = useCallback((category: string) => {
    setNotifications(prev => prev.filter(notification => notification.category !== category))
  }, [])

  // Admin notifications
  const showAdminNotification = useCallback((notification: Omit<AdminNotification, 'id' | 'timestamp'>) => {
    const id = generateId()
    const newNotification: AdminNotification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? 8000,
      position: notification.position ?? 'top-right'
    }
    
    setAdminNotifications(prev => [...prev, newNotification])
    
    if (!notification.persistent) {
      autoRemove(id, newNotification.duration)
    }
    
    return id
  }, [autoRemove])

  const removeAdminNotification = useCallback((id: string) => {
    setAdminNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAdminNotifications = useCallback(() => {
    setAdminNotifications([])
  }, [])


  // Auth messages
  const authErrorMessages = {
    'invalid-credentials': {
      title: '🔐 Credenciais inválidas',
      message: 'Email ou senha incorretos. Verifique seus dados e tente novamente.',
    },
    'too-many-requests': {
      title: '⏰ Muitas tentativas',
      message: 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.',
      duration: 15000
    },
    'email-not-confirmed': {
      title: '📧 Email não verificado',
      message: 'Sua conta ainda não foi verificada. Verifique seu email ou solicite um novo link.',
    },
    'user-not-found': {
      title: '👤 Usuário não encontrado',
      message: 'Não encontramos uma conta com este email. Verifique o endereço ou crie uma nova conta.',
    },
    'weak-password': {
      title: '🔒 Senha muito fraca',
      message: 'Sua senha deve ter pelo menos 8 caracteres, incluindo letras, números e símbolos.',
    },
    'email-already-exists': {
      title: '📧 Email já cadastrado',
      message: 'Este email já está em uso. Tente fazer login ou use outro endereço.',
    },
    'network-error': {
      title: '🌐 Erro de conexão',
      message: 'Problema na conexão com o servidor. Verifique sua internet e tente novamente.',
    },
    'server-error': {
      title: '⚠️ Erro no servidor',
      message: 'Ocorreu um erro interno. Nossa equipe foi notificada. Tente novamente em alguns minutos.',
    }
  }

  const showAuthSuccess = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
    showNotification({
      type: 'success',
      title: '✅ Sucesso!',
      message,
      action,
      duration: 8000,
      category: 'auth'
    })
  }, [showNotification])

  const showAuthError = useCallback((errorType: string, customMessage?: string) => {
    const errorConfig = authErrorMessages[errorType as keyof typeof authErrorMessages] || {
      title: '❌ Erro',
      message: customMessage || 'Ocorreu um erro inesperado. Tente novamente.',
    }
    
    showNotification({
      type: 'error',
      title: errorConfig.title,
      message: errorConfig.message,
      duration: ('duration' in errorConfig ? errorConfig.duration : 10000),
      category: 'auth'
    })
  }, [showNotification])

  const showAuthWarning = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
    showNotification({
      type: 'warning',
      title: '⚠️ Atenção',
      message,
      action,
      duration: 12000,
      category: 'auth'
    })
  }, [showNotification])

  // Progress messages
  const showProgress = useCallback((stage: string, message: string, progress: number = 0) => {
    setProgressState({
      visible: true,
      stage,
      message,
      progress
    })
  }, [])

  const hideProgress = useCallback(() => {
    setProgressState(null)
  }, [])

  const value: NotificationContextType = {
    // Regular notifications
    notifications,
    showNotification,
    removeNotification,
    clearAll,
    clearByCategory,
    
    // Admin notifications
    adminNotifications,
    showAdminNotification,
    removeAdminNotification,
    clearAdminNotifications,
    
    // Auth messages
    showAuthSuccess,
    showAuthError,
    showAuthWarning,
    
    // Progress messages
    showProgress,
    hideProgress,
    progressState
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Hooks específicos para facilitar o uso
export function useToast() {
  const { showNotification, removeNotification } = useNotifications()
  
  return {
    success: (message: string, title?: string) => showNotification({
      type: 'success',
      title: title || '✅ Sucesso!',
      message,
      duration: 5000
    }),
    error: (message: string, title?: string) => showNotification({
      type: 'error', 
      title: title || '❌ Erro!',
      message,
      duration: 8000
    }),
    warning: (message: string, title?: string) => showNotification({
      type: 'warning',
      title: title || '⚠️ Atenção!',
      message,
      duration: 6000
    }),
    info: (message: string, title?: string) => showNotification({
      type: 'info',
      title: title || 'ℹ️ Informação',
      message,
      duration: 5000
    }),
    remove: removeNotification
  }
}


export function useAuthMessages() {
  const { showAuthSuccess, showAuthError, showAuthWarning } = useNotifications()
  
  return {
    success: showAuthSuccess,
    error: showAuthError,
    warning: showAuthWarning,
    
    // Mensagens pré-definidas
    accountCreated: () => showAuthSuccess(
      'Enviamos um email de verificação para seu endereço. Verifique sua caixa de entrada e clique no link para ativar sua conta.',
      { 
        label: 'Reenviar email', 
        onClick: () => {
          // TODO: Implementar reenvio de email
          console.log('Reenviar email de verificação')
        }
      }
    ),
    
    emailSent: () => showAuthSuccess(
      'Email de verificação enviado! Verifique sua caixa de entrada e spam. O link expira em 24 horas.',
      {
        label: 'Reenviar email',
        onClick: () => {
          // TODO: Implementar reenvio de email  
          console.log('Reenviar email de verificação')
        }
      }
    ),
    
    emailFailed: () => showAuthWarning(
      'Sua conta foi criada, mas houve um problema no envio do email. Você pode tentar reenviar ou entrar em contato conosco.',
      {
        label: 'Tentar novamente',
        onClick: () => {
          // TODO: Implementar tentativa de reenvio
          console.log('Tentar reenviar email novamente')  
        }
      }
    ),
    
    // Mensagens de erro específicas
    'invalid-credentials': () => showAuthError(
      'Credenciais inválidas',
      'Email ou senha incorretos. Verifique suas credenciais e tente novamente.'
    ),
    
    'email-not-confirmed': () => showAuthError(
      'Email não confirmado',
      'Sua conta ainda não foi confirmada. Verifique seu email e clique no link de confirmação.'
    ),
    
    'too-many-requests': () => showAuthError(
      'Muitas tentativas',
      'Você fez muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.'
    ),
    
    'user-not-found': () => showAuthError(
      'Usuário não encontrado',
      'Não encontramos uma conta com este email. Verifique o email ou crie uma nova conta.'
    ),
    
    'server-error': (customMessage?: string) => showAuthError(
      'Erro do servidor',
      customMessage || 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.'
    ),
    
    'network-error': (customMessage?: string) => showAuthError(
      'Erro de conexão',
      customMessage || 'Problema de conexão. Verifique sua internet e tente novamente.'
    ),
    
    'database-error': (customMessage?: string) => showAuthError(
      'Erro no banco de dados',
      customMessage || 'Problema técnico no banco de dados. Entre em contato com o suporte.'
    ),
    'url-config-error': (customMessage?: string) => showAuthError(
      'Erro de configuração',
      customMessage || 'Problema de configuração. Entre em contato com o suporte.'
    )
  }
}

export function useAdminNotifications() {
  const { showAdminNotification, adminNotifications, clearAdminNotifications } = useNotifications()
  
  return {
    notifications: adminNotifications,
    clear: clearAdminNotifications,
    
    // Notificações pré-definidas para admin
    reservationCreated: (data: { name: string; date: string; time: string; people: number }) => 
      showAdminNotification({
        type: 'success',
        title: '🎉 Nova reserva recebida!',
        message: `${data.name} fez uma reserva para ${data.people} pessoas em ${data.date} às ${data.time}`,
        category: 'reservation',
        actions: [
          { label: 'Ver detalhes', href: '/admin/reservas', variant: 'primary' },
          { label: 'Confirmar', onClick: () => console.log('Confirmar reserva'), variant: 'secondary' }
        ]
      }),
      
    menuItemAdded: (data: { name: string; category: string }) =>
      showAdminNotification({
        type: 'success',
        title: '🍽️ Prato adicionado ao cardápio',
        message: `${data.name} foi adicionado à categoria ${data.category}`,
        category: 'menu',
        actions: [
          { label: 'Ver cardápio', href: '/admin/menu', variant: 'primary' }
        ]
      }),
      
    systemError: (message: string) =>
      showAdminNotification({
        type: 'error',
        title: '⚠️ Erro no sistema',
        message,
        persistent: true,
        category: 'system'
      })
  }
} 