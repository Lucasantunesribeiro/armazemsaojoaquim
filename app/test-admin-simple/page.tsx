import { requireAdmin } from '@/lib/auth/middleware'

export default async function SimpleAdminTest() {
  try {
    const session = await requireAdmin()
    
    return (
      <div className="min-h-screen bg-white p-8">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ✅ Teste Admin - SUCESSO!
        </h1>
        <div className="space-y-4">
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>User ID:</strong> {session.user.id}</p>
          <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
          
          <div className="mt-8 space-y-2">
            <h2 className="text-xl font-semibold">Links de Teste:</h2>
            <a href="/admin" className="block text-blue-600 hover:underline">→ Ir para /admin</a>
            <a href="/admin/reservas" className="block text-blue-600 hover:underline">→ Ir para /admin/reservas</a>
            <a href="/admin/usuarios" className="block text-blue-600 hover:underline">→ Ir para /admin/usuarios</a>
            <a href="/debug/auth" className="block text-purple-600 hover:underline">→ Página de Debug</a>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          ❌ Teste Admin - ERRO!
        </h1>
        <p>Erro: {error instanceof Error ? error.message : String(error)}</p>
      </div>
    )
  }
} 