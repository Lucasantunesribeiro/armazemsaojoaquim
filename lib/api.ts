import { supabase } from './supabase'
import { Database } from '../types/database.types'

// ============================
// TYPE DEFINITIONS
// ============================

export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']
export type Reserva = Database['public']['Tables']['reservas']['Row']

// Helper function to check if data is valid
function isValidData<T>(data: any): data is T[] {
  return Array.isArray(data) && !data.some(item => item?.error === true)
}

function isValidSingleData<T>(data: any): data is T {
  return data && typeof data === 'object' && !data.error
}

// ============================
// BLOG OPERATIONS
// ============================

export const blogApi = {
  // Buscar todos os posts publicados
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar posts:', error)
        return []
      }
      
      return isValidData<BlogPost>(data) ? data : []
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
      return []
    }
  },

  // Buscar post por slug
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (error) {
        console.error('Erro ao buscar post por slug:', error)
        return null
      }
      
      return isValidSingleData<BlogPost>(data) ? data : null
    } catch (error) {
      console.error('Erro ao buscar post por slug:', error)
      return null
    }
  },

  // Buscar posts com busca por texto
  async searchPosts(searchTerm: string): Promise<BlogPost[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .or(`title.ilike.%${searchTerm}%, excerpt.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar posts:', error)
        return []
      }
      
      return isValidData<BlogPost>(data) ? data : []
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
      return []
    }
  }
}

// ============================
// MENU OPERATIONS
// ============================

export const menuApi = {
  // Buscar todos os itens disponíveis
  async getAllItems(): Promise<MenuItem[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('category')
        .order('name')

      if (error) {
        console.error('Erro ao buscar itens do menu:', error)
        return []
      }
      
      return isValidData<MenuItem>(data) ? data : []
    } catch (error) {
      console.error('Erro ao buscar itens do menu:', error)
      return []
    }
  },

  // Buscar itens por categoria
  async getItemsByCategory(category: string): Promise<MenuItem[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('menu_items')
        .select('*')
        .eq('category', category)
        .eq('available', true)
        .order('name')

      if (error) {
        console.error('Erro ao buscar itens por categoria:', error)
        return []
      }
      
      return isValidData<MenuItem>(data) ? data : []
    } catch (error) {
      console.error('Erro ao buscar itens por categoria:', error)
      return []
    }
  },

  // Buscar itens com filtro de texto
  async searchItems(searchTerm: string): Promise<MenuItem[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .or(`name.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%`)
        .order('category')
        .order('name')

      if (error) {
        console.error('Erro ao buscar itens:', error)
        return []
      }
      
      return isValidData<MenuItem>(data) ? data : []
    } catch (error) {
      console.error('Erro ao buscar itens:', error)
      return []
    }
  },

  // Buscar categorias disponíveis
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('menu_items')
        .select('category')
        .eq('available', true)

      if (error) {
        console.error('Erro ao buscar categorias:', error)
        return []
      }
      
      if (!isValidData(data)) return []
      
      const uniqueCategories = new Set(data.map((item: any) => item.category as string))
      return Array.from(uniqueCategories).sort()
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      return []
    }
  }
}

// ============================
// RESERVATIONS OPERATIONS
// ============================

export const reservasApi = {
  // Buscar reservas do usuário
  async getUserReservations(userId: string): Promise<Reserva[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('reservas')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: true })

      if (error) {
        console.error('Erro ao buscar reservas do usuário:', error)
        return []
      }
      
      return isValidData<Reserva>(data) ? data : []
    } catch (error) {
      console.error('Erro ao buscar reservas do usuário:', error)
      return []
    }
  },

  // Criar nova reserva
  async createReservation(reserva: Database['public']['Tables']['reservas']['Insert']): Promise<Reserva | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('reservas')
        .insert(reserva)
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar reserva:', error)
        throw error
      }

      return isValidSingleData<Reserva>(data) ? data : null
    } catch (error) {
      console.error('Erro ao criar reserva:', error)
      throw error
    }
  },

  // Atualizar reserva
  async updateReservation(id: string, updates: Database['public']['Tables']['reservas']['Update']): Promise<Reserva | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('reservas')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar reserva:', error)
        throw error
      }

      return isValidSingleData<Reserva>(data) ? data : null
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error)
      throw error
    }
  },

  // Deletar reserva
  async deleteReservation(id: string): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('reservas')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao deletar reserva:', error)
        throw error
      }
    } catch (error) {
      console.error('Erro ao deletar reserva:', error)
      throw error
    }
  },

  // Verificar disponibilidade
  async checkAvailability(data: string, horario: string): Promise<boolean> {
    try {
      const { data: reservas, error } = await (supabase as any)
        .from('reservas')
        .select('id')
        .eq('data', data)
        .eq('horario', horario)
        .neq('status', 'cancelada')

      if (error) {
        console.error('Erro ao verificar disponibilidade:', error)
        return false
      }
      
      if (!isValidData(reservas)) return true
      
      // Assumindo limite de 10 reservas por horário
      return reservas.length < 10
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error)
      return false
    }
  }
}

// ============================
// ANALYTICS & STATS
// ============================

export const analyticsApi = {
  // Estatísticas do menu
  async getMenuStats() {
    try {
      const { data, error } = await (supabase as any)
        .from('menu_items')
        .select('category, id')
        .eq('available', true)

      if (error) {
        console.error('Erro ao buscar estatísticas do menu:', error)
        return null
      }

      if (!isValidData(data)) return null

      const stats = data.reduce((acc: Record<string, number>, item: any) => {
        acc[item.category] = (acc[item.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        totalItems: data.length,
        byCategory: stats
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas do menu:', error)
      return null
    }
  },

  // Estatísticas de reservas
  async getReservationStats(userId?: string) {
    try {
      let query = (supabase as any)
        .from('reservas')
        .select('status, data, pessoas')

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar estatísticas de reservas:', error)
        return null
      }

      if (!isValidData(data)) return { total: 0, byStatus: {}, totalPessoas: 0 }

      const stats = data.reduce((acc: any, reserva: any) => {
        acc.total = (acc.total || 0) + 1
        acc.byStatus = acc.byStatus || {}
        acc.byStatus[reserva.status] = (acc.byStatus[reserva.status] || 0) + 1
        acc.totalPessoas = (acc.totalPessoas || 0) + reserva.pessoas
        return acc
      }, {})

      return stats || { total: 0, byStatus: {}, totalPessoas: 0 }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de reservas:', error)
      return null
    }
  }
}

// ============================
// UTILITY FUNCTIONS
// ============================

export const utils = {
  // Formatar erro para exibição
  formatError(error: any): string {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    return 'Erro desconhecido'
  },

  // Validar formato de data
  isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  },

  // Verificar se a data é futura
  isFutureDate(dateString: string): boolean {
    const date = new Date(dateString)
    const now = new Date()
    return date > now
  },

  // Gerar slug a partir do título
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
}

/**
 * Safely handles API responses, checking content-type before parsing JSON
 * Prevents "Unexpected token '<'" errors when server returns HTML instead of JSON
 */
export async function handleApiResponse<T = any>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  
  if (!response.ok) {
    // Handle error responses
    if (contentType && contentType.includes('application/json')) {
      try {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || `Erro ${response.status}`)
      } catch (jsonError) {
        console.error('Error parsing JSON error response:', jsonError)
        throw new Error(`Erro ${response.status}: Falha na comunicação com o servidor`)
      }
    } else {
      // Response is not JSON (probably HTML error page)
      const errorText = await response.text()
      console.error('Non-JSON error response:', errorText)
      throw new Error(`Erro ${response.status}: Serviço temporariamente indisponível`)
    }
  }

  // Handle successful responses
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Resposta inválida do servidor (não é JSON)')
  }

  try {
    return await response.json()
  } catch (jsonError) {
    console.error('Error parsing JSON success response:', jsonError)
    throw new Error('Erro ao processar resposta do servidor')
  }
}

/**
 * Makes a safe API request with proper error handling
 */
export async function safeApiRequest<T = any>(
  url: string, 
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options)
    return await handleApiResponse<T>(response)
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.')
    }
    
    // Re-throw other errors
    throw error
  }
} 