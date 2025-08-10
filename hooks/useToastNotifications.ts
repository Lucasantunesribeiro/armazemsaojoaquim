'use client'

import { useToast, useToastHelpers } from '@/contexts/ToastContext'

// Main hook that combines all toast functionality
export function useToastNotifications() {
  const { toasts, removeToast, clearToasts, updateToast } = useToast()
  const { showSuccess, showError, showWarning, showInfo, showToast } = useToastHelpers()

  return {
    // Toast state
    toasts,
    
    // Basic actions
    removeToast,
    clearToasts,
    updateToast,
    
    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast,
    
    // Specialized methods for common use cases
    showAuthSuccess: (message: string) => {
      return showSuccess(message, '✅ Sucesso!', {
        duration: 4000
      })
    },
    
    showAuthError: (message: string) => {
      return showError(message, '❌ Erro de Autenticação', {
        duration: 6000
      })
    },
    
    showNetworkError: () => {
      return showError(
        'Verifique sua conexão com a internet e tente novamente.',
        '🌐 Erro de Conexão',
        {
          duration: 8000,
          action: {
            label: 'Tentar Novamente',
            onClick: () => window.location.reload()
          }
        }
      )
    },
    
    showValidationError: (message: string) => {
      return showWarning(message, '⚠️ Dados Inválidos', {
        duration: 5000
      })
    },
    
    showLoadingToast: (message: string) => {
      return showInfo(message, '⏳ Carregando...', {
        duration: 0, // Don't auto-dismiss
        dismissible: false
      })
    },
    
    showLocationSuccess: () => {
      return showSuccess(
        'Localização aberta com sucesso!',
        '📍 Localização',
        {
          duration: 3000
        }
      )
    },
    
    showLocationError: () => {
      return showError(
        'Não foi possível abrir a localização. Tente novamente.',
        '📍 Erro de Localização',
        {
          duration: 5000,
          action: {
            label: 'Tentar Novamente',
            onClick: () => {
              // This would be handled by the component using the hook
            }
          }
        }
      )
    },

    showProgressToast: (current: number, total: number, message: string, label?: string) => {
      return showInfo(message, '⏳ Progresso', {
        duration: 0,
        dismissible: false,
        progress: {
          current,
          total,
          label
        }
      })
    },

    showExpandableError: (summary: string, details: string) => {
      return showError(summary, '❌ Erro Detalhado', {
        duration: 0,
        expandable: {
          summary: 'Ver detalhes',
          details
        },
        action: {
          label: 'Reportar',
          onClick: () => {
            // Handle error reporting
          }
        }
      })
    },

    showCopyableInfo: (message: string, copyText: string, title?: string) => {
      return showInfo(message, title || 'ℹ️ Informação', {
        duration: 8000,
        copyable: {
          text: copyText,
          label: 'Copiar'
        }
      })
    },

    showPersistentWarning: (message: string, title?: string) => {
      return showWarning(message, title || '⚠️ Atenção', {
        duration: 0,
        persistent: true,
        action: {
          label: 'Entendi',
          onClick: () => {
            // Handle acknowledgment
          }
        }
      })
    }
  }
}

export default useToastNotifications