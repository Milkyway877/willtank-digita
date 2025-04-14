export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          last_login: string | null
          will_in_progress: boolean
          will_completed: boolean
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          created_at?: string
          last_login?: string | null
          will_in_progress?: boolean
          will_completed?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          last_login?: string | null
          will_in_progress?: boolean
          will_completed?: boolean
        }
      }
      wills: {
        Row: {
          id: string
          user_id: string
          template_id: string
          status: string
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id: string
          status?: string
          data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string
          status?: string
          data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          user_id: string
          will_id: string
          title: string
          description: string | null
          value: number | null
          proof_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          will_id: string
          title: string
          description?: string | null
          value?: number | null
          proof_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          will_id?: string
          title?: string
          description?: string | null
          value?: number | null
          proof_url?: string | null
          created_at?: string
        }
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
  }
}