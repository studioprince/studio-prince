import { useState } from 'react';
import { Camera, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive"
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters",
                variant: "destructive"
            });
            return;
        }

        if (!token) {
            toast({
                title: "Error",
                description: "Invalid or missing reset token",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                toast({
                    title: "Success",
                    description: "Your password has been reset successfully."
                });
                setTimeout(() => navigate('/auth'), 3000);
            } else {
                throw new Error(data.message || 'Failed to reset password');
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token && !isSuccess) {
        return (
            <main className="min-h-screen pt-24 pb-12 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl font-bold mb-4">Invalid Link</h1>
                    <p className="text-gray-600 mb-4">This password reset link is invalid or missing the token.</p>
                    <Link to="/auth" className="btn-primary">Back to Login</Link>
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
                        Set New Password
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Please enter your new password below.
                    </p>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
                    {!isSuccess ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-1">
                                    New Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Minimum 6 characters"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Repeat new password"
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary"
                            >
                                {isLoading ? "Resetting..." : "Set New Password"}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
                                Password changed successfully! Redirecting to login...
                            </div>
                            <Link to="/auth" className="btn-primary w-full block">
                                Go to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ResetPassword;
