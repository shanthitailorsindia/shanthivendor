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
      abandoned_cart_campaigns: {
        Row: {
          checkout_id: number
          created_at: string
          customer_email: string | null
          customer_phone: string | null
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          checkout_id: number
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          checkout_id?: number
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      abandoned_cart_notifications: {
        Row: {
          campaign_id: string
          created_at: string
          error_message: string | null
          id: string
          notification_type: string
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          notification_type: string
          sent_at?: string | null
          status: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_cart_notifications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "abandoned_cart_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          processing_time: number | null
          role: string
          session_id: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          processing_time?: number | null
          role: string
          session_id: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          processing_time?: number | null
          role?: string
          session_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_sessions: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          session_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          session_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          session_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_name: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_name: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_name?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_visibility_data: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          mentioned: boolean | null
          platform: string
          position: number | null
          query: string
          snippet: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          mentioned?: boolean | null
          platform: string
          position?: number | null
          query: string
          snippet?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          mentioned?: boolean | null
          platform?: string
          position?: number | null
          query?: string
          snippet?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      apoorva_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "apoorva_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "apoorva_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      apoorva_chat_sessions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          session_token: string
          updated_at: string
          user_agent: string | null
          user_ip: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          session_token: string
          updated_at?: string
          user_agent?: string | null
          user_ip?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          session_token?: string
          updated_at?: string
          user_agent?: string | null
          user_ip?: string | null
        }
        Relationships: []
      }
      apoorva_csv_uploads: {
        Row: {
          created_at: string
          error_log: string | null
          failed_rows: number
          filename: string
          id: string
          processed_rows: number
          status: string
          total_rows: number
          updated_at: string
          upload_data: Json | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          error_log?: string | null
          failed_rows?: number
          filename: string
          id?: string
          processed_rows?: number
          status?: string
          total_rows?: number
          updated_at?: string
          upload_data?: Json | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          error_log?: string | null
          failed_rows?: number
          filename?: string
          id?: string
          processed_rows?: number
          status?: string
          total_rows?: number
          updated_at?: string
          upload_data?: Json | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      apoorva_faq_data: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      apoorva_products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price: number | null
          product_image: string | null
          updated_at: string
          website_link: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price?: number | null
          product_image?: string | null
          updated_at?: string
          website_link?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number | null
          product_image?: string | null
          updated_at?: string
          website_link?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      appointment_settings: {
        Row: {
          agent_phone: string | null
          color: string | null
          created_at: string | null
          id: string
          label: string
          setting_type: string
          sort_order: number | null
        }
        Insert: {
          agent_phone?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          label: string
          setting_type: string
          sort_order?: number | null
        }
        Update: {
          agent_phone?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          label?: string
          setting_type?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          appointment_type: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          duration_minutes: number | null
          id: string
          notes: string | null
          session_id: string | null
          status: string | null
          teams_link: string | null
          updated_at: string | null
          zoom_link: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          appointment_type?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          session_id?: string | null
          status?: string | null
          teams_link?: string | null
          updated_at?: string | null
          zoom_link?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          session_id?: string | null
          status?: string | null
          teams_link?: string | null
          updated_at?: string | null
          zoom_link?: string | null
        }
        Relationships: []
      }
      auto_reply_rules: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          platform_id: string | null
          priority: number | null
          reply_template: string
          rule_name: string
          social_account_id: string | null
          trigger_conditions: Json | null
          trigger_keywords: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform_id?: string | null
          priority?: number | null
          reply_template: string
          rule_name: string
          social_account_id?: string | null
          trigger_conditions?: Json | null
          trigger_keywords?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform_id?: string | null
          priority?: number | null
          reply_template?: string
          rule_name?: string
          social_account_id?: string | null
          trigger_conditions?: Json | null
          trigger_keywords?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_reply_rules_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_reply_rules_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_customers: {
        Row: {
          created_at: string | null
          credit_approved_at: string | null
          credit_approved_by: string | null
          credit_utilized: number | null
          customer_id: string | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          last_order_date: string | null
          notes: string | null
          payment_history: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credit_approved_at?: string | null
          credit_approved_by?: string | null
          credit_utilized?: number | null
          customer_id?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          last_order_date?: string | null
          notes?: string | null
          payment_history?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credit_approved_at?: string | null
          credit_approved_by?: string | null
          credit_utilized?: number | null
          customer_id?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          last_order_date?: string | null
          notes?: string | null
          payment_history?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_customers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_invoice_items: {
        Row: {
          cgst_amount: number | null
          cgst_rate: number | null
          created_at: string | null
          discount_amount: number | null
          discount_type: string | null
          discount_value: number | null
          gst_rate: number | null
          hsn_code: string | null
          id: string
          igst_amount: number | null
          igst_rate: number | null
          invoice_id: string | null
          item_name: string
          line_total: number
          product_id: string | null
          quantity: number
          sgst_amount: number | null
          sgst_rate: number | null
          taxable_amount: number
          texas_store_markup: number | null
          total_amount: number
          unit_price: number
        }
        Insert: {
          cgst_amount?: number | null
          cgst_rate?: number | null
          created_at?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          gst_rate?: number | null
          hsn_code?: string | null
          id?: string
          igst_amount?: number | null
          igst_rate?: number | null
          invoice_id?: string | null
          item_name: string
          line_total?: number
          product_id?: string | null
          quantity?: number
          sgst_amount?: number | null
          sgst_rate?: number | null
          taxable_amount?: number
          texas_store_markup?: number | null
          total_amount?: number
          unit_price?: number
        }
        Update: {
          cgst_amount?: number | null
          cgst_rate?: number | null
          created_at?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          gst_rate?: number | null
          hsn_code?: string | null
          id?: string
          igst_amount?: number | null
          igst_rate?: number | null
          invoice_id?: string | null
          item_name?: string
          line_total?: number
          product_id?: string | null
          quantity?: number
          sgst_amount?: number | null
          sgst_rate?: number | null
          taxable_amount?: number
          texas_store_markup?: number | null
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "b2b_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "b2b_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_invoices: {
        Row: {
          ack_date: string | null
          ack_no: string | null
          cgst_amount: number | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          due_date: string | null
          einvoice_error: string | null
          einvoice_status: string | null
          id: string
          igst_amount: number | null
          invoice_date: string
          invoice_number: string
          invoice_type: string | null
          irn: string | null
          line_discount_amount: number | null
          notes: string | null
          overall_discount_amount: number | null
          overall_discount_type: string | null
          overall_discount_value: number | null
          payment_status: string | null
          payment_terms: string | null
          place_of_supply: string | null
          qr_code: string | null
          reverse_charge: boolean | null
          sgst_amount: number | null
          subtotal: number
          taxable_amount: number
          total_amount: number
          total_gst_amount: number | null
          updated_at: string | null
        }
        Insert: {
          ack_date?: string | null
          ack_no?: string | null
          cgst_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          due_date?: string | null
          einvoice_error?: string | null
          einvoice_status?: string | null
          id?: string
          igst_amount?: number | null
          invoice_date?: string
          invoice_number: string
          invoice_type?: string | null
          irn?: string | null
          line_discount_amount?: number | null
          notes?: string | null
          overall_discount_amount?: number | null
          overall_discount_type?: string | null
          overall_discount_value?: number | null
          payment_status?: string | null
          payment_terms?: string | null
          place_of_supply?: string | null
          qr_code?: string | null
          reverse_charge?: boolean | null
          sgst_amount?: number | null
          subtotal?: number
          taxable_amount?: number
          total_amount?: number
          total_gst_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          ack_date?: string | null
          ack_no?: string | null
          cgst_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          due_date?: string | null
          einvoice_error?: string | null
          einvoice_status?: string | null
          id?: string
          igst_amount?: number | null
          invoice_date?: string
          invoice_number?: string
          invoice_type?: string | null
          irn?: string | null
          line_discount_amount?: number | null
          notes?: string | null
          overall_discount_amount?: number | null
          overall_discount_type?: string | null
          overall_discount_value?: number | null
          payment_status?: string | null
          payment_terms?: string | null
          place_of_supply?: string | null
          qr_code?: string | null
          reverse_charge?: boolean | null
          sgst_amount?: number | null
          subtotal?: number
          taxable_amount?: number
          total_amount?: number
          total_gst_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_payment_terms: {
        Row: {
          created_at: string | null
          days: number
          description: string | null
          early_payment_discount: number | null
          id: string
          is_active: boolean | null
          late_payment_penalty: number | null
          term_name: string
        }
        Insert: {
          created_at?: string | null
          days?: number
          description?: string | null
          early_payment_discount?: number | null
          id?: string
          is_active?: boolean | null
          late_payment_penalty?: number | null
          term_name: string
        }
        Update: {
          created_at?: string | null
          days?: number
          description?: string | null
          early_payment_discount?: number | null
          id?: string
          is_active?: boolean | null
          late_payment_penalty?: number | null
          term_name?: string
        }
        Relationships: []
      }
      background_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          failed_items: number | null
          id: string
          job_type: string
          metadata: Json | null
          processed_items: number | null
          progress: number | null
          started_at: string | null
          status: string
          total_items: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          failed_items?: number | null
          id?: string
          job_type: string
          metadata?: Json | null
          processed_items?: number | null
          progress?: number | null
          started_at?: string | null
          status?: string
          total_items?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          failed_items?: number | null
          id?: string
          job_type?: string
          metadata?: Json | null
          processed_items?: number | null
          progress?: number | null
          started_at?: string | null
          status?: string
          total_items?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string
          account_type: string | null
          bank_name: string
          branch: string | null
          created_at: string | null
          current_balance: number | null
          id: string
          ifsc_code: string | null
          is_active: boolean | null
          last_updated: string | null
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          account_type?: string | null
          bank_name: string
          branch?: string | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          ifsc_code?: string | null
          is_active?: boolean | null
          last_updated?: string | null
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string | null
          bank_name?: string
          branch?: string | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          ifsc_code?: string | null
          is_active?: boolean | null
          last_updated?: string | null
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bank_transactions: {
        Row: {
          account_id: string | null
          amount: number
          balance_after: number | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          reference_number: string | null
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          balance_after?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reference_number?: string | null
          transaction_date: string
          transaction_type: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          balance_after?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reference_number?: string | null
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string | null
          id: string
          name: string
          scheduled_at: string | null
          segment_filters: Json | null
          stats: Json | null
          status: string | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          scheduled_at?: string | null
          segment_filters?: Json | null
          stats?: Json | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          scheduled_at?: string | null
          segment_filters?: Json | null
          stats?: Json | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "wa_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_accounts: {
        Row: {
          account_name: string
          account_number: string | null
          account_type: string
          available_credit: number | null
          bank_name: string | null
          created_at: string
          current_balance: number
          id: string
          is_active: boolean
          notes: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number?: string | null
          account_type: string
          available_credit?: number | null
          bank_name?: string | null
          created_at?: string
          current_balance?: number
          id?: string
          is_active?: boolean
          notes?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string | null
          account_type?: string
          available_credit?: number | null
          bank_name?: string | null
          created_at?: string
          current_balance?: number
          id?: string
          is_active?: boolean
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      catalog_categories: {
        Row: {
          created_at: string | null
          description: string | null
          drive_folder_id: string | null
          google_photos_album_id: string | null
          id: string
          is_active: boolean | null
          main_image_url: string | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          drive_folder_id?: string | null
          google_photos_album_id?: string | null
          id?: string
          is_active?: boolean | null
          main_image_url?: string | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          drive_folder_id?: string | null
          google_photos_album_id?: string | null
          id?: string
          is_active?: boolean | null
          main_image_url?: string | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      catalog_items: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          images: Json | null
          is_active: boolean | null
          item_code: string
          name: string
          price: number
          quantity: number
          show_on_website: boolean | null
          subcategory_id: string | null
          updated_at: string | null
          whatsapp_caption: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          item_code: string
          name: string
          price?: number
          quantity?: number
          show_on_website?: boolean | null
          subcategory_id?: string | null
          updated_at?: string | null
          whatsapp_caption?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          item_code?: string
          name?: string
          price?: number
          quantity?: number
          show_on_website?: boolean | null
          subcategory_id?: string | null
          updated_at?: string | null
          whatsapp_caption?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_items_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "catalog_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_share_links: {
        Row: {
          category_id: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          link_code: string
          selected_items: Json | null
          subcategory_id: string | null
          title: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          link_code: string
          selected_items?: Json | null
          subcategory_id?: string | null
          title?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          link_code?: string
          selected_items?: Json | null
          subcategory_id?: string | null
          title?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_share_links_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_share_links_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "catalog_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_subcategories: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          drive_folder_id: string | null
          google_photos_album_id: string | null
          id: string
          images: Json | null
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          drive_folder_id?: string | null
          google_photos_album_id?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          drive_folder_id?: string | null
          google_photos_album_id?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          gst_rate: number | null
          hsn_code: string | null
          id: string
          name: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          gst_rate?: number | null
          hsn_code?: string | null
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          gst_rate?: number | null
          hsn_code?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      change_sets: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          change_type: string
          created_at: string
          diff_json: Json
          id: string
          product_id: string
          rollback_data: Json | null
          shopify_version: string | null
          status: string
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          change_type: string
          created_at?: string
          diff_json: Json
          id?: string
          product_id: string
          rollback_data?: Json | null
          shopify_version?: string | null
          status?: string
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          change_type?: string
          created_at?: string
          diff_json?: Json
          id?: string
          product_id?: string
          rollback_data?: Json | null
          shopify_version?: string | null
          status?: string
        }
        Relationships: []
      }
      chatbot_analytics_events: {
        Row: {
          created_at: string | null
          event: string | null
          id: string
          meta: Json | null
          session_id: string | null
          value: number | null
        }
        Insert: {
          created_at?: string | null
          event?: string | null
          id?: string
          meta?: Json | null
          session_id?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string | null
          event?: string | null
          id?: string
          meta?: Json | null
          session_id?: string | null
          value?: number | null
        }
        Relationships: []
      }
      chatbot_chunks: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          file_id: string | null
          id: string
          meta: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          file_id?: string | null
          id?: string
          meta?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          file_id?: string | null
          id?: string
          meta?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_chunks_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "chatbot_files"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_files: {
        Row: {
          created_at: string | null
          id: string
          name: string
          source: string | null
          source_id: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          source?: string | null
          source_id?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          source?: string | null
          source_id?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_files_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_leads: {
        Row: {
          budget: number | null
          country: string | null
          created_at: string | null
          email: string | null
          event_date: string | null
          id: string
          ig_handle: string | null
          intent: string | null
          ip_address: string | null
          name: string | null
          product: string | null
          session_id: string | null
          status: string | null
          updated_at: string | null
          wa_number: string | null
          zoho_id: string | null
        }
        Insert: {
          budget?: number | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          event_date?: string | null
          id?: string
          ig_handle?: string | null
          intent?: string | null
          ip_address?: string | null
          name?: string | null
          product?: string | null
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          wa_number?: string | null
          zoho_id?: string | null
        }
        Update: {
          budget?: number | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          event_date?: string | null
          id?: string
          ig_handle?: string | null
          intent?: string | null
          ip_address?: string | null
          name?: string | null
          product?: string | null
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          wa_number?: string | null
          zoho_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_leads_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chatbot_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_measurements: {
        Row: {
          created_at: string | null
          dancer_name: string | null
          id: string
          lead_id: string | null
          line1: Json | null
          line2: Json | null
          line3: Json | null
          line4: Json | null
          raw: Json | null
        }
        Insert: {
          created_at?: string | null
          dancer_name?: string | null
          id?: string
          lead_id?: string | null
          line1?: Json | null
          line2?: Json | null
          line3?: Json | null
          line4?: Json | null
          raw?: Json | null
        }
        Update: {
          created_at?: string | null
          dancer_name?: string | null
          id?: string
          lead_id?: string | null
          line1?: Json | null
          line2?: Json | null
          line3?: Json | null
          line4?: Json | null
          raw?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_measurements_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "chatbot_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          meta: Json | null
          role: string | null
          session_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          meta?: Json | null
          role?: string | null
          session_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          meta?: Json | null
          role?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chatbot_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_orders: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          id: string
          lead_id: string | null
          payment_link: string | null
          shopify_order_id: string | null
          status: string | null
          updated_at: string | null
          zoho_invoice_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          lead_id?: string | null
          payment_link?: string | null
          shopify_order_id?: string | null
          status?: string | null
          updated_at?: string | null
          zoho_invoice_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          lead_id?: string | null
          payment_link?: string | null
          shopify_order_id?: string | null
          status?: string | null
          updated_at?: string | null
          zoho_invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_orders_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "chatbot_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_order: number
          image_url: string
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_order?: number
          image_url: string
          product_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_order?: number
          image_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "chatbot_products"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_product_uploads: {
        Row: {
          created_at: string
          csv_data: string | null
          filename: string
          id: string
          processed_products: number
          status: string
          total_products: number
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          csv_data?: string | null
          filename: string
          id?: string
          processed_products?: number
          status?: string
          total_products?: number
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          csv_data?: string | null
          filename?: string
          id?: string
          processed_products?: number
          status?: string
          total_products?: number
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      chatbot_products: {
        Row: {
          auto_generated_at: string | null
          categories: Json | null
          created_at: string
          details: string | null
          id: string
          is_active: boolean
          keywords: Json | null
          name: string
          price: number
          product_link: string | null
          updated_at: string
          upload_batch_id: string | null
        }
        Insert: {
          auto_generated_at?: string | null
          categories?: Json | null
          created_at?: string
          details?: string | null
          id?: string
          is_active?: boolean
          keywords?: Json | null
          name: string
          price: number
          product_link?: string | null
          updated_at?: string
          upload_batch_id?: string | null
        }
        Update: {
          auto_generated_at?: string | null
          categories?: Json | null
          created_at?: string
          details?: string | null
          id?: string
          is_active?: boolean
          keywords?: Json | null
          name?: string
          price?: number
          product_link?: string | null
          updated_at?: string
          upload_batch_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_products_upload_batch_id_fkey"
            columns: ["upload_batch_id"]
            isOneToOne: false
            referencedRelation: "chatbot_product_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_sessions: {
        Row: {
          channel: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          is_returning_visitor: boolean | null
          language: string | null
          location_data: Json | null
          status: string | null
          timezone: string | null
          updated_at: string | null
          user_handle: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          is_returning_visitor?: boolean | null
          language?: string | null
          location_data?: Json | null
          status?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_handle?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          is_returning_visitor?: boolean | null
          language?: string | null
          location_data?: Json | null
          status?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_handle?: string | null
        }
        Relationships: []
      }
      chatbot_settings: {
        Row: {
          category: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string | null
          id: string
          name: string
          pin_codes: string[] | null
          state_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          pin_codes?: string[] | null
          state_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          pin_codes?: string[] | null
          state_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      cleanup_audit_log: {
        Row: {
          affected_records: number | null
          backup_table_name: string | null
          id: string
          is_dry_run: boolean | null
          operation_timestamp: string | null
          result: Json | null
        }
        Insert: {
          affected_records?: number | null
          backup_table_name?: string | null
          id?: string
          is_dry_run?: boolean | null
          operation_timestamp?: string | null
          result?: Json | null
        }
        Update: {
          affected_records?: number | null
          backup_table_name?: string | null
          id?: string
          is_dry_run?: boolean | null
          operation_timestamp?: string | null
          result?: Json | null
        }
        Relationships: []
      }
      client_credentials: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          is_locked: boolean
          is_temp_password: boolean
          last_login_at: string | null
          login_attempts: number
          password_expires_at: string | null
          temp_password: string
          updated_at: string | null
          username: string
          username_type: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          is_locked?: boolean
          is_temp_password?: boolean
          last_login_at?: string | null
          login_attempts?: number
          password_expires_at?: string | null
          temp_password: string
          updated_at?: string | null
          username: string
          username_type: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          is_locked?: boolean
          is_temp_password?: boolean
          last_login_at?: string | null
          login_attempts?: number
          password_expires_at?: string | null
          temp_password?: string
          updated_at?: string | null
          username?: string
          username_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_credentials_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_emails: {
        Row: {
          body: string
          client_id: string | null
          created_at: string | null
          direction: string
          from_email: string
          id: string
          sent_at: string
          status: string
          subject: string
          to_email: string
        }
        Insert: {
          body: string
          client_id?: string | null
          created_at?: string | null
          direction: string
          from_email: string
          id?: string
          sent_at?: string
          status?: string
          subject: string
          to_email: string
        }
        Update: {
          body?: string
          client_id?: string | null
          created_at?: string | null
          direction?: string
          from_email?: string
          id?: string
          sent_at?: string
          status?: string
          subject?: string
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_favorites: {
        Row: {
          created_at: string
          id: string
          item_id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_favorites_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          client_id: string | null
          content: string
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_attributes: {
        Row: {
          contact_id: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          contact_id?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          contact_id?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_attributes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_list_memberships: {
        Row: {
          added_at: string | null
          contact_id: string | null
          id: string
          list_id: string | null
        }
        Insert: {
          added_at?: string | null
          contact_id?: string | null
          id?: string
          list_id?: string | null
        }
        Update: {
          added_at?: string | null
          contact_id?: string | null
          id?: string
          list_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_list_memberships_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_list_memberships_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_lists: {
        Row: {
          contact_count: number | null
          created_at: string | null
          description: string | null
          filters: Json | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          contact_count?: number | null
          created_at?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          contact_count?: number | null
          created_at?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          consent_status: string | null
          created_at: string | null
          id: string
          language: string | null
          last_contacted_at: string | null
          name: string | null
          phone_e164: string
          preferred_slot: string | null
          source: string | null
          tags: string[] | null
          updated_at: string | null
          vip: boolean | null
        }
        Insert: {
          consent_status?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          last_contacted_at?: string | null
          name?: string | null
          phone_e164: string
          preferred_slot?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          vip?: boolean | null
        }
        Update: {
          consent_status?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          last_contacted_at?: string | null
          name?: string | null
          phone_e164?: string
          preferred_slot?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          vip?: boolean | null
        }
        Relationships: []
      }
      conversation_scenarios: {
        Row: {
          created_at: string | null
          customer_type: string
          difficulty_level: number | null
          id: string
          initial_message: string
          is_active: boolean | null
          scenario_name: string
          success_criteria: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_type: string
          difficulty_level?: number | null
          id?: string
          initial_message: string
          is_active?: boolean | null
          scenario_name: string
          success_criteria?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_type?: string
          difficulty_level?: number | null
          id?: string
          initial_message?: string
          is_active?: boolean | null
          scenario_name?: string
          success_criteria?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      costume_details: {
        Row: {
          blouse_type: string | null
          color: string | null
          costume_number: number
          costume_type: string | null
          created_at: string | null
          dancer_id: string | null
          dancer_name: string | null
          finished_photo_url: string | null
          id: string
          material_id: string | null
          measurement: Json | null
          order_form_photo_url: string | null
          order_id: string
          pattern: string | null
          qc_approved_at: string | null
          qc_photo_url: string | null
          qc_rejected_at: string | null
          qc_rejection_note: string | null
          qc_status: string | null
          saree_photo_url: string | null
          special_instructions: string | null
          status: string
          status_updated_at: string | null
        }
        Insert: {
          blouse_type?: string | null
          color?: string | null
          costume_number: number
          costume_type?: string | null
          created_at?: string | null
          dancer_id?: string | null
          dancer_name?: string | null
          finished_photo_url?: string | null
          id?: string
          material_id?: string | null
          measurement?: Json | null
          order_form_photo_url?: string | null
          order_id: string
          pattern?: string | null
          qc_approved_at?: string | null
          qc_photo_url?: string | null
          qc_rejected_at?: string | null
          qc_rejection_note?: string | null
          qc_status?: string | null
          saree_photo_url?: string | null
          special_instructions?: string | null
          status?: string
          status_updated_at?: string | null
        }
        Update: {
          blouse_type?: string | null
          color?: string | null
          costume_number?: number
          costume_type?: string | null
          created_at?: string | null
          dancer_id?: string | null
          dancer_name?: string | null
          finished_photo_url?: string | null
          id?: string
          material_id?: string | null
          measurement?: Json | null
          order_form_photo_url?: string | null
          order_id?: string
          pattern?: string | null
          qc_approved_at?: string | null
          qc_photo_url?: string | null
          qc_rejected_at?: string | null
          qc_rejection_note?: string | null
          qc_status?: string | null
          saree_photo_url?: string | null
          special_instructions?: string | null
          status?: string
          status_updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "costume_details_dancer_id_fkey"
            columns: ["dancer_id"]
            isOneToOne: false
            referencedRelation: "dancer_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costume_details_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costume_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_booking_customer_details"
            referencedColumns: ["order_booking_id"]
          },
          {
            foreignKeyName: "costume_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      costume_pieces: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          costume_id: string
          created_at: string | null
          id: string
          name: string
          status: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          costume_id: string
          created_at?: string | null
          id?: string
          name: string
          status: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          costume_id?: string
          created_at?: string | null
          id?: string
          name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "costume_pieces_costume_id_fkey"
            columns: ["costume_id"]
            isOneToOne: false
            referencedRelation: "costume_details"
            referencedColumns: ["id"]
          },
        ]
      }
      costume_status: {
        Row: {
          costume_number: number
          created_at: string | null
          id: string
          order_id: string
          status: string
        }
        Insert: {
          costume_number: number
          created_at?: string | null
          id?: string
          order_id: string
          status: string
        }
        Update: {
          costume_number?: number
          created_at?: string | null
          id?: string
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "costume_status_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_booking_customer_details"
            referencedColumns: ["order_booking_id"]
          },
          {
            foreignKeyName: "costume_status_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_bill_items: {
        Row: {
          bill_id: string | null
          costume_number: number
          created_at: string | null
          id: string
          material: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          bill_id?: string | null
          costume_number: number
          created_at?: string | null
          id?: string
          material?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          bill_id?: string | null
          costume_number?: number
          created_at?: string | null
          id?: string
          material?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "custom_bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "custom_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_bills: {
        Row: {
          bill_date: string
          client_id: string | null
          created_at: string | null
          due_date: string | null
          id: string
          notes: string | null
          order_number: string
          shipping_charge: number
          status: string
          total_amount: number
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          bill_date?: string
          client_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          order_number: string
          shipping_charge?: number
          status?: string
          total_amount?: number
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          bill_date?: string
          client_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          shipping_charge?: number
          status?: string
          total_amount?: number
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_bills_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_payment_receipts: {
        Row: {
          amount_paid: number
          bill_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_mode: string
          store_id: string
          transaction_id: string | null
        }
        Insert: {
          amount_paid: number
          bill_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string
          store_id?: string
          transaction_id?: string | null
        }
        Update: {
          amount_paid?: number
          bill_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string
          store_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_payment_receipts_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "tax_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_payment_receipts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_terminology: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          source_term: string
          target_language: string
          translated_term: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          source_term: string
          target_language: string
          translated_term: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          source_term?: string
          target_language?: string
          translated_term?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          address: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          client_user_id: string | null
          country: string | null
          created_at: string | null
          credit_limit: number | null
          customer_type: string | null
          email: string | null
          gstin: string | null
          id: string
          name: string
          pan: string | null
          payment_terms: string | null
          phone: string
          registration_type: string | null
          state: string | null
          trade_name: string | null
          whatsapp_number: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          client_user_id?: string | null
          country?: string | null
          created_at?: string | null
          credit_limit?: number | null
          customer_type?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          pan?: string | null
          payment_terms?: string | null
          phone: string
          registration_type?: string | null
          state?: string | null
          trade_name?: string | null
          whatsapp_number?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          client_user_id?: string | null
          country?: string | null
          created_at?: string | null
          credit_limit?: number | null
          customer_type?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          name?: string
          pan?: string | null
          payment_terms?: string | null
          phone?: string
          registration_type?: string | null
          state?: string | null
          trade_name?: string | null
          whatsapp_number?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      customer_service_training: {
        Row: {
          created_at: string | null
          customer_emotion: string | null
          escalation_criteria: string | null
          id: string
          priority: number | null
          recommended_approach: string | null
          resolution_steps: string | null
          sample_responses: string | null
          scenario_type: string
          situation: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_emotion?: string | null
          escalation_criteria?: string | null
          id?: string
          priority?: number | null
          recommended_approach?: string | null
          resolution_steps?: string | null
          sample_responses?: string | null
          scenario_type: string
          situation: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_emotion?: string | null
          escalation_criteria?: string | null
          id?: string
          priority?: number | null
          recommended_approach?: string | null
          resolution_steps?: string | null
          sample_responses?: string | null
          scenario_type?: string
          situation?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_payment_limits: {
        Row: {
          allocated_amount: number
          budget_id: string
          created_at: string | null
          daily_limit: number
          id: string
          limit_date: string
          remaining_amount: number
          updated_at: string | null
        }
        Insert: {
          allocated_amount?: number
          budget_id: string
          created_at?: string | null
          daily_limit?: number
          id?: string
          limit_date: string
          remaining_amount?: number
          updated_at?: string | null
        }
        Update: {
          allocated_amount?: number
          budget_id?: string
          created_at?: string | null
          daily_limit?: number
          id?: string
          limit_date?: string
          remaining_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_payment_limits_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "vendor_payment_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      dancer_details: {
        Row: {
          costume_count: number
          created_at: string | null
          group_name: string | null
          group_number: number | null
          id: string
          measurements: string | null
          name: string
          order_id: string
        }
        Insert: {
          costume_count: number
          created_at?: string | null
          group_name?: string | null
          group_number?: number | null
          id?: string
          measurements?: string | null
          name: string
          order_id: string
        }
        Update: {
          costume_count?: number
          created_at?: string | null
          group_name?: string | null
          group_number?: number | null
          id?: string
          measurements?: string | null
          name?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dancer_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_booking_customer_details"
            referencedColumns: ["order_booking_id"]
          },
          {
            foreignKeyName: "dancer_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_users: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: Database["public"]["Enums"]["dashboard_role"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["dashboard_role"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["dashboard_role"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      day_book_entries: {
        Row: {
          bank_account_sales: number
          cash_denominations: Json
          created_at: string | null
          credit_card_sales: number
          date: string
          expenses: Json
          gpay_sales: number
          id: string
          manual_pos_sales_override: number | null
          manual_sales: number
          manual_tailoring_receipts_override: number | null
          notes: string | null
          other_income: number
          pay_later: number
          pos_sales: number
          staff_sales: Json | null
          status: string | null
          updated_at: string | null
          use_manual_overrides: boolean | null
        }
        Insert: {
          bank_account_sales?: number
          cash_denominations?: Json
          created_at?: string | null
          credit_card_sales?: number
          date: string
          expenses?: Json
          gpay_sales?: number
          id?: string
          manual_pos_sales_override?: number | null
          manual_sales?: number
          manual_tailoring_receipts_override?: number | null
          notes?: string | null
          other_income?: number
          pay_later?: number
          pos_sales?: number
          staff_sales?: Json | null
          status?: string | null
          updated_at?: string | null
          use_manual_overrides?: boolean | null
        }
        Update: {
          bank_account_sales?: number
          cash_denominations?: Json
          created_at?: string | null
          credit_card_sales?: number
          date?: string
          expenses?: Json
          gpay_sales?: number
          id?: string
          manual_pos_sales_override?: number | null
          manual_sales?: number
          manual_tailoring_receipts_override?: number | null
          notes?: string | null
          other_income?: number
          pay_later?: number
          pos_sales?: number
          staff_sales?: Json | null
          status?: string | null
          updated_at?: string | null
          use_manual_overrides?: boolean | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_promotional_products: {
        Row: {
          created_at: string
          id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "email_promotional_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_promotional_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          id: string
          payload: Json
          processed: boolean | null
          source: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payload?: Json
          processed?: boolean | null
          source?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payload?: Json
          processed?: boolean | null
          source?: string | null
          type?: string
        }
        Relationships: []
      }
      expense_approvals: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          expense_id: string
          id: string
          notes: string | null
          rejection_reason: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          expense_id: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          expense_id?: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_approvals_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expense_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      expense_transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          description: string
          id: string
          notes: string | null
          payment_method: string
          receipt_url: string | null
          status: string
          transaction_date: string
          transaction_reference: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          notes?: string | null
          payment_method?: string
          receipt_url?: string | null
          status?: string
          transaction_date?: string
          transaction_reference?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          notes?: string | null
          payment_method?: string
          receipt_url?: string | null
          status?: string
          transaction_date?: string
          transaction_reference?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_transactions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_balance_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_transactions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_inventory: {
        Row: {
          franchise_id: string | null
          id: string
          last_franchise_price_inr: number | null
          last_retail_price_local: number | null
          product_id: string
          product_name: string
          product_sku: string | null
          quantity_in_hand: number
          updated_at: string | null
        }
        Insert: {
          franchise_id?: string | null
          id?: string
          last_franchise_price_inr?: number | null
          last_retail_price_local?: number | null
          product_id: string
          product_name: string
          product_sku?: string | null
          quantity_in_hand?: number
          updated_at?: string | null
        }
        Update: {
          franchise_id?: string | null
          id?: string
          last_franchise_price_inr?: number | null
          last_retail_price_local?: number | null
          product_id?: string
          product_name?: string
          product_sku?: string | null
          quantity_in_hand?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchise_inventory_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_payments: {
        Row: {
          amount_inr: number
          created_at: string | null
          franchise_id: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          reference_number: string | null
          shipment_id: string | null
        }
        Insert: {
          amount_inr: number
          created_at?: string | null
          franchise_id?: string | null
          id?: string
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          reference_number?: string | null
          shipment_id?: string | null
        }
        Update: {
          amount_inr?: number
          created_at?: string | null
          franchise_id?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
          shipment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchise_payments_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_payments_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "franchise_shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_sale_items: {
        Row: {
          created_at: string | null
          franchise_cost_inr: number | null
          id: string
          product_id: string
          product_name: string
          quantity: number
          sale_id: string | null
          total_price_local: number
          unit_price_local: number
        }
        Insert: {
          created_at?: string | null
          franchise_cost_inr?: number | null
          id?: string
          product_id: string
          product_name: string
          quantity: number
          sale_id?: string | null
          total_price_local: number
          unit_price_local: number
        }
        Update: {
          created_at?: string | null
          franchise_cost_inr?: number | null
          id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          sale_id?: string | null
          total_price_local?: number
          unit_price_local?: number
        }
        Relationships: [
          {
            foreignKeyName: "franchise_sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "franchise_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_sales: {
        Row: {
          created_at: string | null
          currency_code: string | null
          customer_name: string | null
          customer_phone: string | null
          franchise_id: string | null
          id: string
          invoice_number: string | null
          payment_method: string | null
          sold_at: string | null
          total_inr_approx: number | null
          total_local_currency: number
        }
        Insert: {
          created_at?: string | null
          currency_code?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          franchise_id?: string | null
          id?: string
          invoice_number?: string | null
          payment_method?: string | null
          sold_at?: string | null
          total_inr_approx?: number | null
          total_local_currency: number
        }
        Update: {
          created_at?: string | null
          currency_code?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          franchise_id?: string | null
          id?: string
          invoice_number?: string | null
          payment_method?: string | null
          sold_at?: string | null
          total_inr_approx?: number | null
          total_local_currency?: number
        }
        Relationships: [
          {
            foreignKeyName: "franchise_sales_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_shipment_inventory_log: {
        Row: {
          deducted_at: string | null
          deducted_from: string
          id: string
          product_id: string
          quantity_deducted: number
          shipment_id: string | null
          shipment_item_id: string | null
        }
        Insert: {
          deducted_at?: string | null
          deducted_from?: string
          id?: string
          product_id: string
          quantity_deducted: number
          shipment_id?: string | null
          shipment_item_id?: string | null
        }
        Update: {
          deducted_at?: string | null
          deducted_from?: string
          id?: string
          product_id?: string
          quantity_deducted?: number
          shipment_id?: string | null
          shipment_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchise_shipment_inventory_log_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "franchise_shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_shipment_inventory_log_shipment_item_id_fkey"
            columns: ["shipment_item_id"]
            isOneToOne: false
            referencedRelation: "franchise_shipment_items"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_shipment_items: {
        Row: {
          cost_price_inr: number
          created_at: string | null
          franchise_price_inr: number | null
          id: string
          product_id: string
          product_name: string
          product_sku: string | null
          quantity: number
          retail_price_inr: number | null
          retail_price_local: number | null
          shipment_id: string | null
        }
        Insert: {
          cost_price_inr: number
          created_at?: string | null
          franchise_price_inr?: number | null
          id?: string
          product_id: string
          product_name: string
          product_sku?: string | null
          quantity: number
          retail_price_inr?: number | null
          retail_price_local?: number | null
          shipment_id?: string | null
        }
        Update: {
          cost_price_inr?: number
          created_at?: string | null
          franchise_price_inr?: number | null
          id?: string
          product_id?: string
          product_name?: string
          product_sku?: string | null
          quantity?: number
          retail_price_inr?: number | null
          retail_price_local?: number | null
          shipment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchise_shipment_items_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "franchise_shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_shipments: {
        Row: {
          amount_paid_inr: number | null
          created_at: string | null
          delivered_at: string | null
          dispatched_at: string | null
          expected_delivery_date: string | null
          franchise_id: string | null
          id: string
          inventory_deducted: boolean | null
          invoice_number: string | null
          notes: string | null
          payment_due_date: string | null
          payment_status: string | null
          request_id: string | null
          shipment_type: string
          status: string
          total_inr: number | null
          transfer_type: string
          updated_at: string | null
        }
        Insert: {
          amount_paid_inr?: number | null
          created_at?: string | null
          delivered_at?: string | null
          dispatched_at?: string | null
          expected_delivery_date?: string | null
          franchise_id?: string | null
          id?: string
          inventory_deducted?: boolean | null
          invoice_number?: string | null
          notes?: string | null
          payment_due_date?: string | null
          payment_status?: string | null
          request_id?: string | null
          shipment_type?: string
          status?: string
          total_inr?: number | null
          transfer_type?: string
          updated_at?: string | null
        }
        Update: {
          amount_paid_inr?: number | null
          created_at?: string | null
          delivered_at?: string | null
          dispatched_at?: string | null
          expected_delivery_date?: string | null
          franchise_id?: string | null
          id?: string
          inventory_deducted?: boolean | null
          invoice_number?: string | null
          notes?: string | null
          payment_due_date?: string | null
          payment_status?: string | null
          request_id?: string | null
          shipment_type?: string
          status?: string
          total_inr?: number | null
          transfer_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchise_shipments_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_shipments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "franchise_stock_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_stock_request_items: {
        Row: {
          created_at: string | null
          franchise_price_inr: number | null
          id: string
          product_id: string
          product_name: string
          quantity_requested: number
          request_id: string | null
        }
        Insert: {
          created_at?: string | null
          franchise_price_inr?: number | null
          id?: string
          product_id: string
          product_name: string
          quantity_requested: number
          request_id?: string | null
        }
        Update: {
          created_at?: string | null
          franchise_price_inr?: number | null
          id?: string
          product_id?: string
          product_name?: string
          quantity_requested?: number
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchise_stock_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "franchise_stock_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_stock_requests: {
        Row: {
          created_at: string | null
          franchise_id: string | null
          id: string
          notes: string | null
          requested_by: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          franchise_id?: string | null
          id?: string
          notes?: string | null
          requested_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          franchise_id?: string | null
          id?: string
          notes?: string | null
          requested_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchise_stock_requests_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_users: {
        Row: {
          created_at: string | null
          franchise_id: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          franchise_id?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          franchise_id?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchise_users_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      franchises: {
        Row: {
          address: string | null
          city: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string
          created_at: string | null
          currency_code: string
          currency_symbol: string
          franchise_type: string
          id: string
          inr_conversion_rate: number
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string | null
          currency_code?: string
          currency_symbol?: string
          franchise_type?: string
          id?: string
          inr_conversion_rate?: number
          name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string | null
          currency_code?: string
          currency_symbol?: string
          franchise_type?: string
          id?: string
          inr_conversion_rate?: number
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      google_api_usage: {
        Row: {
          api_method: string
          created_at: string | null
          error_message: string | null
          id: string
          integration_id: string | null
          request_count: number | null
          response_status: string | null
          service_name: string
          usage_date: string | null
        }
        Insert: {
          api_method: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          request_count?: number | null
          response_status?: string | null
          service_name: string
          usage_date?: string | null
        }
        Update: {
          api_method?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          request_count?: number | null
          response_status?: string | null
          service_name?: string
          usage_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_api_usage_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "google_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      google_drive_folders: {
        Row: {
          category_id: string | null
          created_at: string | null
          folder_id: string
          folder_name: string
          id: string
          parent_folder_id: string | null
          subcategory_id: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          folder_id: string
          folder_name: string
          id?: string
          parent_folder_id?: string | null
          subcategory_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          folder_id?: string
          folder_name?: string
          id?: string
          parent_folder_id?: string | null
          subcategory_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_drive_folders_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_drive_folders_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "catalog_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      google_drive_images: {
        Row: {
          created_at: string | null
          drive_file_id: string
          id: string
          image_url: string
          product_id: string | null
          sync_status: string
          thumbnail_url: string | null
          updated_at: string | null
          view_url: string | null
        }
        Insert: {
          created_at?: string | null
          drive_file_id: string
          id?: string
          image_url: string
          product_id?: string | null
          sync_status?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          view_url?: string | null
        }
        Update: {
          created_at?: string | null
          drive_file_id?: string
          id?: string
          image_url?: string
          product_id?: string | null
          sync_status?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          view_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_drive_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_drive_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      google_integrations: {
        Row: {
          access_token: string | null
          client_id: string
          client_secret: string
          created_at: string | null
          enabled_services: Json
          id: string
          is_active: boolean | null
          project_id: string
          project_name: string | null
          refresh_token: string | null
          scopes: string[] | null
          service_configs: Json
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          client_id: string
          client_secret: string
          created_at?: string | null
          enabled_services?: Json
          id?: string
          is_active?: boolean | null
          project_id: string
          project_name?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          service_configs?: Json
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          client_id?: string
          client_secret?: string
          created_at?: string | null
          enabled_services?: Json
          id?: string
          is_active?: boolean | null
          project_id?: string
          project_name?: string | null
          refresh_token?: string | null
          scopes?: string[] | null
          service_configs?: Json
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      google_photos_albums: {
        Row: {
          album_cover_photo_url: string | null
          album_id: string
          album_title: string
          category_id: string | null
          created_at: string | null
          id: string
          photos_count: number | null
          subcategory_id: string | null
          updated_at: string | null
        }
        Insert: {
          album_cover_photo_url?: string | null
          album_id: string
          album_title: string
          category_id?: string | null
          created_at?: string | null
          id?: string
          photos_count?: number | null
          subcategory_id?: string | null
          updated_at?: string | null
        }
        Update: {
          album_cover_photo_url?: string | null
          album_id?: string
          album_title?: string
          category_id?: string | null
          created_at?: string | null
          id?: string
          photos_count?: number | null
          subcategory_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_photos_albums_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_photos_albums_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "catalog_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      group_details: {
        Row: {
          color: string | null
          costume_count: number
          created_at: string | null
          dancer_names: string | null
          group_name: string | null
          group_number: number
          id: string
          material_id: string | null
          measurement_file_url: string | null
          order_id: string | null
          pattern: string | null
          special_instructions: string | null
        }
        Insert: {
          color?: string | null
          costume_count: number
          created_at?: string | null
          dancer_names?: string | null
          group_name?: string | null
          group_number: number
          id?: string
          material_id?: string | null
          measurement_file_url?: string | null
          order_id?: string | null
          pattern?: string | null
          special_instructions?: string | null
        }
        Update: {
          color?: string | null
          costume_count?: number
          created_at?: string | null
          dancer_names?: string | null
          group_name?: string | null
          group_number?: number
          id?: string
          material_id?: string | null
          measurement_file_url?: string | null
          order_id?: string | null
          pattern?: string | null
          special_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_details_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_booking_customer_details"
            referencedColumns: ["order_booking_id"]
          },
          {
            foreignKeyName: "group_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      gst_validation_cache: {
        Row: {
          address: string | null
          created_at: string | null
          gstin: string
          id: string
          is_valid: boolean | null
          last_validated: string | null
          legal_name: string | null
          registration_date: string | null
          status: string | null
          trade_name: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          gstin: string
          id?: string
          is_valid?: boolean | null
          last_validated?: string | null
          legal_name?: string | null
          registration_date?: string | null
          status?: string | null
          trade_name?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          gstin?: string
          id?: string
          is_valid?: boolean | null
          last_validated?: string | null
          legal_name?: string | null
          registration_date?: string | null
          status?: string | null
          trade_name?: string | null
        }
        Relationships: []
      }
      instructions_training: {
        Row: {
          active: boolean
          category: string
          content: string
          created_at: string
          id: string
          priority: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          content: string
          created_at?: string
          id?: string
          priority?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          content?: string
          created_at?: string
          id?: string
          priority?: number
          updated_at?: string
        }
        Relationships: []
      }
      integration_settings: {
        Row: {
          config_data: Json
          created_at: string | null
          id: string
          integration_type: string
          is_active: boolean
          updated_at: string | null
        }
        Insert: {
          config_data?: Json
          created_at?: string | null
          id?: string
          integration_type: string
          is_active?: boolean
          updated_at?: string | null
        }
        Update: {
          config_data?: Json
          created_at?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      integration_sync_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          error_message: string | null
          id: string
          integration_type: string
          operation: string
          status: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          integration_type: string
          operation: string
          status: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          integration_type?: string
          operation?: string
          status?: string
        }
        Relationships: []
      }
      inventory_sold: {
        Row: {
          created_at: string
          id: string
          invoice_id: string | null
          invoice_number: string
          invoice_type: string
          product_id: string | null
          quantity_sold: number
          sold_at: string
          store_id: string | null
          total_amount: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          invoice_number: string
          invoice_type?: string
          product_id?: string | null
          quantity_sold?: number
          sold_at?: string
          store_id?: string | null
          total_amount?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          invoice_number?: string
          invoice_type?: string
          product_id?: string | null
          quantity_sold?: number
          sold_at?: string
          store_id?: string | null
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_sold_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_sold_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_sold_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          invoice_id: string | null
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          invoice_id?: string | null
          product_id?: string | null
          quantity: number
          unit_price: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoice_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoice_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          template_data: Json
          template_name: string
          template_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          template_data: Json
          template_name: string
          template_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          template_data?: Json
          template_name?: string
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string | null
          customer_id: string | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          order_id: string | null
          payment_date: string | null
          payment_method: string | null
          payment_notes: string | null
          staff_id: string | null
          status: string
          store_id: string | null
          subtotal: number
          tax_amount: number
          total_amount: number
          transaction_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          due_date: string
          id?: string
          invoice_date: string
          invoice_number: string
          notes?: string | null
          order_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          staff_id?: string | null
          status?: string
          store_id?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          transaction_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          order_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          staff_id?: string | null
          status?: string
          store_id?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_booking_customer_details"
            referencedColumns: ["order_booking_id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      jfd_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      jfd_clients: {
        Row: {
          address: string | null
          city: string | null
          client_type: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string
          postal_code: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone: string
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          client_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      jfd_inventory_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          images: Json | null
          is_active: boolean | null
          item_id: string
          item_type: string | null
          name: string
          quantity_available: number | null
          rental_price: number | null
          sale_price: number | null
          specifications: Json | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          item_id: string
          item_type?: string | null
          name: string
          quantity_available?: number | null
          rental_price?: number | null
          sale_price?: number | null
          specifications?: Json | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          item_id?: string
          item_type?: string | null
          name?: string
          quantity_available?: number | null
          rental_price?: number | null
          sale_price?: number | null
          specifications?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jfd_inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "jfd_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      jfd_payment_transactions: {
        Row: {
          amount: number
          bill_id: string
          bill_type: string
          created_at: string | null
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string
          transaction_reference: string | null
        }
        Insert: {
          amount: number
          bill_id: string
          bill_type: string
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method: string
          transaction_reference?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string
          bill_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string
          transaction_reference?: string | null
        }
        Relationships: []
      }
      jfd_rental_bill_items: {
        Row: {
          created_at: string | null
          id: string
          inventory_item_id: string
          quantity: number
          rental_bill_id: string
          rental_price: number
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_item_id: string
          quantity?: number
          rental_bill_id: string
          rental_price: number
          total_amount: number
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string
          quantity?: number
          rental_bill_id?: string
          rental_price?: number
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "jfd_rental_bill_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "jfd_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jfd_rental_bill_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "jfd_rental_item_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jfd_rental_bill_items_rental_bill_id_fkey"
            columns: ["rental_bill_id"]
            isOneToOne: false
            referencedRelation: "jfd_rental_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      jfd_rental_bills: {
        Row: {
          bill_number: string
          client_id: string
          created_at: string | null
          date: string
          deposit_amount: number | null
          deposit_details: string | null
          deposit_type: string | null
          id: string
          notes: string | null
          picked_up_at: string | null
          return_date: string
          return_time: string
          returned_at: string | null
          status: string | null
          time: string
          total_rent: number
          updated_at: string | null
        }
        Insert: {
          bill_number: string
          client_id: string
          created_at?: string | null
          date: string
          deposit_amount?: number | null
          deposit_details?: string | null
          deposit_type?: string | null
          id?: string
          notes?: string | null
          picked_up_at?: string | null
          return_date: string
          return_time: string
          returned_at?: string | null
          status?: string | null
          time: string
          total_rent?: number
          updated_at?: string | null
        }
        Update: {
          bill_number?: string
          client_id?: string
          created_at?: string | null
          date?: string
          deposit_amount?: number | null
          deposit_details?: string | null
          deposit_type?: string | null
          id?: string
          notes?: string | null
          picked_up_at?: string | null
          return_date?: string
          return_time?: string
          returned_at?: string | null
          status?: string | null
          time?: string
          total_rent?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jfd_rental_bills_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "jfd_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      jfd_sales_bill_items: {
        Row: {
          created_at: string | null
          id: string
          inventory_item_id: string
          quantity: number
          sales_bill_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_item_id: string
          quantity?: number
          sales_bill_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string
          quantity?: number
          sales_bill_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "jfd_sales_bill_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "jfd_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jfd_sales_bill_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "jfd_rental_item_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jfd_sales_bill_items_sales_bill_id_fkey"
            columns: ["sales_bill_id"]
            isOneToOne: false
            referencedRelation: "jfd_sales_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      jfd_sales_bills: {
        Row: {
          bill_number: string
          client_id: string
          created_at: string | null
          discount_amount: number | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          sale_date: string
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          bill_number: string
          client_id: string
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          sale_date?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          bill_number?: string
          client_id?: string
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          sale_date?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jfd_sales_bills_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "jfd_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      jfd_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      journey_executions: {
        Row: {
          completed_at: string | null
          contact_id: string | null
          current_node_id: string | null
          id: string
          journey_id: string | null
          started_at: string | null
          status: string | null
          variables: Json | null
        }
        Insert: {
          completed_at?: string | null
          contact_id?: string | null
          current_node_id?: string | null
          id?: string
          journey_id?: string | null
          started_at?: string | null
          status?: string | null
          variables?: Json | null
        }
        Update: {
          completed_at?: string | null
          contact_id?: string | null
          current_node_id?: string | null
          id?: string
          journey_id?: string | null
          started_at?: string | null
          status?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_executions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_executions_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          created_at: string | null
          description: string | null
          flow_graph: Json
          id: string
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          flow_graph?: Json
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          flow_graph?: Json
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          chunk_index: number | null
          content: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json | null
          source_id: string | null
          source_type: string
          source_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chunk_index?: number | null
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type: string
          source_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chunk_index?: number | null
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string
          source_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      knowledge_chunks: {
        Row: {
          chunk_index: number | null
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          source_id: string | null
          tokens: number | null
        }
        Insert: {
          chunk_index?: number | null
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          tokens?: number | null
        }
        Update: {
          chunk_index?: number | null
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          tokens?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_sources: {
        Row: {
          created_at: string | null
          file_path: string | null
          id: string
          last_processed_at: string | null
          metadata: Json | null
          name: string
          source_url: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_path?: string | null
          id?: string
          last_processed_at?: string | null
          metadata?: Json | null
          name: string
          source_url?: string | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_path?: string | null
          id?: string
          last_processed_at?: string | null
          metadata?: Json | null
          name?: string
          source_url?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      loan_payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          interest_portion: number | null
          loan_id: string
          notes: string | null
          paid_amount: number | null
          payment_date: string | null
          principal_portion: number | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          interest_portion?: number | null
          loan_id: string
          notes?: string | null
          paid_amount?: number | null
          payment_date?: string | null
          principal_portion?: number | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          interest_portion?: number | null
          loan_id?: string
          notes?: string | null
          paid_amount?: number | null
          payment_date?: string | null
          principal_portion?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          created_at: string
          end_date: string
          id: string
          interest_rate: number
          lender_name: string
          loan_name: string
          monthly_payment: number
          notes: string | null
          principal_amount: number
          remaining_balance: number
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          interest_rate: number
          lender_name: string
          loan_name: string
          monthly_payment: number
          notes?: string | null
          principal_amount: number
          remaining_balance: number
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          interest_rate?: number
          lender_name?: string
          loan_name?: string
          monthly_payment?: number
          notes?: string | null
          principal_amount?: number
          remaining_balance?: number
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      material_transactions: {
        Row: {
          created_at: string | null
          id: string
          material_id: string | null
          notes: string | null
          order_id: string | null
          quantity: number
          transaction_type: string
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          material_id?: string | null
          notes?: string | null
          order_id?: string | null
          quantity: number
          transaction_type: string
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          material_id?: string | null
          notes?: string | null
          order_id?: string | null
          quantity?: number
          transaction_type?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "material_transactions_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_booking_customer_details"
            referencedColumns: ["order_booking_id"]
          },
          {
            foreignKeyName: "material_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          available_quantity: number
          created_at: string | null
          id: string
          material_id: string
          name: string
          price_per_unit: number
          unit: string
          updated_at: string | null
        }
        Insert: {
          available_quantity?: number
          created_at?: string | null
          id?: string
          material_id: string
          name: string
          price_per_unit: number
          unit: string
          updated_at?: string | null
        }
        Update: {
          available_quantity?: number
          created_at?: string | null
          id?: string
          material_id?: string
          name?: string
          price_per_unit?: number
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      message_threads: {
        Row: {
          created_at: string | null
          customer_id: string
          customer_name: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          metadata: Json | null
          platform_id: string | null
          social_account_id: string | null
          status: string | null
          thread_identifier: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          customer_name?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          metadata?: Json | null
          platform_id?: string | null
          social_account_id?: string | null
          status?: string | null
          thread_identifier: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          customer_name?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          metadata?: Json | null
          platform_id?: string | null
          social_account_id?: string | null
          status?: string | null
          thread_identifier?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: Json
          context_message_id: string | null
          created_at: string | null
          direction: string
          error_code: string | null
          id: string
          status: string | null
          thread_id: string | null
          type: string
          wa_message_id: string | null
        }
        Insert: {
          body?: Json
          context_message_id?: string | null
          created_at?: string | null
          direction: string
          error_code?: string | null
          id?: string
          status?: string | null
          thread_id?: string | null
          type: string
          wa_message_id?: string | null
        }
        Update: {
          body?: Json
          context_message_id?: string | null
          created_at?: string | null
          direction?: string
          error_code?: string | null
          id?: string
          status?: string | null
          thread_id?: string | null
          type?: string
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_expense_budgets: {
        Row: {
          allocated_amount: number
          budget_month: string
          category_id: string
          created_at: string | null
          id: string
          remaining_amount: number
          spent_amount: number
          status: string
          updated_at: string | null
        }
        Insert: {
          allocated_amount?: number
          budget_month: string
          category_id: string
          created_at?: string | null
          id?: string
          remaining_amount?: number
          spent_amount?: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          allocated_amount?: number
          budget_month?: string
          category_id?: string
          created_at?: string | null
          id?: string
          remaining_amount?: number
          spent_amount?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_expense_budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_salary_processing: {
        Row: {
          advance_deduction: number
          allowances_total: number
          approved_at: string | null
          approved_by: string | null
          basic_salary: number
          created_at: string | null
          da_amount: number
          esi_employee: number
          esi_employer: number
          gross_salary: number
          half_days: number
          hra_amount: number
          id: string
          leave_days: number
          net_salary: number
          other_deductions: number
          other_deductions_detail: Json | null
          permission_days: number
          pf_employee: number
          pf_employer: number
          present_days: number
          processed_at: string | null
          processed_by: string | null
          professional_tax: number
          salary_month: string
          staff_id: string
          status: string
          tds_amount: number
          total_deductions: number
          total_working_days: number
          updated_at: string | null
        }
        Insert: {
          advance_deduction?: number
          allowances_total?: number
          approved_at?: string | null
          approved_by?: string | null
          basic_salary?: number
          created_at?: string | null
          da_amount?: number
          esi_employee?: number
          esi_employer?: number
          gross_salary?: number
          half_days?: number
          hra_amount?: number
          id?: string
          leave_days?: number
          net_salary?: number
          other_deductions?: number
          other_deductions_detail?: Json | null
          permission_days?: number
          pf_employee?: number
          pf_employer?: number
          present_days?: number
          processed_at?: string | null
          processed_by?: string | null
          professional_tax?: number
          salary_month: string
          staff_id: string
          status?: string
          tds_amount?: number
          total_deductions?: number
          total_working_days: number
          updated_at?: string | null
        }
        Update: {
          advance_deduction?: number
          allowances_total?: number
          approved_at?: string | null
          approved_by?: string | null
          basic_salary?: number
          created_at?: string | null
          da_amount?: number
          esi_employee?: number
          esi_employer?: number
          gross_salary?: number
          half_days?: number
          hra_amount?: number
          id?: string
          leave_days?: number
          net_salary?: number
          other_deductions?: number
          other_deductions_detail?: Json | null
          permission_days?: number
          pf_employee?: number
          pf_employer?: number
          present_days?: number
          processed_at?: string | null
          processed_by?: string | null
          professional_tax?: number
          salary_month?: string
          staff_id?: string
          status?: string
          tds_amount?: number
          total_deductions?: number
          total_working_days?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_salary_processing_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_salary_processing_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_salary_processing_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_salary_processing_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_salary_processing_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_salary_processing_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      order_bookings: {
        Row: {
          amount_paid: number | null
          approval_link: string | null
          approval_status: string | null
          approved_at: string | null
          client_view_token: string | null
          courier_company: string | null
          created_at: string | null
          customer_id: string | null
          delivery_option: string | null
          due_date: string
          franchise_id: string | null
          id: string
          is_admin: boolean | null
          is_same_person: boolean | null
          label_url: string | null
          material_availability: boolean | null
          order_category: string | null
          order_date: string
          order_number: string
          order_type: string | null
          packed_photo_url: string | null
          payment_status: string | null
          products: Json | null
          ready_by_date: string | null
          rejection_reason: string | null
          shipped_at: string | null
          shipping_status: string | null
          shopify_order_id: string | null
          status: string | null
          terms_accepted_at: string | null
          terms_accepted_by: string | null
          total_amount: number | null
          total_costumes: number
          tracking_number: string | null
          weight_kg: number | null
          workshop_location: string | null
          workshop_status: string | null
        }
        Insert: {
          amount_paid?: number | null
          approval_link?: string | null
          approval_status?: string | null
          approved_at?: string | null
          client_view_token?: string | null
          courier_company?: string | null
          created_at?: string | null
          customer_id?: string | null
          delivery_option?: string | null
          due_date: string
          franchise_id?: string | null
          id?: string
          is_admin?: boolean | null
          is_same_person?: boolean | null
          label_url?: string | null
          material_availability?: boolean | null
          order_category?: string | null
          order_date: string
          order_number: string
          order_type?: string | null
          packed_photo_url?: string | null
          payment_status?: string | null
          products?: Json | null
          ready_by_date?: string | null
          rejection_reason?: string | null
          shipped_at?: string | null
          shipping_status?: string | null
          shopify_order_id?: string | null
          status?: string | null
          terms_accepted_at?: string | null
          terms_accepted_by?: string | null
          total_amount?: number | null
          total_costumes: number
          tracking_number?: string | null
          weight_kg?: number | null
          workshop_location?: string | null
          workshop_status?: string | null
        }
        Update: {
          amount_paid?: number | null
          approval_link?: string | null
          approval_status?: string | null
          approved_at?: string | null
          client_view_token?: string | null
          courier_company?: string | null
          created_at?: string | null
          customer_id?: string | null
          delivery_option?: string | null
          due_date?: string
          franchise_id?: string | null
          id?: string
          is_admin?: boolean | null
          is_same_person?: boolean | null
          label_url?: string | null
          material_availability?: boolean | null
          order_category?: string | null
          order_date?: string
          order_number?: string
          order_type?: string | null
          packed_photo_url?: string | null
          payment_status?: string | null
          products?: Json | null
          ready_by_date?: string | null
          rejection_reason?: string | null
          shipped_at?: string | null
          shipping_status?: string | null
          shopify_order_id?: string | null
          status?: string | null
          terms_accepted_at?: string | null
          terms_accepted_by?: string | null
          total_amount?: number | null
          total_costumes?: number
          tracking_number?: string | null
          weight_kg?: number | null
          workshop_location?: string | null
          workshop_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_bookings_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      order_change_requests: {
        Row: {
          attachments: string[] | null
          client_notes: string | null
          created_at: string | null
          id: string
          modified_at: string | null
          order_id: string
          requested_changes: string
          resent_at: string | null
          staff_notes: string | null
          status: string
        }
        Insert: {
          attachments?: string[] | null
          client_notes?: string | null
          created_at?: string | null
          id?: string
          modified_at?: string | null
          order_id: string
          requested_changes: string
          resent_at?: string | null
          staff_notes?: string | null
          status: string
        }
        Update: {
          attachments?: string[] | null
          client_notes?: string | null
          created_at?: string | null
          id?: string
          modified_at?: string | null
          order_id?: string
          requested_changes?: string
          resent_at?: string | null
          staff_notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_change_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_booking_customer_details"
            referencedColumns: ["order_booking_id"]
          },
          {
            foreignKeyName: "order_change_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      order_interactions: {
        Row: {
          created_at: string
          created_by: string | null
          details: string | null
          id: string
          interaction_type: string
          is_resolved: boolean
          new_value: string | null
          old_value: string | null
          order_id: string
          summary: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          details?: string | null
          id?: string
          interaction_type: string
          is_resolved?: boolean
          new_value?: string | null
          old_value?: string | null
          order_id: string
          summary: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          details?: string | null
          id?: string
          interaction_type?: string
          is_resolved?: boolean
          new_value?: string | null
          old_value?: string | null
          order_id?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_interactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_booking_customer_details"
            referencedColumns: ["order_booking_id"]
          },
          {
            foreignKeyName: "order_interactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order_id: string | null
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order_id?: string | null
          price: number
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order_id?: string | null
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string
          id: string
          order_date: string | null
          order_number: string
          shipping_address: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name: string
          id?: string
          order_date?: string | null
          order_number: string
          shipping_address: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          id?: string
          order_date?: string | null
          order_number?: string
          shipping_address?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
        }
        Relationships: []
      }
      payment_schedules: {
        Row: {
          account_number: string | null
          adjustment_amount: number | null
          amount: number
          auto_generated: boolean | null
          bank_name: string | null
          bill_id: string | null
          cheque_number: string | null
          created_at: string | null
          description: string
          emi_schedule_id: string | null
          id: string
          payment_method: string
          payment_source: string | null
          payment_type: string
          scheduled_date: string
          status: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          account_number?: string | null
          adjustment_amount?: number | null
          amount?: number
          auto_generated?: boolean | null
          bank_name?: string | null
          bill_id?: string | null
          cheque_number?: string | null
          created_at?: string | null
          description: string
          emi_schedule_id?: string | null
          id?: string
          payment_method?: string
          payment_source?: string | null
          payment_type: string
          scheduled_date: string
          status?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          account_number?: string | null
          adjustment_amount?: number | null
          amount?: number
          auto_generated?: boolean | null
          bank_name?: string | null
          bill_id?: string | null
          cheque_number?: string | null
          created_at?: string | null
          description?: string
          emi_schedule_id?: string | null
          id?: string
          payment_method?: string
          payment_source?: string | null
          payment_type?: string
          scheduled_date?: string
          status?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_schedules_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "purchase_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_schedules_emi_schedule_id_fkey"
            columns: ["emi_schedule_id"]
            isOneToOne: false
            referencedRelation: "recurring_emi_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_schedules_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_balance_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_schedules_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          cashfree_order_id: string | null
          cashfree_payment_id: string | null
          created_at: string | null
          gateway_response: Json | null
          id: string
          invoice_id: string
          payment_link_id: string | null
          payment_method: string | null
          transaction_status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          cashfree_order_id?: string | null
          cashfree_payment_id?: string | null
          created_at?: string | null
          gateway_response?: Json | null
          id?: string
          invoice_id: string
          payment_link_id?: string | null
          payment_method?: string | null
          transaction_status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          cashfree_order_id?: string | null
          cashfree_payment_id?: string | null
          created_at?: string | null
          gateway_response?: Json | null
          id?: string
          invoice_id?: string
          payment_link_id?: string | null
          payment_method?: string | null
          transaction_status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "tax_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      personality_training: {
        Row: {
          created_at: string | null
          description: string | null
          example_responses: Json | null
          id: string
          is_active: boolean | null
          priority: number | null
          trait_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          example_responses?: Json | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          trait_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          example_responses?: Json | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          trait_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_analytics: {
        Row: {
          auto_replies: number | null
          average_response_time: number | null
          created_at: string | null
          customer_satisfaction: number | null
          date: string | null
          id: string
          manual_replies: number | null
          messages_received: number | null
          messages_replied: number | null
          platform_id: string | null
          social_account_id: string | null
        }
        Insert: {
          auto_replies?: number | null
          average_response_time?: number | null
          created_at?: string | null
          customer_satisfaction?: number | null
          date?: string | null
          id?: string
          manual_replies?: number | null
          messages_received?: number | null
          messages_replied?: number | null
          platform_id?: string | null
          social_account_id?: string | null
        }
        Update: {
          auto_replies?: number | null
          average_response_time?: number | null
          created_at?: string | null
          customer_satisfaction?: number | null
          date?: string | null
          id?: string
          manual_replies?: number | null
          messages_received?: number | null
          messages_replied?: number | null
          platform_id?: string | null
          social_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_analytics_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_analytics_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_held_bills: {
        Row: {
          cart_items: Json
          created_at: string | null
          customer_data: Json | null
          day_book_entry_id: string | null
          hold_number: string
          id: string
          staff_id: string | null
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          cart_items?: Json
          created_at?: string | null
          customer_data?: Json | null
          day_book_entry_id?: string | null
          hold_number: string
          id?: string
          staff_id?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          cart_items?: Json
          created_at?: string | null
          customer_data?: Json | null
          day_book_entry_id?: string | null
          hold_number?: string
          id?: string
          staff_id?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_held_bills_day_book_entry_id_fkey"
            columns: ["day_book_entry_id"]
            isOneToOne: false
            referencedRelation: "day_book_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_held_bills_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_held_bills_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_invoice_sequences: {
        Row: {
          created_at: string | null
          id: string
          last_sequence_number: number
          month_year: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_sequence_number?: number
          month_year: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_sequence_number?: number
          month_year?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pos_payment_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          created_at: string | null
          id: string
          invoice_id: string
          new_payment_method: string
          new_transaction_id: string | null
          old_payment_method: string | null
          old_transaction_id: string | null
          reason: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          invoice_id: string
          new_payment_method: string
          new_transaction_id?: string | null
          old_payment_method?: string | null
          old_transaction_id?: string | null
          reason?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string
          new_payment_method?: string
          new_transaction_id?: string | null
          old_payment_method?: string | null
          old_transaction_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_payment_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_payment_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_payment_history_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_returns: {
        Row: {
          created_at: string | null
          id: string
          original_invoice_id: string
          return_amount: number
          return_date: string
          return_items: Json
          return_number: string
          return_reason: string | null
          staff_id: string | null
          status: string
          store_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          original_invoice_id: string
          return_amount?: number
          return_date?: string
          return_items?: Json
          return_number: string
          return_reason?: string | null
          staff_id?: string | null
          status?: string
          store_id?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          original_invoice_id?: string
          return_amount?: number
          return_date?: string
          return_items?: Json
          return_number?: string
          return_reason?: string | null
          staff_id?: string | null
          status?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_returns_original_invoice_id_fkey"
            columns: ["original_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_returns_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_returns_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_returns_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      postal_codes: {
        Row: {
          city: string
          country: string
          created_at: string | null
          district: string | null
          id: string
          pin_code: string
          region: string | null
          state: string
          updated_at: string | null
        }
        Insert: {
          city: string
          country?: string
          created_at?: string | null
          district?: string | null
          id?: string
          pin_code: string
          region?: string | null
          state: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          district?: string | null
          id?: string
          pin_code?: string
          region?: string | null
          state?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      processing_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          job_type: string
          progress: number | null
          result: Json | null
          source_id: string | null
          started_at: string | null
          status: string
          total_steps: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type: string
          progress?: number | null
          result?: Json | null
          source_id?: string | null
          started_at?: string | null
          status?: string
          total_steps?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type?: string
          progress?: number | null
          result?: Json | null
          source_id?: string | null
          started_at?: string | null
          status?: string
          total_steps?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_inventory_summary: {
        Row: {
          created_at: string | null
          current_available_quantity: number | null
          id: string
          initial_stock: number | null
          item_code: string
          last_purchase_date: string | null
          last_sale_date: string | null
          product_id: string
          product_name: string
          total_purchase_value: number | null
          total_purchased_quantity: number | null
          total_sales_value: number | null
          total_sold_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_available_quantity?: number | null
          id?: string
          initial_stock?: number | null
          item_code: string
          last_purchase_date?: string | null
          last_sale_date?: string | null
          product_id: string
          product_name: string
          total_purchase_value?: number | null
          total_purchased_quantity?: number | null
          total_sales_value?: number | null
          total_sold_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_available_quantity?: number | null
          id?: string
          initial_stock?: number | null
          item_code?: string
          last_purchase_date?: string | null
          last_sale_date?: string | null
          product_id?: string
          product_name?: string
          total_purchase_value?: number | null
          total_purchased_quantity?: number | null
          total_sales_value?: number | null
          total_sold_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_summary_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_summary_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_knowledge: {
        Row: {
          care_instructions: string | null
          created_at: string | null
          id: string
          key_features: Json | null
          price_range: string | null
          product_category: string
          product_name: string
          sizing_info: string | null
          updated_at: string | null
          upselling_tips: string | null
        }
        Insert: {
          care_instructions?: string | null
          created_at?: string | null
          id?: string
          key_features?: Json | null
          price_range?: string | null
          product_category: string
          product_name: string
          sizing_info?: string | null
          updated_at?: string | null
          upselling_tips?: string | null
        }
        Update: {
          care_instructions?: string | null
          created_at?: string | null
          id?: string
          key_features?: Json | null
          price_range?: string | null
          product_category?: string
          product_name?: string
          sizing_info?: string | null
          updated_at?: string | null
          upselling_tips?: string | null
        }
        Relationships: []
      }
      product_price_history: {
        Row: {
          created_at: string | null
          effective_date: string
          id: string
          price: number
          product_id: string
        }
        Insert: {
          created_at?: string | null
          effective_date: string
          id?: string
          price: number
          product_id: string
        }
        Update: {
          created_at?: string | null
          effective_date?: string
          id?: string
          price?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          created_at: string | null
          customer_id: string | null
          customer_name: string
          id: string
          product_id: string
          rating: number
          review_text: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          customer_name: string
          id?: string
          product_id: string
          rating: number
          review_text?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string
          id?: string
          product_id?: string
          rating?: number
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specifications: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          name: string
          product_id: string
          value: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          name: string
          product_id: string
          value: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          name?: string
          product_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          tag_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          tag_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          tag_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attributes: Json
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          product_id: string
          quantity_in_stock: number
          sale_price: number | null
          sku: string | null
          updated_at: string | null
        }
        Insert: {
          attributes?: Json
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          product_id: string
          quantity_in_stock?: number
          sale_price?: number | null
          sku?: string | null
          updated_at?: string | null
        }
        Update: {
          attributes?: Json
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          product_id?: string
          quantity_in_stock?: number
          sale_price?: number | null
          sku?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_mentions: string | null
          call_to_action: string | null
          category: string | null
          category_id: string | null
          cost_price: number
          created_at: string | null
          cultural_keywords: string[] | null
          deleted_at: string | null
          description: string | null
          external_ids: Json | null
          features: string[] | null
          gst_rate: number
          hashtags: string[] | null
          hsn_code: string
          id: string
          image_url: string | null
          initial_stock: number | null
          is_active: boolean
          item_code: string
          meta_description: string | null
          meta_title: string | null
          name: string
          product_type: string | null
          quantity_in_stock: number
          reorder_level: number
          shopify_product_id: string | null
          social_caption: string | null
          store_id: string | null
          subcategory: string | null
          supplier_id: string | null
          tags: string[] | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          brand_mentions?: string | null
          call_to_action?: string | null
          category?: string | null
          category_id?: string | null
          cost_price: number
          created_at?: string | null
          cultural_keywords?: string[] | null
          deleted_at?: string | null
          description?: string | null
          external_ids?: Json | null
          features?: string[] | null
          gst_rate: number
          hashtags?: string[] | null
          hsn_code: string
          id?: string
          image_url?: string | null
          initial_stock?: number | null
          is_active?: boolean
          item_code: string
          meta_description?: string | null
          meta_title?: string | null
          name: string
          product_type?: string | null
          quantity_in_stock?: number
          reorder_level?: number
          shopify_product_id?: string | null
          social_caption?: string | null
          store_id?: string | null
          subcategory?: string | null
          supplier_id?: string | null
          tags?: string[] | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          brand_mentions?: string | null
          call_to_action?: string | null
          category?: string | null
          category_id?: string | null
          cost_price?: number
          created_at?: string | null
          cultural_keywords?: string[] | null
          deleted_at?: string | null
          description?: string | null
          external_ids?: Json | null
          features?: string[] | null
          gst_rate?: number
          hashtags?: string[] | null
          hsn_code?: string
          id?: string
          image_url?: string | null
          initial_stock?: number | null
          is_active?: boolean
          item_code?: string
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          product_type?: string | null
          quantity_in_stock?: number
          reorder_level?: number
          shopify_product_id?: string | null
          social_caption?: string | null
          store_id?: string | null
          subcategory?: string | null
          supplier_id?: string | null
          tags?: string[] | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      proforma_invoices: {
        Row: {
          created_at: string | null
          currency: string
          exchange_rate: number
          id: string
          invoice_date: string
          invoice_number: string
          order_id: string | null
          order_number: string
          products: Json
          to_address: Json
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          currency: string
          exchange_rate?: number
          id?: string
          invoice_date: string
          invoice_number: string
          order_id?: string | null
          order_number: string
          products: Json
          to_address: Json
          total_amount: number
        }
        Update: {
          created_at?: string | null
          currency?: string
          exchange_rate?: number
          id?: string
          invoice_date?: string
          invoice_number?: string
          order_id?: string | null
          order_number?: string
          products?: Json
          to_address?: Json
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "proforma_invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_booking_customer_details"
            referencedColumns: ["order_booking_id"]
          },
          {
            foreignKeyName: "proforma_invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_bill_audit: {
        Row: {
          action: string
          bill_id: string
          changed_at: string | null
          changed_by: string | null
          id: string
          new_data: Json | null
          notes: string | null
          old_data: Json | null
        }
        Insert: {
          action: string
          bill_id: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          notes?: string | null
          old_data?: Json | null
        }
        Update: {
          action?: string
          bill_id?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          notes?: string | null
          old_data?: Json | null
        }
        Relationships: []
      }
      purchase_bill_items: {
        Row: {
          bill_id: string
          created_at: string | null
          description: string
          id: string
          item_code: string | null
          product_id: string
          quantity: number
          tax_amount: number
          tax_rate: number
          total_amount: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          bill_id: string
          created_at?: string | null
          description: string
          id?: string
          item_code?: string | null
          product_id: string
          quantity: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          bill_id?: string
          created_at?: string | null
          description?: string
          id?: string
          item_code?: string | null
          product_id?: string
          quantity?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "purchase_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_bill_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_bill_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_bills: {
        Row: {
          bill_date: string
          bill_number: string
          created_at: string | null
          currency: string | null
          discount_amount: number | null
          discount_type: string | null
          discount_value: number | null
          due_date: string
          id: string
          is_gst_inclusive: boolean | null
          notes: string | null
          original_bill_filename: string | null
          original_bill_size: number | null
          original_bill_url: string | null
          paid_amount: number
          payment_status: string
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          bill_date: string
          bill_number: string
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          due_date: string
          id?: string
          is_gst_inclusive?: boolean | null
          notes?: string | null
          original_bill_filename?: string | null
          original_bill_size?: number | null
          original_bill_url?: string | null
          paid_amount?: number
          payment_status?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          bill_date?: string
          bill_number?: string
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          due_date?: string
          id?: string
          is_gst_inclusive?: boolean | null
          notes?: string | null
          original_bill_filename?: string | null
          original_bill_size?: number | null
          original_bill_url?: string | null
          paid_amount?: number
          payment_status?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_bills_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_balance_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_bills_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          actual_delivery_date: string | null
          assigned_by: string | null
          category: string | null
          created_at: string
          expected_delivery_date: string | null
          id: string
          ordered_date: string | null
          sale_order_id: string
          sale_order_item_id: string
          status: string
          updated_at: string
          vendor_id: string | null
          vendor_name: string | null
          vendor_notes: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          assigned_by?: string | null
          category?: string | null
          created_at?: string
          expected_delivery_date?: string | null
          id?: string
          ordered_date?: string | null
          sale_order_id: string
          sale_order_item_id: string
          status?: string
          updated_at?: string
          vendor_id?: string | null
          vendor_name?: string | null
          vendor_notes?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          assigned_by?: string | null
          category?: string | null
          created_at?: string
          expected_delivery_date?: string | null
          id?: string
          ordered_date?: string | null
          sale_order_id?: string
          sale_order_item_id?: string
          status?: string
          updated_at?: string
          vendor_id?: string | null
          vendor_name?: string | null
          vendor_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_sale_order_id_fkey"
            columns: ["sale_order_id"]
            isOneToOne: false
            referencedRelation: "sale_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_sale_order_item_id_fkey"
            columns: ["sale_order_item_id"]
            isOneToOne: false
            referencedRelation: "sale_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_training: {
        Row: {
          active: boolean
          answer: string
          category: string
          created_at: string
          id: string
          priority: number
          question: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          answer: string
          category?: string
          created_at?: string
          id?: string
          priority?: number
          question: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          answer?: string
          category?: string
          created_at?: string
          id?: string
          priority?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      quick_replies: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          language: string | null
          title: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          language?: string | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          language?: string | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      quick_send_resources: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          admin_notes: string | null
          budget_range: string | null
          costume_type: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          event_date: string | null
          id: string
          quantity: number | null
          quoted_at: string | null
          quoted_by: string | null
          quoted_price: number | null
          reference_images: Json | null
          session_id: string | null
          special_requirements: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          budget_range?: string | null
          costume_type?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          event_date?: string | null
          id?: string
          quantity?: number | null
          quoted_at?: string | null
          quoted_by?: string | null
          quoted_price?: number | null
          reference_images?: Json | null
          session_id?: string | null
          special_requirements?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          budget_range?: string | null
          costume_type?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          event_date?: string | null
          id?: string
          quantity?: number | null
          quoted_at?: string | null
          quoted_by?: string | null
          quoted_price?: number | null
          reference_images?: Json | null
          session_id?: string | null
          special_requirements?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      recurring_emi_schedules: {
        Row: {
          amount: number
          bank_name: string | null
          created_at: string
          description: string
          id: string
          is_active: boolean
          payment_day: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          amount?: number
          bank_name?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          payment_day: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          amount?: number
          bank_name?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          payment_day?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      reward_tiers: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          maximum_amount: number | null
          minimum_amount: number
          reward_percentage: number
          sort_order: number | null
          tier_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_amount?: number | null
          minimum_amount?: number
          reward_percentage?: number
          sort_order?: number | null
          tier_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_amount?: number | null
          minimum_amount?: number
          reward_percentage?: number
          sort_order?: number | null
          tier_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      salary_slips: {
        Row: {
          created_at: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          salary_processing_id: string
          slip_data: Json
          slip_number: string
        }
        Insert: {
          created_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          salary_processing_id: string
          slip_data?: Json
          slip_number: string
        }
        Update: {
          created_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          salary_processing_id?: string
          slip_data?: Json
          slip_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_slips_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_slips_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_slips_salary_processing_id_fkey"
            columns: ["salary_processing_id"]
            isOneToOne: false
            referencedRelation: "monthly_salary_processing"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_order_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          item_code: string | null
          item_name: string
          notes: string | null
          order_booking_id: string | null
          product_id: string | null
          quantity: number
          sale_order_id: string | null
          total_price: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          item_code?: string | null
          item_name: string
          notes?: string | null
          order_booking_id?: string | null
          product_id?: string | null
          quantity?: number
          sale_order_id?: string | null
          total_price?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          item_code?: string | null
          item_name?: string
          notes?: string | null
          order_booking_id?: string | null
          product_id?: string | null
          quantity?: number
          sale_order_id?: string | null
          total_price?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_order_items_order_booking_id_fkey"
            columns: ["order_booking_id"]
            isOneToOne: false
            referencedRelation: "order_booking_customer_details"
            referencedColumns: ["order_booking_id"]
          },
          {
            foreignKeyName: "sale_order_items_order_booking_id_fkey"
            columns: ["order_booking_id"]
            isOneToOne: false
            referencedRelation: "order_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_order_items_sale_order_id_fkey"
            columns: ["sale_order_id"]
            isOneToOne: false
            referencedRelation: "sale_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_orders: {
        Row: {
          courier_company: string | null
          created_at: string
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          delivery_date: string | null
          id: string
          notes: string | null
          order_number: string
          order_source: string
          packed_photo_url: string | null
          salesperson_name: string
          shipped_at: string | null
          shipping_status: string | null
          status: string
          total_amount: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          courier_company?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number: string
          order_source?: string
          packed_photo_url?: string | null
          salesperson_name: string
          shipped_at?: string | null
          shipping_status?: string | null
          status?: string
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          courier_company?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          order_source?: string
          packed_photo_url?: string | null
          salesperson_name?: string
          shipped_at?: string | null
          shipping_status?: string | null
          status?: string
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_process_training: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key_questions: Json | null
          priority: number | null
          process_name: string
          sample_responses: Json | null
          stage: string
          success_criteria: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key_questions?: Json | null
          priority?: number | null
          process_name: string
          sample_responses?: Json | null
          stage: string
          success_criteria?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key_questions?: Json | null
          priority?: number | null
          process_name?: string
          sample_responses?: Json | null
          stage?: string
          success_criteria?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sales_targets: {
        Row: {
          ai_analysis: Json | null
          available_resources: number
          created_at: string
          deficit_amount: number | null
          id: string
          required_sales: number
          target_month: string
          total_obligations: number
        }
        Insert: {
          ai_analysis?: Json | null
          available_resources: number
          created_at?: string
          deficit_amount?: number | null
          id?: string
          required_sales: number
          target_month: string
          total_obligations: number
        }
        Update: {
          ai_analysis?: Json | null
          available_resources?: number
          created_at?: string
          deficit_amount?: number | null
          id?: string
          required_sales?: number
          target_month?: string
          total_obligations?: number
        }
        Relationships: []
      }
      salespersons: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      seo_auto_blog_logs: {
        Row: {
          blog_post_id: string | null
          created_at: string | null
          error_message: string | null
          generation_status: string | null
          generation_time_seconds: number | null
          id: string
          keywords_used: Json
        }
        Insert: {
          blog_post_id?: string | null
          created_at?: string | null
          error_message?: string | null
          generation_status?: string | null
          generation_time_seconds?: number | null
          id?: string
          keywords_used: Json
        }
        Update: {
          blog_post_id?: string | null
          created_at?: string | null
          error_message?: string | null
          generation_status?: string | null
          generation_time_seconds?: number | null
          id?: string
          keywords_used?: Json
        }
        Relationships: []
      }
      seo_backlinks: {
        Row: {
          anchor_text: string | null
          created_at: string
          domain: string
          dr: number | null
          first_seen: string | null
          id: string
          last_seen: string | null
          rel: string | null
          source_url: string
          status: string | null
          target_url: string | null
          traffic: number | null
          ur: number | null
        }
        Insert: {
          anchor_text?: string | null
          created_at?: string
          domain: string
          dr?: number | null
          first_seen?: string | null
          id?: string
          last_seen?: string | null
          rel?: string | null
          source_url: string
          status?: string | null
          target_url?: string | null
          traffic?: number | null
          ur?: number | null
        }
        Update: {
          anchor_text?: string | null
          created_at?: string
          domain?: string
          dr?: number | null
          first_seen?: string | null
          id?: string
          last_seen?: string | null
          rel?: string | null
          source_url?: string
          status?: string | null
          target_url?: string | null
          traffic?: number | null
          ur?: number | null
        }
        Relationships: []
      }
      seo_blog_posts: {
        Row: {
          content: string
          created_at: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          project_id: string | null
          published_at: string | null
          reading_time: number | null
          seo_score: number | null
          slug: string
          status: string | null
          tags: Json | null
          target_keywords: Json | null
          title: string
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          project_id?: string | null
          published_at?: string | null
          reading_time?: number | null
          seo_score?: number | null
          slug: string
          status?: string | null
          tags?: Json | null
          target_keywords?: Json | null
          title: string
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          project_id?: string | null
          published_at?: string | null
          reading_time?: number | null
          seo_score?: number | null
          slug?: string
          status?: string | null
          tags?: Json | null
          target_keywords?: Json | null
          title?: string
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      seo_competitor_keywords: {
        Row: {
          competitor_domain: string
          competitor_position: number | null
          created_at: string
          date: string
          difficulty: number | null
          domain: string
          id: string
          keyword: string
          our_position: number | null
          search_volume: number | null
          target_url: string | null
        }
        Insert: {
          competitor_domain: string
          competitor_position?: number | null
          created_at?: string
          date?: string
          difficulty?: number | null
          domain: string
          id?: string
          keyword: string
          our_position?: number | null
          search_volume?: number | null
          target_url?: string | null
        }
        Update: {
          competitor_domain?: string
          competitor_position?: number | null
          created_at?: string
          date?: string
          difficulty?: number | null
          domain?: string
          id?: string
          keyword?: string
          our_position?: number | null
          search_volume?: number | null
          target_url?: string | null
        }
        Relationships: []
      }
      seo_competitors: {
        Row: {
          created_at: string
          description: string | null
          domain: string
          domain_authority: number | null
          id: string
          keyword_overlap: number | null
          name: string
          project_id: string
          traffic_estimate: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain: string
          domain_authority?: number | null
          id?: string
          keyword_overlap?: number | null
          name: string
          project_id: string
          traffic_estimate?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string
          domain_authority?: number | null
          id?: string
          keyword_overlap?: number | null
          name?: string
          project_id?: string
          traffic_estimate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_competitors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_content_ideas: {
        Row: {
          ai_generated: boolean | null
          content_type: string | null
          created_at: string
          description: string | null
          difficulty: number | null
          id: string
          project_id: string
          search_volume: number | null
          status: string | null
          target_keyword: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          difficulty?: number | null
          id?: string
          project_id: string
          search_volume?: number | null
          status?: string | null
          target_keyword?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          difficulty?: number | null
          id?: string
          project_id?: string
          search_volume?: number | null
          status?: string | null
          target_keyword?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_content_ideas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_domain_metrics: {
        Row: {
          authority: number | null
          backlinks: number | null
          created_at: string
          date: string
          domain: string
          id: string
          keywords_in_top10: number | null
          keywords_in_top3: number | null
          organic_traffic: number | null
          referring_domains: number | null
          visibility: number | null
        }
        Insert: {
          authority?: number | null
          backlinks?: number | null
          created_at?: string
          date?: string
          domain: string
          id?: string
          keywords_in_top10?: number | null
          keywords_in_top3?: number | null
          organic_traffic?: number | null
          referring_domains?: number | null
          visibility?: number | null
        }
        Update: {
          authority?: number | null
          backlinks?: number | null
          created_at?: string
          date?: string
          domain?: string
          id?: string
          keywords_in_top10?: number | null
          keywords_in_top3?: number | null
          organic_traffic?: number | null
          referring_domains?: number | null
          visibility?: number | null
        }
        Relationships: []
      }
      seo_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          is_active: boolean | null
          is_verified: boolean
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_domains_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_google_analytics: {
        Row: {
          created_at: string | null
          date_range_end: string
          date_range_start: string
          dimensions: Json | null
          domain: string
          id: string
          metric_name: string
          metric_value: number | null
          project_id: string | null
          synced_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_range_end: string
          date_range_start: string
          dimensions?: Json | null
          domain: string
          id?: string
          metric_name: string
          metric_value?: number | null
          project_id?: string | null
          synced_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_range_end?: string
          date_range_start?: string
          dimensions?: Json | null
          domain?: string
          id?: string
          metric_name?: string
          metric_value?: number | null
          project_id?: string | null
          synced_at?: string | null
        }
        Relationships: []
      }
      seo_keyword_opportunities: {
        Row: {
          competition_level: string | null
          competitor_domain: string | null
          content_gap: boolean | null
          created_at: string | null
          difficulty: number | null
          domain: string
          id: string
          keyword: string
          keyword_type: string | null
          notes: string | null
          opportunity_score: number | null
          potential_traffic: number | null
          quick_win: boolean | null
          search_intent: string | null
          search_volume: number | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          competition_level?: string | null
          competitor_domain?: string | null
          content_gap?: boolean | null
          created_at?: string | null
          difficulty?: number | null
          domain: string
          id?: string
          keyword: string
          keyword_type?: string | null
          notes?: string | null
          opportunity_score?: number | null
          potential_traffic?: number | null
          quick_win?: boolean | null
          search_intent?: string | null
          search_volume?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          competition_level?: string | null
          competitor_domain?: string | null
          content_gap?: boolean | null
          created_at?: string | null
          difficulty?: number | null
          domain?: string
          id?: string
          keyword?: string
          keyword_type?: string | null
          notes?: string | null
          opportunity_score?: number | null
          potential_traffic?: number | null
          quick_win?: boolean | null
          search_intent?: string | null
          search_volume?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_keyword_positions: {
        Row: {
          best_position: number | null
          created_at: string
          date: string
          device: string | null
          difficulty: number | null
          domain: string
          id: string
          keyword: string
          location: string | null
          position: number | null
          search_volume: number | null
          target_url: string | null
          updated_at: string
        }
        Insert: {
          best_position?: number | null
          created_at?: string
          date?: string
          device?: string | null
          difficulty?: number | null
          domain: string
          id?: string
          keyword: string
          location?: string | null
          position?: number | null
          search_volume?: number | null
          target_url?: string | null
          updated_at?: string
        }
        Update: {
          best_position?: number | null
          created_at?: string
          date?: string
          device?: string | null
          difficulty?: number | null
          domain?: string
          id?: string
          keyword?: string
          location?: string | null
          position?: number | null
          search_volume?: number | null
          target_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seo_keyword_research_projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          keywords_added: number | null
          name: string
          opportunities_found: number | null
          research_settings: Json | null
          seed_keywords: string[] | null
          status: string | null
          target_domain: string
          total_keywords: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          keywords_added?: number | null
          name: string
          opportunities_found?: number | null
          research_settings?: Json | null
          seed_keywords?: string[] | null
          status?: string | null
          target_domain: string
          total_keywords?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          keywords_added?: number | null
          name?: string
          opportunities_found?: number | null
          research_settings?: Json | null
          seed_keywords?: string[] | null
          status?: string | null
          target_domain?: string
          total_keywords?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_keywords: {
        Row: {
          best_position: number | null
          category: string | null
          created_at: string
          current_position: number | null
          difficulty: number | null
          domain: string | null
          domain_id: string | null
          id: string
          is_priority: boolean
          keyword: string
          locations: string[] | null
          search_intent: string | null
          search_volume: number | null
          target_url: string | null
          updated_at: string
        }
        Insert: {
          best_position?: number | null
          category?: string | null
          created_at?: string
          current_position?: number | null
          difficulty?: number | null
          domain?: string | null
          domain_id?: string | null
          id?: string
          is_priority?: boolean
          keyword: string
          locations?: string[] | null
          search_intent?: string | null
          search_volume?: number | null
          target_url?: string | null
          updated_at?: string
        }
        Update: {
          best_position?: number | null
          category?: string | null
          created_at?: string
          current_position?: number | null
          difficulty?: number | null
          domain?: string | null
          domain_id?: string | null
          id?: string
          is_priority?: boolean
          keyword?: string
          locations?: string[] | null
          search_intent?: string | null
          search_volume?: number | null
          target_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seo_projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_rank_tracking: {
        Row: {
          created_at: string
          id: string
          keyword_id: string
          location: string
          position: number | null
          snippet: string | null
          title: string | null
          tracked_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          keyword_id: string
          location: string
          position?: number | null
          snippet?: string | null
          title?: string | null
          tracked_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          keyword_id?: string
          location?: string
          position?: number | null
          snippet?: string | null
          title?: string | null
          tracked_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_rank_tracking_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "seo_keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_recommendations: {
        Row: {
          category: string
          created_at: string
          description: string | null
          domain: string
          effort: string | null
          id: string
          impact: string | null
          priority: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          domain: string
          effort?: string | null
          id?: string
          impact?: string | null
          priority?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          domain?: string
          effort?: string | null
          id?: string
          impact?: string | null
          priority?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_referring_domains: {
        Row: {
          backlinks_count: number | null
          created_at: string
          domain: string
          dr: number | null
          first_seen: string | null
          id: string
          last_seen: string | null
          referring_domain: string
          traffic: number | null
        }
        Insert: {
          backlinks_count?: number | null
          created_at?: string
          domain: string
          dr?: number | null
          first_seen?: string | null
          id?: string
          last_seen?: string | null
          referring_domain: string
          traffic?: number | null
        }
        Update: {
          backlinks_count?: number | null
          created_at?: string
          domain?: string
          dr?: number | null
          first_seen?: string | null
          id?: string
          last_seen?: string | null
          referring_domain?: string
          traffic?: number | null
        }
        Relationships: []
      }
      seo_reports: {
        Row: {
          created_at: string
          data: Json
          generated_at: string
          id: string
          project_id: string
          report_type: string
          title: string
        }
        Insert: {
          created_at?: string
          data?: Json
          generated_at?: string
          id?: string
          project_id: string
          report_type: string
          title: string
        }
        Update: {
          created_at?: string
          data?: Json
          generated_at?: string
          id?: string
          project_id?: string
          report_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_social_posts: {
        Row: {
          content: string
          created_at: string
          hashtags: string[] | null
          id: string
          media_urls: string[] | null
          platform: string
          project_id: string
          scheduled_for: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          platform: string
          project_id: string
          scheduled_for?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          platform?: string
          project_id?: string
          scheduled_for?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_social_posts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_suggestions: {
        Row: {
          applied_at: string | null
          confidence_score: number | null
          created_at: string
          current_value: string | null
          id: string
          product_id: string
          rationale: string | null
          status: string
          suggested_value: string
          suggestion_type: string
          updated_at: string
        }
        Insert: {
          applied_at?: string | null
          confidence_score?: number | null
          created_at?: string
          current_value?: string | null
          id?: string
          product_id: string
          rationale?: string | null
          status?: string
          suggested_value: string
          suggestion_type: string
          updated_at?: string
        }
        Update: {
          applied_at?: string | null
          confidence_score?: number | null
          created_at?: string
          current_value?: string | null
          id?: string
          product_id?: string
          rationale?: string | null
          status?: string
          suggested_value?: string
          suggestion_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_trending_keywords: {
        Row: {
          category: string | null
          competition: string | null
          country_code: string | null
          created_at: string | null
          difficulty: number | null
          fetched_date: string | null
          id: string
          is_processed: boolean | null
          keyword: string
          language: string | null
          related_queries: Json | null
          search_volume: number | null
          source: string | null
          trend_score: number | null
        }
        Insert: {
          category?: string | null
          competition?: string | null
          country_code?: string | null
          created_at?: string | null
          difficulty?: number | null
          fetched_date?: string | null
          id?: string
          is_processed?: boolean | null
          keyword: string
          language?: string | null
          related_queries?: Json | null
          search_volume?: number | null
          source?: string | null
          trend_score?: number | null
        }
        Update: {
          category?: string | null
          competition?: string | null
          country_code?: string | null
          created_at?: string | null
          difficulty?: number | null
          fetched_date?: string | null
          id?: string
          is_processed?: boolean | null
          keyword?: string
          language?: string | null
          related_queries?: Json | null
          search_volume?: number | null
          source?: string | null
          trend_score?: number | null
        }
        Relationships: []
      }
      shanthi_profiles: {
        Row: {
          bonus_earned: number | null
          country: string | null
          created_at: string | null
          dance_school_name: string | null
          estimated_wallet_size: string | null
          event_type: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
          wallet_balance: number | null
        }
        Insert: {
          bonus_earned?: number | null
          country?: string | null
          created_at?: string | null
          dance_school_name?: string | null
          estimated_wallet_size?: string | null
          event_type?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Update: {
          bonus_earned?: number | null
          country?: string | null
          created_at?: string | null
          dance_school_name?: string | null
          estimated_wallet_size?: string | null
          event_type?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      shanthi_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shanthi_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "shanthi_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_domestic_special_rates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_special_rate: boolean
          postal_code_prefix: string
          rate: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_special_rate?: boolean
          postal_code_prefix: string
          rate: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_special_rate?: boolean
          postal_code_prefix?: string
          rate?: number
        }
        Relationships: []
      }
      shipping_logs: {
        Row: {
          carrier: string
          created_at: string | null
          details: Json | null
          id: string
          order_id: string
          status: string
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          carrier: string
          created_at?: string | null
          details?: Json | null
          id?: string
          order_id: string
          status: string
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          carrier?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          order_id?: string
          status?: string
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_booking_customer_details"
            referencedColumns: ["order_booking_id"]
          },
          {
            foreignKeyName: "shipping_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_rates: {
        Row: {
          base_rate: number
          created_at: string | null
          delivery_mode: string
          id: string
          is_active: boolean
          max_weight: number | null
          min_weight: number
          per_kg_rate: number
          updated_at: string | null
        }
        Insert: {
          base_rate?: number
          created_at?: string | null
          delivery_mode: string
          id?: string
          is_active?: boolean
          max_weight?: number | null
          min_weight?: number
          per_kg_rate?: number
          updated_at?: string | null
        }
        Update: {
          base_rate?: number
          created_at?: string | null
          delivery_mode?: string
          id?: string
          is_active?: boolean
          max_weight?: number | null
          min_weight?: number
          per_kg_rate?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      shipping_zone_rates: {
        Row: {
          created_at: string | null
          id: string
          rate: number
          weight_from: number
          weight_to: number
          zone_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          rate: number
          weight_from: number
          weight_to: number
          zone_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          rate?: number
          weight_from?: number
          weight_to?: number
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_zone_rates_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "shipping_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          countries: string[]
          created_at: string | null
          description: string | null
          id: string
          is_domestic: boolean
          name: string
        }
        Insert: {
          countries: string[]
          created_at?: string | null
          description?: string | null
          id?: string
          is_domestic?: boolean
          name: string
        }
        Update: {
          countries?: string[]
          created_at?: string | null
          description?: string | null
          id?: string
          is_domestic?: boolean
          name?: string
        }
        Relationships: []
      }
      shopify_collections: {
        Row: {
          collection_type: string
          created_at: string
          description: string | null
          handle: string
          id: string
          published_at: string | null
          rules: Json | null
          seo_description: string | null
          seo_title: string | null
          shopify_gid: string
          sort_order: string | null
          store_id: string
          template_suffix: string | null
          title: string
          updated_at: string
        }
        Insert: {
          collection_type: string
          created_at?: string
          description?: string | null
          handle: string
          id?: string
          published_at?: string | null
          rules?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          shopify_gid: string
          sort_order?: string | null
          store_id: string
          template_suffix?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          collection_type?: string
          created_at?: string
          description?: string | null
          handle?: string
          id?: string
          published_at?: string | null
          rules?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          shopify_gid?: string
          sort_order?: string | null
          store_id?: string
          template_suffix?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopify_collections_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "shopify_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_credentials: {
        Row: {
          access_token: string
          created_at: string
          id: string
          shop_domain: string
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          shop_domain: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          shop_domain?: string
          updated_at?: string
        }
        Relationships: []
      }
      shopify_images: {
        Row: {
          alt_text: string | null
          alt_text_ai: string | null
          created_at: string
          height: number | null
          id: string
          position: number | null
          product_id: string
          shopify_image_gid: string
          src: string
          updated_at: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          alt_text_ai?: string | null
          created_at?: string
          height?: number | null
          id?: string
          position?: number | null
          product_id: string
          shopify_image_gid: string
          src: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          alt_text_ai?: string | null
          created_at?: string
          height?: number | null
          id?: string
          position?: number | null
          product_id?: string
          shopify_image_gid?: string
          src?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      shopify_product_mapping: {
        Row: {
          created_at: string | null
          id: string
          last_synced: string | null
          local_product_id: string | null
          shopify_product_id: string
          shopify_variant_id: string | null
          sync_status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_synced?: string | null
          local_product_id?: string | null
          shopify_product_id: string
          shopify_variant_id?: string | null
          sync_status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_synced?: string | null
          local_product_id?: string | null
          shopify_product_id?: string
          shopify_variant_id?: string | null
          sync_status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopify_product_mapping_local_product_id_fkey"
            columns: ["local_product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopify_product_mapping_local_product_id_fkey"
            columns: ["local_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_products: {
        Row: {
          body_html: string | null
          created_at: string | null
          handle: string
          id: string
          product_type: string | null
          seo_description: string | null
          seo_title: string | null
          shopify_id: number
          status: string
          synced_at: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          body_html?: string | null
          created_at?: string | null
          handle: string
          id?: string
          product_type?: string | null
          seo_description?: string | null
          seo_title?: string | null
          shopify_id: number
          status?: string
          synced_at?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          body_html?: string | null
          created_at?: string | null
          handle?: string
          id?: string
          product_type?: string | null
          seo_description?: string | null
          seo_title?: string | null
          shopify_id?: number
          status?: string
          synced_at?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      shopify_stores: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          scope: string
          shop_domain: string
          updated_at: string
          webhook_endpoint: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          scope: string
          shop_domain: string
          updated_at?: string
          webhook_endpoint?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          scope?: string
          shop_domain?: string
          updated_at?: string
          webhook_endpoint?: string | null
        }
        Relationships: []
      }
      shopify_variants: {
        Row: {
          barcode: string | null
          compare_at_price: number | null
          created_at: string
          id: string
          inventory_quantity: number | null
          option1: string | null
          option2: string | null
          option3: string | null
          price: number | null
          product_id: string
          requires_shipping: boolean | null
          shopify_variant_gid: string
          sku: string | null
          taxable: boolean | null
          title: string | null
          updated_at: string
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          barcode?: string | null
          compare_at_price?: number | null
          created_at?: string
          id?: string
          inventory_quantity?: number | null
          option1?: string | null
          option2?: string | null
          option3?: string | null
          price?: number | null
          product_id: string
          requires_shipping?: boolean | null
          shopify_variant_gid: string
          sku?: string | null
          taxable?: boolean | null
          title?: string | null
          updated_at?: string
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          barcode?: string | null
          compare_at_price?: number | null
          created_at?: string
          id?: string
          inventory_quantity?: number | null
          option1?: string | null
          option2?: string | null
          option3?: string | null
          price?: number | null
          product_id?: string
          requires_shipping?: boolean | null
          shopify_variant_gid?: string
          sku?: string | null
          taxable?: boolean | null
          title?: string | null
          updated_at?: string
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: []
      }
      social_accounts: {
        Row: {
          access_token: string | null
          account_identifier: string
          account_name: string
          configuration: Json | null
          connection_status:
            | Database["public"]["Enums"]["connection_status"]
            | null
          created_at: string | null
          id: string
          last_connected_at: string | null
          platform_id: string | null
          refresh_token: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          account_identifier: string
          account_name: string
          configuration?: Json | null
          connection_status?:
            | Database["public"]["Enums"]["connection_status"]
            | null
          created_at?: string | null
          id?: string
          last_connected_at?: string | null
          platform_id?: string | null
          refresh_token?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          account_identifier?: string
          account_name?: string
          configuration?: Json | null
          connection_status?:
            | Database["public"]["Enums"]["connection_status"]
            | null
          created_at?: string | null
          id?: string
          last_connected_at?: string | null
          platform_id?: string | null
          refresh_token?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      social_platforms: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          platform_name: string
          platform_type: Database["public"]["Enums"]["social_platform_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform_name: string
          platform_type: Database["public"]["Enums"]["social_platform_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform_name?: string
          platform_type?: Database["public"]["Enums"]["social_platform_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_advances: {
        Row: {
          advance_amount: number
          advance_date: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          monthly_deduction: number
          reason: string | null
          remaining_installments: number
          staff_id: string
          status: string
          total_installments: number
          updated_at: string
        }
        Insert: {
          advance_amount?: number
          advance_date?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          monthly_deduction?: number
          reason?: string | null
          remaining_installments?: number
          staff_id: string
          status?: string
          total_installments?: number
          updated_at?: string
        }
        Update: {
          advance_amount?: number
          advance_date?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          monthly_deduction?: number
          reason?: string | null
          remaining_installments?: number
          staff_id?: string
          status?: string
          total_installments?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_advances_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_advances_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_advances_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_advances_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_attendance: {
        Row: {
          attendance_date: string
          created_at: string
          id: string
          location: string
          notes: string | null
          permission_from: string | null
          permission_to: string | null
          staff_id: string
          status: string
          updated_at: string
        }
        Insert: {
          attendance_date: string
          created_at?: string
          id?: string
          location: string
          notes?: string | null
          permission_from?: string | null
          permission_to?: string | null
          staff_id: string
          status: string
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          created_at?: string
          id?: string
          location?: string
          notes?: string | null
          permission_from?: string | null
          permission_to?: string | null
          staff_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_incentive_rules: {
        Row: {
          applicable_roles: string[] | null
          calculation_basis: string
          created_at: string | null
          id: string
          is_active: boolean | null
          maximum_cap: number | null
          minimum_threshold: number | null
          rate_value: number
          rule_name: string
          rule_type: string
          updated_at: string | null
        }
        Insert: {
          applicable_roles?: string[] | null
          calculation_basis: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_cap?: number | null
          minimum_threshold?: number | null
          rate_value: number
          rule_name: string
          rule_type: string
          updated_at?: string | null
        }
        Update: {
          applicable_roles?: string[] | null
          calculation_basis?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_cap?: number | null
          minimum_threshold?: number | null
          rate_value?: number
          rule_name?: string
          rule_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_module_permissions: {
        Row: {
          created_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          module_name: string
          staff_id: string
        }
        Insert: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          module_name: string
          staff_id: string
        }
        Update: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          module_name?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_module_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_module_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_module_permissions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_module_permissions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_monthly_deductions: {
        Row: {
          advance_id: string | null
          amount: number
          created_at: string
          deduction_type: string
          description: string | null
          end_month: string | null
          id: string
          is_active: boolean
          staff_id: string
          start_month: string
          updated_at: string
        }
        Insert: {
          advance_id?: string | null
          amount?: number
          created_at?: string
          deduction_type?: string
          description?: string | null
          end_month?: string | null
          id?: string
          is_active?: boolean
          staff_id: string
          start_month: string
          updated_at?: string
        }
        Update: {
          advance_id?: string | null
          amount?: number
          created_at?: string
          deduction_type?: string
          description?: string | null
          end_month?: string | null
          id?: string
          is_active?: boolean
          staff_id?: string
          start_month?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_monthly_deductions_advance_id_fkey"
            columns: ["advance_id"]
            isOneToOne: false
            referencedRelation: "staff_advances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_monthly_deductions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_monthly_deductions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_monthly_targets: {
        Row: {
          achieved_amount: number | null
          base_amount: number
          bonus_earned: number | null
          calculated_reward: number | null
          created_at: string | null
          id: string
          incentive_earned: number | null
          minimum_sales: number | null
          sales_target: number
          staff_id: string | null
          stretch_target: number | null
          target_month: string
          updated_at: string | null
        }
        Insert: {
          achieved_amount?: number | null
          base_amount?: number
          bonus_earned?: number | null
          calculated_reward?: number | null
          created_at?: string | null
          id?: string
          incentive_earned?: number | null
          minimum_sales?: number | null
          sales_target?: number
          staff_id?: string | null
          stretch_target?: number | null
          target_month: string
          updated_at?: string | null
        }
        Update: {
          achieved_amount?: number | null
          base_amount?: number
          bonus_earned?: number | null
          calculated_reward?: number | null
          created_at?: string | null
          id?: string
          incentive_earned?: number | null
          minimum_sales?: number | null
          sales_target?: number
          staff_id?: string | null
          stretch_target?: number | null
          target_month?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_monthly_targets_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_monthly_targets_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_performance: {
        Row: {
          created_at: string | null
          id: string
          incentive_earned: number | null
          items_sold: number | null
          performance_date: string | null
          sales_amount: number | null
          staff_id: string | null
          transaction_count: number | null
          working_hours: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          incentive_earned?: number | null
          items_sold?: number | null
          performance_date?: string | null
          sales_amount?: number | null
          staff_id?: string | null
          transaction_count?: number | null
          working_hours?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          incentive_earned?: number | null
          items_sold?: number | null
          performance_date?: string | null
          sales_amount?: number | null
          staff_id?: string | null
          transaction_count?: number | null
          working_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_performance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_performance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_profiles: {
        Row: {
          accessible_modules: Json | null
          address: string | null
          base_amount: number | null
          created_at: string | null
          department: string | null
          department_id: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_id: string
          first_name: string
          hire_date: string
          id: string
          is_locked: boolean | null
          last_login_at: string | null
          last_name: string
          login_attempts: number | null
          monthly_sales_target: number | null
          password: string
          password_expires_at: string | null
          password_hash: string | null
          password_set_at: string | null
          phone: string | null
          salary: number | null
          status: string
          store_id: string | null
          temp_password: string | null
          updated_at: string | null
        }
        Insert: {
          accessible_modules?: Json | null
          address?: string | null
          base_amount?: number | null
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id: string
          first_name: string
          hire_date?: string
          id?: string
          is_locked?: boolean | null
          last_login_at?: string | null
          last_name: string
          login_attempts?: number | null
          monthly_sales_target?: number | null
          password?: string
          password_expires_at?: string | null
          password_hash?: string | null
          password_set_at?: string | null
          phone?: string | null
          salary?: number | null
          status?: string
          store_id?: string | null
          temp_password?: string | null
          updated_at?: string | null
        }
        Update: {
          accessible_modules?: Json | null
          address?: string | null
          base_amount?: number | null
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string
          first_name?: string
          hire_date?: string
          id?: string
          is_locked?: boolean | null
          last_login_at?: string | null
          last_name?: string
          login_attempts?: number | null
          monthly_sales_target?: number | null
          password?: string
          password_expires_at?: string | null
          password_hash?: string | null
          password_set_at?: string | null
          phone?: string | null
          salary?: number | null
          status?: string
          store_id?: string | null
          temp_password?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_profiles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_role_assignments: {
        Row: {
          assigned_date: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          role_id: string | null
          staff_id: string | null
        }
        Insert: {
          assigned_date?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: string | null
          staff_id?: string | null
        }
        Update: {
          assigned_date?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: string | null
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_role_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "staff_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_role_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_role_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_roles: {
        Row: {
          base_permissions: Json | null
          created_at: string | null
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          role_name: string
          updated_at: string | null
        }
        Insert: {
          base_permissions?: Json | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          role_name: string
          updated_at?: string | null
        }
        Update: {
          base_permissions?: Json | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          role_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_salary_components: {
        Row: {
          basic_salary: number
          created_at: string | null
          da_amount: number
          effective_from: string
          esi_applicable: boolean
          hra_percentage: number
          id: string
          is_active: boolean
          medical_allowance: number
          other_allowances: number
          pf_applicable: boolean
          professional_tax: number
          special_allowance: number
          staff_id: string
          transport_allowance: number
          updated_at: string | null
        }
        Insert: {
          basic_salary?: number
          created_at?: string | null
          da_amount?: number
          effective_from?: string
          esi_applicable?: boolean
          hra_percentage?: number
          id?: string
          is_active?: boolean
          medical_allowance?: number
          other_allowances?: number
          pf_applicable?: boolean
          professional_tax?: number
          special_allowance?: number
          staff_id: string
          transport_allowance?: number
          updated_at?: string | null
        }
        Update: {
          basic_salary?: number
          created_at?: string | null
          da_amount?: number
          effective_from?: string
          esi_applicable?: boolean
          hra_percentage?: number
          id?: string
          is_active?: boolean
          medical_allowance?: number
          other_allowances?: number
          pf_applicable?: boolean
          professional_tax?: number
          special_allowance?: number
          staff_id?: string
          transport_allowance?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_salary_components_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_salary_components_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_shifts: {
        Row: {
          break_duration_minutes: number | null
          created_at: string | null
          end_time: string
          id: string
          notes: string | null
          shift_date: string
          staff_id: string | null
          start_time: string
          status: string | null
          total_hours: number | null
        }
        Insert: {
          break_duration_minutes?: number | null
          created_at?: string | null
          end_time: string
          id?: string
          notes?: string | null
          shift_date: string
          staff_id?: string | null
          start_time: string
          status?: string | null
          total_hours?: number | null
        }
        Update: {
          break_duration_minutes?: number | null
          created_at?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          shift_date?: string
          staff_id?: string | null
          start_time?: string
          status?: string | null
          total_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_shifts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_shifts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      states: {
        Row: {
          code: string | null
          country: string
          created_at: string | null
          gst_zone: string | null
          id: string
          is_gst_state: boolean | null
          name: string
        }
        Insert: {
          code?: string | null
          country?: string
          created_at?: string | null
          gst_zone?: string | null
          id?: string
          is_gst_state?: boolean | null
          name: string
        }
        Update: {
          code?: string | null
          country?: string
          created_at?: string | null
          gst_zone?: string | null
          id?: string
          is_gst_state?: boolean | null
          name?: string
        }
        Relationships: []
      }
      stock_correction_backup: {
        Row: {
          created_at: string | null
          id: string | null
          initial_stock: number | null
          item_code: string | null
          name: string | null
          stock_before_correction: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          initial_stock?: number | null
          item_code?: string | null
          name?: string | null
          stock_before_correction?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          initial_stock?: number | null
          item_code?: string | null
          name?: string | null
          stock_before_correction?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_correction_summary: {
        Row: {
          correction_timestamp: string | null
          id: string | null
          initial_stock: number | null
          item_code: string | null
          name: string | null
          stock_after_correction: number | null
          stock_before_correction: number | null
          stock_status: string | null
          total_sales_found: number | null
          units_reduced: number | null
        }
        Insert: {
          correction_timestamp?: string | null
          id?: string | null
          initial_stock?: number | null
          item_code?: string | null
          name?: string | null
          stock_after_correction?: number | null
          stock_before_correction?: number | null
          stock_status?: string | null
          total_sales_found?: number | null
          units_reduced?: number | null
        }
        Update: {
          correction_timestamp?: string | null
          id?: string | null
          initial_stock?: number | null
          item_code?: string | null
          name?: string | null
          stock_after_correction?: number | null
          stock_before_correction?: number | null
          stock_status?: string | null
          total_sales_found?: number | null
          units_reduced?: number | null
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          product_id: string
          product_name: string
          quantity: number
          reference: string
          reference_type: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          product_name: string
          quantity: number
          reference: string
          reference_type: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          product_name?: string
          quantity?: number
          reference?: string
          reference_type?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_reconciliation_log: {
        Row: {
          errors: Json | null
          execution_time_ms: number | null
          id: string
          products_updated: number | null
          reconciliation_date: string | null
          total_products_checked: number | null
        }
        Insert: {
          errors?: Json | null
          execution_time_ms?: number | null
          id?: string
          products_updated?: number | null
          reconciliation_date?: string | null
          total_products_checked?: number | null
        }
        Update: {
          errors?: Json | null
          execution_time_ms?: number | null
          id?: string
          products_updated?: number | null
          reconciliation_date?: string | null
          total_products_checked?: number | null
        }
        Relationships: []
      }
      stock_requests: {
        Row: {
          approved_by: string | null
          created_at: string
          id: string
          notes: string | null
          product_id: string | null
          product_name: string
          quantity: number
          requested_by: string | null
          requesting_store_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name: string
          quantity?: number
          requested_by?: string | null
          requesting_store_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          requested_by?: string | null
          requesting_store_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_requests_requesting_store_id_fkey"
            columns: ["requesting_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_restoration_backup: {
        Row: {
          created_at: string | null
          current_stock: number | null
          id: string | null
          initial_stock: number | null
          item_code: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_stock?: number | null
          id?: string | null
          initial_stock?: number | null
          item_code?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_stock?: number | null
          id?: string | null
          initial_stock?: number | null
          item_code?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_restoration_report: {
        Row: {
          current_stock: number | null
          id: string | null
          initial_stock: number | null
          item_code: string | null
          name: string | null
          restoration_status: string | null
          restoration_timestamp: string | null
          restored_stock: number | null
        }
        Insert: {
          current_stock?: number | null
          id?: string | null
          initial_stock?: number | null
          item_code?: string | null
          name?: string | null
          restoration_status?: string | null
          restoration_timestamp?: string | null
          restored_stock?: number | null
        }
        Update: {
          current_stock?: number | null
          id?: string | null
          initial_stock?: number | null
          item_code?: string | null
          name?: string | null
          restoration_status?: string | null
          restoration_timestamp?: string | null
          restored_stock?: number | null
        }
        Relationships: []
      }
      stock_transactions: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          notes: string | null
          product_id: string | null
          quantity: number
          reference_no: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          quantity: number
          reference_no?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          quantity?: number
          reference_no?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          code: string
          country: string
          created_at: string
          currency: string
          currency_symbol: string
          id: string
          is_hq: boolean
          name: string
          state: string
          tax_label: string
          tax_rate: number
          timezone: string
        }
        Insert: {
          code: string
          country?: string
          created_at?: string
          currency?: string
          currency_symbol?: string
          id?: string
          is_hq?: boolean
          name: string
          state?: string
          tax_label?: string
          tax_rate?: number
          timezone?: string
        }
        Update: {
          code?: string
          country?: string
          created_at?: string
          currency?: string
          currency_symbol?: string
          id?: string
          is_hq?: boolean
          name?: string
          state?: string
          tax_label?: string
          tax_rate?: number
          timezone?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string
          company_name: string
          contact_person: string
          created_at: string | null
          email: string | null
          gstin: string | null
          id: string
          pan: string | null
          phone: string
          updated_at: string | null
        }
        Insert: {
          address: string
          company_name: string
          contact_person: string
          created_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          pan?: string | null
          phone: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          company_name?: string
          contact_person?: string
          created_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          pan?: string | null
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          integration_type: string
          items_failed: number | null
          items_processed: number | null
          items_succeeded: number | null
          message: string | null
          metadata: Json | null
          started_at: string | null
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          integration_type: string
          items_failed?: number | null
          items_processed?: number | null
          items_succeeded?: number | null
          message?: string | null
          metadata?: Json | null
          started_at?: string | null
          status: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          integration_type?: string
          items_failed?: number | null
          items_processed?: number | null
          items_succeeded?: number | null
          message?: string | null
          metadata?: Json | null
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: []
      }
      sync_operations: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          operation_id: string | null
          operation_type: string
          processed_items: number | null
          started_at: string | null
          status: string
          store_id: string
          total_items: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          operation_id?: string | null
          operation_type: string
          processed_items?: number | null
          started_at?: string | null
          status?: string
          store_id: string
          total_items?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          operation_id?: string | null
          operation_type?: string
          processed_items?: number | null
          started_at?: string | null
          status?: string
          store_id?: string
          total_items?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_operations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "shopify_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_invoices: {
        Row: {
          advance_amount: number | null
          balance: number | null
          cgst_amount: number
          created_at: string | null
          delivery_mode: string | null
          due_date: string | null
          id: string
          igst_amount: number
          invoice_date: string
          invoice_number: string
          is_igst: boolean
          is_split_invoice: boolean | null
          order_id: string | null
          order_number: string | null
          package_weight: number | null
          payment_link_expires_at: string | null
          payment_link_id: string | null
          payment_link_status: string | null
          payment_link_url: string | null
          payment_method: string | null
          payment_receipt_history: Json | null
          payment_status: string
          products: Json
          sgst_amount: number
          shipping_charge: number
          split_group_name: string | null
          split_group_number: number | null
          store_id: string
          subtotal: number
          to_address: Json
          total_amount: number
        }
        Insert: {
          advance_amount?: number | null
          balance?: number | null
          cgst_amount?: number
          created_at?: string | null
          delivery_mode?: string | null
          due_date?: string | null
          id?: string
          igst_amount?: number
          invoice_date: string
          invoice_number: string
          is_igst?: boolean
          is_split_invoice?: boolean | null
          order_id?: string | null
          order_number?: string | null
          package_weight?: number | null
          payment_link_expires_at?: string | null
          payment_link_id?: string | null
          payment_link_status?: string | null
          payment_link_url?: string | null
          payment_method?: string | null
          payment_receipt_history?: Json | null
          payment_status?: string
          products: Json
          sgst_amount?: number
          shipping_charge?: number
          split_group_name?: string | null
          split_group_number?: number | null
          store_id?: string
          subtotal?: number
          to_address: Json
          total_amount?: number
        }
        Update: {
          advance_amount?: number | null
          balance?: number | null
          cgst_amount?: number
          created_at?: string | null
          delivery_mode?: string | null
          due_date?: string | null
          id?: string
          igst_amount?: number
          invoice_date?: string
          invoice_number?: string
          is_igst?: boolean
          is_split_invoice?: boolean | null
          order_id?: string | null
          order_number?: string | null
          package_weight?: number | null
          payment_link_expires_at?: string | null
          payment_link_id?: string | null
          payment_link_status?: string | null
          payment_link_url?: string | null
          payment_method?: string | null
          payment_receipt_history?: Json | null
          payment_status?: string
          products?: Json
          sgst_amount?: number
          shipping_charge?: number
          split_group_name?: string | null
          split_group_number?: number | null
          store_id?: string
          subtotal?: number
          to_address?: Json
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "tax_invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_booking_customer_details"
            referencedColumns: ["order_booking_id"]
          },
          {
            foreignKeyName: "tax_invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_invoices_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      team_monthly_targets: {
        Row: {
          created_at: string | null
          id: string
          minimum_individual_sales: number
          target_month: string
          team_bonus_percentage: number
          team_bonus_threshold: number
          total_team_target: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          minimum_individual_sales?: number
          target_month: string
          team_bonus_percentage?: number
          team_bonus_threshold?: number
          total_team_target?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          minimum_individual_sales?: number
          target_month?: string
          team_bonus_percentage?: number
          team_bonus_threshold?: number
          total_team_target?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      template_designs: {
        Row: {
          content_settings: Json
          created_at: string | null
          created_by: string | null
          field_visibility: Json
          font_settings: Json
          id: string
          is_active: boolean | null
          is_default: boolean | null
          layout_settings: Json
          name: string
          style_settings: Json
          template_config: Json
          template_type: string
          updated_at: string | null
        }
        Insert: {
          content_settings?: Json
          created_at?: string | null
          created_by?: string | null
          field_visibility?: Json
          font_settings?: Json
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          layout_settings?: Json
          name: string
          style_settings?: Json
          template_config?: Json
          template_type: string
          updated_at?: string | null
        }
        Update: {
          content_settings?: Json
          created_at?: string | null
          created_by?: string | null
          field_visibility?: Json
          font_settings?: Json
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          layout_settings?: Json
          name?: string
          style_settings?: Json
          template_config?: Json
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      threads: {
        Row: {
          assignee_id: string | null
          contact_id: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          status: string | null
          tags: string[] | null
          unread_count: number | null
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
          tags?: string[] | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
          tags?: string[] | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "threads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      training_instructions: {
        Row: {
          content: string
          created_at: string | null
          id: string
          instruction_type: string
          is_active: boolean | null
          priority: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          instruction_type: string
          is_active?: boolean | null
          priority?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          instruction_type?: string
          is_active?: boolean | null
          priority?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      training_qa: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category: string | null
          created_at: string
          description: string | null
          id: string
          reference_number: string | null
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          account_id: string
          amount: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reference_number?: string | null
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reference_number?: string | null
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "cash_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      translations_cache: {
        Row: {
          created_at: string | null
          id: string
          source_text: string
          target_language: string
          translated_text: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          source_text: string
          target_language: string
          translated_text: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          source_text?: string
          target_language?: string
          translated_text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      unified_messages: {
        Row: {
          ai_confidence: number | null
          ai_response: string | null
          created_at: string | null
          external_message_id: string
          id: string
          is_from_customer: boolean | null
          message_content: string
          message_type: string | null
          metadata: Json | null
          platform_id: string | null
          recipient_id: string | null
          replied_at: string | null
          sender_id: string
          sender_name: string | null
          social_account_id: string | null
          status: Database["public"]["Enums"]["message_status"] | null
          thread_id: string | null
          updated_at: string | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_response?: string | null
          created_at?: string | null
          external_message_id: string
          id?: string
          is_from_customer?: boolean | null
          message_content: string
          message_type?: string | null
          metadata?: Json | null
          platform_id?: string | null
          recipient_id?: string | null
          replied_at?: string | null
          sender_id: string
          sender_name?: string | null
          social_account_id?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          thread_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_confidence?: number | null
          ai_response?: string | null
          created_at?: string | null
          external_message_id?: string
          id?: string
          is_from_customer?: boolean | null
          message_content?: string
          message_type?: string | null
          metadata?: Json | null
          platform_id?: string | null
          recipient_id?: string | null
          replied_at?: string | null
          sender_id?: string
          sender_name?: string | null
          social_account_id?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          thread_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unified_messages_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_messages_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          preference_key: string
          preference_value: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          preference_key: string
          preference_value: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          preference_key?: string
          preference_value?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          staff_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          staff_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          staff_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: true
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: true
            referencedRelation: "staff_profiles_directory"
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
      vendor_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          address_type: string
          city: string
          country: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          postal_code: string
          state: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          address_type: string
          city: string
          country?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          postal_code: string
          state: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          address_type?: string
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          postal_code?: string
          state?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_addresses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_balance_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_addresses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_contacts: {
        Row: {
          created_at: string | null
          department: string | null
          designation: string | null
          email: string | null
          first_name: string
          id: string
          is_primary: boolean | null
          last_name: string
          phone: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          designation?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_primary?: boolean | null
          last_name: string
          phone?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          designation?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_primary?: boolean | null
          last_name?: string
          phone?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contacts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_balance_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contacts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          is_active: boolean | null
          mime_type: string | null
          updated_at: string | null
          uploaded_by: string | null
          vendor_id: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          vendor_id?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          vendor_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_balance_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_payment_budgets: {
        Row: {
          allocated_amount: number
          budget_month: string
          created_at: string | null
          id: string
          notes: string | null
          remaining_amount: number
          status: string
          total_budget: number
          updated_at: string | null
        }
        Insert: {
          allocated_amount?: number
          budget_month: string
          created_at?: string | null
          id?: string
          notes?: string | null
          remaining_amount?: number
          status?: string
          total_budget?: number
          updated_at?: string | null
        }
        Update: {
          allocated_amount?: number
          budget_month?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          remaining_amount?: number
          status?: string
          total_budget?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      vendor_payment_history: {
        Row: {
          amount_paid: number
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          schedule_id: string
          transaction_reference: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_date: string
          payment_method: string
          schedule_id: string
          transaction_reference?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          schedule_id?: string
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_payment_history_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "vendor_payment_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_payment_schedules: {
        Row: {
          actual_amount: number | null
          budget_id: string
          cheque_number: string | null
          created_at: string | null
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: string
          scheduled_amount: number
          scheduled_date: string
          status: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          actual_amount?: number | null
          budget_id: string
          cheque_number?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string
          scheduled_amount: number
          scheduled_date: string
          status?: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          actual_amount?: number | null
          budget_id?: string
          cheque_number?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string
          scheduled_amount?: number
          scheduled_date?: string
          status?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_payment_schedules_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "vendor_payment_budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payment_schedules_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_balance_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payment_schedules_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_payment_terms: {
        Row: {
          created_at: string | null
          days_to_pay: number
          discount_days: number | null
          discount_percentage: number | null
          id: string
          is_default: boolean | null
          term_name: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          days_to_pay: number
          discount_days?: number | null
          discount_percentage?: number | null
          id?: string
          is_default?: boolean | null
          term_name: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          days_to_pay?: number
          discount_days?: number | null
          discount_percentage?: number | null
          id?: string
          is_default?: boolean | null
          term_name?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_payment_terms_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_balance_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payment_terms_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_payments: {
        Row: {
          amount: number
          bill_id: string | null
          created_at: string
          due_date: string
          id: string
          notes: string | null
          payment_amount: number | null
          payment_date: string | null
          payment_method: string | null
          status: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          amount: number
          bill_id?: string | null
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "purchase_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_profiles: {
        Row: {
          category: string | null
          company_name: string
          created_at: string | null
          credit_limit: number | null
          email: string | null
          id: string
          notes: string | null
          opening_balance: number | null
          opening_balance_date: string | null
          payment_terms: number | null
          phone: string | null
          preferred_currency: string | null
          preferred_payment_method: string | null
          registration_number: string | null
          status: string | null
          tax_id: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          category?: string | null
          company_name: string
          created_at?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          notes?: string | null
          opening_balance?: number | null
          opening_balance_date?: string | null
          payment_terms?: number | null
          phone?: string | null
          preferred_currency?: string | null
          preferred_payment_method?: string | null
          registration_number?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          category?: string | null
          company_name?: string
          created_at?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          notes?: string | null
          opening_balance?: number | null
          opening_balance_date?: string | null
          payment_terms?: number | null
          phone?: string | null
          preferred_currency?: string | null
          preferred_payment_method?: string | null
          registration_number?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          payment_terms: string | null
          phone: string | null
          total_balance: number | null
          updated_at: string
          vendor_name: string
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          total_balance?: number | null
          updated_at?: string
          vendor_name: string
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          total_balance?: number | null
          updated_at?: string
          vendor_name?: string
        }
        Relationships: []
      }
      wa_media: {
        Row: {
          created_at: string | null
          file_size: number | null
          filename: string | null
          id: string
          mime_type: string | null
          sha256_hash: string | null
          url: string | null
          wa_media_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_size?: number | null
          filename?: string | null
          id?: string
          mime_type?: string | null
          sha256_hash?: string | null
          url?: string | null
          wa_media_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_size?: number | null
          filename?: string | null
          id?: string
          mime_type?: string | null
          sha256_hash?: string | null
          url?: string | null
          wa_media_id?: string | null
        }
        Relationships: []
      }
      wa_phone_health: {
        Row: {
          checked_at: string | null
          id: string
          limit_tier: string | null
          messaging_limit: number | null
          phone_number_id: string
          phone_status: string | null
          quality_rating: string | null
        }
        Insert: {
          checked_at?: string | null
          id?: string
          limit_tier?: string | null
          messaging_limit?: number | null
          phone_number_id: string
          phone_status?: string | null
          quality_rating?: string | null
        }
        Update: {
          checked_at?: string | null
          id?: string
          limit_tier?: string | null
          messaging_limit?: number | null
          phone_number_id?: string
          phone_status?: string | null
          quality_rating?: string | null
        }
        Relationships: []
      }
      wa_templates: {
        Row: {
          category: string
          components: Json
          created_at: string | null
          id: string
          language: string
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          wa_template_name: string
        }
        Insert: {
          category: string
          components?: Json
          created_at?: string | null
          id?: string
          language?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          wa_template_name: string
        }
        Update: {
          category?: string
          components?: Json
          created_at?: string | null
          id?: string
          language?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          wa_template_name?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          integration_type: string
          payload: Json
          processed: boolean | null
          processed_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          integration_type: string
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          integration_type?: string
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          created_at: string | null
          customer_id: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          invoice_id: string | null
          message_content: string
          message_type: string
          metadata: Json | null
          phone_number: string
          read_at: string | null
          sent_at: string | null
          status: string
          template_name: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          invoice_id?: string | null
          message_content: string
          message_type: string
          metadata?: Json | null
          phone_number: string
          read_at?: string | null
          sent_at?: string | null
          status?: string
          template_name?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          invoice_id?: string | null
          message_content?: string
          message_type?: string
          metadata?: Json | null
          phone_number?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string
          template_name?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "tax_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          category: string
          created_at: string | null
          id: string
          language: string
          name: string
          status: string
          template_content: Json
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          language?: string
          name: string
          status?: string
          template_content: Json
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          language?: string
          name?: string
          status?: string
          template_content?: Json
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      workshop_progress: {
        Row: {
          costumes_completed: number | null
          created_at: string | null
          id: string
          order_id: string
          workshop_location: string
        }
        Insert: {
          costumes_completed?: number | null
          created_at?: string | null
          id?: string
          order_id: string
          workshop_location: string
        }
        Update: {
          costumes_completed?: number | null
          created_at?: string | null
          id?: string
          order_id?: string
          workshop_location?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_progress_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_booking_customer_details"
            referencedColumns: ["order_booking_id"]
          },
          {
            foreignKeyName: "workshop_progress_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      jfd_rental_item_analytics: {
        Row: {
          avg_rental_duration: number | null
          category_id: string | null
          category_name: string | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          item_id: string | null
          name: string | null
          rental_price: number | null
          total_income: number | null
          total_rentals: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jfd_inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "jfd_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_booking_customer_details: {
        Row: {
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          order_booking_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_inventory_analytics: {
        Row: {
          category: string | null
          cost_price: number | null
          current_available_quantity: number | null
          gross_profit: number | null
          id: string | null
          initial_stock: number | null
          item_code: string | null
          last_purchase_date: string | null
          last_sale_date: string | null
          product_id: string | null
          product_name: string | null
          stock_status: string | null
          total_purchase_value: number | null
          total_purchased_quantity: number | null
          total_sales_value: number | null
          total_sold_quantity: number | null
          turnover_percentage: number | null
          unit_price: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_summary_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "product_inventory_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_summary_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_inventory_dashboard: {
        Row: {
          current_available_quantity: number | null
          id: string | null
          initial_stock: number | null
          item_code: string | null
          name: string | null
          total_purchased_quantity: number | null
          total_sold_quantity: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      staff_profiles_directory: {
        Row: {
          id: string | null
          name: string | null
        }
        Insert: {
          id?: string | null
          name?: never
        }
        Update: {
          id?: string | null
          name?: never
        }
        Relationships: []
      }
      vendor_balance_summary: {
        Row: {
          company_name: string | null
          current_balance: number | null
          id: string | null
          opening_balance: number | null
          opening_balance_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_money_to_wallet: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      bulk_create_client_credentials: { Args: never; Returns: Json }
      bulk_restore_products: { Args: never; Returns: Json }
      bulk_soft_delete_products: { Args: never; Returns: Json }
      calculate_product_purchases: {
        Args: { p_product_id: string }
        Returns: number
      }
      calculate_product_sales: {
        Args: { p_product_id: string }
        Returns: number
      }
      calculate_simple_stock: {
        Args: { p_product_id: string }
        Returns: number
      }
      calculate_vendor_balance: {
        Args: { vendor_uuid: string }
        Returns: number
      }
      cancel_pos_invoice: { Args: { invoice_uuid: string }; Returns: Json }
      check_product_dependencies: {
        Args: { product_uuid: string }
        Returns: Json
      }
      cleanup_test_products: {
        Args: { backup_before_delete?: boolean; dry_run?: boolean }
        Returns: Json
      }
      correct_all_sales_stock_levels: { Args: never; Returns: Json }
      correct_b2b_stock_levels: { Args: never; Returns: Json }
      create_admin_user: {
        Args: {
          admin_email: string
          admin_password: string
          first_name?: string
          last_name?: string
        }
        Returns: Json
      }
      create_client_credentials_for_customer: {
        Args: { customer_id: string }
        Returns: Json
      }
      create_costume_pieces_table: { Args: never; Returns: undefined }
      delete_order: { Args: { target_order_id: string }; Returns: undefined }
      delete_pos_invoice: { Args: { invoice_uuid: string }; Returns: Json }
      end_day_book_entry: { Args: { target_date: string }; Returns: Json }
      extract_product_keywords: {
        Args: { product_details: string; product_name: string }
        Returns: Json
      }
      fix_bulk_order_invoice_data: { Args: never; Returns: Json }
      fix_duplicate_stock_updates: { Args: never; Returns: Json }
      fix_missing_purchase_stock_updates_safe: { Args: never; Returns: Json }
      fix_purchase_bill_calculations: { Args: never; Returns: Json }
      generate_client_username: {
        Args: { customer_id: string }
        Returns: string
      }
      generate_monthly_emi_pdcs: {
        Args: { target_month: number; target_year: number }
        Returns: Json
      }
      generate_pos_invoice_number: { Args: never; Returns: string }
      generate_random_password: { Args: never; Returns: string }
      generate_temp_password: { Args: never; Returns: string }
      generate_yearly_emi_pdcs: {
        Args: { target_month: number; target_year: number }
        Returns: Json
      }
      get_my_franchise_id: { Args: never; Returns: string }
      get_staff_accessible_modules: {
        Args: { staff_uuid: string }
        Returns: Json
      }
      get_staff_permissions: { Args: { staff_uuid: string }; Returns: Json }
      get_user_staff_profile: {
        Args: { user_uuid: string }
        Returns: {
          department: string
          employee_id: string
          first_name: string
          last_name: string
          staff_id: string
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_password: { Args: { password: string }; Returns: string }
      increment_share_link_views: {
        Args: { link_code_param: string }
        Returns: undefined
      }
      is_hq_user: { Args: never; Returns: boolean }
      is_showroom_staff: { Args: { user_uuid: string }; Returns: boolean }
      jfd_generate_bill_number: { Args: { bill_type: string }; Returns: string }
      match_documents: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          similarity: number
        }[]
      }
      match_knowledge_base: {
        Args: {
          filter_user_id?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
          source_type: string
          source_url: string
          title: string
        }[]
      }
      migrate_all_custom_bills: { Args: never; Returns: Json }
      migrate_custom_bill_to_tax_invoice: {
        Args: { custom_bill_id: string }
        Returns: Json
      }
      migrate_tax_invoice_inventory_data: { Args: never; Returns: Json }
      preview_bulk_order_invoice_fixes: { Args: never; Returns: Json }
      recalculate_all_monthly_targets: { Args: never; Returns: Json }
      recalculate_all_product_stock: { Args: never; Returns: Json }
      recalculate_purchase_bill_totals: { Args: never; Returns: Json }
      refresh_all_inventory_summaries: { Args: never; Returns: Json }
      refresh_product_inventory_summary: {
        Args: { target_product_id: string }
        Returns: undefined
      }
      reset_client_password: { Args: { credential_id: string }; Returns: Json }
      restore_product: { Args: { product_uuid: string }; Returns: Json }
      reverse_purchase_bill_stock: {
        Args: { bill_id_param: string }
        Returns: Json
      }
      safe_delete_product: {
        Args: { force_hard_delete?: boolean; product_uuid: string }
        Returns: Json
      }
      save_day_book_entry: {
        Args: {
          cash_denominations_data: Json
          entry_date: string
          expenses_data: Json
          notes_text: string
          should_end_day?: boolean
        }
        Returns: Json
      }
      search_knowledge_chunks: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
          source_id: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      sync_inventory_sold_from_transactions: { Args: never; Returns: Json }
      update_overdue_shipments: { Args: never; Returns: undefined }
      update_staff_accessible_modules: {
        Args: { modules: Json; staff_uuid: string }
        Returns: undefined
      }
      validate_and_fix_stock_levels: { Args: never; Returns: Json }
      verify_client_password: {
        Args: { credential_id: string; password: string }
        Returns: boolean
      }
      verify_password: {
        Args: { hash: string; password: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "workshop"
      connection_status: "connected" | "disconnected" | "error" | "pending"
      dashboard_role: "admin" | "operator" | "client" | "viewer"
      message_status: "pending" | "processed" | "replied" | "failed" | "ignored"
      order_status: "processing" | "shipped" | "delivered" | "cancelled"
      social_platform_type:
        | "instagram"
        | "youtube"
        | "shopify"
        | "whatsapp"
        | "facebook"
      transaction_type: "purchase" | "sale" | "adjustment"
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
      app_role: ["admin", "staff", "workshop"],
      connection_status: ["connected", "disconnected", "error", "pending"],
      dashboard_role: ["admin", "operator", "client", "viewer"],
      message_status: ["pending", "processed", "replied", "failed", "ignored"],
      order_status: ["processing", "shipped", "delivered", "cancelled"],
      social_platform_type: [
        "instagram",
        "youtube",
        "shopify",
        "whatsapp",
        "facebook",
      ],
      transaction_type: ["purchase", "sale", "adjustment"],
    },
  },
} as const
