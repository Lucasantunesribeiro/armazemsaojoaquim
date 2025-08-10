'use client'

import { useState, useEffect, useMemo } from 'react'
import { AdminErrorBoundary } from '@/components/admin/ErrorBoundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { toast } from 'sonner'
import { 
  Users, 
  UserCheck, 
  Shield, 
  Search, 
  Filter,
  Edit3,
  Trash2,
  UserPlus,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { useAdminData } from '@/hooks/useAdminData'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { 
  UserData, 
  UserDataTransformer, 
  transformApiResponse,
  formatDateTime,
  getRoleBadgeColor
} from '@/lib/data-transformers'
import { LoadingState } from '@/components/admin/LoadingState'
import { ErrorState } from '@/components/admin/ErrorState'
import { EmptyState } from '@/components/admin/EmptyState'
import { DataExporter } from '@/lib/data-export'
import { Download } from 'lucide-react'

interface UserStats {
  total: number
  admins: number
  users: number
  recent: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

function UsersManagementPageContent() {
  const { makeRequest } = useAdminApi()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 })
  const [stats, setStats] = useState<UserStats>({ total: 0, admins: 0, users: 0, recent: 0 })

  // Build endpoint with filters
  const endpoint = useMemo(() => {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
    })

    if (searchTerm) params.append('search', searchTerm)
    if (roleFilter !== 'all') params.append('role', roleFilter)

    return `/users?${params.toString()}`
  }, [pagination.page, pagination.limit, searchTerm, roleFilter])

  // Use enhanced data loading hook
  const { data: users, loading, error, isEmpty, retry, refresh } = useAdminData<UserData>(
    endpoint,
    {
      transform: (response) => {
        console.log('🔄 [UsersPage] Raw API response:', response)
        
        // Extract stats and pagination from response
        if (response.success && response.data) {
          console.log('✅ [UsersPage] Processing successful response with data')
          console.log('📊 [UsersPage] Stats:', response.data.stats)
          console.log('👥 [UsersPage] Users array length:', response.data.users?.length || 0)
          
          setStats(response.data.stats || { total: 0, admins: 0, users: 0, recent: 0 })
          setPagination(prev => ({
            ...prev,
            total: response.data.pagination?.total || 0,
            pages: response.data.pagination?.pages || 0
          }))
          
          const transformedUsers = transformApiResponse(response.data.users, new UserDataTransformer())
          console.log('✅ [UsersPage] Transformed users:', transformedUsers.length)
          return transformedUsers
        }
        
        console.warn('⚠️ [UsersPage] Unexpected response format, trying fallback')
        const fallbackUsers = transformApiResponse(response, new UserDataTransformer())
        console.log('⚠️ [UsersPage] Fallback users:', fallbackUsers.length)
        return fallbackUsers
      },
      dependencies: [searchTerm, roleFilter, pagination.page],
      errorConfig: {
        maxRetries: 2,
        retryDelay: 1000,
        showFallback: false
      }
    }
  )

  const updateUser = async (userId: string, updates: Partial<UserData>) => {
    try {
      await makeRequest('/users', {
        method: 'PATCH',
        body: JSON.stringify({ userId, updates })
      })

      toast.success('Usuário atualizado com sucesso')
      refresh()
      setEditDialogOpen(false)
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      toast.error('Erro ao atualizar usuário')
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return

    try {
      await makeRequest(`/users?userId=${userId}`, {
        method: 'DELETE'
      })

      toast.success('Usuário deletado com sucesso')
      refresh()
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao deletar usuário')
    }
  }

  const exportUsers = (format: 'csv' | 'json') => {
    try {
      const exportData = users.map(user => ({
        Email: user.email,
        Nome: user.full_name,
        Telefone: user.phone || '',
        Role: user.role,
        'Data de Cadastro': formatDateTime(user.created_at),
        'Último Acesso': user.last_sign_in ? formatDateTime(user.last_sign_in) : 'Nunca',
        'Número de Acessos': user.sign_in_count
      }))

      if (format === 'csv') {
        DataExporter.exportToCSV(exportData, {
          format: 'csv',
          filename: `usuarios_${new Date().toISOString().split('T')[0]}`,
          includeHeaders: true
        })
      } else {
        DataExporter.exportToJSON(exportData, {
          format: 'json',
          filename: `usuarios_${new Date().toISOString().split('T')[0]}`
        })
      }

      toast.success(`Dados exportados em formato ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      toast.error('Erro ao exportar dados')
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários cadastrados no sistema
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administradores
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Comuns
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novos (7 dias)
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Filtros</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            {!isEmpty && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportUsers('csv')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportUsers('json')}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  JSON
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por email ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                  <SelectItem value="user">Usuários comuns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usuários ({stats.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState message="Carregando usuários..." />
          ) : error ? (
            <ErrorState 
              message={error}
              onRetry={retry}
              showRetry={true}
            />
          ) : isEmpty ? (
            <EmptyState
              icon={Users}
              title="Nenhum usuário encontrado"
              description={
                searchTerm || roleFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Não há usuários cadastrados no sistema.'
              }
              action={
                searchTerm || roleFilter !== 'all' ? (
                  <Button
                    onClick={() => {
                      setSearchTerm('')
                      setRoleFilter('all')
                    }}
                  >
                    Limpar Filtros
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.full_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(user.created_at)}</TableCell>
                      <TableCell>
                        {user.last_sign_in ? formatDateTime(user.last_sign_in) : 'Nunca'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                            disabled={user.email === 'armazemsaojoaquimoficial@gmail.com'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                  >
                    Anterior
                  </Button>
                  <span className="px-4 py-2 text-sm">
                    Página {pagination.page} de {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={selectedUser.email}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={selectedUser.full_name || ''}
                  onChange={(e) => setSelectedUser(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={selectedUser.role || 'user'}
                  onValueChange={(value) => setSelectedUser(prev => prev ? { ...prev, role: value as 'user' | 'admin' } : null)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => updateUser(selectedUser.id, {
                    full_name: selectedUser.full_name,
                    role: selectedUser.role
                  })}
                >
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function UsersManagementPage() {
  return (
    <AdminErrorBoundary>
      <UsersManagementPageContent />
    </AdminErrorBoundary>
  )
}