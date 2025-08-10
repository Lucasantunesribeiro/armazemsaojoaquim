'use client'

import { useState, useEffect, useMemo } from 'react'
import { use } from 'react'
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Shield,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { useAdminData } from '@/hooks/useAdminData'
import { 
  UserData, 
  UserDataTransformer, 
  transformApiResponse,
  formatDate,
  getRoleBadgeColor
} from '@/lib/data-transformers'
import { useComponentLifecycle, useRenderCounter } from '@/hooks/useComponentLifecycle'
import { CacheDebugger } from '@/components/admin/CacheDebugger'

interface UsersPageProps {
  params: Promise<{ locale: string }>
}

// Using UserData from data-transformers instead of local interface

export default function UsersPage({ params }: UsersPageProps) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale || 'pt'
  
  // Debug component lifecycle
  useComponentLifecycle('UsersPage')
  useRenderCounter('UsersPage', 3)
  
  const { makeRequest, isAuthorized, isLoading: adminLoading } = useAdminApi()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Memoize endpoint to prevent unnecessary re-fetches
  const endpoint = useMemo(() => '/users', [])
  
  // Use enhanced data loading hook
  const { data: users, loading, error, isEmpty, retry, refresh } = useAdminData<UserData>(
    endpoint,
    {
      transform: (response) => {
        console.log('[UsersPage] Raw API response:', response)
        
        // Handle the users API response format
        if (response && typeof response === 'object') {
          let usersArray: any[] = []
          
          // Handle different response formats
          if (response.success && response.data) {
            // Check if data has users array (new API format)
            if (response.data.users && Array.isArray(response.data.users)) {
              usersArray = response.data.users
            } else if (Array.isArray(response.data)) {
              usersArray = response.data
            } else {
              usersArray = [response.data]
            }
          } else if (Array.isArray(response)) {
            usersArray = response
          } else if (response.users && Array.isArray(response.users)) {
            usersArray = response.users
          } else {
            console.warn('[UsersPage] Unexpected response format:', response)
            return []
          }
          
          console.log('[UsersPage] Users array length:', usersArray.length)
          
          // Use the transformer to ensure consistent data format
          const result = transformApiResponse(usersArray, new UserDataTransformer())
          console.log('[UsersPage] Transformed users:', result.length)
          return result
        }
        
        console.warn('[UsersPage] Unexpected response format')
        return []
      },
      dependencies: [], // Remove dependencies to prevent cascading re-fetches
      errorConfig: {
        maxRetries: 2,
        retryDelay: 1000,
        showFallback: false
      }
    }
  )

  // Memoize filtered users to prevent excessive re-calculations
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.phone || '').includes(searchTerm)
      const matchesRole = filterRole === 'all' || user.role === filterRole
      // Since UserData doesn't have status, we'll treat all as active
      const matchesStatus = filterStatus === 'all' || filterStatus === 'active'
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, filterRole, filterStatus])

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await makeRequest(`/users/${userId}`, { method: 'DELETE' })
        refresh() // Refresh data after deletion
      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
        alert('Erro ao excluir usuário. Tente novamente.')
      }
    }
  }

  const handleToggleUserStatus = async (userId: string) => {
    try {
      // TODO: Implement API call to toggle user status
      console.log('Toggle status for user:', userId)
      // For now just log since UserData doesn't have status field
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error)
    }
  }

  const getStatusBadge = (status: string = 'active') => {
    const statusConfig = {
      active: { label: 'Ativo', class: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
      inactive: { label: 'Inativo', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      suspended: { label: 'Suspenso', class: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}>
        {role === 'admin' ? 'Admin' : 'Usuário'}
      </span>
    )
  }

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {adminLoading ? 'Verificando permissões...' : 'Carregando usuários...'}
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Acesso Negado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CacheDebugger />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualize e gerencie usuários cadastrados
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Função
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Todas as funções</option>
                  <option value="admin">Administrador</option>
                  <option value="user">Usuário</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Todos os status</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="suspended">Suspenso</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período de Cadastro
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="all">Todos os períodos</option>
                  <option value="last-week">Última semana</option>
                  <option value="last-month">Último mês</option>
                  <option value="last-year">Último ano</option>
                </select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total de Usuários
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Usuários Ativos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Administradores
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(user => user.role === 'admin').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total de Logins
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.reduce((sum, user) => sum + user.sign_in_count, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* User Avatar */}
              <div className="lg:w-20 lg:flex-shrink-0">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl lg:text-2xl font-bold text-gray-500 dark:text-gray-400">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {user.full_name}
                    </h3>
                    {getRoleBadge(user.role)}
                    {getStatusBadge('active')}
                  </div>
                  
                  {/* Actions Menu */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    
                    {user.role !== 'admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4" />
                      {user.phone}
                    </div>
                  )}
                  

                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {user.sign_in_count} logins
                  </div>
                </div>

                {/* Activity Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Último login: {formatDate(user.last_sign_in)}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Cadastrado em: {formatDate(user.created_at)}
                  </div>
                </div>

                {/* Quick Actions */}
                {user.role !== 'admin' && (
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleUserStatus(user.id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <UserX className="h-4 w-4" />
                      Desativar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum usuário encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Nenhum usuário cadastrado no sistema.'}
          </p>
        </Card>
      )}
    </div>
  )
}