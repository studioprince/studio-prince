
import { useState, useContext } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/App';

interface LoginFormProps {
  onSuccess: () => void;
  switchToRegister: () => void;
}

// Mock users for demo
const MOCK_USERS = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin' as const
  },
  {
    id: '2',
    name: 'Jane Client',
    email: 'client@example.com',
    password: 'password123',
    role: 'client' as const
  }
];

const LoginForm = ({ onSuccess, switchToRegister }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock login - in a real app, this would call an authentication API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find user with matching credentials
      const user = MOCK_USERS.find(
        u => u.email === email && u.password === password
      );

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Login successful
      const { password: _, ...userData } = user;
      login(userData);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="your@email.com"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Demo: admin@example.com or client@example.com
        </p>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Demo password: password123
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
            Remember me
          </label>
        </div>
        
        <a
          href="#"
          className="text-sm text-primary hover:underline"
          onClick={(e) => e.preventDefault()}
        >
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-gray-600 mt-6">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={switchToRegister}
          className="text-primary font-semibold hover:underline"
        >
          Register
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
