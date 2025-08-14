'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Mail, User, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { ToastProvider } from '@/contexts/ToastContext'
import ToastContainer from '@/components/ui/ToastContainer'
import { useAuthToasts } from '@/hooks/useAuthToasts'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

interface AuthPageProps {
  params: Promise<{ locale: string }>
}

export default function AuthPage({ params }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [rateLimitInfo, setRateLimitInfo] = useState<{active: boolean, remainingMinutes: number, email: string} | null>(null)
  const [locale, setLocale] = useState<string>('pt')

  const router = useRouter()
  const supabase = createClient()

  // Hooks para notificações toast
  const {
    showAuthSuccess,
    showAuthError,
    showAuthWarning,
    showRegistrationSuccess,
    showLoginSuccess,
    showPasswordResetSuccess,
    showEmailResendSuccess,
    showRateLimitWarning,
    showOAuthSuccess,
    showToast
  } = useAuthToasts()

  const showProgress = (stage: string, message: string, progress?: number) => {
    console.log(`Progress: ${stage} - ${message} (${progress}%)`)
  }

  const hideProgress = () => {
    console.log('Progress hidden')
  }

  // NEXT.JS 15: Resolver params Promise
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params
        setLocale(resolvedParams?.locale || 'pt')
      } catch (error) {
        console.error('Erro ao resolver params:', error)
        setLocale('pt')
      }
    }
    
    resolveParams()
  }, [params])

  // Verificar se há erro na URL
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const message = urlParams.get('message')
    
    if (error) {
      if (error === 'link_expired') {
        showAuthError('link_expired', 'O link de redefinição de senha expirou. Solicite um novo link abaixo.')
        setShowForgotPassword(true)
      } else if (error === 'session_required') {
        showAuthError('session_expired', 'Faça login novamente para acessar a área administrativa.')
      } else if (error === 'session_expired') {
        showAuthError('session_expired', 'Sua sessão expirou. Por favor, faça login novamente.')
      } else {
        showAuthError('server-error', decodeURIComponent(message || error))
      }
      // Limpar o erro da URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Monitorar rate limit
  useEffect(() => {
    const checkRateLimit = () => {
      const rateLimitTimestamp = localStorage.getItem('supabase_rate_limit_timestamp')
      const rateLimitEmail = localStorage.getItem('supabase_rate_limit_email')
      
      if (rateLimitTimestamp && rateLimitEmail) {
        const timeSinceRateLimit = Date.now() - parseInt(rateLimitTimestamp)
        const hoursWaited = timeSinceRateLimit / (1000 * 60 * 60)
        
        if (hoursWaited < 2) {
          const remainingMinutes = Math.ceil((2 * 60) - (timeSinceRateLimit / (1000 * 60)))
          setRateLimitInfo({
            active: true,
            remainingMinutes,
            email: rateLimitEmail
          })
        } else {
          // Limpar rate limit expirado
          localStorage.removeItem('supabase_rate_limit_timestamp')
          localStorage.removeItem('supabase_rate_limit_email')
          setRateLimitInfo(null)
        }
      } else {
        setRateLimitInfo(null)
      }
    }

    checkRateLimit()
    const interval = setInterval(checkRateLimit, 60000) // Verificar a cada minuto

    return () => clearInterval(interval)
  }, [])

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const forgotPasswordForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const handleLogin = async (data: LoginForm) => {
    setLoading(true)
    try {
      console.log('🔄 Tentando fazer login:', {
        email: data.email,
        environment: window.location.hostname !== 'localhost' ? 'production' : 'development'
      })

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        console.error('❌ Login Error:', error)
        
        // Tratar diferentes tipos de erro
        if (error.message?.includes('Invalid login credentials')) {
          showAuthError('invalid-credentials')
          return
        }
        
        if (error.message?.includes('Email not confirmed')) {
          showAuthError('email-not-confirmed')
          setShowResendConfirmation(true)
          setResendEmail(data.email)
          return
        }
        
        if (error.message?.includes('Too many requests')) {
          showAuthError('too-many-requests')
          return
        }
        
        if (error.message?.includes('User not found')) {
          showAuthError('user-not-found')
          return
        }
        
        // Erro de banco de dados
        if (error.message?.includes('Database error granting user') || 
            error.message?.includes('relation "users" does not exist') ||
            error.message?.includes('relation "profiles" does not exist')) {
          console.error('🔧 Erro de banco de dados detectado - executando correção...')
          
          try {
            // Tentar corrigir via API
            const fixResponse = await fetch('/api/auth/fix-database', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            })
            
            if (fixResponse.ok) {
              console.log('✅ Correção aplicada, tentando login novamente...')
              // Tentar login novamente após correção
              const retryResult = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
              })
              
              if (!retryResult.error) {
                console.log('✅ Login bem-sucedido após correção!')
                
                // Continuar com o fluxo normal
                if (retryResult.data.user) {
                  const adminEmails = ['armazemsaojoaquimoficial@gmail.com']
                  const isUserAdmin = adminEmails.includes(retryResult.data.user.email || '')
                  
                  showLoginSuccess(isUserAdmin)
                  
                  if (isUserAdmin) {
                    window.location.href = `/${locale}/admin`
                    return
                  } else {
                    router.push(`/${locale}`)
                    return
                  }
                }
              }
            }
          } catch (fixError) {
            console.error('❌ Erro ao tentar corrigir banco:', fixError)
          }
          
          showAuthError('database-error', 'Problema no banco de dados. Entre em contato com o suporte.')
          return
        }
        
        // Erro de URL não configurada (desenvolvimento)
        if (error.message?.includes('redirect_uri_mismatch') || 
            error.message?.includes('invalid redirect uri') ||
            error.message?.includes('redirect_uri')) {
          console.error('🔧 Erro de URL não configurada detectado...')
          
          const isDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1'
          
          if (isDevelopment) {
            console.error('⚠️  localhost:3000 não está configurado no Supabase')
            showAuthError('url-config-error', 
              'URL de desenvolvimento não configurada. Execute: node scripts/fix-supabase-urls.js')
            return
          } else {
            showAuthError('url-config-error', 'Erro de configuração de URL. Entre em contato com o suporte.')
            return
          }
        }
        
        // Erro genérico
        showAuthError('server-error', error.message)
        return
      }

      if (authData.user) {
        console.log('✅ Login realizado com sucesso!')
        
        // Verificar se o usuário é admin baseado no email
        const adminEmails = ['armazemsaojoaquimoficial@gmail.com']
        const isUserAdmin = adminEmails.includes(authData.user.email || '')
        
        showLoginSuccess(isUserAdmin)
        
        // Limpar dados de registro recente
        localStorage.removeItem('recent_registration_email')
        
        // Aguardar um pouco para garantir que a sessão seja propagada para o servidor
        console.log('⏳ Aguardando propagação da sessão...')
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        if (isUserAdmin) {
          console.log('🔐 Usuário admin detectado, redirecionando para /admin')
          // Usar window.location.href para forçar uma nova requisição e garantir sincronização
          window.location.href = `/${locale}/admin`
          return
        } else {
          router.push(`/${locale}`)
        }
      }

    } catch (error) {
      console.error('❌ Erro inesperado no login:', error)
      showAuthError('network-error', 'Tente novamente em alguns instantes.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (data: RegisterForm) => {
    setLoading(true)
    
    // Iniciar progresso
    showProgress('creating', 'Preparando sua conta...', 10)
    
    try {
      // Verificar rate limit ativo
      const rateLimitTimestamp = localStorage.getItem('supabase_rate_limit_timestamp')
      const rateLimitEmail = localStorage.getItem('supabase_rate_limit_email')
      
      if (rateLimitTimestamp) {
        const timeSinceRateLimit = Date.now() - parseInt(rateLimitTimestamp)
        const hoursWaited = timeSinceRateLimit / (1000 * 60 * 60)
        
        // Se ainda não passou 2 horas e é o mesmo email
        if (hoursWaited < 2 && rateLimitEmail === data.email) {
          const remainingMinutes = Math.ceil((2 * 60) - (timeSinceRateLimit / (1000 * 60)))
          hideProgress()
          showAuthError('too-many-requests', `Aguarde mais ${remainingMinutes} minutos ou use um email diferente.`)
          setLoading(false)
          return
        }
        
        // Se passou 2 horas, limpar o rate limit
        if (hoursWaited >= 2) {
          localStorage.removeItem('supabase_rate_limit_timestamp')
          localStorage.removeItem('supabase_rate_limit_email')
        }
      }

      console.log('🔄 Tentando registrar usuário:', {
        email: data.email,
        name: data.name,
        environment: window.location.hostname !== 'localhost' ? 'production' : 'development'
      })

      // Atualizar progresso - criando conta
      showProgress('creating', 'Criando sua conta...', 30)

      // SEMPRE usar signup público para garantir verificação por email
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            name: data.name
          }
        }
      })

      // Atualizar progresso - processando
      showProgress('sending', 'Processando cadastro...', 60)

      if (error) {
        console.error('❌ Registration Error:', error)
        
        // Tratar rate limit específico do Supabase Auth
        if (error.status === 429 || error.message?.includes('rate limit')) {
          console.log('🚫 Rate limit detectado:', error.message)
          
          // Verificar se é rate limit de email
          if (error.message?.includes('email rate limit')) {
            console.log('🔄 Tentando bypass via Admin API...')
            
            try {
              // Tentar bypass usando Admin API
              const bypassResponse = await fetch('/api/auth/signup-bypass', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: data.email,
                  password: data.password,
                  userData: {
                    full_name: data.name,
                    name: data.name
                  }
                })
              })

              const bypassResult = await bypassResponse.json()

              if (bypassResult.success) {
                console.log('✅ Bypass bem-sucedido via Admin API')
                
                if (bypassResult.requiresManualActivation) {
                  showAuthWarning('Devido ao rate limit, entre em contato conosco para ativar sua conta.', '🎯 Conta criada!')
                } else {
                  showRegistrationSuccess(true)
                  
                  // Salvar email para facilitar detecção no login
                  localStorage.setItem('recent_registration_email', data.email)
                  
                  // Mudar para tela de login após 3 segundos
                  setTimeout(() => {
                    setIsLogin(true)
                    registerForm.reset()
                  }, 3000)
                }
                return
              } else {
                console.error('❌ Bypass falhou:', bypassResult.error)
              }
            } catch (bypassError) {
              console.error('❌ Erro no bypass:', bypassError)
            }

            // Se bypass falhou, mostrar mensagem original
            showAuthError('email-rate-limit', 'Aguarde 1-2 horas antes de tentar novamente ou use um email diferente.')
            
            // Salvar timestamp do rate limit
            localStorage.setItem('supabase_rate_limit_timestamp', Date.now().toString())
            localStorage.setItem('supabase_rate_limit_email', data.email)
            
            return
          } else {
            showAuthError('too-many-requests')
            return
          }
        }

        // Outros erros
        if (error.message?.includes('User already registered')) {
          showAuthError('user-exists', 'Tente fazer login ou use a opção "Esqueci minha senha".')
          return
        }

        showAuthError('server-error', error.message)
        return
      }

      if (authData.user) {
        console.log('✅ Usuário registrado com sucesso!')
        
        // Verificar se precisa de confirmação
        if (!authData.session) {
          showRegistrationSuccess(true)
          
          // Salvar email para facilitar detecção no login
          localStorage.setItem('recent_registration_email', data.email)
          
          // Mudar para tela de login após 3 segundos
          setTimeout(() => {
            setIsLogin(true)
            registerForm.reset()
          }, 3000)
        } else {
          // Login automático se não precisar de confirmação
          const adminEmails = ['armazemsaojoaquimoficial@gmail.com']
          const isUserAdmin = adminEmails.includes(authData.user.email || '')
          
          showRegistrationSuccess(false)
          
          // Aguardar um pouco para garantir que a sessão seja propagada para o servidor
          console.log('⏳ Aguardando propagação da sessão após registro...')
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          if (isUserAdmin) {
            console.log('🔐 Usuário admin detectado, redirecionando para /admin')
            // Usar window.location.href para forçar uma nova requisição e garantir sincronização
            window.location.href = `/${locale}/admin`
            return
          } else {
            router.push(`/${locale}`)
          }
        }
      }

    } catch (error) {
      console.error('❌ Erro inesperado no registro:', error)
      showToast('error', 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      console.log('🔄 Iniciando Google OAuth...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/${locale}/auth/callback`
        }
      })

      if (error) {
        console.error('❌ Google OAuth Error:', error)
        showToast('error', `Erro no login com Google: ${error.message}`)
        return
      }

      console.log('✅ Google OAuth iniciado com sucesso')
      showOAuthSuccess()
      // O redirecionamento acontece automaticamente
      
    } catch (error: any) {
      console.error('❌ Erro inesperado no Google OAuth:', error)
      showAuthError('server-error', 'Erro inesperado no login com Google. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!resendEmail) {
      showToast('error', 'Email não especificado para reenvio')
      return
    }

    try {
      setLoading(true)
      console.log('🔄 Reenviando email de confirmação para:', resendEmail)
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/${locale}/auth/callback`
        }
      })

      if (error) {
        console.error('❌ Erro ao reenviar confirmação:', error)
        
        if (error.message?.includes('rate limit')) {
          showAuthError('rate-limit', 'Limite de reenvio atingido. Aguarde alguns minutos.')
        } else {
          showAuthError('server-error', `Erro ao reenviar email: ${error.message}`)
        }
        return
      }

      console.log('✅ Email de confirmação reenviado!')
      showEmailResendSuccess()
      
      setShowResendConfirmation(false)
      localStorage.removeItem('recent_registration_email')
      
    } catch (error) {
      console.error('❌ Erro inesperado ao reenviar email:', error)
      showToast('error', 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (data: ForgotPasswordForm) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/${locale}/auth/callback?type=recovery`,
      })

      if (error) {
        showAuthError('server-error', `Erro ao enviar email de recuperação: ${error.message}`)
      } else {
        showPasswordResetSuccess()
        setShowForgotPassword(false)
        forgotPasswordForm.reset()
      }
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error)
      showAuthError('network-error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Background pattern com z-index baixo */}
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Container principal com padding adequado para compensar header fixo */}
      <div className="relative z-10 pt-32 pb-8 px-4 min-h-screen">
        <div className="flex items-center justify-center min-h-[calc(100vh-6rem)]">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-6 pt-8">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <img src="/images/logo-optimized.jpg" alt="Armazém São Joaquim" className="w-full h-full object-contain rounded-full shadow-lg" />
                </div>
                
                <h1 className="font-playfair text-3xl font-bold text-amber-900 mb-2">
                  Armazém São Joaquim
                </h1>
                <h2 className="font-playfair text-xl font-semibold text-amber-800 mb-3">
                  {showForgotPassword ? 'Recuperar Senha' : (isLogin ? 'Bem-vindo de volta!' : 'Junte-se a nós')}
                </h2>
                <p className="text-amber-700/80 text-sm leading-relaxed">
                  {showForgotPassword 
                    ? 'Insira seu email para receber o link de recuperação'
                    : (isLogin 
                      ? 'Acesse sua conta para fazer reservas e acompanhar seu histórico' 
                      : 'Crie sua conta e faça parte da nossa história gastronômica'
                    )
                  }
                </p>
              </CardHeader>

              <CardContent className="space-y-6 px-8 pb-8">
                <Button
                  variant="outline"
                  className="w-full border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-amber-800 font-medium py-3"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-amber-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-amber-600 font-medium">ou continue com email</span>
                  </div>
                </div>

                {/* Rate Limit Warning */}
                {rateLimitInfo?.active && !isLogin && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0">⏰</div>
                      <div className="text-sm text-red-800">
                        <p className="font-medium mb-1">Limite de cadastros atingido</p>
                        <p className="text-red-700 mb-2">
                          Email <code className="bg-red-100 px-1 rounded">{rateLimitInfo.email}</code> está em rate limit.
                        </p>
                        <p className="text-red-700">
                          ⏳ Aguarde <strong>{rateLimitInfo.remainingMinutes} minutos</strong> ou use um email diferente.
                        </p>
                        <p className="text-red-600 text-xs mt-1">
                          Este limite é do Supabase para prevenir spam de emails.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {showForgotPassword ? (
                  <form onSubmit={forgotPasswordForm.handleSubmit(handlePasswordReset)} className="space-y-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="forgot-email" className="text-sm font-medium text-madeira-escura">E-mail</label>
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="seu@email.com"
                          aria-invalid={forgotPasswordForm.formState.errors.email ? "true" : "false"}
                          {...forgotPasswordForm.register('email')}
                          className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                        />
                        {forgotPasswordForm.formState.errors.email && (
                          <span role="alert" className="text-sm text-red-600">
                            {forgotPasswordForm.formState.errors.email.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 shadow-lg"
                      disabled={loading}
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(false)
                          forgotPasswordForm.reset()
                        }}
                        className="text-amber-600 hover:text-amber-700 font-medium transition-colors text-sm"
                      >
                        ← Voltar ao login
                      </button>
                    </div>
                  </form>
                ) : isLogin ? (
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-madeira-escura">E-mail</label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          aria-invalid={loginForm.formState.errors.email ? "true" : "false"}
                          {...loginForm.register('email')}
                          className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                        />
                        {loginForm.formState.errors.email && (
                          <span role="alert" className="text-sm text-red-600">
                            {loginForm.formState.errors.email.message}
                          </span>
                        )}
                      </div>
                      
                      <div className="relative space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-madeira-escura">Senha</label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Sua senha"
                            aria-invalid={loginForm.formState.errors.password ? "true" : "false"}
                            {...loginForm.register('password')}
                            className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-700"
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <span role="alert" className="text-sm text-red-600">
                            {loginForm.formState.errors.password.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                      >
                        Esqueci minha senha
                      </button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 shadow-lg"
                      disabled={loading}
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      {loading ? 'Entrando...' : 'Entrar na minha conta'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-madeira-escura">Nome completo</label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Seu nome completo"
                          aria-invalid={registerForm.formState.errors.name ? "true" : "false"}
                          {...registerForm.register('name')}
                          className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                        />
                        {registerForm.formState.errors.name && (
                          <span role="alert" className="text-sm text-red-600">
                            {registerForm.formState.errors.name.message}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-madeira-escura">E-mail</label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          aria-invalid={registerForm.formState.errors.email ? "true" : "false"}
                          {...registerForm.register('email')}
                          className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                        />
                        {registerForm.formState.errors.email && (
                          <span role="alert" className="text-sm text-red-600">
                            {registerForm.formState.errors.email.message}
                          </span>
                        )}
                      </div>
                      
                      <div className="relative space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-madeira-escura">Senha</label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Crie uma senha segura"
                            aria-invalid={registerForm.formState.errors.password ? "true" : "false"}
                            {...registerForm.register('password')}
                            className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-700"
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {registerForm.formState.errors.password && (
                          <span role="alert" className="text-sm text-red-600">
                            {registerForm.formState.errors.password.message}
                          </span>
                        )}
                      </div>
                      
                      <div className="relative space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-madeira-escura">Confirmar senha</label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirme sua senha"
                            aria-invalid={registerForm.formState.errors.confirmPassword ? "true" : "false"}
                            {...registerForm.register('confirmPassword')}
                            className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-700"
                            aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {registerForm.formState.errors.confirmPassword && (
                          <span role="alert" className="text-sm text-red-600">
                            {registerForm.formState.errors.confirmPassword.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium mb-1">Seus dados estão seguros</p>
                          <p className="text-amber-700">Utilizamos criptografia avançada para proteger suas informações pessoais.</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 shadow-lg"
                      disabled={loading || (rateLimitInfo?.active && rateLimitInfo.email === registerForm.watch('email'))}
                    >
                      <User className="w-5 h-5 mr-2" />
                      {loading ? 'Criando conta...' : 'Criar minha conta'}
                    </Button>
                  </form>
                )}

                {!showForgotPassword && (
                  <div className="text-center pt-6 border-t border-amber-100">
                    <p className="text-sm text-amber-700">
                      {isLogin ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin)
                        setShowResendConfirmation(false)
                        setShowForgotPassword(false)
                        loginForm.reset()
                        registerForm.reset()
                        forgotPasswordForm.reset()
                      }}
                      className="mt-2 text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                    >
                      {isLogin ? 'Criar nova conta' : 'Fazer login'}
                    </button>
                  </div>
                )}

                {/* Resend Confirmation */}
                {showResendConfirmation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-center space-y-4">
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Não recebeu o email de confirmação?</p>
                        <p className="text-blue-700">Email: <code className="bg-blue-100 px-1 rounded">{resendEmail}</code></p>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                        onClick={handleResendConfirmation}
                        disabled={loading}
                      >
                        {loading ? 'Reenviando...' : 'Reenviar Email de Confirmação'}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowResendConfirmation(false)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mt-6">
                    <h3 className="font-semibold text-amber-900 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-amber-600" />
                      Benefícios da sua conta
                    </h3>
                    <ul className="space-y-2 text-sm text-amber-800">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mr-3"></div>
                        Faça reservas de forma rápida e fácil
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mr-3"></div>
                        Acompanhe o histórico das suas visitas
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mr-3"></div>
                        Receba ofertas especiais e novidades
                      </li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
