'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { Card, CardContent, CardHeader } from '../../../components/ui/Card'
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Label } from '../../../components/ui/Label'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useRouter()
  // supabase client já importado

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsValidSession(true)
      } else {
        toast.error('Sessão inválida. Solicite um novo link de redefinição.')
        router.push('/auth')
      }
    }

    checkSession()
  }, [router])

  const handlePasswordReset: SubmitHandler<ResetPasswordForm> = async (data) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      })

      if (error) {
        toast.error(`Erro ao redefinir senha: ${error.message}`)
      } else {
        toast.success('Senha redefinida com sucesso! Você será redirecionado.')
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error)
      toast.error('Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-700">Verificando sessão...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 pt-20 pb-8 px-4 min-h-screen">
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
                  Nova Senha
                </h2>
                <p className="text-amber-700/80 text-sm leading-relaxed">
                  Defina uma nova senha segura para sua conta
                </p>
              </CardHeader>

              <CardContent className="space-y-6 px-8 pb-8">
                <form onSubmit={form.handleSubmit(handlePasswordReset)} className="space-y-5">
                  <div className="space-y-4">
                    <div className="relative space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-madeira-escura">Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua nova senha"
                          aria-invalid={form.formState.errors.password ? "true" : "false"}
                          {...form.register('password')}
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
                      {form.formState.errors.password && (
                        <span role="alert" className="text-sm text-red-600">
                          {form.formState.errors.password.message}
                        </span>
                      )}
                    </div>
                    
                    <div className="relative space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-madeira-escura">Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme sua nova senha"
                          aria-invalid={form.formState.errors.confirmPassword ? "true" : "false"}
                          {...form.register('confirmPassword')}
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
                      {form.formState.errors.confirmPassword && (
                        <span role="alert" className="text-sm text-red-600">
                          {form.formState.errors.confirmPassword.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium mb-1">Dicas para uma senha segura</p>
                        <ul className="space-y-1 text-amber-700">
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mr-2"></div>
                            Pelo menos 6 caracteres
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mr-2"></div>
                            Combine letras, números e símbolos
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 shadow-lg"
                    disabled={loading}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                  </Button>
                </form>

                <div className="text-center pt-6 border-t border-amber-100">
                  <button
                    type="button"
                    onClick={() => router.push('/auth')}
                    className="text-amber-600 hover:text-amber-700 font-medium transition-colors text-sm"
                  >
                    ← Voltar ao login
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 