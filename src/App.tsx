
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";
import { useState, createContext, useEffect } from "react";

// Create auth context to manage user state across the app
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

const queryClient = new QueryClient();

const App = () => {
  // Initialize user state from localStorage if available
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('studioUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Update localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('studioUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('studioUser');
    }
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated: !!user 
      }}>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/booking" element={
              user ? <Booking /> : <Navigate to="/auth" state={{ from: 'booking' }} />
            } />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              user ? <Dashboard /> : <Navigate to="/auth" state={{ from: 'dashboard' }} />
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
