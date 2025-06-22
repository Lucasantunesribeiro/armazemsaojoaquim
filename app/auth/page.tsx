'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '../../components/providers/SupabaseProvider'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Mail, User, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react'
import OptimizedImage from '@/components/ui/OptimizedImage'

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

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [rateLimitInfo, setRateLimitInfo] = useState<{active: boolean, remainingMinutes: number, email: string} | null>(null)
  const { supabase } = useSupabase()
  const router = useRouter()

  // Verificar se há erro na URL
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    if (error) {
      toast.error(`Erro de autenticação: ${decodeURIComponent(error)}`)
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
          // Rate limit expirado
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

  const handleLogin = async (data: LoginForm) => {
    setLoading(true)
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        console.error('❌ Login Error:', error)
        
        // Tratar erro de email não confirmado
        if (error.message?.includes('Email not confirmed')) {
          toast.error('Email não confirmado! Verifique sua caixa de entrada e clique no link de confirmação.')
          setShowResendConfirmation(true)
          return
        }
        
        // Tratar erro de credenciais inválidas (pode ser conta não confirmada)
        if (error.message?.includes('Invalid login credentials')) {
          // Verificar se é uma conta recém-criada que precisa de confirmação
          const recentRegistration = localStorage.getItem('recent_registration_email')
          if (recentRegistration === data.email) {
            toast.error('Conta criada mas não confirmada! Verifique seu email ou reenvie a confirmação.')
            setShowResendConfirmation(true)
            setResendEmail(data.email)
            return
          }
          
          toast.error('Email ou senha incorretos. Verifique suas credenciais e tente novamente.')
          return
        }
        
        toast.error('Erro no login. Tente novamente.')
        return
      }

      toast.success('Login realizado com sucesso!')
      router.push('/')
    } catch (error) {
      console.error('Unexpected Login Error:', error)
      toast.error('Erro inesperado ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (data: RegisterForm) => {
    setLoading(true)
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
          toast.error(`⏰ Rate limit ainda ativo!\n\nAguarde mais ${remainingMinutes} minutos ou use um email diferente.`)
          setLoading(false)
          return
        }
        
        // Limpar rate limit expirado
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
                  toast.success('🎯 Conta criada com sucesso!\n\nDevido ao rate limit, entre em contato conosco para ativar sua conta.')
                } else {
                  toast.success('🎯 Conta criada via sistema alternativo!\n\nVerifique seu email para confirmar.')
                  
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
            toast.error(`📧 Limite de emails atingido!\n\n• Aguarde 1-2 horas antes de tentar novamente\n• Use um email diferente se urgente\n• Este é um limite do Supabase para prevenir spam`)
            
            // Salvar timestamp do rate limit
            localStorage.setItem('supabase_rate_limit_timestamp', Date.now().toString())
            localStorage.setItem('supabase_rate_limit_email', data.email)
            
            return
          } else {
            toast.error('⏰ Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.')
            return
          }
        }
        
        // Tratar erro 500 SMTP
        if (error.message?.includes('Error sending') || error.status === 500) {
          toast.error('📧 Problema no envio do email de confirmação. Verifique se o SMTP está configurado corretamente no Supabase.')
          return
        }
        
        // Outros erros
        toast.error(`Erro no cadastro: ${error.message}`)
        return
      }

      // Sucesso - sempre exigir verificação por email
      if (authData.user && !authData.user.email_confirmed_at) {
        console.log('✅ Registro bem-sucedido - aguardando confirmação por email')
        
        // Salvar email para facilitar detecção no login
        localStorage.setItem('recent_registration_email', data.email)
        
        toast.success('📧 Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.')
        
        // Mudar para tela de login após 3 segundos
        setTimeout(() => {
          setIsLogin(true)
          registerForm.reset()
        }, 3000)
      } else if (authData.user && authData.user.email_confirmed_at) {
        // Email já confirmado (não deveria acontecer com SMTP configurado)
        console.log('⚠️ Email já confirmado automaticamente')
        toast.success('🎉 Bem-vindo! Sua conta foi criada e confirmada.')
        localStorage.removeItem('recent_registration_email')
        setTimeout(() => router.push('/'), 2000)
      } else {
        toast.error('❌ Erro inesperado no cadastro. Tente novamente.')
      }

    } catch (error) {
      console.error('❌ Unexpected registration error:', error)
      toast.error('❌ Erro inesperado. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const isProduction = window.location.hostname !== 'localhost'
      const redirectUrl = isProduction 
        ? 'https://armazemsaojoaquim.netlify.app/auth/callback'
        : `${window.location.origin}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('Google OAuth Error:', error)
        toast.error(`Erro ao fazer login com Google: ${error.message}`)
      }
    } catch (error: any) {
      console.error('Unexpected Google OAuth Error:', error)
      toast.error('Erro inesperado ao fazer login com Google')
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!resendEmail) {
      toast.error('Email não especificado para reenvio')
      return
    }

    try {
      setLoading(true)
      console.log('📧 Reenviando email de confirmação para:', resendEmail)
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('❌ Erro ao reenviar email:', error)
        if (error.status === 429) {
          toast.error('⏰ Aguarde alguns minutos antes de solicitar um novo email.')
        } else {
          toast.error(`Erro ao reenviar email: ${error.message}`)
        }
      } else {
        toast.success('📧 Email de confirmação reenviado! Verifique sua caixa de entrada.')
        setShowResendConfirmation(false)
        localStorage.removeItem('recent_registration_email')
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao reenviar email:', error)
      toast.error('❌ Erro inesperado. Tente novamente.')
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
      <div className="relative z-10 pt-28 pb-8 px-4 min-h-screen">
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-6 pt-8">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <OptimizedImage
                    src="/images/logo-optimized.jpg"
                    alt="Armazém São Joaquim"
                    fill
                    sizes="80px"
                    className="transition-opacity duration-300 opacity-100 object-contain rounded-full shadow-lg"
                    priority
                  />
                </div>
                
                <h1 className="font-playfair text-3xl font-bold text-amber-900 mb-2">
                  Armazém São Joaquim
                </h1>
                <h2 className="font-playfair text-xl font-semibold text-amber-800 mb-3">
                  {isLogin ? 'Bem-vindo de volta!' : 'Junte-se a nós'}
                </h2>
                <p className="text-amber-700/80 text-sm leading-relaxed">
                  {isLogin 
                    ? 'Acesse sua conta para fazer reservas e acompanhar seu histórico' 
                    : 'Crie sua conta e faça parte da nossa história gastronômica'
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

                {isLogin ? (
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                    <div className="space-y-4">
                      <Input
                        label="E-mail"
                        type="email"
                        placeholder="seu@email.com"
                        {...loginForm.register('email')}
                        error={loginForm.formState.errors.email?.message}
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                      />
                      
                      <div className="relative">
                        <Input
                          label="Senha"
                          type={showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          {...loginForm.register('password')}
                          error={loginForm.formState.errors.password?.message}
                          className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-9 text-amber-600 hover:text-amber-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 shadow-lg"
                      loading={loading}
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Entrar na minha conta
                    </Button>

                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resendingEmail}
                      className="w-full text-sm text-amber-600 hover:text-amber-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {resendingEmail ? 'Reenviando...' : 'Reenviar email de confirmação'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
                    <div className="space-y-4">
                      <Input
                        label="Nome completo"
                        type="text"
                        placeholder="Seu nome completo"
                        {...registerForm.register('name')}
                        error={registerForm.formState.errors.name?.message}
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                      />
                      
                      <Input
                        label="E-mail"
                        type="email"
                        placeholder="seu@email.com"
                        {...registerForm.register('email')}
                        error={registerForm.formState.errors.email?.message}
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                      />
                      
                      <div className="relative">
                        <Input
                          label="Senha"
                          type={showPassword ? "text" : "password"}
                          placeholder="Crie uma senha segura"
                          {...registerForm.register('password')}
                          error={registerForm.formState.errors.password?.message}
                          className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-9 text-amber-600 hover:text-amber-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      <div className="relative">
                        <Input
                          label="Confirmar senha"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme sua senha"
                          {...registerForm.register('confirmPassword')}
                          error={registerForm.formState.errors.confirmPassword?.message}
                          className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-9 text-amber-600 hover:text-amber-700"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
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
                      variant="primary"
                      size="lg"
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 shadow-lg"
                      loading={loading}
                    >
                      <User className="w-5 h-5 mr-2" />
                      Criar minha conta
                    </Button>
                  </form>
                )}

                <div className="text-center pt-6 border-t border-amber-100">
                  <p className="text-sm text-amber-700">
                    {isLogin ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="mt-2 text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                  >
                    {isLogin ? 'Criar nova conta' : 'Fazer login'}
                  </button>
                </div>

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

                {/* Seção de Reenvio de Confirmação */}
                {showResendConfirmation && (
                  <Card className="w-full max-w-md mx-auto mt-4">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="text-sm text-muted-foreground">
                          <p>Não recebeu o email de confirmação?</p>
                          <p className="text-xs mt-1">Email: {resendEmail || 'N/A'}</p>
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
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
                        >
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}