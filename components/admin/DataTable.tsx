'use client'

import { ReactNode } from 'react'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => ReactNode
  sortable?: boolean
  className?: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
  hasNext?: boolean
  hasPrev?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
  emptyState?: {
    title: string
    description: string
    action?: ReactNode
  }
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  onRetry,
  pagination,
  onPageChange,
  emptyState,
  className = ''
}: DataTableProps<T>) {
  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <LoadingState message="Carregando dados..." />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={className}>
        <ErrorState 
          message={error}
          onRetry={onRetry}
          showRetry={!!onRetry}
        />
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    if (emptyState) {
      return (
        <div className={className}>
          <EmptyState
            icon={FileText}
            title={emptyState.title}
            description={emptyState.description}
            action={emptyState.action}
          />
        </div>
      )
    }

    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead 
                  key={index}
                  className={column.className}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell 
                    key={colIndex}
                    className={column.className}
                  >
                    {column.render 
                      ? column.render(item)
                      : String(item[column.key] || '')
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} resultados
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            <span className="px-3 py-1 text-sm">
              Página {pagination.page} de {pagination.pages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="flex items-center gap-1"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Utility function to create table columns easily
export function createColumn<T>(
  key: keyof T | string,
  header: string,
  options: Partial<Column<T>> = {}
): Column<T> {
  return {
    key,
    header,
    ...options
  }
}