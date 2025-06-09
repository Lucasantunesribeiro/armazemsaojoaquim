export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
      }
      reservas: {
        Row: {
          id: string
          data: string
          horario: string
          pessoas: number
          status: string
          user_id: string
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          data: string
          horario: string
          pessoas: number
          status?: string
          user_id: string
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          data?: string
          horario?: string
          pessoas?: number
          status?: string
          user_id?: string
          observacoes?: string | null
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          nome: string
          descricao: string
          preco: number
          categoria: string
          disponivel: boolean
          imagem: string | null
          ingredientes: string[] | null
          alergenos: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao: string
          preco: number
          categoria: string
          disponivel?: boolean
          imagem?: string | null
          ingredientes?: string[] | null
          alergenos?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string
          preco?: number
          categoria?: string
          disponivel?: boolean
          imagem?: string | null
          ingredientes?: string[] | null
          alergenos?: string[] | null
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          titulo: string
          conteudo: string
          resumo: string
          imagem: string | null
          publicado: boolean
          author_id: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          conteudo: string
          resumo: string
          imagem?: string | null
          publicado?: boolean
          author_id: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          conteudo?: string
          resumo?: string
          imagem?: string | null
          publicado?: boolean
          author_id?: string
          slug?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}