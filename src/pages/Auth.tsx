
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { Camera } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const message = location.state?.message || null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAuthSuccess = () => {
    // Redirect to dashboard after successful auth
    navigate('/dashboard');
  };

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
            {isLogin ? "Welcome Back" : "Create an Account"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin
              ? "Sign in to access your Studio Prince client area"
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
