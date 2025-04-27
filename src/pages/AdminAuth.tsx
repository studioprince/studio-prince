
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminLoginForm from '@/components/auth/AdminLoginForm';
import AdminRegisterForm from '@/components/auth/AdminRegisterForm';
import { Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();
  
  const message = location.state?.message || null;
  const from = location.state?.from || 'dashboard'; // Default redirect to dashboard

  useEffect(() => {
    window.scrollTo(0, 0);
    console.log("AdminAuth page - Auth state:", { isAuthenticated, isLoading, userRole: user?.role });
    
    // If user is already authenticated and is an admin, redirect them
    if (isAuthenticated && !isLoading && user && (user.role === 'admin' || user.role === 'super_admin')) {
      console.log("Admin authenticated, redirecting to:", from);
      navigate(`/${from}`);
    } else if (isAuthenticated && !isLoading && user && user.role === 'client') {
      // If user is authenticated but not an admin, log them out and show message
      console.log("Client detected in admin login, redirecting to client auth");
      navigate('/auth', { 
        state: { 
          message: "You need administrator privileges to access this area." 
        } 
      });
    }
  }, [isAuthenticated, navigate, from, isLoading, user]);

  const handleAuthSuccess = () => {
    // Redirect based on where the user came from
    console.log("Admin auth success, redirecting to:", from);
    navigate(`/${from}`);
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
      <div className="container-custom max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 rounded-full p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-playfair font-semibold">
            {isLogin ? "Admin Area" : "Create Admin Account"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin
              ? "Sign in to access the Studio Prince admin dashboard"
              : "Register as a new administrator for Studio Prince"}
          </p>
          {message && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-md">
              {message}
            </div>
          )}
        </div>

        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
          {isLogin ? (
            <AdminLoginForm
              onSuccess={handleAuthSuccess}
              switchToRegister={() => setIsLogin(false)}
            />
          ) : (
            <AdminRegisterForm
              onSuccess={handleAuthSuccess}
              switchToLogin={() => setIsLogin(true)}
            />
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Looking to access the client area?{' '}
            <a href="/auth" className="text-primary hover:underline font-medium">
              Go to client login
            </a>
          </p>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          By using our services, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
};

export default AdminAuth;
