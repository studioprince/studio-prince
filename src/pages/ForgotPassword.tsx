import { useState } from 'react';
import { Camera, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setEmailSent(true);
                toast({
                    title: "Reset link sent",
                    description: "Check your email for the password reset link."
                });
            } else {
                throw new Error(data.message || 'Failed to send reset link');
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
                        Reset Password
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Enter your email to receive a password reset link.
                    </p>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
                    {!emailSent ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-1">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="your@email.com"
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary"
                            >
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
                                Password reset link has been sent to <strong>{email}</strong>.
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                                If you don't receive the email within a few minutes, please check your spam folder.
                            </p>
                            <button
                                onClick={() => setEmailSent(false)}
                                className="text-primary hover:underline text-sm"
                            >
                                Try a different email
                            </button>
                        </div>
                    )}
                </div>

                <div className="text-center mt-6">
                    <Link to="/auth" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default ForgotPassword;
