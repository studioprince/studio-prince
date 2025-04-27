
import { supabase } from '@/services/supabaseClient';
import { toast } from '@/hooks/use-toast';

// This is a helper function to set passwords for admin users
// that were created through SQL migrations
export const setAdminPasswords = async () => {
  try {
    // Check if the super admin needs a password
    const { data: superAdmin } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('email', 'koyande.om27@gmail.com')
      .eq('role', 'super_admin')
      .single();
      
    if (superAdmin) {
      // Try to set the password for super admin
      const { error: superAdminError } = await supabase.auth.admin.updateUserById(
        'super-admin-id', // This would need to be dynamically fetched
        { password: 'Swami@459' }
      );
      
      if (superAdminError) {
        console.error("Could not set super admin password:", superAdminError);
      }
    }
    
    // Check if the admin needs a password
    const { data: admin } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('email', 'StudioAdmin@gmail.com')
      .eq('role', 'admin')
      .single();
      
    if (admin) {
      // Try to set the password for admin
      const { error: adminError } = await supabase.auth.admin.updateUserById(
        'admin-id', // This would need to be dynamically fetched
        { password: 'admin123' }
      );
      
      if (adminError) {
        console.error("Could not set admin password:", adminError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error setting admin passwords:', error);
    return false;
  }
};

// Note: This function assumes that you have admin privileges to set passwords
// In a real application, you would use a more secure approach to set initial passwords
// This is mainly for demonstration purposes
