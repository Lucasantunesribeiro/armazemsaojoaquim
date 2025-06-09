import { supabase } from './supabase'

// ============================
// BLOG OPERATIONS
// ============================

export interface BlogPost {
  id: string
  titulo: string
  conteudo: string
  resumo: string
  imagem: string | null
  slug: string
  created_at: string
  author_id: string
  publicado: boolean
}

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

export interface MenuItem {
  id: string
  nome: string
  descricao: string
  preco: number
  categoria: string
  disponivel: boolean
  imagem: string | null
  ingredientes: string[] | null
  alergenos: string[] | null
}

export const menuApi = {
  // Buscar todos os itens disponíveis
  async getAllItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('disponivel', true)
      .order('categoria')
      .order('nome')

    if (error) throw error
    return data || []
  },

  // Buscar itens por categoria
  async getItemsByCategory(categoria: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('categoria', categoria)
      .eq('disponivel', true)
      .order('nome')

    if (error) throw error
    return data || []
  },

  // Buscar itens com filtro de texto
  async searchItems(searchTerm: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('disponivel', true)
      .or(`nome.ilike.%${searchTerm}%, descricao.ilike.%${searchTerm}%`)
      .order('categoria')
      .order('nome')

    if (error) throw error
    return data || []
  },

  // Buscar categorias disponíveis
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('categoria')
      .eq('disponivel', true)

    if (error) throw error
    
    const uniqueCategories = new Set(data?.map(item => item.categoria) || [])
    const categories = Array.from(uniqueCategories)
    return categories.sort()
  }
}

// ============================
// RESERVATIONS OPERATIONS
// ============================

export interface Reserva {
  id: string
  data: string
  horario: string
  pessoas: number
  status: string
  observacoes: string | null
  user_id: string
  created_at: string
  updated_at: string
}

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
      .select('categoria, id')
      .eq('disponivel', true)

    if (error) return null

    const stats = data?.reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return stats
  },

  // Estatísticas de reservas
  async getReservationStats(userId?: string) {
    let query = supabase
      .from('reservas')
      .select('status, created_at')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) return null

    const stats = {
      total: data?.length || 0,
      confirmed: data?.filter(r => r.status === 'confirmada').length || 0,
      pending: data?.filter(r => r.status === 'pendente').length || 0,
      cancelled: data?.filter(r => r.status === 'cancelada').length || 0,
    }

    return stats
  }
}

// ============================
// UTILS
// ============================

export const apiUtils = {
  // Formatar erro para o usuário
  formatError(error: any): string {
    if (error?.message) {
      return error.message
    }
    return 'Ocorreu um erro inesperado. Tente novamente.'
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
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim()
  }
} 