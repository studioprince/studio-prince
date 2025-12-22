
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
import ProfileSetup from "./pages/ProfileSetup";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInvoices from "./pages/AdminInvoices";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SharedGallery from "./pages/SharedGallery";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ProtectedRoute component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to auth page");
    return <Navigate to="/auth" state={{ from: window.location.pathname.substring(1) }} replace />;
  }

  // Check role access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect admin to admin dashboard if they try to access client pages
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    // Redirect client to client dashboard if they try to access admin pages
    if (user.role === 'client') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check if profile is completed, if not redirect to profile setup
  // Don't redirect admins to profile setup as they might not have it or need it the same way
  if (user?.role !== 'admin' && !user?.profile_completed && window.location.pathname !== '/profile-setup') {
    console.log("Profile not completed, redirecting to profile setup");
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/profile-setup" element={
              <ProtectedRoute allowedRoles={['client', 'admin']}>
                <ProfileSetup />
              </ProtectedRoute>
            } />
            <Route path="/booking" element={
              <ProtectedRoute allowedRoles={['client']}>
                <Booking />
              </ProtectedRoute>
            } />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/gallery/shared/:token" element={<SharedGallery />} />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['client']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/invoices" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminInvoices />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
