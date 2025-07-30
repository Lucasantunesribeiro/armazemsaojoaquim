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
          content: string
          excerpt: string | null
          featured_image: string | null
          published: boolean
          author_id: string | null
          slug: string
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt?: string | null
          featured_image?: string | null
          published?: boolean
          author_id?: string | null
          slug: string
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string | null
          featured_image?: string | null
          published?: boolean
          author_id?: string | null
          slug?: string
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          display_order?: number
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
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      availability_settings: {
        Row: {
          id: string
          day_of_week: number
          opening_time: string
          closing_time: string
          max_capacity: number
          is_closed: boolean
          special_hours: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          day_of_week: number
          opening_time: string
          closing_time: string
          max_capacity?: number
          is_closed?: boolean
          special_hours?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          day_of_week?: number
          opening_time?: string
          closing_time?: string
          max_capacity?: number
          is_closed?: boolean
          special_hours?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          subject: string | null
          message: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          subject?: string | null
          message: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          subject?: string | null
          message?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      art_gallery: {
        Row: {
          id: string
          title: string
          artist: string
          description: string | null
          price: number
          image_url: string | null
          category: string
          dimensions: string | null
          year_created: number | null
          historical_context: string | null
          stock_quantity: number
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist: string
          description?: string | null
          price: number
          image_url?: string | null
          category: string
          dimensions?: string | null
          year_created?: number | null
          historical_context?: string | null
          stock_quantity?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category?: string
          dimensions?: string | null
          year_created?: number | null
          historical_context?: string | null
          stock_quantity?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      art_orders: {
        Row: {
          id: string
          customer_name: string
          email: string
          phone: string | null
          artwork_ids: string[]
          artwork_details: Json
          total_price: number
          shipping_address: Json
          status: string
          order_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          email: string
          phone?: string | null
          artwork_ids: string[]
          artwork_details: Json
          total_price: number
          shipping_address: Json
          status?: string
          order_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          email?: string
          phone?: string | null
          artwork_ids?: string[]
          artwork_details?: Json
          total_price?: number
          shipping_address?: Json
          status?: string
          order_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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

// Tipos específicos para galeria de arte
export type Artwork = Tables<'art_gallery'>
export type ArtworkInsert = TablesInsert<'art_gallery'>
export type ArtworkUpdate = TablesUpdate<'art_gallery'>

export type ArtOrder = Tables<'art_orders'>
export type ArtOrderInsert = TablesInsert<'art_orders'>
export type ArtOrderUpdate = TablesUpdate<'art_orders'>

export type ArtworkCategory = 'SANTA_TERESA_HISTORICA' | 'RIO_ANTIGO' | 'ARTE_CONTEMPORANEA' | 'RETRATOS_BAIRRO'
export type ArtOrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'