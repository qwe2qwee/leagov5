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
          email: string;
          full_name: string;
          phone: string;
          age: number | null;
          gender: string | null;
          role: Database["public"]["Enums"]["user_role"];
          location: string | null;
          user_latitude: number | null;
          user_longitude: number | null;
          geom: string | null; // geography type as string
          branch_id: string | null;
          password: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name: string;
          phone: string;
          age?: number | null;
          gender?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          location?: string | null;
          password?: string | null;
          user_latitude?: number | null;
          user_longitude?: number | null;
          geom?: string | null;
          branch_id?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string;
          phone?: string;
          age?: number | null;
          gender?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          location?: string | null;
          user_latitude?: number | null;
          user_longitude?: number | null;
          geom?: string | null;
          branch_id?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_profiles_branch";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
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
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          }
        ];
      };
      branches: {
        Row: {
          id: string;
          name_ar: string | null;
          name_en: string;
          location_ar: string | null;
          location_en: string;
          latitude: number | null; // ✅ صحيح
          longitude: number | null; // ✅ صحيح
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
          name_ar?: string | null;
          name_en: string;
          location_ar?: string | null;
          location_en: string;
          latitude: number | null; // ✅ صحيح
          longitude: number | null; // ✅ صحيح
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
          name_ar?: string | null;
          name_en?: string;
          location_ar?: string | null;
          location_en?: string;
          latitude: number | null; // ✅ صحيح
          longitude: number | null; // ✅ صحيح
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
            foreignKeyName: "branches_manager_id_fkey";
            columns: ["manager_id"];
            isOneToOne: false;
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          }
        ];
      };
      car_brands: {
        Row: {
          id: string;
          name_ar: string | null;
          name_en: string;
          logo_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name_ar?: string | null;
          name_en: string;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name_ar?: string | null;
          name_en?: string;
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
          name_ar: string | null;
          name_en: string;
          year: number;
          default_image_url: string | null;
          description_ar: string | null;
          description_en: string | null;
          specifications: Json | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          name_ar?: string | null;
          name_en: string;
          year: number;
          default_image_url?: string | null;
          description_ar?: string | null;
          description_en?: string | null;
          specifications?: Json | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          brand_id?: string;
          name_ar?: string | null;
          name_en?: string;
          year?: number;
          default_image_url?: string | null;
          description_ar?: string | null;
          description_en?: string | null;
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
          name_ar: string | null;
          name_en: string;
          hex_code: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name_ar?: string | null;
          name_en: string;
          hex_code?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name_ar?: string | null;
          name_en?: string;
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
          features_ar: string[] | null; // ✅ صحيح
          features_en: string[] | null; // ✅ صحيح
          branch_images: string[] | null; // ✅ صحيح
          branch_description_ar: string | null;
          branch_description_en: string | null;
          quantity: number;
          available_quantity: number;
          status: Database["public"]["Enums"]["car_status"];
          is_new: boolean;
          discount_percentage: number;
          offer_expires_at: string | null;
          rental_types: Database["public"]["Enums"]["rental_type"][]; // ✅ صحيح
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
          features_ar: string[] | null; // ✅ صحيح
          features_en: string[] | null; // ✅ صحيح
          branch_images: string[] | null; // ✅ صحيح
          branch_description_ar?: string | null;
          branch_description_en?: string | null;
          quantity?: number;
          available_quantity?: number;
          status?: Database["public"]["Enums"]["car_status"];
          is_new?: boolean;
          discount_percentage?: number;
          offer_expires_at?: string | null;
          rental_types: Database["public"]["Enums"]["rental_type"][]; // ✅ صحيح
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          branch_id?: string;
          model_id?: string;
          color_id?: string;
          daily_price: number;
          weekly_price?: number | null;
          monthly_price?: number | null;
          ownership_price?: number | null;
          mileage?: number;
          seats?: number;
          fuel_type?: string;
          transmission?: string;
          features_ar: string[] | null; // ✅ صحيح
          features_en: string[] | null; // ✅ صحيح
          branch_images: string[] | null; // ✅ صحيح
          branch_description_ar?: string | null;
          branch_description_en?: string | null;
          quantity?: number;
          available_quantity?: number;
          status?: Database["public"]["Enums"]["car_status"];
          is_new?: boolean;
          discount_percentage?: number;
          offer_expires_at?: string | null;
          rental_types: Database["public"]["Enums"]["rental_type"][]; // ✅ صحيح
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
          rental_types: Database["public"]["Enums"]["rental_type"][];
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
          rental_types: Database["public"]["Enums"]["rental_type"][];
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
          offer_id: string | null;
          approved_by: string | null;
          approved_at: string | null;
          notes: string | null;
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
          offer_id?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          car_id?: string;
          branch_id?: string;
          rental_type?: Database["public"]["Enums"]["rental_type"];
          start_date: string;
          end_date: string;
          total_days?: number;
          daily_rate?: number;
          total_amount?: number;
          discount_amount?: number;
          final_amount?: number;
          status?: Database["public"]["Enums"]["booking_status"];
          payment_reference?: string | null;
          offer_id?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "auth.users";
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
            foreignKeyName: "bookings_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "car_offers";
            referencedColumns: ["id"];
          }
        ];
      };
      announcements: {
        Row: {
          id: string;
          title_ar: string | null;
          title_en: string;
          description_ar: string | null;
          description_en: string | null;
          image_url: string | null;
          is_active: boolean;
          is_featured: boolean;
          branch_id: string | null;
          created_by: string;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title_ar?: string | null;
          title_en: string;
          description_ar?: string | null;
          description_en?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          branch_id?: string | null;
          created_by: string;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title_ar?: string | null;
          title_en?: string;
          description_ar?: string | null;
          description_en?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
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
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title_ar: string | null;
          title_en: string;
          message_ar: string | null;
          message_en: string;
          type: string;
          is_read: boolean;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title_ar?: string | null;
          title_en: string;
          message_ar?: string | null;
          message_en: string;
          type: string;
          is_read?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title_ar?: string | null;
          title_en?: string;
          message_ar?: string | null;
          message_en?: string;
          type?: string;
          is_read?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "auth.users";
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
            referencedRelation: "auth.users";
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
          brand_name_ar: string | null;
          brand_name_en: string;
          model_name_ar: string | null;
          model_name_en: string;
          year: number;
          main_image_url: string | null;
          model_description_ar: string | null;
          model_description_en: string | null;
          specifications: Json | null;
          color_name_ar: string | null;
          color_name_en: string;
          hex_code: string | null;
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
          additional_images: string[] | null;
          features_ar: string[] | null;
          features_en: string[] | null;
          quantity: number;
          available_quantity: number;
          status: Database["public"]["Enums"]["car_status"];
          is_new: boolean;
          discount_percentage: number;
          offer_expires_at: string | null;
          rental_types: Database["public"]["Enums"]["rental_type"][];
          branch_name_ar: string | null;
          branch_name_en: string;
          branch_location_ar: string | null;
          branch_location_en: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      get_branches_within_distance: {
        Args: {
          _user_lat: number;
          _user_lon: number;
          _distance_km?: number;
        };
        Returns: {
          id: string;
          name_ar: string | null;
          name_en: string;
          location_ar: string | null;
          location_en: string;
          distance_meters: number;
          distance_km: number;
          cars_count: number;
        }[];
      };

      get_branch_statistics: {
        Args: {
          _branch_id: string;
        };
        Returns: {
          id: string;
          name_ar: string | null;
          name_en: string;
          location_ar: string | null;
          location_en: string;
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

      update_user_profile: {
        Args: {
          _full_name?: string | null;
          _phone?: string | null;
          _location?: string | null;
          _age?: number | null;
          _gender?: string | null;
          _user_latitude?: number | null;
          _user_longitude?: number | null;
        };
        Returns: void;
      };

      get_user_role: {
        Args: {
          _user_id: string;
        };
        Returns: Database["public"]["Enums"]["user_role"];
      };

      is_user_verified: {
        Args: {
          _user_id: string;
        };
        Returns: boolean;
      };
      check_car_availability: {
        Args: {
          _car_id: string;
          _start_date: string;
          _end_date: string;
        };
        Returns: boolean;
      };
      get_nearest_branches: {
        Args: {
          _user_lat: number;
          _user_lon: number;
          _limit?: number;
        };
        Returns: {
          id: string;
          name_ar: string | null;
          name_en: string;
          location_ar: string | null;
          location_en: string;
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
          brand_name_ar: string | null;
          brand_name_en: string;
          model_name_ar: string | null;
          model_name_en: string;
          year: number;
          color_name_ar: string | null;
          color_name_en: string;
          daily_price: number;
          branch_name_ar: string | null;
          branch_name_en: string;
          branch_location_ar: string | null;
          branch_location_en: string;
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
      get_best_car_offer: {
        Args: {
          _car_id: string;
          _rental_days: number;
          _rental_type?: Database["public"]["Enums"]["rental_type"];
        };
        Returns: {
          offer_id: string;
          offer_name_ar: string;
          offer_name_en: string;
          discount_type: string;
          discount_value: number;
          original_price: number;
          discounted_price: number;
          savings_amount: number;
        }[];
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
        | "cancelled";
      document_status: "pending" | "approved" | "rejected";
      car_status: "available" | "rented" | "maintenance" | "hidden";
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

// Insert types
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type DocumentInsert =
  Database["public"]["Tables"]["documents"]["Insert"];
export type BranchInsert = Database["public"]["Tables"]["branches"]["Insert"];
export type CarInsert = Database["public"]["Tables"]["cars"]["Insert"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];

// Update types
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type DocumentUpdate =
  Database["public"]["Tables"]["documents"]["Update"];
export type BranchUpdate = Database["public"]["Tables"]["branches"]["Update"];
export type CarUpdate = Database["public"]["Tables"]["cars"]["Update"];
export type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];

// Enum types
export type UserRole = Database["public"]["Enums"]["user_role"];
export type RentalType = Database["public"]["Enums"]["rental_type"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type DocumentStatus = Database["public"]["Enums"]["document_status"];
export type CarStatus = Database["public"]["Enums"]["car_status"];

// View types
export type CarWithImages =
  Database["public"]["Views"]["cars_with_images"]["Row"];

// Function types
export type NearestBranch =
  Database["public"]["Functions"]["get_nearest_branches"]["Returns"][0];
export type NearestCar =
  Database["public"]["Functions"]["get_nearest_cars"]["Returns"][0];
export type BestCarOffer =
  Database["public"]["Functions"]["get_best_car_offer"]["Returns"][0];
