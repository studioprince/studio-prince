
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type LoginFormProps = {
  onSuccess: () => void;
  switchToRegister: () => void;
};

const LoginForm = ({ onSuccess, switchToRegister }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to fill demo credentials
  const fillDemoCredentials = (type: 'super_admin' | 'admin' | 'client') => {
    if (type === 'super_admin') {
      setEmail('koyande.om27@gmail.com');
      setPassword('Swami@459');
    } else if (type === 'admin') {
      setEmail('StudioAdmin@gmail.com');
      setPassword('admin123');
    } else {
      setEmail('client@example.com');
      setPassword('client123');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="your@email.com"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="••••••••"
          disabled={isLoading}
        />
        <div className="flex justify-end">
          <Link to="#" className="text-sm text-primary hover:underline mt-1">
            Forgot password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={switchToRegister}
            className="text-primary hover:underline font-medium"
          >
            Create one
          </button>
        </p>
      </div>

      {/* Demo account info */}
      <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 mt-4">
        <p className="font-medium mb-1 text-center text-red-600">ATTENTION: Use these credentials:</p>
        <div className="flex flex-col space-y-1">
          <div className="bg-green-50 p-2 rounded-md border border-green-200 mb-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Super Admin:</p>
                <p>koyande.om27@gmail.com / Swami@459</p>
              </div>
              <button 
                type="button"
                onClick={() => fillDemoCredentials('super_admin')}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              >
                Use This
              </button>
            </div>
          </div>
          <div className="flex justify-between">
            <p>Admin: StudioAdmin@gmail.com / admin123</p>
            <button 
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="text-xs text-primary hover:underline"
            >
              Fill
            </button>
          </div>
          <div className="flex justify-between">
            <p>Client: client@example.com / client123</p>
            <button 
              type="button"
              onClick={() => fillDemoCredentials('client')}
              className="text-xs text-primary hover:underline"
            >
              Fill
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
