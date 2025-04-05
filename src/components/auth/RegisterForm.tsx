
import { useState, useContext } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/App';

interface RegisterFormProps {
  onSuccess: () => void;
  switchToLogin: () => void;
}

const RegisterForm = ({ onSuccess, switchToLogin }: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useContext(AuthContext);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Mock registration - in a real app, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Create a new user object
      const newUser = {
        id: `user-${Date.now()}`, // Generate a unique ID
        name: formData.name,
        email: formData.email,
        role: 'client' as const, // New users are always clients
      };
      
      // Log the user in
      login(newUser);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. Welcome to Studio Prince!",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="John Doe"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="your@email.com"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
            required
            minLength={8}
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
        <p className="text-xs text-gray-500 mt-1">
          Password must be at least 8 characters long
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="••••••••"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
          I agree to the{" "}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </label>
      </div>

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{" "}
        <button
          type="button"
          onClick={switchToLogin}
          className="text-primary font-semibold hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;
