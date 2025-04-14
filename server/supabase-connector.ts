import { createClient } from '@supabase/supabase-js';
import type { Request, Response, NextFunction } from 'express';

// Constants from your environment
const supabaseUrl = 'https://zsqwucyloirnwkpsjifj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcXd1Y3lsb2lybndrcHNqaWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2Njg1OTYsImV4cCI6MjA2MDI0NDU5Nn0.uDm_7r_ox0OvRhj0CTAEtmQRP80IICv09JmLXCmQCRw';

// Create the Supabase server client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Supabase tables if they don't exist
export async function initializeSupabaseTables() {
  try {
    // Check if the users table exists by attempting to query it
    const { error } = await supabase.from('users').select('id').limit(1);

    // If we get a specific error about the table not existing, create it
    if (error && error.code === '42P01') {
      console.log('Creating Supabase users table...');
      
      // Use Supabase's SQL executor to create the table
      const { error: createError } = await supabase.rpc('create_users_table', {});
      
      if (createError) {
        // If the RPC doesn't exist, use raw SQL
        const { error: sqlError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.users (
              id TEXT PRIMARY KEY,
              email TEXT UNIQUE NOT NULL,
              name TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              last_login TIMESTAMP WITH TIME ZONE,
              will_in_progress BOOLEAN DEFAULT FALSE,
              will_completed BOOLEAN DEFAULT FALSE
            );
          `
        });
        
        if (sqlError) {
          console.error('Error creating users table:', sqlError);
        } else {
          console.log('Users table created successfully');
        }
      }
    }
  } catch (error) {
    console.error('Error initializing Supabase tables:', error);
  }
}

/**
 * Middleware to sync user data with Supabase after successful authentication
 * This maintains user data in Supabase without changing your auth flow
 */
export function syncUserWithSupabase(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated and user object exists
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    // Extract user properties safely, accounting for potential undefined values
    const id = req.user.id?.toString() || '';
    const username = req.user.username || '';
    const fullName = req.user.fullName || undefined;
    
    // Only sync if we have the required data
    if (id && username) {
      // Sync user data with Supabase in the background
      syncUserData({
        id,
        email: username,   // Assuming username is email
        name: fullName,    // Include name if available, using undefined instead of null
      }).catch(error => {
        // Log error but don't disrupt the main flow
        console.error('Error syncing user data with Supabase:', error);
      });
    }
  }
  
  // Continue with the request
  next();
}

/**
 * Sync user data with Supabase database
 */
export async function syncUserData(userData: {
  id: string;
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
      console.error('Error checking for existing user in Supabase:', fetchError);
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
        .select();

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
        .select();

      if (error) {
        console.error('Error creating user in Supabase:', error);
        return { success: false, error };
      }

      return { success: true, data };
    }
  } catch (error) {
    console.error('Unexpected error in syncUserData:', error);
    return { success: false, error };
  }
}

/**
 * Update user will status in Supabase
 */
export async function updateUserWillStatus(userId: string, status: {
  will_in_progress?: boolean;
  will_completed?: boolean;
}) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(status)
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error updating user will status in Supabase:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in updateUserWillStatus:', error);
    return { success: false, error };
  }
}

/**
 * Get user data from Supabase
 */
export async function getUserData(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user data from Supabase:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getUserData:', error);
    return { success: false, error };
  }
}