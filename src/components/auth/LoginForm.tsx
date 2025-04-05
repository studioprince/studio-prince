
import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '@/App';
import { dbService } from '@/services/database';

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
    
    // Login user using our database service
    const user = dbService.loginUser(email, password);
    
    if (user) {
      login(user);
      onSuccess();
    }
    
    setIsLoading(false);
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
        <p className="font-medium mb-1">Demo accounts:</p>
        <p>Admin: aditya@admin.com / 123</p>
        <p>Client: omkar@client.com / 123</p>
      </div>
    </form>
  );
};

export default LoginForm;
