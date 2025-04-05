
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Clock, Check, X } from 'lucide-react';
import { AuthContext } from '@/App';
import { dbService, Booking } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

const ClientOrders = () => {
  const [orders, setOrders] = useState<Booking[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Booking | null>(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  // Load orders for this user
  useEffect(() => {
    if (user) {
      // Get user's bookings from database
      const userOrders = dbService.getBookingsByUserId(user.id);
      setOrders(userOrders);
    }
  }, [user]);

  const viewOrderDetails = (order: Booking) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const handleNewBooking = () => {
    navigate('/booking');
  };

  const handleCancelBooking = (id: string) => {
    const updatedBooking = dbService.updateBookingStatus(id, 'cancelled');
    
    if (updatedBooking) {
      // Update local state
      setOrders(orders.map(order => 
        order.id === id ? updatedBooking : order
      ));
      
      // Close modal
      setSelectedOrder(null);
      
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully."
      });
    }
  };

  // Helper for status badge styling
  const getStatusBadgeClasses = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <Check className="h-4 w-4" />;
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-playfair font-semibold">Your Bookings</h2>
        <button
          onClick={handleNewBooking}
          className="btn-primary text-sm py-2"
        >
          New Booking
        </button>
      </div>
      
      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.serviceType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()} at {order.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="text-primary hover:text-primary-dark inline-flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  You don't have any bookings yet. Make your first booking now!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {orders.length === 0 && (
        <div className="mt-8 text-center">
          <p className="mb-4">Ready to capture your special moments?</p>
          <button
            onClick={handleNewBooking}
            className="btn-secondary"
          >
            Book Your First Session
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Booking Details</h3>
              <button 
                onClick={closeOrderDetails}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Booking ID</h4>
                <p>#{selectedOrder.id}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Service</h4>
                <p>{selectedOrder.serviceType}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h4>
                <p>{new Date(selectedOrder.date).toLocaleDateString()} at {selectedOrder.time}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                <p>{selectedOrder.location}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Request Date</h4>
                <p>{new Date(selectedOrder.requestDate).toLocaleDateString()}</p>
              </div>
              
              {selectedOrder.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                  <p className="text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}
              
              <div className="pt-4 border-t flex justify-between">
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => handleCancelBooking(selectedOrder.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                  >
                    Cancel Booking
                  </button>
                )}
                <button
                  onClick={closeOrderDetails}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientOrders;
