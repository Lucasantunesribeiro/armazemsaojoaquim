'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { User, Shield, Calendar, Phone } from 'lucide-react'

type UserData = {
  id: string
  email: string
  created_at: string
  user_metadata?: {
    name?: string
    phone?: string
  }
}

export default function UsersManagementPage() {
  const { supabase } = useSupabase()
  const { adminFetch } = useAdminApi()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Usar adminFetch para requisição autenticada
      const data = await adminFetch('/api/admin/users')
      
      // Converter profiles em formato de usuário
      const usersList: UserData[] = (data.users || []).map((profile: any) => ({
        id: profile.id,
        email: profile.email || '',
        created_at: profile.created_at,
        user_metadata: {
          name: profile.name || undefined,
          phone: profile.phone || undefined
        }
      }))

      setUsers(usersList)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUserName = (user: UserData) => {
    return user.user_metadata?.name || 'Sem nome'
  }

  const getUserPhone = (user: UserData) => {
    return user.user_metadata?.phone || '-'
  }

  const isAdmin = (email: string) => {
    return email === 'armazemsaojoaquimoficial@gmail.com'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando usuários...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Erro</h2>
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchUsers}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Gerenciar Usuários
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Total de usuários cadastrados: {users.length}
        </p>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total"
          value={users.length}
          icon={<User className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard
          title="Admins"
          value={users.filter(u => isAdmin(u.email)).length}
          icon={<Shield className="h-5 w-5" />}
          color="purple"
        />
        <StatsCard
          title="Este Mês"
          value={users.filter(u => {
            const userDate = new Date(u.created_at)
            const now = new Date()
            return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
          }).length}
          icon={<Calendar className="h-5 w-5" />}
          color="green"
        />
        <StatsCard
          title="Com Telefone"
          value={users.filter(u => u.user_metadata?.phone).length}
          icon={<Phone className="h-5 w-5" />}
          color="yellow"
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lista de Usuários
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">
                          {getUserName(user).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {getUserName(user)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {getUserPhone(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      isAdmin(user.email) 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {isAdmin(user.email) ? 'Admin' : 'Usuário'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Nenhum usuário encontrado
            </h3>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Lista de Usuários
          </h2>
        </div>
        
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}

        {users.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Nenhum usuário encontrado
            </h3>
          </div>
        )}
      </div>
    </div>
  )
}

// Stats Card Component
function StatsCard({ title, value, icon, color }: {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {title}
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

// Mobile User Card Component
function UserCard({ user }: { user: UserData }) {
  const getUserName = (user: UserData) => {
    return user.user_metadata?.name || 'Sem nome'
  }

  const getUserPhone = (user: UserData) => {
    return user.user_metadata?.phone || '-'
  }

  const isAdmin = (email: string) => {
    return email === 'armazemsaojoaquimoficial@gmail.com'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
      {/* Header with Avatar and Name */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              {getUserName(user).charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {getUserName(user)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ID: {user.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          isAdmin(user.email) 
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        }`}>
          {isAdmin(user.email) ? 'Admin' : 'Usuário'}
        </span>
      </div>

      {/* User Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Email:</span>
          <span className="text-gray-900 dark:text-white truncate ml-2">{user.email}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Telefone:</span>
          <span className="text-gray-900 dark:text-white">{getUserPhone(user)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Cadastro:</span>
          <span className="text-gray-900 dark:text-white">{formatDate(user.created_at)}</span>
        </div>
      </div>
    </div>
  )
} 