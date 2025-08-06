'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { use } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Shield, ArrowLeft } from 'lucide-react'

interface UnauthorizedPageProps {
  params: Promise<{ locale: string }>
}

export default function UnauthorizedPage({ params }: UnauthorizedPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [locale, setLocale] = useState<string>('pt')
  const [message, setMessage] = useState<string>('')

  // Desempacotar params usando React.use()
  const resolvedParams = use(params)
  
  useEffect(() => {
    setLocale(resolvedParams.locale || 'pt')
  }, [resolvedParams.locale])

  useEffect(() => {
    const urlMessage = searchParams.get('message')
    if (urlMessage) {
      setMessage(decodeURIComponent(urlMessage))
    }
  }, [searchParams])

  const handleGoBack = () => {
    router.push(`/${locale}`)
  }

  const handleLogin = () => {
    router.push(`/${locale}/auth`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
      <div className="relative z-10 pt-32 pb-8 px-4 min-h-screen">
        <div className="flex items-center justify-center min-h-[calc(100vh-6rem)]">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-6 pt-8">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-red-100 rounded-full">
                  <Shield className="w-10 h-10 text-red-600" />
                </div>
                
                <h1 className="font-playfair text-3xl font-bold text-red-900 mb-2">
                  Acesso Negado
                </h1>
                <h2 className="font-playfair text-xl font-semibold text-red-800 mb-3">
                  Você não tem permissão para esta área
                </h2>
                <p className="text-red-700/80 text-sm leading-relaxed">
                  {message || 'Esta área requer permissões especiais de administrador'}
                </p>
              </CardHeader>

              <CardContent className="space-y-6 px-8 pb-8">
                <div className="space-y-4">
                  <Button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 shadow-lg"
                  >
                    Fazer Login
                  </Button>
                  
                  <Button
                    onClick={handleGoBack}
                    variant="outline"
                    className="w-full border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-amber-800 font-medium py-3"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Voltar ao Início
                  </Button>
                </div>

                <div className="text-center pt-4 border-t border-amber-100">
                  <p className="text-sm text-amber-700">
                    Se você acredita que deveria ter acesso, entre em contato com o administrador.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}