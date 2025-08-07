'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { toast } from 'sonner'
import { 
  Activity, 
  Calendar, 
  Clock, 
  Eye,
  Filter,
  Search,
  Trash2,
  AlertCircle,
  BarChart3,
  RefreshCw
} from 'lucide-react'

interface ActivityLog {
  id: string
  action: string
  resource_type: string
  resource_id?: string
  details: any
  created_at: string
  user_email: string
  ip_address?: string
  user_agent?: string
}

interface LogStats {
  total: number
  today: number
  thisWeek: number
  thisMonth: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [stats, setStats] = useState<LogStats>({ total: 0, today: 0, thisWeek: 0, thisMonth: 0 })
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('all')
  const [resourceFilter, setResourceFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  const actionTypes = [
    { value: 'all', label: 'Todas as ações' },
    { value: 'create', label: 'Criar' },
    { value: 'update', label: 'Atualizar' },
    { value: 'delete', label: 'Deletar' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'view', label: 'Visualizar' },
    { value: 'export', label: 'Exportar' },
    { value: 'import', label: 'Importar' },
    { value: 'cleanup', label: 'Limpeza' }
  ]

  const resourceTypes = [
    { value: 'all', label: 'Todos os recursos' },
    { value: 'user', label: 'Usuários' },
    { value: 'blog_post', label: 'Posts do Blog' },
    { value: 'pousada_room', label: 'Quartos da Pousada' },
    { value: 'cafe_product', label: 'Produtos do Café' },
    { value: 'settings', label: 'Configurações' },
    { value: 'admin_log', label: 'Logs Admin' }
  ]

  useEffect(() => {
    fetchLogs()
  }, [pagination.page, actionFilter, resourceFilter, dateFrom, dateTo])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (actionFilter !== 'all') params.append('action', actionFilter)
      if (resourceFilter !== 'all') params.append('resource', resourceFilter)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)

      const response = await fetch(`/api/admin/logs?${params}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar logs')
      }

      const data = await response.json()
      setLogs(data.logs)
      setStats(data.stats)
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages
      }))
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
      toast.error('Erro ao carregar logs')
    } finally {
      setLoading(false)
    }
  }

  const cleanupOldLogs = async (days: number) => {
    if (!confirm(`Tem certeza que deseja deletar todos os logs com mais de ${days} dias?`)) return

    try {
      const response = await fetch(`/api/admin/logs?olderThan=${days}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao limpar logs antigos')
      }

      const data = await response.json()
      toast.success(data.message || 'Logs antigos removidos com sucesso')
      fetchLogs()
    } catch (error) {
      console.error('Erro ao limpar logs:', error)
      toast.error('Erro ao limpar logs antigos')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800'
      case 'update':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
        return 'bg-red-100 text-red-800'
      case 'login':
        return 'bg-purple-100 text-purple-800'
      case 'logout':
        return 'bg-gray-100 text-gray-800'
      case 'view':
        return 'bg-indigo-100 text-indigo-800'
      case 'export':
        return 'bg-orange-100 text-orange-800'
      case 'cleanup':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'user':
        return '👤'
      case 'blog_post':
        return '📝'
      case 'pousada_room':
        return '🏠'
      case 'cafe_product':
        return '☕'
      case 'settings':
        return '⚙️'
      case 'admin_log':
        return '📋'
      default:
        return '📄'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Logs de Auditoria</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie logs de atividade administrativa
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchLogs()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            variant="outline"
            onClick={() => cleanupOldLogs(30)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar +30 dias
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Logs
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hoje
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Esta Semana
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Este Mês
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por ação" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map(action => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por recurso" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map(resource => (
                    <SelectItem key={resource.value} value={resource.value}>
                      {resource.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="datetime-local"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Data início"
              />
            </div>
            <div>
              <Input
                type="datetime-local"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Data fim"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Atividades Registradas ({stats.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">Carregando logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Nenhum log encontrado para os filtros aplicados</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead className="text-right">Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionBadgeColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getResourceIcon(log.resource_type)}
                          </span>
                          <span className="font-medium">
                            {log.resource_type}
                          </span>
                          {log.resource_id && (
                            <span className="text-xs text-muted-foreground">
                              ({log.resource_id.substring(0, 8)})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {log.user_email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">
                          {log.ip_address || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log)
                            setDetailsDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Log</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Data/Hora</h4>
                  <p className="font-mono">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Ação</h4>
                  <Badge className={getActionBadgeColor(selectedLog.action)}>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Tipo de Recurso</h4>
                  <p>{selectedLog.resource_type}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">ID do Recurso</h4>
                  <p className="font-mono text-sm">{selectedLog.resource_id || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Usuário</h4>
                  <p className="font-mono">{selectedLog.user_email}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Endereço IP</h4>
                  <p className="font-mono text-sm">{selectedLog.ip_address || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">User Agent</h4>
                <p className="font-mono text-xs bg-muted p-2 rounded break-all">
                  {selectedLog.user_agent || 'N/A'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Detalhes</h4>
                <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}