
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase, UserRole } from '@/services/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
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
  
  // Check for existing session on load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.name || session.user.email?.split('@')[0] || 'User',
            role: profile?.role || 'client',
            phone: profile?.phone || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
    
    // Listen for auth changes - with error handling
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: profile?.name || session.user.email?.split('@')[0] || 'User',
              role: profile?.role || 'client',
              phone: profile?.phone || ''
            });
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
        }
      });
      
      return () => {
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth state change listener:', error);
      setIsLoading(false);
    }
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: profile?.name || data.user.email?.split('@')[0] || 'User',
          role: profile?.role || 'client',
          phone: profile?.phone || ''
        });
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${profile?.name || data.user.email?.split('@')[0] || 'User'}!`
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const register = async (email: string, password: string, name: string) => {
    try {
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
        throw error;
      }
      
      if (data.user) {
        // Create profile entry with default client role
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: data.user.id,
            email: data.user.email,
            name,
            role: 'client'
          }]);
          
        if (profileError) {
          throw profileError;
        }
        
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name,
          role: 'client'
        });
        
        toast({
          title: "Registration successful",
          description: "Your account has been created."
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "Could not log out",
        variant: "destructive"
      });
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
