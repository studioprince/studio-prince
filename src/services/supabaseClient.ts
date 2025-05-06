
import { supabase as supabaseIntegration } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export const supabase = supabaseIntegration;

// User roles
export type UserRole = 'super_admin' | 'admin' | 'client';

// Define our own User type that includes profile data
export type UserProfile = Database['public']['Tables']['users']['Row'];

// Get user role using security definer function
export const getUserRole = async (userId: string): Promise<UserRole> => {
  try {
    // Use security definer function to get user role safely
    const { data, error } = await supabase.rpc('get_role', {
      uid: userId
    });
      
    if (error || !data) {
      console.error('Error fetching user role:', error);
      return 'client';
    }
    
    return data as UserRole;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return 'client';
  }
};

// Helper function to create or get a user profile
export const ensureUserProfile = async (userId: string, email: string) => {
  try {
    // Use security definer function to check if profile exists
    const { data: profileData, error: profileError } = await supabase.rpc('get_user_by_id', {
      uid: userId
    });
    
    if (profileError) {
      console.error('Error checking for existing user:', profileError);
      return null;
    }
    
    // If profile exists, return it
    if (profileData) {
      console.log("User found via RPC:", profileData);
      return profileData as UserProfile;
    }
    
    // If profile doesn't exist, create it via security definer function
    console.log('Creating missing user profile for:', userId);
    const { data: user } = await supabase.auth.getUser();
    const name = user?.user?.user_metadata?.name || email.split('@')[0] || 'User';
    
    // Insert via RPC to avoid RLS policy issues
    const { data: newProfile, error: insertError } = await supabase.rpc('handle_user_profile', {
      uid: userId,
      user_email: email,
      user_name: name,
      user_role: 'client',
      user_phone: null
    });
      
    if (insertError) {
      console.error('Error creating user profile:', insertError);
      return null;
    }
    
    return newProfile as UserProfile;
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
      // Get user profile data
      const profile = await ensureUserProfile(user.id, user.email || '');
      
      if (profile) {
        return { 
          ...user,
          role: profile.role as UserRole,
          name: profile.name || user.email?.split('@')[0] || 'User',
          phone: profile.phone || '',
          profile_completed: profile.profile_completed ?? false
        };
      }
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  }
  
  return null;
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
    
    return Boolean(data);
  } catch (error) {
    console.error('Error checking if user is super admin:', error);
    return false;
  }
};

// Check if user is admin
export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data: isUserAdmin, error } = await supabase.rpc('is_admin', {
      uid: userId
    });
    
    if (error) {
      console.error('Error checking if user is admin:', error);
      return false;
    }
    
    return Boolean(isUserAdmin);
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
      const { error: profileError } = await supabase.rpc('handle_user_profile', {
        uid: authData.user.id,
        user_email: email,
        user_name: name,
        user_role: role,
        user_phone: null
      });
        
      if (profileError) throw profileError;
      
      return authData.user;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
