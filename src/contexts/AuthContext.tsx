
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase, ensureClientProfile } from '@/services/supabaseClient';

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  profile_completed: boolean;
  role: string;  // Add this property
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
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
      
      // Use RPC function to get profile safely
      const profile = await ensureClientProfile(userId, email);
      return profile;
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
        
        // Set up auth state listener
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
                    phone: profile.phone,
                    profile_completed: profile.profile_completed ?? false,
                    role: 'client' // Always set role as client
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
              phone: profile.phone,
              profile_completed: profile.profile_completed ?? false,
              role: 'client' // Always set role as client
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

  const login = async (email: string, password: string) => {
    try {
      console.log(`Attempting login with email: ${email}`);
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
          console.log("Login successful, setting user");
          setUser({
            id: data.user.id,
            email: profile.email,
            name: profile.name || data.user.email?.split('@')[0] || 'User',
            phone: profile.phone || null,
            profile_completed: profile.profile_completed ?? false,
            role: 'client' // Always set role as client
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
  
  const register = async (email: string, password: string, name: string) => {
    try {
      console.log(`Attempting to register ${email}`);
      setIsLoading(true);
      
      // First create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        console.error("Registration auth error:", error);
        throw error;
      }
      
      if (data.user) {
        // Manually create profile to ensure it exists
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
          description: "Your account has been created. Please complete your profile."
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
