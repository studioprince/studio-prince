
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Check, AlertCircle } from 'lucide-react';

const ProfileSetup = () => {
  const { user, isLoading, updateProfile, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '+91 ',
  });

  useEffect(() => {
    // If user data is loaded, pre-fill the form
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '+91 ',
      });
    }
  }, [user]);

  useEffect(() => {
    // If user isn't logged in, redirect to auth
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [isLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) return;

      const success = await updateProfile({
        name: formData.name,
        phone: formData.phone
      });

      if (success) {
        toast({ title: "Profile Updated", description: "Your details have been saved." });
        // Don't auto-redirect if not verified? 
        // For now, allow redirect if profile is "completed" (saved).
        if (user.verified) {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Profile setup error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOTP = async () => {
    const success = await sendOTP();
    if (success) setOtpSent(true);
  };

  const handleVerifyOTP = async () => {
    setIsVerifying(true);
    const success = await verifyOTP(otp);
    setIsVerifying(false);
    if (success) {
      setOtpSent(false);
      setOtp('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="container-custom max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-playfair font-semibold">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 mt-2">
            Please verify your email and complete your details.
          </p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm space-y-8">
          {/* Email Verification Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Verification
            </h3>

            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="text-sm text-gray-700">Email: <strong>{user?.email}</strong></p>
              <div className="flex items-center gap-2 mt-2">
                Status:
                {user?.verified ? (
                  <span className="text-green-600 font-bold flex items-center gap-1">
                    <Check className="h-4 w-4" /> Verified
                  </span>
                ) : (
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> Not Verified
                  </span>
                )}
              </div>
            </div>

            {!user?.verified && (
              <div className="space-y-4">
                {!otpSent ? (
                  <button
                    onClick={handleSendOTP}
                    className="w-full py-2 border border-primary text-primary rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Send Verification Code
                  </button>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-center tracking-widest text-lg"
                      maxLength={6}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setOtpSent(false)}
                        className="flex-1 py-2 text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleVerifyOTP}
                        disabled={isVerifying || otp.length < 6}
                        className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {isVerifying ? 'Verifying...' : 'Verify Code'}
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 text-center">
                  Note: If you don't use real credentials, check the server console for the mock OTP.
                </p>
              </div>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Details
            </h3>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+91 9876543210"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-primary py-2.5"
              >
                {isSubmitting ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ProfileSetup;
