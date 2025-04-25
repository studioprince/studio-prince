
import { createClient } from '@supabase/supabase-js';

// Check for environment variables and provide fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

// Create a properly structured mock client for graceful fallback
const createMockClient = () => {
  console.warn('Creating dummy Supabase client. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
  
  // This mock client follows the Supabase JS client structure more closely
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback) => {
        console.warn('Auth state change listener added, but Supabase is not configured');
        return { 
          data: { subscription: { unsubscribe: () => {} } },
          error: null
        };
      },
      admin: {
        createUser: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } })
      }
    },
    from: (table) => {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { message: `Supabase not configured. Cannot query ${table}` } }),
            data: null, error: { message: `Supabase not configured. Cannot query ${table}` }
          }),
          data: null, error: { message: `Supabase not configured. Cannot query ${table}` }
        }),
        insert: () => ({ data: null, error: { message: `Supabase not configured. Cannot insert into ${table}` } }),
        update: () => ({ 
          eq: () => ({ data: null, error: { message: `Supabase not configured. Cannot update ${table}` } }),
          data: null, error: { message: `Supabase not configured. Cannot update ${table}` } 
        }),
        delete: () => ({ data: null, error: { message: `Supabase not configured. Cannot delete from ${table}` } }),
        eq: () => ({ data: null, error: { message: `Supabase not configured. Cannot query ${table}` } }),
        single: async () => ({ data: null, error: { message: `Supabase not configured. Cannot query ${table}` } })
      };
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        list: async () => ({ data: [], error: { message: 'Supabase not configured' } }),
        remove: async () => ({ data: null, error: { message: 'Supabase not configured' } })
      })
    }
  };
};

// Initialize client based on available configuration
let supabase;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    supabase = createMockClient();
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  supabase = createMockClient();
}

export { supabase };

// User roles
export type UserRole = 'super_admin' | 'admin' | 'client';

// Helper functions for authentication
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get the user's profile including role
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      return { 
        ...user,
        role: data?.role || 'client',
        name: data?.name || user.email?.split('@')[0] || 'User',
        phone: data?.phone || ''
      };
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  }
  
  return null;
};

// Get user role
export const getUserRole = async (userId: string): Promise<UserRole> => {
  try {
    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    return data?.role as UserRole || 'client';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'client';
  }
};

// Check if user is super admin
export const isSuperAdmin = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'super_admin';
};

// Check if user is admin
export const isAdmin = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'super_admin' || role === 'admin';
};

// Create a new user via admin panel (for super admin use)
export const createUser = async (email: string, password: string, role: UserRole, name: string) => {
  try {
    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (authError) throw authError;
    
    // Create the profile with role
    if (authData?.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          { 
            id: authData.user.id,
            email,
            name,
            role
          }
        ]);
        
      if (profileError) throw profileError;
      
      return authData.user;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
