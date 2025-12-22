
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// import { supabase } from '@/services/supabaseClient'; // Removed Supabase import
import { useAuth } from '@/contexts/AuthContext';
import ClientOrders from '@/components/ClientOrders';
import ClientGallery from '@/components/gallery/ClientGallery';
import InvoiceList from '@/components/invoices/InvoiceList';

const Dashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+91 '
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '+91 '
      });
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Redirect if not logged in
    if (!user) {
      navigate('/auth', { state: { from: 'dashboard' } });
    }
  }, [user, navigate]);

  // Early return if no user to avoid errors
  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    try {
      await updateProfile(user.id, {
        name: formData.name,
        phone: formData.phone
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Ensure phone number starts with +91
    if (!value.startsWith('+91 ')) {
      value = '+91 ' + value.replace('+91 ', '');
    }

    setFormData(prev => ({ ...prev, phone: value }));
  };

  return (
    <main className="pt-24 pb-20">
      <div className="container-custom">
        <div className="bg-gray-50 rounded-lg p-6 mb-8 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center">
            <div className="bg-primary rounded-full p-2 mr-4">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-playfair font-semibold">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              {user.phone && <p className="text-gray-600 text-sm mt-1">{user.phone}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 inline-flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
          <Tabs defaultValue="bookings">
            <TabsList className="mb-6">
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="galleries">My Galleries</TabsTrigger>
              <TabsTrigger value="invoices">My Invoices</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings">
              <ClientOrders />
            </TabsContent>

            <TabsContent value="galleries">
              <ClientGallery />
            </TabsContent>

            <TabsContent value="invoices">
              <InvoiceList />
            </TabsContent>

            <TabsContent value="profile">
              <div className="max-w-lg mx-auto">
                <h2 className="text-xl font-playfair font-semibold mb-6">Your Profile</h2>

                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleProfileUpdate}
                      className="btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
