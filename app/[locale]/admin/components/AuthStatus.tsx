'use client'

import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { RefreshCw, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export default function AuthStatus() {
  const { isAuthenticated, isLoading, error, refreshSession } = useAdminApi()

  if (isLoading) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertTitle>Verificando autenticação...</AlertTitle>
        <AlertDescription>
          Aguarde enquanto verificamos sua sessão.
        </AlertDescription>
      </Alert>
    )
  }

  if (!isAuthenticated) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Erro de autenticação</AlertTitle>
        <AlertDescription className="text-red-700">
          <div className="space-y-2">
            <p>{error || 'Sua sessão expirou ou não foi encontrada.'}</p>
            <Button
              onClick={refreshSession}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar renovar sessão
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Autenticado</AlertTitle>
      <AlertDescription className="text-green-700">
        <div className="flex items-center justify-between">
          <span>Sua sessão está ativa e válida.</span>
          <Shield className="h-4 w-4" />
        </div>
      </AlertDescription>
    </Alert>
  )
}
