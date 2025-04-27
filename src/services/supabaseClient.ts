
import { supabase as supabaseIntegration } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export const supabase = supabaseIntegration;

// User roles
export type UserRole = 'super_admin' | 'admin' | 'client';

// Helper functions for authentication
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        return { 
          ...user,
          role: data.role,
          name: data.name || user.email?.split('@')[0] || 'User',
          phone: data.phone || '',
          // Use optional chaining to handle potential missing field
          profile_completed: data.profile_completed ?? false
        };
      }
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

// Check if user is super admin using security definer function
export const isSuperAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_super_admin', {
      uid: userId
    });
    
    if (error) {
      console.error('Error checking if user is super admin:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error checking if user is super admin:', error);
    return false;
  }
};

// Check if user is admin
export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    // Update to use is_admin function with correct parameter
    const { data, error } = await supabase.rpc('is_admin', {
      uid: userId
    });
    
    if (error) {
      console.error('Error checking if user is admin:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error checking if user is admin:', error);
    return false;
  }
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
