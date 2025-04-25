
import { supabase as supabaseIntegration } from '@/integrations/supabase/client';

// Use the already configured Supabase client from the integration
export const supabase = supabaseIntegration;

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
