import { createClient } from '@supabase/supabase-js';

// Database type from the file we created
// This type will be automatically detected by TypeScript
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

// Constants from your environment
const supabaseUrl = 'https://zsqwucyloirnwkpsjifj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcXd1Y3lsb2lybndrcHNqaWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2Njg1OTYsImV4cCI6MjA2MDI0NDU5Nn0.uDm_7r_ox0OvRhj0CTAEtmQRP80IICv09JmLXCmQCRw';

// Create the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// User management functions
export async function createOrUpdateUser(userData: {
  id: string; // Using email or custom user ID
  email: string;
  name?: string;
}) {
  try {
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userData.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // Error other than "no rows returned"
      console.error('Error checking for existing user:', fetchError);
      return { success: false, error: fetchError };
    }

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          email: userData.email,
          name: userData.name,
          last_login: new Date().toISOString(),
        })
        .eq('id', userData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user in Supabase:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          will_in_progress: false,
          will_completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user in Supabase:', error);
        return { success: false, error };
      }

      return { success: true, data };
    }
  } catch (error) {
    console.error('Unexpected error in createOrUpdateUser:', error);
    return { success: false, error };
  }
}

// Will management functions
export async function createWill(willData: {
  user_id: string;
  template_id: string;
  data?: any;
}) {
  try {
    const { data, error } = await supabase
      .from('wills')
      .insert({
        user_id: willData.user_id,
        template_id: willData.template_id,
        status: 'draft',
        data: willData.data || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating will in Supabase:', error);
      return { success: false, error };
    }

    // Update user status
    await supabase
      .from('users')
      .update({ will_in_progress: true })
      .eq('id', willData.user_id);

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in createWill:', error);
    return { success: false, error };
  }
}

export async function updateWill(willData: {
  id: string;
  user_id: string;
  data: any;
  status?: 'draft' | 'in_progress' | 'finalized';
}) {
  try {
    const { data, error } = await supabase
      .from('wills')
      .update({
        data: willData.data,
        status: willData.status || 'in_progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', willData.id)
      .eq('user_id', willData.user_id) // Security check
      .select()
      .single();

    if (error) {
      console.error('Error updating will in Supabase:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in updateWill:', error);
    return { success: false, error };
  }
}

export async function finalizeWill(willId: string, userId: string) {
  try {
    // Update will status
    const { data: will, error: willError } = await supabase
      .from('wills')
      .update({
        status: 'finalized',
        updated_at: new Date().toISOString(),
      })
      .eq('id', willId)
      .eq('user_id', userId)
      .select()
      .single();

    if (willError) {
      console.error('Error finalizing will in Supabase:', willError);
      return { success: false, error: willError };
    }

    // Update user status
    const { error: userError } = await supabase
      .from('users')
      .update({
        will_in_progress: false,
        will_completed: true,
      })
      .eq('id', userId);

    if (userError) {
      console.error('Error updating user status in Supabase:', userError);
      return { success: false, error: userError };
    }

    return { success: true, data: will };
  } catch (error) {
    console.error('Unexpected error in finalizeWill:', error);
    return { success: false, error };
  }
}

export async function getWillsByUserId(userId: string) {
  try {
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching wills from Supabase:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getWillsByUserId:', error);
    return { success: false, error };
  }
}

export async function getWillById(willId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('wills')
      .select('*')
      .eq('id', willId)
      .eq('user_id', userId) // Security check
      .single();

    if (error) {
      console.error('Error fetching will from Supabase:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getWillById:', error);
    return { success: false, error };
  }
}

// Asset management functions
export async function addAsset(assetData: {
  user_id: string;
  will_id: string;
  title: string;
  description?: string;
  value?: number;
  proof_url?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('assets')
      .insert({
        user_id: assetData.user_id,
        will_id: assetData.will_id,
        title: assetData.title,
        description: assetData.description || '',
        value: assetData.value || null,
        proof_url: assetData.proof_url || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding asset to Supabase:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in addAsset:', error);
    return { success: false, error };
  }
}

export async function getAssetsByWillId(willId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('will_id', willId)
      .eq('user_id', userId); // Security check

    if (error) {
      console.error('Error fetching assets from Supabase:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getAssetsByWillId:', error);
    return { success: false, error };
  }
}

// File storage functions
export async function uploadFile(file: File, userId: string, willId: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${willId}/${fileName}`;

    const { data, error } = await supabase
      .storage
      .from('willtank-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file to Supabase Storage:', error);
      return { success: false, error };
    }

    // Get public URL
    const { data: publicURL } = supabase
      .storage
      .from('willtank-assets')
      .getPublicUrl(filePath);

    return { success: true, data: { path: data.path, url: publicURL.publicUrl } };
  } catch (error) {
    console.error('Unexpected error in uploadFile:', error);
    return { success: false, error };
  }
}

export async function deleteFile(filePath: string) {
  try {
    const { error } = await supabase
      .storage
      .from('willtank-assets')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file from Supabase Storage:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deleteFile:', error);
    return { success: false, error };
  }
}