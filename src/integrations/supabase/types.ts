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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_2fa: {
        Row: {
          created_at: string | null
          enrolled_at: string | null
          id: string
          is_enrolled: boolean
          last_verified_at: string | null
          recovery_codes: string[] | null
          secret: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          is_enrolled?: boolean
          last_verified_at?: string | null
          recovery_codes?: string[] | null
          secret?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          is_enrolled?: boolean
          last_verified_at?: string | null
          recovery_codes?: string[] | null
          secret?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action_type: string
          admin_user_id: string
          changes: Json | null
          created_at: string | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_name: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          blocked_at: string | null
          blocked_by: string
          created_at: string | null
          expires_at: string | null
          id: string
          ip_address: string
          reason: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_by: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address: string
          reason: string
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string
          reason?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          author_id: string | null
          body_images_data: Json | null
          created_at: string
          featured_image_url: string | null
          id: string
          main_content: string
          meta_description: string
          meta_title: string
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          author_id?: string | null
          body_images_data?: Json | null
          created_at?: string
          featured_image_url?: string | null
          id?: string
          main_content: string
          meta_description: string
          meta_title: string
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          author_id?: string | null
          body_images_data?: Json | null
          created_at?: string
          featured_image_url?: string | null
          id?: string
          main_content?: string
          meta_description?: string
          meta_title?: string
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      celebrities: {
        Row: {
          created_at: string
          date_of_birth: string
          face_embedding: Json | null
          id: string
          known_for_data: Json | null
          main_content: string
          meta_description: string
          meta_title: string
          name: string
          place_of_birth: string | null
          popularity_ranks: Json | null
          profession: string
          profile_image_url: string
          profile_slug: string
          updated_at: string
          zodiac_sign: string | null
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          face_embedding?: Json | null
          id?: string
          known_for_data?: Json | null
          main_content: string
          meta_description: string
          meta_title: string
          name: string
          place_of_birth?: string | null
          popularity_ranks?: Json | null
          profession: string
          profile_image_url: string
          profile_slug: string
          updated_at?: string
          zodiac_sign?: string | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          face_embedding?: Json | null
          id?: string
          known_for_data?: Json | null
          main_content?: string
          meta_description?: string
          meta_title?: string
          name?: string
          place_of_birth?: string | null
          popularity_ranks?: Json | null
          profession?: string
          profile_image_url?: string
          profile_slug?: string
          updated_at?: string
          zodiac_sign?: string | null
        }
        Relationships: []
      }
      gsc_submission_logs: {
        Row: {
          error_message: string | null
          id: string
          response_data: Json | null
          sitemap_url: string
          submission_status: string
          submitted_at: string
          submitted_by: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          response_data?: Json | null
          sitemap_url: string
          submission_status: string
          submitted_at?: string
          submitted_by?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          response_data?: Json | null
          sitemap_url?: string
          submission_status?: string
          submitted_at?: string
          submitted_by?: string | null
        }
        Relationships: []
      }
      profile_generations: {
        Row: {
          celebrity_id: string | null
          celebrity_name: string
          created_at: string
          engine_used: string
          error_message: string | null
          generated_by: string | null
          generation_status: string
          id: string
          source_url: string
        }
        Insert: {
          celebrity_id?: string | null
          celebrity_name: string
          created_at?: string
          engine_used: string
          error_message?: string | null
          generated_by?: string | null
          generation_status: string
          id?: string
          source_url: string
        }
        Update: {
          celebrity_id?: string | null
          celebrity_name?: string
          created_at?: string
          engine_used?: string
          error_message?: string | null
          generated_by?: string | null
          generation_status?: string
          id?: string
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_generations_celebrity_id_fkey"
            columns: ["celebrity_id"]
            isOneToOne: false
            referencedRelation: "celebrities"
            referencedColumns: ["id"]
          },
        ]
      }
      redirect_logs: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          new_url: string
          old_url: string
          redirect_type: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_url: string
          old_url: string
          redirect_type: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_url?: string
          old_url?: string
          redirect_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_2fa_safe: {
        Row: {
          created_at: string | null
          enrolled_at: string | null
          id: string | null
          is_enrolled: boolean | null
          last_verified_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          enrolled_at?: string | null
          id?: string | null
          is_enrolled?: boolean | null
          last_verified_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          enrolled_at?: string | null
          id?: string | null
          is_enrolled?: boolean | null
          last_verified_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_ip_blocks: { Args: never; Returns: undefined }
      cleanup_old_security_logs: { Args: never; Returns: undefined }
      get_celebrities_by_birthday: {
        Args: { birth_day: number; birth_month: number }
        Returns: {
          created_at: string
          date_of_birth: string
          id: string
          main_content: string
          meta_description: string
          meta_title: string
          name: string
          place_of_birth: string
          popularity_ranks: Json
          profession: string
          profile_image_url: string
          profile_slug: string
          updated_at: string
          zodiac_sign: string
        }[]
      }
      get_my_2fa_status: {
        Args: never
        Returns: {
          enrolled_at: string
          is_enrolled: boolean
          last_verified_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_gsc_submission_log: {
        Args: {
          p_error_message?: string
          p_response_data?: Json
          p_sitemap_url: string
          p_submission_status: string
        }
        Returns: string
      }
      insert_redirect_log: {
        Args: {
          p_ip_address?: string
          p_new_url: string
          p_old_url: string
          p_redirect_type: string
          p_user_agent?: string
        }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      is_ip_blocked: { Args: { ip_addr: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      log_admin_action: {
        Args: {
          p_action_type: string
          p_changes?: Json
          p_resource_id?: string
          p_resource_name?: string
          p_resource_type: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      reset_user_2fa: { Args: { p_user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "super_admin"
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
      app_role: ["admin", "moderator", "user", "super_admin"],
    },
  },
} as const
