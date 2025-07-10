'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'

export default function FixAdminPage() {
  const { user, loading } = useSupabase()
  const [fixing, setFixing] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const handleFixAdmin = async () => {
    setFixing(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/fix-admin-direct', {
        method: 'POST',
        credentials: 'include'
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setFixing(false)
    }
  }
  
  if (loading) {
    return <div className="p-8">Carregando...</div>
  }
  
  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Correção de Usuário Admin</h1>
        <p className="text-red-600">Você precisa estar logado para usar esta página.</p>
        <a href="/auth" className="text-blue-600 hover:underline">Fazer login</a>
      </div>
    )
  }
  
  if (user.email !== 'armazemsaojoaquimoficial@gmail.com') {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Correção de Usuário Admin</h1>
        <p className="text-red-600">Apenas o usuário admin pode acessar esta página.</p>
        <p className="text-sm text-gray-600 mt-2">Usuário atual: {user.email}</p>
      </div>
    )
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Correção de Usuário Admin</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-blue-800 mb-2">Informações do Usuário</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>ID:</strong> {user.id}</p>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-yellow-800 mb-2">⚠️ Sobre esta correção</h2>
        <p className="text-yellow-700 mb-2">
          Esta operação vai sincronizar seu usuário entre a tabela auth.users e public.users, 
          garantindo que o ID seja consistente para acesso admin.
        </p>
        <p className="text-yellow-700">
          Isso vai resolver o problema de redirecionamento para /auth quando você tenta acessar /admin.
        </p>
      </div>
      
      <button
        onClick={handleFixAdmin}
        disabled={fixing}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {fixing ? 'Corrigindo...' : 'Corrigir Usuário Admin'}
      </button>
      
      {result && (
        <div className={`mt-6 p-4 rounded-lg ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            result.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {result.success ? '✅ Correção realizada com sucesso!' : '❌ Erro na correção'}
          </h3>
          
          {result.success ? (
            <div className="text-green-700">
              <p><strong>Ação:</strong> {result.action === 'created' ? 'Usuário criado' : 
                result.action === 'updated' ? 'Usuário atualizado' : 
                result.action === 'user_synced' ? 'Usuário sincronizado' :
                result.action === 'cleared_old_user' ? 'Usuário antigo removido' : 'Concluído'}</p>
              
              {result.message && (
                <p className="mt-2 font-medium">{result.message}</p>
              )}
              
              {result.user && (
                <div className="mt-2">
                  <p><strong>ID:</strong> {result.user.id}</p>
                  <p><strong>Email:</strong> {result.user.email}</p>
                  <p><strong>Role:</strong> {result.user.role}</p>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-green-100 rounded">
                <p className="font-medium">Próximos passos:</p>
                {result.instructions ? (
                  <ul className="list-disc list-inside mt-2">
                    {result.instructions.map((instruction: string, index: number) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                ) : (
                  <>
                    <p>1. Tente acessar <a href="/admin" className="text-blue-600 hover:underline">/admin</a></p>
                    <p>2. Se ainda não funcionar, faça logout e login novamente</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-red-700">
              <p>{result.error}</p>
              {result.debug && (
                <div className="mt-2 p-3 bg-red-100 rounded text-sm">
                  <p className="font-medium">Debug Info:</p>
                  <pre>{JSON.stringify(result.debug, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}