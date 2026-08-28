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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      charge_sessions: {
        Row: {
          cost_cents: number
          duration_min: number
          ended_at: string | null
          energy_kwh: number
          id: string
          power_kw: number
          started_at: string
          station_address: string | null
          station_name: string
          user_id: string
        }
        Insert: {
          cost_cents?: number
          duration_min?: number
          ended_at?: string | null
          energy_kwh?: number
          id?: string
          power_kw?: number
          started_at?: string
          station_address?: string | null
          station_name: string
          user_id: string
        }
        Update: {
          cost_cents?: number
          duration_min?: number
          ended_at?: string | null
          energy_kwh?: number
          id?: string
          power_kw?: number
          started_at?: string
          station_address?: string | null
          station_name?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          high_contrast: boolean
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          high_contrast?: boolean
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          high_contrast?: boolean
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rfid_tags: {
        Row: {
          active: boolean
          created_at: string
          id: string
          label: string
          serial: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          label: string
          serial: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string
          serial?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      smartcar_connections: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          make: string | null
          mode: string
          model: string | null
          refresh_token: string
          updated_at: string
          user_id: string
          vehicle_id: string
          year: number | null
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          make?: string | null
          mode?: string
          model?: string | null
          refresh_token: string
          updated_at?: string
          user_id: string
          vehicle_id: string
          year?: number | null
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          make?: string | null
          mode?: string
          model?: string | null
          refresh_token?: string
          updated_at?: string
          user_id?: string
          vehicle_id?: string
          year?: number | null
        }
        Relationships: []
      }
      smartcar_oauth_states: {
        Row: {
          created_at: string
          expires_at: string
          redirect_uri: string
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          redirect_uri: string
          state: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          redirect_uri?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      trip_plans: {
        Row: {
          created_at: string
          destination: string
          id: string
          name: string
          origin: string
          start_soc: number
          stops: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination: string
          id?: string
          name: string
          origin: string
          start_soc?: number
          stops?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string
          id?: string
          name?: string
          origin?: string
          start_soc?: number
          stops?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          battery_kwh: number
          brand: string
          created_at: string
          id: string
          is_primary: boolean
          model: string
          plate: string | null
          range_km: number
          updated_at: string
          user_id: string
        }
        Insert: {
          battery_kwh?: number
          brand: string
          created_at?: string
          id?: string
          is_primary?: boolean
          model: string
          plate?: string | null
          range_km?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          battery_kwh?: number
          brand?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          model?: string
          plate?: string | null
          range_km?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_balances: {
        Row: {
          balance_cents: number
          plan: Database["public"]["Enums"]["subscription_plan"]
          plan_renews_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_cents?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          plan_renews_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_cents?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          plan_renews_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount_cents: number
          created_at: string
          description: string
          id: string
          kind: string
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          description: string
          id?: string
          kind: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          description?: string
          id?: string
          kind?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_plan: "bronze" | "silver" | "gold"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      subscription_plan: ["bronze", "silver", "gold"],
    },
  },
} as const
