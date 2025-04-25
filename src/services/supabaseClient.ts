
import { createClient } from '@supabase/supabase-js';

// Check for environment variables and provide fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

// Create client even with empty strings to prevent immediate crashes, 
// but operations will fail if credentials are missing
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User roles
export type UserRole = 'super_admin' | 'admin' | 'client';

// Helper functions for authentication
export const getCurrentUser = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration missing. Cannot get current user.');
    return null;
  }
  
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
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration missing. Cannot get user role.');
    return 'client';
  }
  
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
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing. Cannot create user.');
  }
  
  // Create the auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  
  if (authError) throw authError;
  
  // Create the profile with role
  if (authData.user) {
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
  }
  
  return authData.user;
};
