'use client'

import { useAdmin } from '@/hooks/useAdmin'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { useState, useEffect } from 'react'

export default function TestAdminSystem() {
  const adminState = useAdmin()
  const { makeRequest, isAuthorized } = useAdminApi()
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testBlogEndpoint = async () => {
    if (!isAuthorized) {
      setError('Não autorizado - usuário não é admin')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      console.log('🚀 Testando endpoint /blog/posts...')
      const data = await makeRequest('/blog/posts')
      setBlogPosts(data.posts || [])
      console.log('✅ Dados recebidos:', data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('❌ Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthorized && blogPosts.length === 0) {
      testBlogEndpoint()
    }
  }, [isAuthorized])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Teste do Sistema Admin</h1>
      
      {/* Status do Admin */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Status de Autenticação Admin:</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Loading:</strong> {adminState.loading ? '✅ Sim' : '❌ Não'}
          </div>
          <div>
            <strong>É Admin:</strong> {adminState.isAdmin ? '✅ Sim' : '❌ Não'}
          </div>
          <div>
            <strong>Tem Perfil:</strong> {adminState.hasProfile ? '✅ Sim' : '❌ Não'}
          </div>
          <div>
            <strong>Autorizado:</strong> {isAuthorized ? '✅ Sim' : '❌ Não'}
          </div>
          <div>
            <strong>Usuário:</strong> {adminState.user?.email || 'Nenhum'}
          </div>
          <div>
            <strong>Método:</strong> {adminState.verificationMethod || 'N/A'}
          </div>
        </div>
        {adminState.error && (
          <div className="mt-3 text-red-600 text-sm">
            <strong>Erro:</strong> {adminState.error}
          </div>
        )}
      </div>

      {/* Teste do Endpoint */}
      <div className="bg-white border p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Teste do Endpoint /api/admin/blog/posts:</h2>
        
        <button
          onClick={testBlogEndpoint}
          disabled={!isAuthorized || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
        >
          {loading ? 'Carregando...' : 'Testar Endpoint'}
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {blogPosts.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Posts encontrados ({blogPosts.length}):</h3>
            <div className="max-h-64 overflow-y-auto">
              {blogPosts.map((post, index) => (
                <div key={post.id || index} className="border-b py-2 text-sm">
                  <div><strong>Título PT:</strong> {post.title_pt}</div>
                  <div><strong>Título EN:</strong> {post.title_en}</div>
                  <div><strong>Status:</strong> {post.published ? 'Publicado' : 'Rascunho'}</div>
                  <div><strong>Data:</strong> {new Date(post.created_at).toLocaleString('pt-BR')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {blogPosts.length === 0 && !loading && !error && (
          <div className="text-gray-500 text-sm">
            Nenhum post encontrado.
          </div>
        )}
      </div>
    </div>
  )
}