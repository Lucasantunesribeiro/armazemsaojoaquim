// Data transformation utilities for consistent data formatting

export interface DataTransformer<TInput, TOutput> {
  transform(input: TInput): TOutput
  validate(input: TInput): boolean
  getEmptyState(): TOutput[]
}

// User data interfaces
export interface UserData {
  id: string
  email: string
  full_name: string
  phone?: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
  last_sign_in: string
  sign_in_count: number
  avatar_url?: string
}

// Blog data interfaces
export interface BlogPostData {
  id: string
  title: string
  excerpt: string
  status: 'draft' | 'published' | 'scheduled'
  author: string
  created_at: string
  updated_at: string
  published_at?: string
  category?: string
  tags: string[]
  featured_image?: string
  views: number
}

// User data transformer
export class UserDataTransformer implements DataTransformer<any, UserData> {
  transform(input: any): UserData {
    return {
      id: input.id || '',
      email: input.email || '',
      full_name: input.full_name || input.name || '',
      phone: input.phone || '',
      role: input.role || 'user',
      created_at: input.created_at || new Date().toISOString(),
      updated_at: input.updated_at || input.created_at || new Date().toISOString(),
      last_sign_in: input.last_sign_in_at || input.last_sign_in || '',
      sign_in_count: input.sign_in_count || 0,
      avatar_url: input.avatar_url || ''
    }
  }

  validate(input: any): boolean {
    const isValid = !!(input && input.id && input.email)
    if (!isValid) {
      console.log('[UserDataTransformer] Validation failed for:', {
        hasInput: !!input,
        hasId: !!(input && input.id),
        hasEmail: !!(input && input.email),
        inputKeys: input ? Object.keys(input) : 'no input'
      })
    }
    return isValid
  }

  getEmptyState(): UserData[] {
    return []
  }
}

// Blog post data transformer
export class BlogPostDataTransformer implements DataTransformer<any, BlogPostData> {
  transform(input: any): BlogPostData {
    return {
      id: input.id || '',
      title: input.title || '',
      excerpt: input.excerpt || '',
      status: this.normalizeStatus(input.status || input.published),
      author: input.author || input.author_name || 'Admin',
      created_at: input.created_at || new Date().toISOString(),
      updated_at: input.updated_at || input.created_at || new Date().toISOString(),
      published_at: input.published_at || '',
      category: input.category || '',
      tags: this.normalizeTags(input.tags),
      featured_image: input.featured_image || input.image_url || '',
      views: input.views || 0
    }
  }

  private normalizeStatus(status: any): 'draft' | 'published' | 'scheduled' {
    if (typeof status === 'boolean') {
      return status ? 'published' : 'draft'
    }
    
    if (typeof status === 'string') {
      const normalized = status.toLowerCase()
      if (['published', 'draft', 'scheduled'].includes(normalized)) {
        return normalized as 'draft' | 'published' | 'scheduled'
      }
    }
    
    return 'draft'
  }

  private normalizeTags(tags: any): string[] {
    if (Array.isArray(tags)) {
      return tags.filter(tag => typeof tag === 'string')
    }
    
    if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.trim()).filter(Boolean)
    }
    
    return []
  }

  validate(input: any): boolean {
    return !!(input && input.id && input.title)
  }

  getEmptyState(): BlogPostData[] {
    return []
  }
}

// Generic API response transformer
export function transformApiResponse<T>(
  response: any,
  transformer: DataTransformer<any, T>
): T[] {
  console.log(`🔄 [transformApiResponse] Starting transformation:`)
  console.log(`   - Response type:`, typeof response)
  console.log(`   - Response:`, response)
  console.log(`   - Transformer type:`, transformer.constructor.name)
  
  try {
    let items: any[] = []
    
    // Handle different response formats
    if (Array.isArray(response)) {
      items = response
      console.log(`✅ [transformApiResponse] Direct array format:`, items.length, 'items')
    } else if (response.data && Array.isArray(response.data)) {
      items = response.data
      console.log(`✅ [transformApiResponse] response.data format:`, items.length, 'items')
    } else if (response.users && Array.isArray(response.users)) {
      items = response.users
      console.log(`✅ [transformApiResponse] response.users format:`, items.length, 'items')
    } else if (response.posts && Array.isArray(response.posts)) {
      items = response.posts
      console.log(`✅ [transformApiResponse] response.posts format:`, items.length, 'items')
    } else {
      console.warn('⚠️ [transformApiResponse] Unexpected response format:', response)
      console.warn('⚠️ [transformApiResponse] Response keys:', Object.keys(response || {}))
      const emptyState = transformer.getEmptyState()
      console.log(`❌ [transformApiResponse] Returning empty state:`, emptyState.length, 'items')
      return emptyState
    }

    console.log(`🔍 [transformApiResponse] Processing ${items.length} items`)
    
    // Transform and validate each item
    const validItems = items.filter((item, index) => {
      const isValid = transformer.validate(item)
      if (!isValid) {
        console.warn(`[transformApiResponse] Invalid item at index ${index}:`, item)
      }
      return isValid
    })
    
    console.log(`✅ [transformApiResponse] ${validItems.length} valid items out of ${items.length}`)
    
    const transformedItems = validItems.map((item, index) => {
      try {
        const transformed = transformer.transform(item)
        console.log(`✅ [transformApiResponse] Item ${index} transformed successfully`)
        return transformed
      } catch (transformError) {
        console.error(`❌ [transformApiResponse] Error transforming item ${index}:`, transformError, item)
        throw transformError
      }
    })
    
    console.log(`🎉 [transformApiResponse] Transformation complete:`, transformedItems.length, 'items')
    console.log(`📊 [transformApiResponse] Sample transformed item:`, transformedItems[0])
    
    return transformedItems
      
  } catch (error) {
    console.error('❌ [transformApiResponse] Transformation error:', error)
    console.error('❌ [transformApiResponse] Original response:', response)
    const emptyState = transformer.getEmptyState()
    console.log(`🔄 [transformApiResponse] Returning empty state due to error:`, emptyState.length, 'items')
    return emptyState
  }
}

// Utility functions for date formatting
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return 'N/A'
  
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...options
    })
  } catch (error) {
    console.error('❌ [formatDate] Invalid date:', dateString)
    return 'Data inválida'
  }
}

export function formatDateTime(dateString: string): string {
  return formatDate(dateString, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Utility function for role badge styling
export function getRoleBadgeColor(role?: string): string {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    case 'user':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

// Utility function for status badge styling
export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    case 'draft':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

// Additional validation utilities
export class DataValidator {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static isValidDate(dateString: string): boolean {
    if (!dateString) return false
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  static sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, '')
  }

  static validateUserData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.id) errors.push('ID é obrigatório')
    if (!data.email) errors.push('Email é obrigatório')
    else if (!this.isValidEmail(data.email)) errors.push('Email inválido')
    
    if (data.created_at && !this.isValidDate(data.created_at)) {
      errors.push('Data de criação inválida')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static validateBlogPostData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.id) errors.push('ID é obrigatório')
    if (!data.title) errors.push('Título é obrigatório')
    
    if (data.featured_image && !this.isValidUrl(data.featured_image)) {
      errors.push('URL da imagem destacada inválida')
    }

    if (data.created_at && !this.isValidDate(data.created_at)) {
      errors.push('Data de criação inválida')
    }

    const validStatuses = ['draft', 'published', 'scheduled']
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push('Status inválido')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Fallback data generators for error scenarios
export class FallbackDataGenerator {
  static generateMockUsers(count: number = 5): UserData[] {
    const mockUsers: UserData[] = []
    
    for (let i = 1; i <= count; i++) {
      mockUsers.push({
        id: `mock-user-${i}`,
        email: `usuario${i}@exemplo.com`,
        full_name: `Usuário ${i}`,
        phone: `(11) 9999-${String(i).padStart(4, '0')}`,
        role: i === 1 ? 'admin' : 'user',
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        last_sign_in: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        sign_in_count: Math.floor(Math.random() * 50) + 1,
        avatar_url: ''
      })
    }
    
    return mockUsers
  }

  static generateMockBlogPosts(count: number = 3): BlogPostData[] {
    const mockPosts: BlogPostData[] = []
    const categories = ['Culinária', 'História', 'Eventos', 'Turismo']
    const statuses: ('draft' | 'published' | 'scheduled')[] = ['draft', 'published', 'scheduled']
    
    for (let i = 1; i <= count; i++) {
      mockPosts.push({
        id: `mock-post-${i}`,
        title: `Post de Exemplo ${i}`,
        excerpt: `Este é um resumo do post de exemplo ${i} para demonstrar a funcionalidade do blog.`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        author: 'Admin',
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        published_at: Math.random() > 0.5 ? new Date().toISOString() : '',
        category: categories[Math.floor(Math.random() * categories.length)],
        tags: [`tag${i}`, `exemplo`, 'blog'],
        featured_image: '',
        views: Math.floor(Math.random() * 1000)
      })
    }
    
    return mockPosts
  }
}

// Enhanced error handling for API responses
export function handleApiError(error: any): string {
  if (error.response) {
    // HTTP error response
    const status = error.response.status
    const message = error.response.data?.message || error.response.data?.error
    
    switch (status) {
      case 401:
        return 'Sessão expirada. Faça login novamente.'
      case 403:
        return 'Você não tem permissão para acessar estes dados.'
      case 404:
        return 'Dados não encontrados.'
      case 429:
        return 'Muitas tentativas. Tente novamente em alguns minutos.'
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.'
      default:
        return message || `Erro HTTP ${status}`
    }
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Erro de conexão. Verifique sua internet e tente novamente.'
  }
  
  if (error.name === 'TimeoutError') {
    return 'Tempo limite excedido. Tente novamente.'
  }
  
  return error.message || 'Erro desconhecido. Tente novamente.'
}