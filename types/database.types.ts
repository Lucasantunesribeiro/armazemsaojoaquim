export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          author: string
          published: boolean
          featured: boolean
          category: string | null
          tags: string[] | null
          meta_title: string | null
          meta_description: string | null
          image_url: string | null
          read_time: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          author: string
          published?: boolean
          featured?: boolean
          category?: string | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          image_url?: string | null
          read_time?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          author?: string
          published?: boolean
          featured?: boolean
          category?: string | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          image_url?: string | null
          read_time?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: string
          available: boolean
          featured: boolean
          allergens: string[] | null
          image_url: string | null
          preparation_time: number | null
          ingredients: string[] | null
          nutritional_info: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category: string
          available?: boolean
          featured?: boolean
          allergens?: string[] | null
          image_url?: string | null
          preparation_time?: number | null
          ingredients?: string[] | null
          nutritional_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string
          available?: boolean
          featured?: boolean
          allergens?: string[] | null
          image_url?: string | null
          preparation_time?: number | null
          ingredients?: string[] | null
          nutritional_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservas: {
        Row: {
          id: string
          user_id: string | null
          data: string
          horario: string
          pessoas: number
          status: string
          observacoes: string | null
          email_confirmacao_enviado: boolean
          telefone_confirmacao: string | null
          codigo_confirmacao: string | null
          confirmado_em: string | null
          cancelado_em: string | null
          cancelado_por: string | null
          motivo_cancelamento: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          data: string
          horario: string
          pessoas: number
          status?: string
          observacoes?: string | null
          email_confirmacao_enviado?: boolean
          telefone_confirmacao?: string | null
          codigo_confirmacao?: string | null
          confirmado_em?: string | null
          cancelado_em?: string | null
          cancelado_por?: string | null
          motivo_cancelamento?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          data?: string
          horario?: string
          pessoas?: number
          status?: string
          observacoes?: string | null
          email_confirmacao_enviado?: boolean
          telefone_confirmacao?: string | null
          codigo_confirmacao?: string | null
          confirmado_em?: string | null
          cancelado_em?: string | null
          cancelado_por?: string | null
          motivo_cancelamento?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservas_cancelado_por_fkey"
            columns: ["cancelado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      reservas_stats: {
        Row: {
          mes: string | null
          total_reservas: number | null
          confirmadas: number | null
          canceladas: number | null
          pendentes: number | null
          media_pessoas: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      cancel_reserva: {
        Args: {
          reserva_id: string
          motivo?: string
        }
        Returns: undefined
      }
      confirm_reserva: {
        Args: {
          reserva_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

// Tipos específicos para reservas
export type Reserva = Tables<'reservas'>
export type ReservaInsert = TablesInsert<'reservas'>
export type ReservaUpdate = TablesUpdate<'reservas'>

export type ReservaStatus = 'pendente' | 'confirmada' | 'cancelada' | 'concluida'

export interface ReservaComplete extends Reserva {
  user?: {
    id: string
    email?: string
    user_metadata?: {
      name?: string
      phone?: string
    }
  }
}