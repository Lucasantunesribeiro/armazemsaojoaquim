'use client'

import { useToastNotifications } from './useToastNotifications'

export function useAuthToasts() {
  const { showSuccess, showError, showWarning, showInfo, showToast } = useToastNotifications()

  const showAuthSuccess = (message: string, title?: string) => {
    return showSuccess(message, title || '✅ Sucesso!', {
      duration: 4000
    })
  }

  const showAuthError = (type: string, message?: string) => {
    const errorMessages: Record<string, string> = {
      'invalid-credentials': 'Email ou senha incorretos. Verifique suas credenciais.',
      'email-not-confirmed': 'Confirme seu email antes de fazer login.',
      'too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
      'user-not-found': 'Usuário não encontrado. Verifique o email.',
      'database-error': 'Erro no sistema. Tente novamente em instantes.',
      'network-error': 'Erro de conexão. Verifique sua internet.',
      'link_expired': 'O link de redefinição de senha expirou. Solicite um novo link.',
      'session_expired': 'Sua sessão expirou. Por favor, faça login novamente.',
      'session_required': 'Faça login novamente para acessar a área administrativa.',
      'server-error': 'Erro no servidor. Tente novamente.',
      'url-config-error': 'Erro de configuração. Entre em contato com o suporte.',
      'rate-limit': 'Limite de tentativas atingido. Aguarde alguns minutos.',
      'email-rate-limit': 'Limite de emails atingido. Aguarde 1-2 horas.',
      'user-exists': 'Este email já está cadastrado. Tente fazer login.'
    }

    return showError(
      message || errorMessages[type] || 'Erro desconhecido',
      '❌ Erro de Autenticação',
      {
        duration: 6000
      }
    )
  }

  const showAuthWarning = (message: string, title?: string) => {
    return showWarning(message, title || '⚠️ Atenção', {
      duration: 5000
    })
  }

  const showAuthInfo = (message: string, title?: string) => {
    return showInfo(message, title || 'ℹ️ Informação', {
      duration: 4000
    })
  }

  const showRegistrationSuccess = (requiresConfirmation: boolean = true) => {
    if (requiresConfirmation) {
      return showSuccess(
        'Verifique seu email para confirmar sua conta.',
        '🎉 Conta criada com sucesso!',
        {
          duration: 6000
        }
      )
    } else {
      return showSuccess(
        'Login realizado automaticamente!',
        '🎉 Conta criada com sucesso!',
        {
          duration: 4000
        }
      )
    }
  }

  const showLoginSuccess = (isAdmin: boolean = false) => {
    const message = isAdmin 
      ? 'Redirecionando para área administrativa...'
      : 'Bem-vindo de volta!'
    
    return showSuccess(message, '🎉 Login realizado!', {
      duration: 3000
    })
  }

  const showPasswordResetSuccess = () => {
    return showSuccess(
      'Verifique sua caixa de entrada.',
      '📧 Email de recuperação enviado!',
      {
        duration: 5000
      }
    )
  }

  const showEmailResendSuccess = () => {
    return showSuccess(
      'Verifique sua caixa de entrada.',
      '📧 Email de confirmação reenviado!',
      {
        duration: 4000
      }
    )
  }

  const showRateLimitWarning = (remainingMinutes: number, email?: string) => {
    const message = email 
      ? `Email ${email} está em rate limit. Aguarde ${remainingMinutes} minutos ou use um email diferente.`
      : `Aguarde ${remainingMinutes} minutos antes de tentar novamente.`
    
    return showWarning(message, '⏰ Limite de tentativas', {
      duration: 8000
    })
  }

  const showOAuthSuccess = () => {
    return showInfo(
      'Redirecionando para autenticação...',
      '🔄 Iniciando login com Google',
      {
        duration: 3000
      }
    )
  }

  return {
    showAuthSuccess,
    showAuthError,
    showAuthWarning,
    showAuthInfo,
    showRegistrationSuccess,
    showLoginSuccess,
    showPasswordResetSuccess,
    showEmailResendSuccess,
    showRateLimitWarning,
    showOAuthSuccess,
    showToast
  }
}

export default useAuthToasts