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
import { Mail, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
        console.error('Login Error:', error)
        const errorMessage = typeof error === 'object' && error && 'message' in error 
          ? (error as any).message 
          : 'Authentication failed'
        
        if (errorMessage.includes('Email not confirmed')) {
          toast.error('Email não confirmado! Verifique sua caixa de entrada e clique no link de confirmação enviado de armazemsaojoaquimoficial@gmail.com')
        } else if (errorMessage.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos. Verifique suas credenciais e tente novamente.')
        } else {
          toast.error('Erro no login. Tente novamente.')
        }
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
      const redirectUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? `${window.location.origin}/auth/callback`
        : 'https://armazemsaojoaquim.netlify.app/auth/callback'

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
          emailRedirectTo: redirectUrl
        }
      })

      if (error) {
        console.error('Registration Error:', error)
        const errorMessage = typeof error === 'object' && error && 'message' in error 
          ? (error as any).message 
          : 'Registration failed'
        toast.error('Erro ao criar conta: ' + errorMessage)
      } else {
        const userConfirmed = authData.user && 'email_confirmed_at' in authData.user && (authData.user as any).email_confirmed_at
        if (authData.user && !userConfirmed) {
          toast.success('Conta criada! Verifique seu e-mail (armazemsaojoaquimoficial@gmail.com) para confirmar e ativar sua conta.')
        } else {
          toast.success('Conta criada e confirmada automaticamente!')
          router.push('/')
        }
        setIsLogin(true)
        registerForm.reset()
      }
    } catch (error) {
      console.error('Unexpected Registration Error:', error)
      toast.error('Erro inesperado ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const redirectUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? `${window.location.origin}/auth/callback`
        : 'https://armazemsaojoaquim.netlify.app/auth/callback'

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
        const errorMessage = typeof error === 'object' && error && 'message' in error 
          ? (error as any).message 
          : 'Google OAuth failed'
        toast.error('Erro ao fazer login com Google: ' + errorMessage)
      }
    } catch (error) {
      console.error('Unexpected Google OAuth Error:', error)
      toast.error('Erro inesperado ao fazer login com Google')
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    const email = loginForm.getValues('email')
    if (!email) {
      toast.error('Digite seu e-mail antes de reenviar a confirmação')
      return
    }

    setResendingEmail(true)
    try {
      const redirectUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? `${window.location.origin}/auth/callback`
        : 'https://armazemsaojoaquim.netlify.app/auth/callback'

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectUrl
        }
      })

      if (error) {
        console.error('Resend Confirmation Error:', error)
        const errorMessage = typeof error === 'object' && error && 'message' in error 
          ? (error as any).message 
          : 'Resend failed'
        toast.error('Erro ao reenviar confirmação: ' + errorMessage)
      } else {
        toast.success('Email de confirmação reenviado! Verifique sua caixa de entrada.')
      }
    } catch (error) {
      console.error('Unexpected Resend Error:', error)
      toast.error('Erro inesperado ao reenviar confirmação')
    } finally {
      setResendingEmail(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amarelo-armazem to-vermelho-portas flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-white mb-6 hover:text-white/80 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar ao site
        </Link>

        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-amarelo-armazem rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-madeira-escura font-bold text-2xl">A</span>
            </div>
            <h1 className="font-playfair text-2xl font-bold text-madeira-escura">
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </h1>
            <p className="text-cinza-medio">
              {isLogin 
                ? 'Acesse sua conta para fazer reservas' 
                : 'Crie sua conta e faça parte da nossa história'
              }
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Google Login */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cinza-claro" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-cinza-medio">ou</span>
              </div>
            </div>

            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="seu@email.com"
                  {...loginForm.register('email')}
                  error={loginForm.formState.errors.email?.message}
                />
                <Input
                  label="Senha"
                  type="password"
                  placeholder="Sua senha"
                  {...loginForm.register('password')}
                  error={loginForm.formState.errors.password?.message}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Entrar
                </Button>
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendingEmail}
                  className="w-full text-sm text-amarelo-armazem hover:text-vermelho-portas transition-colors disabled:opacity-50"
                >
                  {resendingEmail ? 'Reenviando...' : 'Reenviar email de confirmação'}
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <Input
                  label="Nome completo"
                  type="text"
                  placeholder="Seu nome"
                  {...registerForm.register('name')}
                  error={registerForm.formState.errors.name?.message}
                />
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="seu@email.com"
                  {...registerForm.register('email')}
                  error={registerForm.formState.errors.email?.message}
                />
                <Input
                  label="Senha"
                  type="password"
                  placeholder="Sua senha"
                  {...registerForm.register('password')}
                  error={registerForm.formState.errors.password?.message}
                />
                <Input
                  label="Confirmar senha"
                  type="password"
                  placeholder="Confirme sua senha"
                  {...registerForm.register('confirmPassword')}
                  error={registerForm.formState.errors.confirmPassword?.message}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                >
                  <User className="w-5 h-5 mr-2" />
                  Criar Conta
                </Button>
              </form>
            )}

            {/* Toggle Form */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-amarelo-armazem hover:text-vermelho-portas transition-colors font-medium"
              >
                {isLogin 
                  ? 'Não tem conta? Criar uma agora' 
                  : 'Já tem conta? Fazer login'
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}