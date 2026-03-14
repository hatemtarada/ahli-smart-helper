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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content_ar: string
          content_en: string
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          priority: number
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          content_ar?: string
          content_en?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          priority?: number
          title_ar: string
          title_en?: string
          updated_at?: string
        }
        Update: {
          content_ar?: string
          content_en?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          priority?: number
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          department_id: string | null
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          department_id?: string | null
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          department_id?: string | null
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name_ar: string
          name_en: string
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_ar: string
          name_en?: string
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_ar?: string
          name_en?: string
        }
        Relationships: []
      }
      doctor_schedules: {
        Row: {
          day_of_week: number
          doctor_id: string
          end_time: string
          id: string
          is_active: boolean
          slot_duration_minutes: number
          start_time: string
        }
        Insert: {
          day_of_week: number
          doctor_id: string
          end_time: string
          id?: string
          is_active?: boolean
          slot_duration_minutes?: number
          start_time: string
        }
        Update: {
          day_of_week?: number
          doctor_id?: string
          end_time?: string
          id?: string
          is_active?: boolean
          slot_duration_minutes?: number
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_schedules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          bio_ar: string | null
          bio_en: string | null
          created_at: string
          department_id: string | null
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name_ar: string
          name_en: string
          phone: string | null
          specialty_ar: string
          specialty_en: string
        }
        Insert: {
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_ar: string
          name_en?: string
          phone?: string | null
          specialty_ar?: string
          specialty_en?: string
        }
        Update: {
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_ar?: string
          name_en?: string
          phone?: string | null
          specialty_ar?: string
          specialty_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          patient_email: string | null
          patient_id: string | null
          patient_name: string | null
          status: string
          subject: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          status?: string
          subject?: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          status?: string
          subject?: string
          type?: string
        }
        Relationships: []
      }
      insurance_providers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name_ar: string
          name_en?: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          phone?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          description_ar: string
          description_en: string | null
          id: string
          invoice_id: string
          quantity: number
        }
        Insert: {
          amount?: number
          description_ar: string
          description_en?: string | null
          id?: string
          invoice_id: string
          quantity?: number
        }
        Update: {
          amount?: number
          description_ar?: string
          description_en?: string | null
          id?: string
          invoice_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          image_url: string | null
          invoice_number: string
          paid_amount: number
          patient_id: string
          status: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          image_url?: string | null
          invoice_number: string
          paid_amount?: number
          patient_id: string
          status?: string
          total_amount?: number
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          image_url?: string | null
          invoice_number?: string
          paid_amount?: number
          patient_id?: string
          status?: string
          total_amount?: number
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          source_url: string | null
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          source_url?: string | null
          title?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          source_url?: string | null
          title?: string
        }
        Relationships: []
      }
      lab_tests: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          notes: string | null
          patient_id: string
          result: string | null
          result_date: string | null
          status: string
          test_date: string
          test_name_ar: string
          test_name_en: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          patient_id: string
          result?: string | null
          result_date?: string | null
          status?: string
          test_date?: string
          test_name_ar: string
          test_name_en?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          patient_id?: string
          result?: string | null
          result_date?: string | null
          status?: string
          test_date?: string
          test_name_ar?: string
          test_name_en?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          gender: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          department_id: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          price: number | null
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          name_ar: string
          name_en?: string
          price?: number | null
        }
        Update: {
          created_at?: string
          department_id?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
    }
    Enums: {
      app_role: "admin" | "patient"
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
      app_role: ["admin", "patient"],
    },
  },
} as const
