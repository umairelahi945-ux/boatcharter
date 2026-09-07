export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      boats: {
        Row: {
          amenities: string[]
          archived_at: string | null
          capacity: number
          category: string
          created_at: string
          daily_rate_cents: number
          description: string
          hourly_rate_cents: number
          id: string
          image_urls: string[]
          is_available: boolean
          length_ft: number
          location: string
          title: string
          updated_at: string
        }
        Insert: {
          amenities?: string[]
          archived_at?: string | null
          capacity?: number
          category: string
          created_at?: string
          daily_rate_cents?: number
          description?: string
          hourly_rate_cents?: number
          id?: string
          image_urls?: string[]
          is_available?: boolean
          length_ft?: number
          location?: string
          title: string
          updated_at?: string
        }
        Update: {
          amenities?: string[]
          archived_at?: string | null
          capacity?: number
          category?: string
          created_at?: string
          daily_rate_cents?: number
          description?: string
          hourly_rate_cents?: number
          id?: string
          image_urls?: string[]
          is_available?: boolean
          length_ft?: number
          location?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          amount_paid_cents: number
          balance_due_cents: number
          boat_id: string | null
          boat_title: string
          booking_type: string
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string
          deposit_cents: number
          duration: number
          end_date: string
          fees_cents: number
          guest_count: number
          id: string
          payment_status: string
          reference: string
          start_date: string
          status: string
          subtotal_cents: number
          total_price_cents: number
          updated_at: string
        }
        Insert: {
          amount_paid_cents?: number
          balance_due_cents?: number
          boat_id?: string | null
          boat_title?: string
          booking_type: string
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          deposit_cents?: number
          duration: number
          end_date: string
          fees_cents?: number
          guest_count?: number
          id?: string
          payment_status?: string
          reference: string
          start_date: string
          status?: string
          subtotal_cents?: number
          total_price_cents?: number
          updated_at?: string
        }
        Update: {
          amount_paid_cents?: number
          balance_due_cents?: number
          boat_id?: string | null
          boat_title?: string
          booking_type?: string
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          deposit_cents?: number
          duration?: number
          end_date?: string
          fees_cents?: number
          guest_count?: number
          id?: string
          payment_status?: string
          reference?: string
          start_date?: string
          status?: string
          subtotal_cents?: number
          total_price_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_boat_id_fkey"
            columns: ["boat_id"]
            isOneToOne: false
            referencedRelation: "boats"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_history: {
        Row: {
          amount_cents: number
          boat_id: string | null
          boat_title: string
          booking_id: string | null
          booking_reference: string
          created_at: string
          currency: string
          customer_name: string
          event: string
          event_type: string
          id: string
          notes: string
          occurred_at: string
          status: string
          transaction_id: string
        }
        Insert: {
          amount_cents?: number
          boat_id?: string | null
          boat_title?: string
          booking_id?: string | null
          booking_reference?: string
          created_at?: string
          currency?: string
          customer_name?: string
          event: string
          event_type: string
          id?: string
          notes?: string
          occurred_at?: string
          status?: string
          transaction_id?: string
        }
        Update: {
          amount_cents?: number
          boat_id?: string | null
          boat_title?: string
          booking_id?: string | null
          booking_reference?: string
          created_at?: string
          currency?: string
          customer_name?: string
          event?: string
          event_type?: string
          id?: string
          notes?: string
          occurred_at?: string
          status?: string
          transaction_id?: string
        }
        Relationships: []
      }
      financial_records: {
        Row: {
          amount_cents: number
          boat_id: string | null
          boat_title: string
          booking_id: string | null
          created_at: string
          currency: string
          customer_name: string
          id: string
          notes: string
          payment_method: string
          payment_status: string
          transaction_date: string
          transaction_id: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          boat_id?: string | null
          boat_title?: string
          booking_id?: string | null
          created_at?: string
          currency?: string
          customer_name?: string
          id?: string
          notes?: string
          payment_method?: string
          payment_status?: string
          transaction_date?: string
          transaction_id: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          boat_id?: string | null
          boat_title?: string
          booking_id?: string | null
          created_at?: string
          currency?: string
          customer_name?: string
          id?: string
          notes?: string
          payment_method?: string
          payment_status?: string
          transaction_date?: string
          transaction_id?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_boat_id_fkey"
            columns: ["boat_id"]
            isOneToOne: false
            referencedRelation: "boats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_records_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          booking_id: string | null
          created_at: string
          currency: string
          id: string
          last_four_digits: string | null
          payment_method_type: string
          payment_status: string
          provider: string
          transaction_id: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          last_four_digits?: string | null
          payment_method_type?: string
          payment_status?: string
          provider?: string
          transaction_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          last_four_digits?: string | null
          payment_method_type?: string
          payment_status?: string
          provider?: string
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string
          provider: string
        }
        Insert: {
          event_id: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string
          provider?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string
          provider?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_authorized_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
