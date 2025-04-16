
import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '@/App';
import { dbService } from '@/services/database';
import { toast } from "@/hooks/use-toast";

type LoginFormProps = {
  onSuccess: () => void;
  switchToRegister: () => void;
};

const LoginForm = ({ onSuccess, switchToRegister }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Login user using our database service
      const user = dbService.loginUser(email, password);
      
      if (user) {
        login(user);
        onSuccess();
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to fill demo credentials
  const fillDemoCredentials = (type: 'admin' | 'client' | 'new-admin') => {
    if (type === 'admin') {
      setEmail('aditya@admin.com');
      setPassword('123');
    } else if (type === 'new-admin') {
      setEmail('admin@studio.com');
      setPassword('admin123');
    } else {
      setEmail('omkar@client.com');
      setPassword('123');
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
                <p className="font-semibold">NEW Admin Account:</p>
                <p>admin@studio.com / admin123</p>
              </div>
              <button 
                type="button"
                onClick={() => fillDemoCredentials('new-admin')}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              >
                Use This
              </button>
            </div>
          </div>
          <div className="flex justify-between">
            <p>Original Admin: aditya@admin.com / 123</p>
            <button 
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="text-xs text-primary hover:underline"
            >
              Fill
            </button>
          </div>
          <div className="flex justify-between">
            <p>Client: omkar@client.com / 123</p>
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

