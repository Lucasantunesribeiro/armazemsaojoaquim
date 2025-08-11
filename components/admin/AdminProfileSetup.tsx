'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'

interface AdminProfileSetupProps {
  onComplete?: () => void
}

export default function AdminProfileSetup({ onComplete }: AdminProfileSetupProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'checking' | 'needs_setup' | 'setting_up' | 'complete' | 'error'>('checking')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkAdminProfile()
  }, [])

  const checkAdminProfile = async () => {
    try {
      setStatus('checking')
      const supabase = createClient()
      
      // Verificar usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || user.email !== 'armazemsaojoaquimoficial@gmail.com') {
        setStatus('error')
        setError('Usuário não é admin')
        return
      }

      // Verificar se já tem perfil admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        setStatus('complete')
        setMessage('Perfil admin já configurado')
        onComplete?.()
      } else if (profileError?.code === 'PGRST116') {
        // Perfil não encontrado
        setStatus('needs_setup')
        setMessage('Perfil admin precisa ser configurado')
      } else {
        // Perfil existe mas não é admin
        setStatus('needs_setup')
        setMessage('Perfil precisa ser atualizado para admin')
      }
    } catch (error) {
      console.error('Erro ao verificar perfil admin:', error)
      setStatus('error')
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const setupAdminProfile = async () => {
    try {
      setStatus('setting_up')
      setLoading(true)
      
      const response = await fetch('/api/admin/setup-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setStatus('complete')
        setMessage(data.message)
        onComplete?.()
      } else {
        setStatus('error')
        setError(data.error || 'Erro ao configurar perfil')
      }
    } catch (error) {
      console.error('Erro ao configurar perfil:', error)
      setStatus('error')
      setError(error instanceof Error ? error.message : 'Erro de rede')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Verificando perfil admin...</p>
        </div>
      </div>
    )
  }

  if (status === 'complete') {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <CheckCircle className="h-8 w-8 mx-auto mb-4 text-green-600" />
          <p className="text-green-700 dark:text-green-300">{message}</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mr-2" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Erro na Configuração</h3>
        </div>
        <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
        <Button 
          onClick={checkAdminProfile}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          Tentar Novamente
        </Button>
      </div>
    )
  }

  if (status === 'needs_setup') {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-2" />
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Configuração Necessária</h3>
        </div>
        <p className="text-yellow-700 dark:text-yellow-300 mb-4">{message}</p>
        <Button 
          onClick={setupAdminProfile}
          disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Configurando...
            </>
          ) : (
            'Configurar Perfil Admin'
          )}
        </Button>
      </div>
    )
  }

  if (status === 'setting_up') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Configurando perfil admin...</p>
        </div>
      </div>
    )
  }

  return null
}





