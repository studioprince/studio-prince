
import { supabase as supabaseIntegration } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export const supabase = supabaseIntegration;

// User roles
export type UserRole = 'super_admin' | 'admin' | 'client';

// Define our own UserProfile type that includes profile_completed
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'] & {
  profile_completed?: boolean;
};

// Helper function to create a user profile if it doesn't exist
export const ensureUserProfile = async (userId: string, email: string) => {
  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error checking for existing profile:', fetchError);
      return null;
    }
    
    // If profile exists, return it
    if (existingProfile) {
      return {
        ...existingProfile,
        profile_completed: (existingProfile as any).profile_completed ?? false
      };
    }
    
    // If profile doesn't exist, create it
    console.log('Creating missing profile for user:', userId);
    const { data: user } = await supabase.auth.getUser(userId);
    const name = user?.user?.user_metadata?.name || email.split('@')[0] || 'User';
    
    const { data: newProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: userId,
          email: email,
          name: name,
          role: 'client',
          profile_completed: false
        }
      ])
      .select()
      .single();
      
    if (insertError) {
      console.error('Error creating user profile:', insertError);
      return null;
    }
    
    return {
      ...newProfile,
      profile_completed: false
    };
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    return null;
  }
};

// Helper functions for authentication
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Ensure user profile exists
      const profile = await ensureUserProfile(user.id, user.email || '');
        
      if (profile) {
        return { 
          ...user,
          role: profile.role as UserRole,
          name: profile.name || user.email?.split('@')[0] || 'User',
          phone: profile.phone || '',
          profile_completed: (profile as any).profile_completed ?? false
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
    // Since we don't have an 'is_admin' function, we'll use the 'is_super_admin' function
    // but check for either 'admin' or 'super_admin' role
    const { data: roleData } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (!roleData) return false;
    
    // Check if the user role is either admin or super_admin
    return roleData.role === 'admin' || roleData.role === 'super_admin';
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
            role,
            profile_completed: false
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
