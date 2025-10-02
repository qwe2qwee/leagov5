// types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          phone_verified_at: string | null;
          age: number | null;
          gender: string | null;
          role: Database["public"]["Enums"]["user_role"];
          location: string | null;
          is_verified: boolean;
          user_latitude: number | null;
          user_longitude: number | null;
          location_updated_at: string | null;
          location_accuracy: number | null;
          geom: string | null; // geography type as string
          branch_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          phone_verified_at?: string | null;
          age?: number | null;
          gender?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          location?: string | null;
          is_verified?: boolean;
          user_latitude?: number | null;
          user_longitude?: number | null;
          location_updated_at?: string | null;
          location_accuracy?: number | null;
          geom?: string | null;
          branch_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          phone_verified_at?: string | null;
          age?: number | null;
          gender?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          location?: string | null;
          is_verified?: boolean;
          user_latitude?: number | null;
          user_longitude?: number | null;
          location_updated_at?: string | null;
          location_accuracy?: number | null;
          geom?: string | null;
          branch_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          document_type: string;
          document_url: string;
          status: Database["public"]["Enums"]["document_status"];
          rejection_reason: string | null;
          verified_by: string | null;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_type: string;
          document_url: string;
          status?: Database["public"]["Enums"]["document_status"];
          rejection_reason?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_type?: string;
          document_url?: string;
          status?: Database["public"]["Enums"]["document_status"];
          rejection_reason?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      branches: {
        Row: {
          id: string;
          name_en: string;
          name_ar: string | null;
          location_en: string;
          location_ar: string | null;
          latitude: number | null;
          longitude: number | null;
          geom: string | null; // geography type as string
          phone: string | null;
          email: string | null;
          working_hours: string | null;
          is_active: boolean;
          manager_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name_en: string;
          name_ar?: string | null;
          location_en: string;
          location_ar?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          geom?: string | null;
          phone?: string | null;
          email?: string | null;
          working_hours?: string | null;
          is_active?: boolean;
          manager_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_ar?: string | null;
          location_en?: string;
          location_ar?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          geom?: string | null;
          phone?: string | null;
          email?: string | null;
          working_hours?: string | null;
          is_active?: boolean;
          manager_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_manager";
            columns: ["manager_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      car_brands: {
        Row: {
          id: string;
          name_en: string;
          name_ar: string | null;
          logo_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name_en: string;
          name_ar?: string | null;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_ar?: string | null;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      car_models: {
        Row: {
          id: string;
          brand_id: string;
          name_en: string;
          name_ar: string | null;
          year: number;
          default_image_url: string | null;
          description_en: string | null;
          description_ar: string | null;
          specifications: Json | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          name_en: string;
          name_ar?: string | null;
          year: number;
          default_image_url?: string | null;
          description_en?: string | null;
          description_ar?: string | null;
          specifications?: Json | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          brand_id?: string;
          name_en?: string;
          name_ar?: string | null;
          year?: number;
          default_image_url?: string | null;
          description_en?: string | null;
          description_ar?: string | null;
          specifications?: Json | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "car_models_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "car_brands";
            referencedColumns: ["id"];
          }
        ];
      };
      car_colors: {
        Row: {
          id: string;
          name_en: string;
          name_ar: string | null;
          hex_code: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name_en: string;
          name_ar?: string | null;
          hex_code?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_ar?: string | null;
          hex_code?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      cars: {
        Row: {
          id: string;
          branch_id: string;
          model_id: string;
          color_id: string;
          daily_price: number;
          weekly_price: number | null;
          monthly_price: number | null;
          ownership_price: number | null;
          mileage: number;
          seats: number;
          fuel_type: string;
          transmission: string;
          features: string[] | null;
          features_ar: string[] | null;
          features_en: string[] | null;
          branch_description_ar: string | null;
          branch_description_en: string | null;
          branch_images: string[] | null;
          quantity: number;
          available_quantity: number;
          status: Database["public"]["Enums"]["car_status"];
          is_new: boolean;
          discount_percentage: number;
          offer_expires_at: string | null;
          rental_types: Database["public"]["Enums"]["rental_type"][];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          branch_id: string;
          model_id: string;
          color_id: string;
          daily_price: number;
          weekly_price?: number | null;
          monthly_price?: number | null;
          ownership_price?: number | null;
          mileage?: number;
          seats?: number;
          fuel_type?: string;
          transmission?: string;
          features?: string[] | null;
          features_ar?: string[] | null;
          features_en?: string[] | null;
          branch_description_ar?: string | null;
          branch_description_en?: string | null;
          branch_images?: string[] | null;
          quantity?: number;
          available_quantity?: number;
          status?: Database["public"]["Enums"]["car_status"];
          is_new?: boolean;
          discount_percentage?: number;
          offer_expires_at?: string | null;
          rental_types?: Database["public"]["Enums"]["rental_type"][];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          branch_id?: string;
          model_id?: string;
          color_id?: string;
          daily_price?: number;
          weekly_price?: number | null;
          monthly_price?: number | null;
          ownership_price?: number | null;
          mileage?: number;
          seats?: number;
          fuel_type?: string;
          transmission?: string;
          features?: string[] | null;
          features_ar?: string[] | null;
          features_en?: string[] | null;
          branch_description_ar?: string | null;
          branch_description_en?: string | null;
          branch_images?: string[] | null;
          quantity?: number;
          available_quantity?: number;
          status?: Database["public"]["Enums"]["car_status"];
          is_new?: boolean;
          discount_percentage?: number;
          offer_expires_at?: string | null;
          rental_types?: Database["public"]["Enums"]["rental_type"][];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cars_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cars_model_id_fkey";
            columns: ["model_id"];
            isOneToOne: false;
            referencedRelation: "car_models";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cars_color_id_fkey";
            columns: ["color_id"];
            isOneToOne: false;
            referencedRelation: "car_colors";
            referencedColumns: ["id"];
          }
        ];
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          car_id: string;
          branch_id: string;
          rental_type: Database["public"]["Enums"]["rental_type"];
          start_date: string; // DATE as string
          end_date: string; // DATE as string
          total_days: number;
          daily_rate: number;
          total_amount: number;
          discount_amount: number;
          final_amount: number;
          status: Database["public"]["Enums"]["booking_status"];
          payment_reference: string | null;
          approved_by: string | null;
          approved_at: string | null;
          notes: string | null;
          expires_at: string | null; // التحديث الجديد
          booking_range: string | null; // daterange as string
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          car_id: string;
          branch_id: string;
          rental_type: Database["public"]["Enums"]["rental_type"];
          start_date: string;
          end_date: string;
          total_days: number;
          daily_rate: number;
          total_amount: number;
          discount_amount?: number;
          final_amount: number;
          status?: Database["public"]["Enums"]["booking_status"];
          payment_reference?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          car_id?: string;
          branch_id?: string;
          rental_type?: Database["public"]["Enums"]["rental_type"];
          start_date?: string;
          end_date?: string;
          total_days?: number;
          daily_rate?: number;
          total_amount?: number;
          discount_amount?: number;
          final_amount?: number;
          status?: Database["public"]["Enums"]["booking_status"];
          payment_reference?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_car_id_fkey";
            columns: ["car_id"];
            isOneToOne: false;
            referencedRelation: "cars";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      announcements: {
        Row: {
          id: string;
          title_en: string;
          title_ar: string | null;
          description_en: string | null;
          description_ar: string | null;
          image_url: string | null;
          is_active: boolean;
          is_featured: boolean;
          priority: Database["public"]["Enums"]["announcement_priority"];
          branch_id: string | null;
          created_by: string;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title_en: string;
          title_ar?: string | null;
          description_en?: string | null;
          description_ar?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          priority?: Database["public"]["Enums"]["announcement_priority"];
          branch_id?: string | null;
          created_by: string;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title_en?: string;
          title_ar?: string | null;
          description_en?: string | null;
          description_ar?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          priority?: Database["public"]["Enums"]["announcement_priority"];
          branch_id?: string | null;
          created_by?: string;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "announcements_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "announcements_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title_en: string;
          title_ar: string | null;
          message_en: string;
          message_ar: string | null;
          type: Database["public"]["Enums"]["notification_type"];
          is_read: boolean;
          metadata: Json | null;
          created_by: string | null;
          sent_via: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title_en: string;
          title_ar?: string | null;
          message_en: string;
          message_ar?: string | null;
          type: Database["public"]["Enums"]["notification_type"];
          is_read?: boolean;
          metadata?: Json | null;
          created_by?: string | null;
          sent_via?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title_en?: string;
          title_ar?: string | null;
          message_en?: string;
          message_ar?: string | null;
          type?: Database["public"]["Enums"]["notification_type"];
          is_read?: boolean;
          metadata?: Json | null;
          created_by?: string | null;
          sent_via?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      car_offers: {
        Row: {
          id: string;
          car_id: string;
          branch_id: string;
          offer_name_ar: string;
          offer_name_en: string;
          description_ar: string | null;
          description_en: string | null;
          discount_type: string;
          discount_value: number;
          min_rental_days: number;
          max_rental_days: number | null;
          rental_types: Database["public"]["Enums"]["rental_type"][];
          valid_from: string;
          valid_until: string;
          max_uses: number | null;
          current_uses: number;
          is_active: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          branch_id: string;
          offer_name_ar: string;
          offer_name_en: string;
          description_ar?: string | null;
          description_en?: string | null;
          discount_type: string;
          discount_value: number;
          min_rental_days?: number;
          max_rental_days?: number | null;
          rental_types?: Database["public"]["Enums"]["rental_type"][];
          valid_from?: string;
          valid_until: string;
          max_uses?: number | null;
          current_uses?: number;
          is_active?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string;
          branch_id?: string;
          offer_name_ar?: string;
          offer_name_en?: string;
          description_ar?: string | null;
          description_en?: string | null;
          discount_type?: string;
          discount_value?: number;
          min_rental_days?: number;
          max_rental_days?: number | null;
          rental_types?: Database["public"]["Enums"]["rental_type"][];
          valid_from?: string;
          valid_until?: string;
          max_uses?: number | null;
          current_uses?: number;
          is_active?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "car_offers_car_id_fkey";
            columns: ["car_id"];
            isOneToOne: false;
            referencedRelation: "cars";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "car_offers_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "car_offers_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      rate_limits: {
        Row: {
          id: string;
          identifier: string;
          action_type: string;
          attempt_count: number;
          first_attempt: string | null;
          last_attempt: string | null;
          blocked_until: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          identifier: string;
          action_type: string;
          attempt_count?: number;
          first_attempt?: string | null;
          last_attempt?: string | null;
          blocked_until?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          identifier?: string;
          action_type?: string;
          attempt_count?: number;
          first_attempt?: string | null;
          last_attempt?: string | null;
          blocked_until?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      security_audit_log: {
        Row: {
          id: string;
          event_type: string;
          user_id: string | null;
          identifier: string | null;
          details: Json | null;
          user_agent: string | null;
          ip_address: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          event_type: string;
          user_id?: string | null;
          identifier?: string | null;
          details?: Json | null;
          user_agent?: string | null;
          ip_address?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          event_type?: string;
          user_id?: string | null;
          identifier?: string | null;
          details?: Json | null;
          user_agent?: string | null;
          ip_address?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "security_audit_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      notification_outbox: {
        Row: {
          id: number;
          created_at: string;
          created_by: string | null;
          to_user: string;
          type: Database["public"]["Enums"]["notification_type"];
        };
        Insert: {
          id?: number;
          created_at?: string;
          created_by?: string | null;
          to_user: string;
          type: Database["public"]["Enums"]["notification_type"];
        };
        Update: {
          id?: number;
          created_at?: string;
          created_by?: string | null;
          to_user?: string;
          type?: Database["public"]["Enums"]["notification_type"];
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: number;
          occurred_at: string;
          actor: string | null;
          table_name: string;
          row_id: string | null;
          action: string | null;
          old_data: Json | null;
          new_data: Json | null;
        };
        Insert: {
          id?: number;
          occurred_at?: string;
          actor?: string | null;
          table_name: string;
          row_id?: string | null;
          action?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
        };
        Update: {
          id?: number;
          occurred_at?: string;
          actor?: string | null;
          table_name?: string;
          row_id?: string | null;
          action?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
        };
        Relationships: [];
      };
      otp_requests: {
        Row: {
          id: string;
          user_id: string | null;
          phone: string;
          authentica_session_id: string | null;
          status: string | null;
          verified_at: string | null;
          created_at: string | null;
          expires_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          phone: string;
          authentica_session_id?: string | null;
          status?: string | null;
          verified_at?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          phone?: string;
          authentica_session_id?: string | null;
          status?: string | null;
          verified_at?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "otp_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      phone_verifications: {
        Row: {
          id: string;
          phone_number: string;
          verification_code: string;
          expires_at: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          phone_number: string;
          verification_code: string;
          expires_at: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          phone_number?: string;
          verification_code?: string;
          expires_at?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      auth_logs: {
        Row: {
          id: number;
          user_id: string | null;
          action: string;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          action: string;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string | null;
          action?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "auth_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      cars_with_images: {
        Row: {
          id: string;
          branch_id: string;
          model_id: string;
          color_id: string;
          daily_price: number;
          weekly_price: number | null;
          monthly_price: number | null;
          ownership_price: number | null;
          seats: number;
          mileage: number;
          fuel_type: string;
          transmission: string;
          features_en: string[] | null;
          features_ar: string[] | null;
          additional_images: string[] | null;
          quantity: number;
          available_quantity: number;
          status: Database["public"]["Enums"]["car_status"];
          is_new: boolean;
          discount_percentage: number;
          offer_expires_at: string | null;
          rental_types: Database["public"]["Enums"]["rental_type"][];
          description_ar: string | null;
          description_en: string | null;
          created_at: string;
          updated_at: string;
          brand_name_ar: string | null;
          brand_name_en: string;
          model_name_ar: string | null;
          model_name_en: string;
          main_image_url: string | null;
          model_description_ar: string | null;
          model_description_en: string | null;
          year: number;
          specifications: Json | null;
          color_name_ar: string | null;
          color_name_en: string;
          hex_code: string | null;
          branch_name_ar: string | null;
          branch_name_en: string;
          branch_location_ar: string | null;
          branch_location_en: string;
        };
      };
    };
    Functions: {
      // دوال المستخدمين والأدوار
      get_user_role: {
        Args: {
          _user_id: string;
        };
        Returns: Database["public"]["Enums"]["user_role"] | null;
      };
      is_user_verified: {
        Args: {
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_branch_manager: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      current_user_branch_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };

      // دوال الحجوزات
      check_car_availability: {
        Args: {
          _car_id: string;
          _start_date: string;
          _end_date?: string | null;
        };
        Returns: boolean;
      };
      create_booking_atomic: {
        Args: {
          p_customer_id: string;
          p_car_id: string;
          p_branch_id: string;
          p_rental_type: Database["public"]["Enums"]["rental_type"];
          p_start: string;
          p_end: string;
          p_daily_rate: number;
          p_discount_amount?: number;
          p_initial_status?: Database["public"]["Enums"]["booking_status"];
          p_notes?: string | null;
        };
        Returns: Database["public"]["Tables"]["bookings"]["Row"];
      };
      cleanup_expired_bookings: {
        Args: Record<string, never>;
        Returns: {
          cleaned_count: number;
          restored_cars: string[];
        }[];
      };

      // دوال البحث الجغرافي
      get_nearest_branches: {
        Args: {
          _user_lat: number;
          _user_lon: number;
          _limit?: number;
        };
        Returns: {
          id: string;
          name: string;
          location: string;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          email: string | null;
          working_hours: string | null;
          distance_meters: number;
          distance_km: number;
          manager_name: string | null;
          cars_count: number;
        }[];
      };
      get_nearest_cars: {
        Args: {
          _user_lat: number;
          _user_lon: number;
          _limit?: number;
        };
        Returns: {
          car_id: string;
          car_model: string;
          car_brand: string;
          car_color: string;
          daily_price: number;
          branch_name: string;
          branch_location: string;
          distance_meters: number;
          distance_km: number;
          main_image_url: string | null;
          seats: number;
          fuel_type: string;
          transmission: string;
          is_new: boolean;
          discount_percentage: number;
        }[];
      };
      get_branches_within_distance: {
        Args: {
          _user_lat: number;
          _user_lon: number;
          _distance_km?: number;
        };
        Returns: {
          id: string;
          name: string;
          location: string;
          distance_meters: number;
          distance_km: number;
          cars_count: number;
        }[];
      };

      // دوال الفروع
      get_branch_statistics: {
        Args: {
          _branch_id: string;
        };
        Returns: {
          id: string;
          name: string;
          location: string;
          is_active: boolean;
          manager_id: string | null;
          manager_name: string | null;
          employees_count: number;
          cars_count: number;
          active_bookings_count: number;
          created_at: string;
          updated_at: string;
        }[];
      };
      get_branch_employee_list: {
        Args: {
          _branch_id: string;
        };
        Returns: {
          id: string;
          user_id: string;
          full_name: string;
          email: string;
          phone: string;
          role: Database["public"]["Enums"]["user_role"];
          is_verified: boolean;
          created_at: string;
        }[];
      };

      // دوال المستخدمين
      update_user_profile: {
        Args: {
          _full_name?: string | null;
          _phone?: string | null;
          _location?: string | null;
          _age?: number | null;
          _gender?: string | null;
          _user_latitude?: number | null;
          _user_longitude?: number | null;
          _location_accuracy?: number | null;
        };
        Returns: void;
      };
      get_user_by_phone: {
        Args: {
          _phone: string;
        };
        Returns: {
          user_id: string;
          phone: string;
          is_verified: boolean;
          full_name: string;
        }[];
      };
      create_user_with_phone: {
        Args: {
          _phone: string;
          _full_name?: string | null;
        };
        Returns: string;
      };
      verify_user_phone: {
        Args: {
          _phone: string;
        };
        Returns: string;
      };
      check_user_exists: {
        Args: {
          _column: string;
          _value: string;
        };
        Returns: boolean;
      };
      find_users_nearby: {
        Args: {
          _latitude: number;
          _longitude: number;
          _radius_km?: number;
        };
        Returns: {
          user_id: string;
          full_name: string;
          location: string;
          distance_km: number;
        }[];
      };

      // دوال البحث
      search_cars: {
        Args: {
          search_query?: string | null;
          search_language?: string | null;
          branch_ids?: string[] | null;
          brand_ids?: string[] | null;
          model_ids?: string[] | null;
          color_ids?: string[] | null;
          min_price?: number | null;
          max_price?: number | null;
          price_type?: string;
          min_seats?: number | null;
          max_seats?: number | null;
          fuel_types?: string[] | null;
          transmission_types?: string[] | null;
          p_rental_types?: Database["public"]["Enums"]["rental_type"][] | null;
          include_new_only?: boolean;
          include_discounted_only?: boolean;
          car_status_filter?: Database["public"]["Enums"]["car_status"][];
          user_lat?: number | null;
          user_lon?: number | null;
          max_distance_km?: number | null;
          sort_by?: string;
          page_size?: number;
          page_number?: number;
        };
        Returns: {
          car_id: string;
          brand_name_ar: string | null;
          brand_name_en: string;
          brand_logo_url: string | null;
          model_name_ar: string | null;
          model_name_en: string;
          model_year: number;
          main_image_url: string | null;
          color_name_ar: string | null;
          color_name_en: string;
          color_hex_code: string | null;
          daily_price: number;
          weekly_price: number | null;
          monthly_price: number | null;
          ownership_price: number | null;
          seats: number;
          fuel_type: string;
          transmission: string;
          mileage: number;
          description_ar: string | null;
          description_en: string | null;
          features_ar: string[] | null;
          features_en: string[] | null;
          additional_images: string[] | null;
          quantity: number;
          available_quantity: number;
          status: Database["public"]["Enums"]["car_status"];
          is_new: boolean;
          discount_percentage: number;
          offer_expires_at: string | null;
          rental_types: Database["public"]["Enums"]["rental_type"][];
          branch_id: string;
          branch_name_ar: string | null;
          branch_name_en: string;
          branch_location_ar: string | null;
          branch_location_en: string;
          branch_phone: string | null;
          distance_km: number | null;
          best_offer_id: string | null;
          best_offer_name_ar: string | null;
          best_offer_name_en: string | null;
          best_offer_discount: number | null;
          search_rank: number;
        }[];
      };
      quick_search_suggestions: {
        Args: {
          _term: string;
          _lang?: string | null;
          _limit?: number;
        };
        Returns: {
          suggestion: string;
          source: string;
          detected_language: string;
        }[];
      };
      advanced_car_filter: {
        Args: {
          availability_start_date?: string | null;
          availability_end_date?: string | null;
          offers_only?: boolean;
          max_offer_discount?: number | null;
          required_features?: string[] | null;
          preferred_features?: string[] | null;
          budget_range?: string | null;
          user_lat?: number | null;
          user_lon?: number | null;
          preferred_branches?: string[] | null;
          include_statistics?: boolean;
          page_size?: number;
          page_number?: number;
        };
        Returns: {
          car_id: string;
          brand_name: string;
          model_name: string;
          year: number;
          daily_price: number;
          branch_name: string;
          distance_km: number | null;
          availability_score: number;
          feature_match_score: number;
          overall_score: number;
        }[];
      };

      // دوال الإشعارات
      send_notification: {
        Args: {
          _to_user: string;
          _title_ar: string;
          _title_en: string;
          _message_ar: string;
          _message_en: string;
          _type: Database["public"]["Enums"]["notification_type"];
          _metadata?: Json;
          _sent_via?: string;
        };
        Returns: string;
      };
      mark_notifications_read: {
        Args: {
          _notification_ids: string[];
        };
        Returns: number;
      };
      get_user_notifications: {
        Args: {
          _limit?: number;
          _offset?: number;
          _unread_only?: boolean;
        };
        Returns: {
          id: string;
          title_ar: string | null;
          title_en: string;
          message_ar: string | null;
          message_en: string;
          type: Database["public"]["Enums"]["notification_type"];
          metadata: Json | null;
          is_read: boolean;
          created_at: string;
        }[];
      };

      // دوال الإعلانات
      upsert_announcement: {
        Args: {
          _title_ar: string;
          _title_en: string;
          _description_ar?: string | null;
          _description_en?: string | null;
          _id?: string | null;
          _branch_id?: string | null;
          _is_active?: boolean;
          _is_featured?: boolean;
          _priority?: Database["public"]["Enums"]["announcement_priority"];
          _expires_at?: string | null;
          _image_url?: string | null;
        };
        Returns: string;
      };

      // دوال إدارة السيارات
      reserve_car_atomic: {
        Args: {
          p_car_id: string;
        };
        Returns: void;
      };
      release_car_atomic: {
        Args: {
          p_car_id: string;
        };
        Returns: void;
      };
      increment_offer_usage_atomic: {
        Args: {
          p_offer_id: string;
        };
        Returns: void;
      };

      // دوال التدقيق والأمان
      log_security_event: {
        Args: {
          _event_type: string;
          _user_id?: string | null;
          _identifier?: string | null;
          _details?: Json | null;
          _user_agent?: string | null;
          _ip_address?: string | null;
        };
        Returns: void;
      };
      fix_availability_inconsistencies: {
        Args: Record<string, never>;
        Returns: {
          car_id: string;
          expected_availability: number;
          actual_availability: number;
          fixed: boolean;
        }[];
      };
      validate_security_setup: {
        Args: Record<string, never>;
        Returns: {
          table_name: string;
          has_rls: boolean;
          policy_count: number;
          security_status: string;
        }[];
      };
      cleanup_old_data: {
        Args: Record<string, never>;
        Returns: void;
      };

      // دوال اللغة
      detect_language: {
        Args: {
          _text: string;
        };
        Returns: string;
      };
      get_localized_text: {
        Args: {
          text_ar: string | null;
          text_en: string | null;
          preferred_language?: string;
        };
        Returns: string;
      };

      // دوال المواد المرفقة
      refresh_cars_with_images: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: {
      user_role: "admin" | "branch" | "branch_employee" | "customer";
      rental_type: "daily" | "weekly" | "monthly" | "ownership";
      booking_status:
        | "pending"
        | "confirmed"
        | "payment_pending"
        | "active"
        | "completed"
        | "cancelled"
        | "expired"; // التحديث الجديد
      document_status: "pending" | "approved" | "rejected";
      car_status: "available" | "rented" | "maintenance" | "hidden";
      notification_type: "info" | "warning" | "booking_update" | "system";
      announcement_priority: "normal" | "high";
    };
  };
};

// Helper types for easier usage
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type Branch = Database["public"]["Tables"]["branches"]["Row"];
export type CarBrand = Database["public"]["Tables"]["car_brands"]["Row"];
export type CarModel = Database["public"]["Tables"]["car_models"]["Row"];
export type CarColor = Database["public"]["Tables"]["car_colors"]["Row"];
export type Car = Database["public"]["Tables"]["cars"]["Row"];
export type CarOffer = Database["public"]["Tables"]["car_offers"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type RateLimit = Database["public"]["Tables"]["rate_limits"]["Row"];
export type SecurityAuditLog =
  Database["public"]["Tables"]["security_audit_log"]["Row"];
export type NotificationOutbox =
  Database["public"]["Tables"]["notification_outbox"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_log"]["Row"];
export type OtpRequest = Database["public"]["Tables"]["otp_requests"]["Row"];
export type PhoneVerification =
  Database["public"]["Tables"]["phone_verifications"]["Row"];
export type AuthLog = Database["public"]["Tables"]["auth_logs"]["Row"];

// Insert types
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type DocumentInsert =
  Database["public"]["Tables"]["documents"]["Insert"];
export type BranchInsert = Database["public"]["Tables"]["branches"]["Insert"];
export type CarInsert = Database["public"]["Tables"]["cars"]["Insert"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type AnnouncementInsert =
  Database["public"]["Tables"]["announcements"]["Insert"];
export type NotificationInsert =
  Database["public"]["Tables"]["notifications"]["Insert"];
export type CarOfferInsert =
  Database["public"]["Tables"]["car_offers"]["Insert"];

// Update types
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type DocumentUpdate =
  Database["public"]["Tables"]["documents"]["Update"];
export type BranchUpdate = Database["public"]["Tables"]["branches"]["Update"];
export type CarUpdate = Database["public"]["Tables"]["cars"]["Update"];
export type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];
export type AnnouncementUpdate =
  Database["public"]["Tables"]["announcements"]["Update"];
export type NotificationUpdate =
  Database["public"]["Tables"]["notifications"]["Update"];
export type CarOfferUpdate =
  Database["public"]["Tables"]["car_offers"]["Update"];

// Enum types
export type UserRole = Database["public"]["Enums"]["user_role"];
export type RentalType = Database["public"]["Enums"]["rental_type"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type DocumentStatus = Database["public"]["Enums"]["document_status"];
export type CarStatus = Database["public"]["Enums"]["car_status"];
export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type AnnouncementPriority =
  Database["public"]["Enums"]["announcement_priority"];

// View types
export type CarWithImages =
  Database["public"]["Views"]["cars_with_images"]["Row"];

// Function return types
export type NearestBranch =
  Database["public"]["Functions"]["get_nearest_branches"]["Returns"][0];
export type NearestCar =
  Database["public"]["Functions"]["get_nearest_cars"]["Returns"][0];
export type BranchStatistics =
  Database["public"]["Functions"]["get_branch_statistics"]["Returns"][0];
export type CarSearchResult =
  Database["public"]["Functions"]["search_cars"]["Returns"][0];
export type SearchSuggestion =
  Database["public"]["Functions"]["quick_search_suggestions"]["Returns"][0];
export type UserNotification =
  Database["public"]["Functions"]["get_user_notifications"]["Returns"][0];
