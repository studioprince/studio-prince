
import { supabase as supabaseIntegration } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export const supabase = supabaseIntegration;

// Define our own Client type that includes profile data
export type ClientProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
};

// Helper function to create or get a client profile
export const ensureClientProfile = async (userId: string, email: string) => {
  try {
    // Use security definer function to check if profile exists
    const { data: profileData, error: profileError } = await supabase.rpc('get_client_by_id', {
      uid: userId
    });
    
    if (profileError) {
      console.error('Error checking for existing client:', profileError);
      return null;
    }
    
    // If profile exists, return it
    if (profileData) {
      console.log("Client found via RPC:", profileData);
      return profileData as ClientProfile;
    }
    
    // If profile doesn't exist, create it via security definer function
    console.log('Creating missing client profile for:', userId);
    const { data: user } = await supabase.auth.getUser();
    const name = user?.user?.user_metadata?.name || email.split('@')[0] || 'User';
    
    // Insert via RPC to avoid RLS policy issues
    const { data: newProfile, error: insertError } = await supabase.rpc('handle_client_profile', {
      uid: userId,
      client_email: email,
      client_name: name,
      client_phone: null
    });
      
    if (insertError) {
      console.error('Error creating client profile:', insertError);
      return null;
    }
    
    return newProfile as ClientProfile;
  } catch (error) {
    console.error('Error in ensureClientProfile:', error);
    return null;
  }
};

// Helper functions for authentication
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get user profile data
      const profile = await ensureClientProfile(user.id, user.email || '');
      
      if (profile) {
        return { 
          ...user,
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
