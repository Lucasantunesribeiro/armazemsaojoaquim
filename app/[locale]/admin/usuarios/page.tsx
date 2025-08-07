'use client'

import { useState, useEffect } from 'react'
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

interface UsersPageProps {
  params: Promise<{ locale: string }>
}

interface User {
  id: string
  email: string
  full_name: string
  phone: string
  role: 'user' | 'admin'
  status: 'active' | 'inactive' | 'suspended'
  avatar_url: string
  last_login: string
  created_at: string
  updated_at: string
  location: string
  total_reservations: number
}

export default function UsersPage({ params }: UsersPageProps) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale || 'pt'
  
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call to load users
      // const response = await fetch('/api/admin/users')
      // const data = await response.json()
      // setUsers(data)
      
      // Mock data for now
      setUsers([
        {
          id: '1',
          email: 'maria.silva@email.com',
          full_name: 'Maria Silva',
          phone: '(11) 99999-9999',
          role: 'user',
          status: 'active',
          avatar_url: '',
          last_login: '2024-01-20T10:30:00Z',
          created_at: '2023-06-15T14:20:00Z',
          updated_at: '2024-01-20T10:30:00Z',
          location: 'São Paulo, SP',
          total_reservations: 5
        },
        {
          id: '2',
          email: 'joao.santos@email.com',
          full_name: 'João Santos',
          phone: '(11) 88888-8888',
          role: 'user',
          status: 'active',
          avatar_url: '',
          last_login: '2024-01-19T16:45:00Z',
          created_at: '2023-08-22T09:10:00Z',
          updated_at: '2024-01-19T16:45:00Z',
          location: 'Rio de Janeiro, RJ',
          total_reservations: 3
        },
        {
          id: '3',
          email: 'ana.costa@email.com',
          full_name: 'Ana Costa',
          phone: '(11) 77777-7777',
          role: 'user',
          status: 'inactive',
          avatar_url: '',
          last_login: '2023-12-10T08:20:00Z',
          created_at: '2023-04-10T11:30:00Z',
          updated_at: '2023-12-10T08:20:00Z',
          location: 'Belo Horizonte, MG',
          total_reservations: 1
        },
        {
          id: '4',
          email: 'armazemsaojoaquimoficial@gmail.com',
          full_name: 'Administrador Armazém São Joaquim',
          phone: '(11) 66666-6666',
          role: 'admin',
          status: 'active',
          avatar_url: '',
          last_login: '2024-01-22T14:15:00Z',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2024-01-22T14:15:00Z',
          location: 'São Paulo, SP',
          total_reservations: 0
        }
      ])
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm)
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        // TODO: Implement API call to delete user
        // await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
        setUsers(users.filter(user => user.id !== userId))
      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
      }
    }
  }

  const handleToggleUserStatus = async (userId: string) => {
    try {
      // TODO: Implement API call to toggle user status
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' }
          : user
      ))
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativo', class: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
      inactive: { label: 'Inativo', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      suspended: { label: 'Suspenso', class: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Admin', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
      user: { label: 'Usuário', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' }
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    )
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
                {users.filter(user => user.status === 'active').length}
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
                Total de Reservas
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.reduce((sum, user) => sum + user.total_reservations, 0)}
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
                    {getStatusBadge(user.status)}
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
                  
                  {user.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {user.total_reservations} reservas
                  </div>
                </div>

                {/* Activity Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Último login: {formatDate(user.last_login)}
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
                      className={`flex items-center gap-2 ${
                        user.status === 'active' 
                          ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      {user.status === 'active' ? (
                        <>
                          <UserX className="h-4 w-4" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4" />
                          Ativar
                        </>
                      )}
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