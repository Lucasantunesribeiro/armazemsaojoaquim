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
          content_html: string | null
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
          content_html?: string | null
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
          content_html?: string | null
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
      pousada_rooms: {
        Row: {
          id: string
          name: string
          type: string
          price_refundable: number
          price_non_refundable: number
          description: string | null
          amenities: string[] | null
          max_guests: number
          image_url: string | null
          available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          price_refundable: number
          price_non_refundable: number
          description?: string | null
          amenities?: string[] | null
          max_guests: number
          image_url?: string | null
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          price_refundable?: number
          price_non_refundable?: number
          description?: string | null
          amenities?: string[] | null
          max_guests?: number
          image_url?: string | null
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pousada_bookings: {
        Row: {
          id: string
          room_id: string
          guest_name: string
          email: string
          phone: string
          check_in: string
          check_out: string
          guests_count: number
          total_price: number
          status: string
          refundable: boolean
          special_requests: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          guest_name: string
          email: string
          phone: string
          check_in: string
          check_out: string
          guests_count: number
          total_price: number
          status?: string
          refundable?: boolean
          special_requests?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          guest_name?: string
          email?: string
          phone?: string
          check_in?: string
          check_out?: string
          guests_count?: number
          total_price?: number
          status?: string
          refundable?: boolean
          special_requests?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pousada_bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "pousada_rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      cafe_products: {
        Row: {
          id: string
          name: string
          category: string
          price: number
          description: string | null
          image_url: string | null
          available: boolean
          featured: boolean
          ingredients: string[] | null
          allergens: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          price: number
          description?: string | null
          image_url?: string | null
          available?: boolean
          featured?: boolean
          ingredients?: string[] | null
          allergens?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          price?: number
          description?: string | null
          image_url?: string | null
          available?: boolean
          featured?: boolean
          ingredients?: string[] | null
          allergens?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cafe_orders: {
        Row: {
          id: string
          customer_name: string
          email: string
          phone: string
          products: Json
          total_price: number
          order_date: string
          status: string
          special_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          email: string
          phone: string
          products: Json
          total_price: number
          order_date?: string
          status?: string
          special_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          email?: string
          phone?: string
          products?: Json
          total_price?: number
          order_date?: string
          status?: string
          special_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      galeria_artworks: {
        Row: {
          id: string
          title: string
          artist: string
          category: string
          technique: string | null
          dimensions: string | null
          year_created: number | null
          price: number
          description: string | null
          image_url: string | null
          gallery_images: string[] | null
          available: boolean
          featured: boolean
          tags: string[] | null
          provenance: string | null
          certificate_authenticity: boolean
          artist_bio: string | null
          condition: string
          frame_included: boolean
          shipping_info: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist: string
          category: string
          technique?: string | null
          dimensions?: string | null
          year_created?: number | null
          price: number
          description?: string | null
          image_url?: string | null
          gallery_images?: string[] | null
          available?: boolean
          featured?: boolean
          tags?: string[] | null
          provenance?: string | null
          certificate_authenticity?: boolean
          artist_bio?: string | null
          condition?: string
          frame_included?: boolean
          shipping_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist?: string
          category?: string
          technique?: string | null
          dimensions?: string | null
          year_created?: number | null
          price?: number
          description?: string | null
          image_url?: string | null
          gallery_images?: string[] | null
          available?: boolean
          featured?: boolean
          tags?: string[] | null
          provenance?: string | null
          certificate_authenticity?: boolean
          artist_bio?: string | null
          condition?: string
          frame_included?: boolean
          shipping_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      galeria_orders: {
        Row: {
          id: string
          customer_name: string
          customer_email: string
          customer_phone: string | null
          customer_address: string | null
          total_amount: number
          status: string
          payment_method: string | null
          shipping_method: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          customer_address?: string | null
          total_amount: number
          status?: string
          payment_method?: string | null
          shipping_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          customer_address?: string | null
          total_amount?: number
          status?: string
          payment_method?: string | null
          shipping_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      galeria_order_items: {
        Row: {
          id: string
          order_id: string
          artwork_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          artwork_id: string
          quantity?: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          artwork_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "galeria_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "galeria_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "galeria_order_items_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "galeria_artworks"
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

// Tipos específicos para pousada
export type PousadaRoom = Tables<'pousada_rooms'>
export type PousadaRoomInsert = TablesInsert<'pousada_rooms'>
export type PousadaRoomUpdate = TablesUpdate<'pousada_rooms'>

export type PousadaBooking = Tables<'pousada_bookings'>
export type PousadaBookingInsert = TablesInsert<'pousada_bookings'>
export type PousadaBookingUpdate = TablesUpdate<'pousada_bookings'>

export type PousadaBookingStatus = 'pendente' | 'confirmada' | 'cancelada' | 'concluida'
export type PousadaRoomType = 'STANDARD' | 'DELUXE' | 'SUITE'

export interface PousadaBookingComplete extends PousadaBooking {
  room?: PousadaRoom
}

// Tipos específicos para café
export type CafeProduct = Tables<'cafe_products'>
export type CafeProductInsert = TablesInsert<'cafe_products'>
export type CafeProductUpdate = TablesUpdate<'cafe_products'>

export type CafeOrder = Tables<'cafe_orders'>
export type CafeOrderInsert = TablesInsert<'cafe_orders'>
export type CafeOrderUpdate = TablesUpdate<'cafe_orders'>

export type CafeOrderStatus = 'pendente' | 'preparando' | 'pronto' | 'entregue' | 'cancelado'
export type CafeProductCategory = 'cafes' | 'sorvetes' | 'doces' | 'salgados' | 'bebidas'

// Tipos específicos para galeria
export type GaleriaArtwork = Tables<'galeria_artworks'>
export type GaleriaArtworkInsert = TablesInsert<'galeria_artworks'>
export type GaleriaArtworkUpdate = TablesUpdate<'galeria_artworks'>

export type GaleriaOrder = Tables<'galeria_orders'>
export type GaleriaOrderInsert = TablesInsert<'galeria_orders'>
export type GaleriaOrderUpdate = TablesUpdate<'galeria_orders'>

export type GaleriaOrderItem = Tables<'galeria_order_items'>
export type GaleriaOrderItemInsert = TablesInsert<'galeria_order_items'>
export type GaleriaOrderItemUpdate = TablesUpdate<'galeria_order_items'>

export type ArtworkCategory = 'pintura' | 'escultura' | 'fotografia' | 'gravura' | 'desenho' | 'arte_digital'
export type ArtworkCondition = 'excelente' | 'muito_bom' | 'bom' | 'regular' | 'necessita_restauro'
export type GaleriaOrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface GaleriaOrderComplete extends GaleriaOrder {
  items?: (GaleriaOrderItem & {
    artwork?: GaleriaArtwork
  })[]
}