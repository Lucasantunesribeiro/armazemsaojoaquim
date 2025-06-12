import { supabase } from './supabase'
import { Tables } from '../types/database.types'

// ============================
// BLOG OPERATIONS
// ============================

export type BlogPost = Tables<'blog_posts'>
export type MenuItem = Tables<'menu_items'>
export type Reserva = Tables<'reservas'>

export const blogApi = {
  // Buscar todos os posts publicados
  async getAllPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('publicado', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Buscar post por slug
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('publicado', true)
      .single()

    if (error) return null
    return data
  },

  // Buscar posts com busca por texto
  async searchPosts(searchTerm: string): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('publicado', true)
      .or(`titulo.ilike.%${searchTerm}%, resumo.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}

// ============================
// MENU OPERATIONS
// ============================

export const menuApi = {
  // Buscar todos os itens disponíveis
  async getAllItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('category')
      .order('name')

    if (error) throw error
    return data || []
  },

  // Buscar itens por categoria
  async getItemsByCategory(category: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', category)
      .eq('available', true)
      .order('name')

    if (error) throw error
    return data || []
  },

  // Buscar itens com filtro de texto
  async searchItems(searchTerm: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .or(`name.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%`)
      .order('category')
      .order('name')

    if (error) throw error
    return data || []
  },

  // Buscar categorias disponíveis
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('category')
      .eq('available', true)

    if (error) throw error
    
    const uniqueCategories = new Set(data?.map((item: any) => item.category as string) || [])
    const categories = Array.from(uniqueCategories) as string[]
    return categories.sort()
  }
}

// ============================
// RESERVATIONS OPERATIONS
// ============================

export const reservasApi = {
  // Buscar reservas do usuário
  async getUserReservations(userId: string): Promise<Reserva[]> {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Criar nova reserva
  async createReservation(reserva: Omit<Reserva, 'id' | 'created_at' | 'updated_at'>): Promise<Reserva> {
    const { data, error } = await supabase
      .from('reservas')
      .insert(reserva)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('Falha ao criar reserva')
    return data
  },

  // Atualizar reserva
  async updateReservation(id: string, updates: Partial<Reserva>): Promise<Reserva> {
    const { data, error } = await supabase
      .from('reservas')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('Falha ao atualizar reserva')
    return data
  },

  // Deletar reserva
  async deleteReservation(id: string): Promise<void> {
    const { error } = await supabase
      .from('reservas')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Verificar disponibilidade
  async checkAvailability(data: string, horario: string): Promise<boolean> {
    const { data: reservas, error } = await supabase
      .from('reservas')
      .select('id')
      .eq('data', data)
      .eq('horario', horario)
      .neq('status', 'cancelada')

    if (error) return false
    
    // Assumindo limite de 10 reservas por horário
    return (reservas?.length || 0) < 10
  }
}

// ============================
// ANALYTICS & STATS
// ============================

export const analyticsApi = {
  // Estatísticas do menu
  async getMenuStats() {
    const { data, error } = await supabase
      .from('menu_items')
      .select('category, id')
      .eq('available', true)

    if (error) return null

    const stats = data?.reduce((acc: Record<string, number>, item: any) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return stats
  },

  // Estatísticas de reservas
  async getReservationStats(userId?: string) {
    let query = supabase
      .from('reservas')
      .select('status, data, pessoas')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) return null

    const stats = data?.reduce((acc: Record<string, number>, reserva: any) => {
      acc.total = (acc.total || 0) + 1
      acc[reserva.status] = (acc[reserva.status] || 0) + 1
      acc.totalPessoas = (acc.totalPessoas || 0) + reserva.pessoas
      return acc
    }, {} as Record<string, number>)

    return stats
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
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
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