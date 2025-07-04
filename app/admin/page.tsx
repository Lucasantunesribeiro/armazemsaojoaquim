import { requireAdmin } from '@/lib/auth/middleware'
import { getUser } from '@/lib/auth/middleware'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function AdminDashboard() {
  await requireAdmin()
  const user = await getUser()
  const supabase = createServerComponentClient({ cookies })
  
  // Get statistics
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
  
  const { count: totalReservations } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
  
  const { count: activeReservations } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'confirmed')
    .gte('date', new Date().toISOString())
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Dashboard Administrativo
      </h1>
      
      <div className="mb-8">
        <p className="text-gray-600 dark:text-gray-400">
          Bem-vindo, {user?.name || user?.email}!
        </p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total de Usuários
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {totalUsers || 0}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total de Reservas
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {totalReservations || 0}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Reservas Ativas
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {activeReservations || 0}
          </p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/users"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">
              Gerenciar Usuários
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Visualizar e gerenciar contas de usuários
            </p>
          </a>
          
          <a
            href="/admin/reservations"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">
              Gerenciar Reservas
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Visualizar e gerenciar reservas do restaurante
            </p>
          </a>
        </div>
      </div>
    </div>
  )
}