// Removed problematic import - using direct createClient instead
import { Database } from '../types/database.types'

// ============================
// SUPABASE CLIENT HELPER
// ============================

// Create a safe server client that doesn't use cookies in problematic contexts
async function createSafeServerClient() {
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

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
// BLOG OPERATIONS - MULTILINGUAL
// ============================

// Multilingual BlogPost interface
export interface BlogPostMultilingual {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  image_url: string | null
  meta_title: string | null
  meta_description: string | null
  category: string
  tags: string[]
  published: boolean
  featured: boolean
  author_name: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export const blogApi = {
  // Buscar todos os posts publicados por idioma
  async getAllPosts(language: string = 'pt'): Promise<BlogPostMultilingual[]> {
    try {
      console.log(`[blogApi] getAllPosts called for language: ${language}`)
      
      // Use server-side client when running on server, HTTP when on client
      if (typeof window === 'undefined') {
        // Server-side: use safe server client
        const supabase = await createSafeServerClient()
        
        const { data: posts, error } = await supabase
          .rpc('get_blog_posts_by_language', { p_language: language })
        
        if (error) {
          console.error('[blogApi] Supabase error:', error)
          return []
        }
        
        console.log(`[blogApi] Successfully fetched ${posts?.length || 0} posts from Supabase`)
        return posts || []
      } else {
        // Client-side: use HTTP API
        const baseUrl = window.location.origin
        const url = `${baseUrl}/api/blog/posts?lang=${encodeURIComponent(language)}&limit=50`
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-cache'
        })
        
        if (!response.ok) {
          console.warn(`[blogApi] API not ready (${response.status}) - returning empty array`)
          return []
        }
        
        const data = await response.json()
        console.log(`[blogApi] Successfully fetched ${data.posts?.length || 0} posts from API`)
        
        return data.posts || []
      }
      
    } catch (error) {
      console.warn('[blogApi] Error fetching posts:', error instanceof Error ? error.message : 'Unknown error')
      return []
    }
  },

  // Buscar post por slug e idioma
  async getPostBySlug(slug: string, language: string = 'pt'): Promise<BlogPostMultilingual | null> {
    try {
      console.log(`[blogApi] getPostBySlug called: ${slug} (${language})`)
      
      // Use server-side client when running on server, HTTP when on client
      if (typeof window === 'undefined') {
        // Server-side: use safe server client
        const supabase = await createSafeServerClient()
        
        const { data: posts, error } = await supabase
          .rpc('get_blog_post_by_slug', { p_slug: slug, p_language: language })
        
        if (error) {
          console.error('[blogApi] Supabase error:', error)
          return null
        }
        
        const post = posts?.[0] || null
        console.log(`[blogApi] Successfully fetched post from Supabase: ${post?.title}`)
        return post
      } else {
        // Client-side: use HTTP API
        const baseUrl = window.location.origin
        const url = `${baseUrl}/api/blog/posts/${encodeURIComponent(slug)}?lang=${encodeURIComponent(language)}`
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-cache'
        })
        
        if (!response.ok) {
          if (response.status === 404) {
            return null
          }
          console.warn(`[blogApi] API not ready (${response.status}) - returning null`)
          return null
        }
        
        const data = await response.json()
        console.log(`[blogApi] Successfully fetched post from API: ${data.post?.title}`)
        
        return data.post
      }
      
    } catch (error) {
      console.warn('[blogApi] Error fetching post:', error instanceof Error ? error.message : 'Unknown error')
      return null
    }
  },

  // Buscar posts em destaque por idioma
  async getFeaturedPosts(language: string = 'pt'): Promise<BlogPostMultilingual[]> {
    try {
      console.log(`[blogApi] getFeaturedPosts called for language: ${language}`)
      
      const allPosts = await this.getAllPosts(language)
      const featuredPosts = allPosts.filter(post => post.featured)
      
      console.log(`[blogApi] Found ${featuredPosts.length} featured posts`)
      return featuredPosts
      
    } catch (error) {
      console.warn('[blogApi] Error getting featured posts:', error instanceof Error ? error.message : 'Unknown error')
      return []
    }
  },

  // Buscar posts por categoria e idioma
  async getPostsByCategory(category: string, language: string = 'pt'): Promise<BlogPostMultilingual[]> {
    try {
      const allPosts = await this.getAllPosts(language)
      return allPosts.filter(post => post.category === category)
    } catch (error) {
      console.error('[blogApi] Erro ao buscar posts por categoria:', error)
      return []
    }
  },

  // Buscar posts com termo de busca
  async searchPosts(searchTerm: string, language: string = 'pt'): Promise<BlogPostMultilingual[]> {
    try {
      console.log(`[blogApi] Buscando posts com termo: ${searchTerm} (${language})`)
      
      const allPosts = await this.getAllPosts(language)
      return allPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    } catch (error) {
      console.error('[blogApi] Erro ao buscar posts:', error)
      return []
    }
  }
}

// Legacy functions for backward compatibility
export async function getAllPosts(language: string = 'pt'): Promise<BlogPostMultilingual[]> {
  return blogApi.getAllPosts(language)
}

export async function getPostBySlug(slug: string, language: string = 'pt'): Promise<BlogPostMultilingual | null> {
  return blogApi.getPostBySlug(slug, language)
}

export async function getFeaturedPosts(language: string = 'pt'): Promise<BlogPostMultilingual[]> {
  return blogApi.getFeaturedPosts(language)
}

export async function getPostsByCategory(category: string, language: string = 'pt'): Promise<BlogPostMultilingual[]> {
  return blogApi.getPostsByCategory(category, language)
}

// ============================
// MENU OPERATIONS
// ============================

export const menuApi = {
  // Buscar todos os itens disponíveis
  async getAllItems(): Promise<MenuItem[]> {
    try {
      const supabase = await createSafeServerClient()
      const { data, error } = await supabase
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
      const supabase = await createSafeServerClient()
      const { data, error } = await supabase
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
      const supabase = await createSafeServerClient()
      const { data, error } = await supabase
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
      const supabase = await createSafeServerClient()
      const { data, error } = await supabase
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
      const supabase = await createSafeServerClient()
      const { data, error } = await supabase
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
      const supabase = await createSafeServerClient()
      const { data, error } = await supabase
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
      const supabase = await createSafeServerClient()
      const { data, error } = await supabase
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
      const supabase = await createSafeServerClient()
      const { error } = await supabase
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
      const supabase = await createSafeServerClient()
      const { data: reservas, error } = await supabase
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
      const supabase = await createSafeServerClient()
      const { data, error } = await supabase
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
      const supabase = await createSafeServerClient()
      let query = supabase
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