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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          first_food: boolean | null
          first_workout: boolean | null
          id: string
          plan_generated: boolean | null
          steps10k: boolean | null
          streak10: boolean | null
          streak7: boolean | null
          user_id: string
        }
        Insert: {
          first_food?: boolean | null
          first_workout?: boolean | null
          id?: string
          plan_generated?: boolean | null
          steps10k?: boolean | null
          streak10?: boolean | null
          streak7?: boolean | null
          user_id: string
        }
        Update: {
          first_food?: boolean | null
          first_workout?: boolean | null
          id?: string
          plan_generated?: boolean | null
          steps10k?: boolean | null
          streak10?: boolean | null
          streak7?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          calories: number | null
          carbs: number | null
          emoji: string | null
          fat: number | null
          id: string
          label: string | null
          logged_at: string | null
          name: string
          protein: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          emoji?: string | null
          fat?: number | null
          id?: string
          label?: string | null
          logged_at?: string | null
          name: string
          protein?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          emoji?: string | null
          fat?: number | null
          id?: string
          label?: string | null
          logged_at?: string | null
          name?: string
          protein?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          created_at: string | null
          goal: string | null
          height: number | null
          id: string
          name: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          created_at?: string | null
          goal?: string | null
          height?: number | null
          id: string
          name?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          created_at?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          name?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      streaks: {
        Row: {
          count: number | null
          id: string
          last_workout_date: string | null
          user_id: string
        }
        Insert: {
          count?: number | null
          id?: string
          last_workout_date?: string | null
          user_id: string
        }
        Update: {
          count?: number | null
          id?: string
          last_workout_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          date: string | null
          glasses: number | null
          id: string
          user_id: string
        }
        Insert: {
          date?: string | null
          glasses?: number | null
          id?: string
          user_id: string
        }
        Update: {
          date?: string | null
          glasses?: number | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      weight_history: {
        Row: {
          date: string | null
          id: string
          user_id: string
          weight: number
        }
        Insert: {
          date?: string | null
          id?: string
          user_id: string
          weight: number
        }
        Update: {
          date?: string | null
          id?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      workouts: {
        Row: {
          calories_burned: number | null
          completed_at: string | null
          duration: number | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          calories_burned?: number | null
          completed_at?: string | null
          duration?: number | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          calories_burned?: number | null
          completed_at?: string | null
          duration?: number | null
          id?: string
          type?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
