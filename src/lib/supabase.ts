import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          data: any | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          data?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          data?: any | null;
          created_at?: string;
        };
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Helper functions for profiles
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
}

export async function updateProfile(userId: string, updates: Partial<Tables<'profiles'>>) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates })
    .select()
    .single();
  
  return { data, error };
}

export async function getProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  
  return { data, error };
}

// Helper function to handle auth errors and clear corrupted sessions
export async function handleAuthError(error: any) {
  if (error?.message?.includes('refresh') || 
      error?.message?.includes('JWT') || 
      error?.message?.includes('Invalid Refresh Token')) {
    console.log('Clearing corrupted session due to auth error:', error.message);
    await supabase.auth.signOut();
    // Clear any stored session data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
    }
    return true; // Indicates auth error was handled
  }
  return false; // Not an auth error
}

// Enhanced session check with error recovery
export async function getValidSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      const wasAuthError = await handleAuthError(error);
      if (wasAuthError) {
        return { session: null, error: null }; // Session cleared, no error to propagate
      }
      return { session: null, error };
    }
    
    return { session, error: null };
  } catch (error) {
    const wasAuthError = await handleAuthError(error);
    if (wasAuthError) {
      return { session: null, error: null };
    }
    return { session: null, error };
  }
}