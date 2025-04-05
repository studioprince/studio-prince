
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Settings, User } from 'lucide-react';
import AdminOrders from '@/components/AdminOrders';
import ClientOrders from '@/components/ClientOrders';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/App';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    navigate('/');
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
              <p className="text-sm bg-gray-200 rounded px-2 py-0.5 inline-block mt-1">
                {user.role === 'admin' ? 'Administrator' : 'Client'}
              </p>
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

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {user.role === 'admin' ? (
            <div className="p-6">
              <AdminOrders />
            </div>
          ) : (
            <div className="p-6">
              <Tabs defaultValue="bookings">
                <TabsList className="mb-6">
                  <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                </TabsList>
                <TabsContent value="bookings">
                  <ClientOrders />
                </TabsContent>
                <TabsContent value="profile">
                  <div className="max-w-lg mx-auto">
                    <h2 className="text-xl font-playfair font-semibold mb-6">Your Profile</h2>
                    
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                          Full Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          defaultValue={user.name}
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
                          defaultValue={user.email}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1">
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          defaultValue=""
                          placeholder="(555) 123-4567"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div className="pt-4">
                        <button
                          type="button"
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
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
