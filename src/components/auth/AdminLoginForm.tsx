
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type AdminLoginFormProps = {
  onSuccess: () => void;
  switchToRegister: () => void;
};

const AdminLoginForm = ({ onSuccess, switchToRegister }: AdminLoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password, 'admin');
      
      if (success) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid admin credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to fill demo credentials
  const fillDemoCredentials = () => {
    setEmail('StudioAdmin@gmail.com');
    setPassword('admin123');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Admin Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="admin@email.com"
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
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        {isLoading ? "Signing in..." : "Admin Sign In"}
      </button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an admin account?{" "}
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
        <p className="font-medium mb-1 text-center">Admin Demo Account:</p>
        <div className="flex justify-between items-center">
          <p>StudioAdmin@gmail.com / admin123</p>
          <button 
            type="button"
            onClick={fillDemoCredentials}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            Use This
          </button>
        </div>
      </div>
    </form>
  );
};

export default AdminLoginForm;
