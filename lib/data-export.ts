// Data export utilities for admin panel

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx'
  filename?: string
  includeHeaders?: boolean
  dateFormat?: string
  fields?: string[]
}

export class DataExporter {
  static exportToCSV<T extends Record<string, any>>(
    data: T[],
    options: ExportOptions = { format: 'csv' }
  ): void {
    if (data.length === 0) {
      throw new Error('Não há dados para exportar')
    }

    const { filename = 'export', includeHeaders = true, fields } = options
    
    // Get fields to export
    const exportFields = fields || Object.keys(data[0])
    
    // Create CSV content
    let csvContent = ''
    
    // Add headers
    if (includeHeaders) {
      csvContent += exportFields.map(field => this.escapeCSVField(field)).join(',') + '\n'
    }
    
    // Add data rows
    data.forEach(row => {
      const values = exportFields.map(field => {
        const value = row[field]
        return this.escapeCSVField(this.formatValue(value, options))
      })
      csvContent += values.join(',') + '\n'
    })
    
    // Download file
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  }

  static exportToJSON<T>(
    data: T[],
    options: ExportOptions = { format: 'json' }
  ): void {
    if (data.length === 0) {
      throw new Error('Não há dados para exportar')
    }

    const { filename = 'export', fields } = options
    
    // Filter fields if specified
    let exportData = data
    if (fields) {
      exportData = data.map(item => {
        const filtered: any = {}
        fields.forEach(field => {
          if (field in (item as any)) {
            filtered[field] = (item as any)[field]
          }
        })
        return filtered
      })
    }
    
    const jsonContent = JSON.stringify(exportData, null, 2)
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json')
  }

  private static escapeCSVField(field: string): string {
    if (field == null) return ''
    
    const stringField = String(field)
    
    // If field contains comma, newline, or quote, wrap in quotes and escape quotes
    if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
      return `"${stringField.replace(/"/g, '""')}"`
    }
    
    return stringField
  }

  private static formatValue(value: any, options: ExportOptions): string {
    if (value == null) return ''
    
    // Format dates
    if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        const format = options.dateFormat || 'dd/MM/yyyy HH:mm'
        return this.formatDate(date, format)
      }
    }
    
    // Format arrays
    if (Array.isArray(value)) {
      return value.join('; ')
    }
    
    // Format objects
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    
    return String(value)
  }

  private static formatDate(date: Date, format: string): string {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return format
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', String(year))
      .replace('HH', hours)
      .replace('mm', minutes)
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    URL.revokeObjectURL(url)
  }
}

// Bulk operations for data management
export class BulkOperations {
  static async bulkUpdate<T>(
    items: T[],
    updateFn: (item: T) => Promise<T>,
    options: {
      batchSize?: number
      onProgress?: (completed: number, total: number) => void
      onError?: (error: any, item: T) => void
    } = {}
  ): Promise<{ success: T[], failed: { item: T, error: any }[] }> {
    const { batchSize = 10, onProgress, onError } = options
    const success: T[] = []
    const failed: { item: T, error: any }[] = []
    
    // Process in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (item) => {
        try {
          const updated = await updateFn(item)
          success.push(updated)
          return { success: true, item: updated }
        } catch (error) {
          failed.push({ item, error })
          onError?.(error, item)
          return { success: false, item, error }
        }
      })
      
      await Promise.all(batchPromises)
      
      // Report progress
      onProgress?.(Math.min(i + batchSize, items.length), items.length)
    }
    
    return { success, failed }
  }

  static async bulkDelete<T extends { id: string }>(
    items: T[],
    deleteFn: (id: string) => Promise<void>,
    options: {
      batchSize?: number
      onProgress?: (completed: number, total: number) => void
      onError?: (error: any, item: T) => void
    } = {}
  ): Promise<{ success: string[], failed: { item: T, error: any }[] }> {
    const { batchSize = 5, onProgress, onError } = options
    const success: string[] = []
    const failed: { item: T, error: any }[] = []
    
    // Process in smaller batches for delete operations
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (item) => {
        try {
          await deleteFn(item.id)
          success.push(item.id)
          return { success: true, item }
        } catch (error) {
          failed.push({ item, error })
          onError?.(error, item)
          return { success: false, item, error }
        }
      })
      
      await Promise.all(batchPromises)
      
      // Report progress
      onProgress?.(Math.min(i + batchSize, items.length), items.length)
    }
    
    return { success, failed }
  }
}

// Data filtering and sorting utilities
export class DataProcessor {
  static filterData<T>(
    data: T[],
    filters: Record<string, any>
  ): T[] {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          return true // Skip empty filters
        }
        
        const itemValue = (item as any)[key]
        
        if (typeof value === 'string') {
          return String(itemValue).toLowerCase().includes(value.toLowerCase())
        }
        
        if (Array.isArray(value)) {
          return value.includes(itemValue)
        }
        
        return itemValue === value
      })
    })
  }

  static sortData<T>(
    data: T[],
    sortBy: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): T[] {
    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortBy]
      const bValue = (b as any)[sortBy]
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortOrder === 'asc' ? 1 : -1
      if (bValue == null) return sortOrder === 'asc' ? -1 : 1
      
      // Handle dates
      if (aValue instanceof Date || bValue instanceof Date) {
        const aTime = new Date(aValue).getTime()
        const bTime = new Date(bValue).getTime()
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime
      }
      
      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      // Handle strings
      const aString = String(aValue).toLowerCase()
      const bString = String(bValue).toLowerCase()
      
      if (sortOrder === 'asc') {
        return aString.localeCompare(bString)
      } else {
        return bString.localeCompare(aString)
      }
    })
  }

  static paginateData<T>(
    data: T[],
    page: number,
    limit: number
  ): { data: T[], pagination: { page: number, limit: number, total: number, pages: number } } {
    const total = data.length
    const pages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const end = start + limit
    
    return {
      data: data.slice(start, end),
      pagination: {
        page,
        limit,
        total,
        pages
      }
    }
  }

  static searchData<T>(
    data: T[],
    searchTerm: string,
    searchFields: (keyof T)[]
  ): T[] {
    if (!searchTerm.trim()) return data
    
    const term = searchTerm.toLowerCase()
    
    return data.filter(item => {
      return searchFields.some(field => {
        const value = item[field]
        if (value == null) return false
        
        if (Array.isArray(value)) {
          return value.some(v => String(v).toLowerCase().includes(term))
        }
        
        return String(value).toLowerCase().includes(term)
      })
    })
  }
}