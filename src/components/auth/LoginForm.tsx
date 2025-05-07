
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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
      console.log("Client login attempt:", email);
      const success = await login(email, password);
      
      if (success) {
        console.log("Client login successful");
        onSuccess();
      } else {
        console.log("Client login returned false");
      }
    } catch (error: any) {
      console.error("Client login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to fill demo credentials
  const fillDemoCredentials = () => {
    setEmail('client@example.com');
    setPassword('client123');
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
        {isLoading ? "Signing in..." : "Sign In"}
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
        <p className="font-medium mb-1 text-center">Demo Account:</p>
        <div className="flex justify-between items-center">
          <p>client@example.com / client123</p>
          <button 
            type="button"
            onClick={fillDemoCredentials}
            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
          >
            Use This
          </button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
