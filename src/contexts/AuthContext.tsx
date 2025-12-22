
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { toast } from "@/hooks/use-toast";

// TODO: Update User type based on MongoDB schema
export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  profile_completed: boolean;
  role: string;
  verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<boolean>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<boolean>;
  sendOTP: () => Promise<boolean>;
  verifyOTP: (otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  updateProfile: async () => false,
  sendOTP: async () => false,
  verifyOTP: async () => false,
  logout: async () => { }
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user/token is stored in localStorage on load
    const storedUser = localStorage.getItem('user_session');
    const storedToken = localStorage.getItem('auth_token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('user_session');
        localStorage.removeItem('auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user_session', JSON.stringify(data.user));
      localStorage.setItem('auth_token', data.token);

      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.name}!`
      });
      return true;
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

  const register = async (email: string, password: string, name: string, phone?: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user_session', JSON.stringify(data.user));
      localStorage.setItem('auth_token', data.token);

      toast({
        title: "Registration successful",
        description: "Your account has been created."
      });

      return true;
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

  const updateProfile = async (updateData: { name?: string; phone?: string }) => {
    try {
      if (!token) throw new Error("Not authenticated");

      setIsLoading(true);
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      setUser(data.user);
      localStorage.setItem('user_session', JSON.stringify(data.user));

      toast({
        title: "Profile updated",
        description: data.message
      });

      return true;
    } catch (error: any) {
      console.error("Profile update failed:", error);
      toast({
        title: "Update failed",
        description: error.message || "Could not update profile",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async () => {
    try {
      if (!token) throw new Error("Not authenticated");

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast({ title: "OTP Sent", description: "Check your email for the verification code." });
      return true;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
  };

  const verifyOTP = async (otp: string) => {
    try {
      if (!token) throw new Error("Not authenticated");

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Update user with verified status
      setUser(data.user);
      localStorage.setItem('user_session', JSON.stringify(data.user));

      toast({ title: "Verified", description: "Email successfully verified!" });
      return true;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (e) {
      console.error("Logout API failed", e);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('user_session');
      localStorage.removeItem('auth_token');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading,
      login,
      register,
      updateProfile,
      sendOTP,
      verifyOTP,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
