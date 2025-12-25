
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  const message = location.state?.message || null;
  useEffect(() => {
    window.scrollTo(0, 0);
    console.log("Auth page - Auth state:", { isAuthenticated, isLoading, user });

    // If user is already authenticated, redirect them
    if (isAuthenticated && !isLoading && user) {
      let destination = location.state?.from;

      // If no specific destination, redirect based on role
      if (!destination) {
        destination = user.role === 'admin' ? 'admin' : 'dashboard';
      }

      console.log("Authenticated, redirecting to:", destination);
      navigate(`/${destination}`);
    }
  }, [isAuthenticated, navigate, location.state, isLoading, user]);

  const handleAuthSuccess = () => {
    // We rely on the useEffect to handle redirection once the user state is updated
    console.log("Auth success, waiting for state update to redirect...");
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
            <div className="bg-primary rounded-full p-3">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-playfair font-semibold">
            {isLogin ? "Login" : "Create Account"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin
              ? "Sign in to access your Studio Prince account"
              : "Join Studio Prince to manage your photography sessions"}
          </p>
          {message && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-md">
              {message}
            </div>
          )}
        </div>

        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
          {isLogin ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              switchToRegister={() => setIsLogin(false)}
            />
          ) : (
            <RegisterForm
              onSuccess={handleAuthSuccess}
              switchToLogin={() => setIsLogin(true)}
            />
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          By using our services, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
};

export default Auth;
