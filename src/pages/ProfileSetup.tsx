
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Form } from '@/components/ui/form';
import { User } from 'lucide-react';

const ProfileSetup = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '+91 ',
  });

  useEffect(() => {
    // If user data is loaded, pre-fill the form
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '+91 ',
      });
    }
  }, [user]);

  useEffect(() => {
    console.log("ProfileSetup - Auth state:", { isLoading, user });
    
    // If user isn't logged in, redirect to auth
    if (!isLoading && !user) {
      navigate('/auth');
    }
    // If user already completed profile setup, redirect to dashboard
    else if (!isLoading && user && user.profile_completed) {
      navigate('/dashboard');
    }
  }, [isLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to complete your profile",
          variant: "destructive"
        });
        return;
      }

      console.log("Updating user profile:", {
        id: user.id,
        name: formData.name,
        phone: formData.phone
      });

      // Update user profile - for this specific operation we use the direct update 
      // since our RLS policy allows users to update their own profiles
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been set up successfully"
      });

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Profile setup error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  if (isLoading) {
    return (
      <main className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="container-custom max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-playfair font-semibold">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 mt-2">
            Please provide some additional information to complete your profile.
          </p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your full name"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+91 9876543210"
              />
              <p className="text-xs text-gray-500 mt-1">
                Please include country code
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-2.5"
            >
              {isSubmitting ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ProfileSetup;
