
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase, ensureUserProfile } from '@/services/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { UserProfile } from '@/services/supabaseClient';

type UserRole = 'super_admin' | 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  phone: string | null;
  profile_completed: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, expectedRole?: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      console.log("Fetching profile for user ID:", userId);
      
      // First try to get the profile directly with RPC to avoid recursion issues
      const { data: profileData, error: profileError } = await supabase.rpc('get_profile_by_id', {
        uid: userId
      });
      
      if (profileData) {
        console.log("Profile found via RPC:", profileData);
        return profileData as UserProfile;
      }
      
      if (profileError) {
        console.error("Error fetching profile with RPC:", profileError);
      }
      
      // Fallback to direct query if RPC fails
      const { data: directProfile, error: directError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (directProfile) {
        console.log("Profile found via direct query:", directProfile);
        return directProfile as UserProfile;
      }
      
      if (directError) {
        console.error("Error fetching profile with direct query:", directError);
      }
      
      // Create profile if not found
      console.log("Profile not found, creating new profile");
      return await ensureUserProfile(userId, email);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Initializing auth state");
        setIsLoading(true);
        
        // First set up auth state listener before checking for session
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event, session?.user?.id);
            
            if (session?.user) {
              // We have a session, fetch the user profile
              setTimeout(async () => {
                const profile = await fetchUserProfile(session.user.id, session.user.email || '');
                
                if (profile) {
                  setUser({
                    id: session.user.id,
                    email: profile.email,
                    name: profile.name,
                    role: profile.role as UserRole,
                    phone: profile.phone,
                    profile_completed: profile.profile_completed ?? false
                  });
                } else {
                  console.warn('User authenticated but profile not found or created');
                  // Sign out if profile doesn't exist and can't be created
                  await supabase.auth.signOut();
                  setUser(null);
                  toast({
                    title: "Profile error",
                    description: "Could not retrieve or create your profile. Please try again.",
                    variant: "destructive"
                  });
                }
                setIsLoading(false);
              }, 0);
            } else {
              // No session, clear user
              setUser(null);
              setIsLoading(false);
            }
          }
        );

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Found existing session, fetching profile");
          const profile = await fetchUserProfile(session.user.id, session.user.email || '');
          
          if (profile) {
            console.log("Found profile:", profile);
            setUser({
              id: session.user.id,
              email: profile.email,
              name: profile.name,
              role: profile.role as UserRole,
              phone: profile.phone,
              profile_completed: profile.profile_completed ?? false
            });
          } else {
            console.warn('User authenticated but profile not found or created');
            // Sign out if profile doesn't exist and can't be created
            await supabase.auth.signOut();
            setUser(null);
            toast({
              title: "Profile error",
              description: "Could not retrieve or create your profile. Please try again.",
              variant: "destructive"
            });
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, expectedRole?: string) => {
    try {
      console.log(`Attempting login with email: ${email}, expected role: ${expectedRole || 'any'}`);
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      if (data.user) {
        const profile = await fetchUserProfile(data.user.id, data.user.email || '');
        
        if (profile) {
          // Check if user role matches expected role
          if (expectedRole) {
            // For admin login, check directly from the profile data
            if (expectedRole === 'admin' && profile.role !== 'admin' && profile.role !== 'super_admin') {
              console.error("Role mismatch: Expected admin, got", profile.role);
              await supabase.auth.signOut();
              toast({
                title: "Unauthorized",
                description: "This login is for administrators only.",
                variant: "destructive"
              });
              return false;
            } 
            // For client login, check directly from the profile data
            else if (expectedRole === 'client' && (profile.role === 'admin' || profile.role === 'super_admin')) {
              console.error("Role mismatch: Expected client, got", profile.role);
              await supabase.auth.signOut();
              toast({
                title: "Admin detected",
                description: "Please use the admin login page.",
                variant: "destructive"
              });
              return false;
            }
          }
          
          console.log("Login successful, setting user with role:", profile.role);
          setUser({
            id: data.user.id,
            email: profile.email,
            name: profile.name || data.user.email?.split('@')[0] || 'User',
            role: profile.role as UserRole,
            phone: profile.phone || null,
            profile_completed: profile.profile_completed ?? false
          });
          
          toast({
            title: "Login successful",
            description: `Welcome back, ${profile.name || data.user.email?.split('@')[0] || 'User'}!`
          });
          
          return true;
        } else {
          console.error("Profile not found or couldn't be created after login");
          toast({
            title: "Profile error",
            description: "Could not retrieve or create your profile. Please try again.",
            variant: "destructive"
          });
          await supabase.auth.signOut();
          return false;
        }
      }
      
      return false;
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (email: string, password: string, name: string, role: string = 'client') => {
    try {
      console.log(`Attempting to register ${email} with role ${role}`);
      setIsLoading(true);
      
      // First create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) {
        console.error("Registration auth error:", error);
        throw error;
      }
      
      if (data.user) {
        // Manually create profile in case trigger doesn't work
        const profile = await fetchUserProfile(data.user.id, email);
        
        if (!profile) {
          console.error("Failed to create profile during registration");
          toast({
            title: "Registration issue",
            description: "Account created but profile setup failed. Please log in to continue.",
            variant: "destructive"
          });
        }
        
        toast({
          title: "Registration successful",
          description: `Your ${role} account has been created. Please complete your profile.`
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "Could not log out",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
