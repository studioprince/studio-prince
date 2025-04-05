
import { useState } from 'react';
import { Eye, Check, X, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for demo purposes
const mockOrders = [
  {
    id: '1',
    customerName: 'Emily Johnson',
    email: 'emily@example.com',
    serviceType: 'Wedding Photography',
    date: '2025-06-15',
    time: '14:00',
    location: 'Grand Plaza Hotel',
    status: 'pending',
    requestDate: '2025-04-02',
  },
  {
    id: '2',
    customerName: 'Michael Smith',
    email: 'michael@example.com',
    serviceType: 'Portrait Session',
    date: '2025-04-20',
    time: '10:00',
    location: 'Studio',
    status: 'confirmed',
    requestDate: '2025-03-28',
  },
  {
    id: '3',
    customerName: 'Sarah Williams',
    email: 'sarah@example.com',
    serviceType: 'Event Coverage',
    date: '2025-05-05',
    time: '18:00',
    location: 'City Convention Center',
    status: 'completed',
    requestDate: '2025-03-15',
  },
  {
    id: '4',
    customerName: 'Robert Davis',
    email: 'robert@example.com',
    serviceType: 'Product Photography',
    date: '2025-04-12',
    time: '09:30',
    location: 'Studio',
    status: 'pending',
    requestDate: '2025-04-01',
  },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<(typeof mockOrders)[0] | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const viewOrderDetails = (order: typeof mockOrders[0]) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const updateOrderStatus = (id: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    // Update local state
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
    
    // Close modal
    setSelectedOrder(null);
    
    // Show success toast
    toast({
      title: "Status updated",
      description: `Order #${id} has been marked as ${newStatus}.`,
    });
  };

  // Helper for status badge styling
  const getStatusBadgeClasses = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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
        <h2 className="text-xl font-playfair font-semibold">Client Bookings</h2>
        
        {/* Filter buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              filterStatus === 'all' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1 text-sm rounded-md ${
              filterStatus === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-100'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('confirmed')}
            className={`px-3 py-1 text-sm rounded-md ${
              filterStatus === 'confirmed' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1 text-sm rounded-md ${
              filterStatus === 'completed' ? 'bg-green-200 text-green-800' : 'bg-gray-100'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
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
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.serviceType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()} at {order.time}
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
                  No bookings found matching the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Booking Details</h3>
              <button 
                onClick={closeOrderDetails}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Customer Information</h4>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                  <p className="text-gray-600">{selectedOrder.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Booking Status</h4>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Service</h4>
                  <p>{selectedOrder.serviceType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Request Date</h4>
                  <p>{new Date(selectedOrder.requestDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Scheduled Date & Time</h4>
                  <p>{new Date(selectedOrder.date).toLocaleDateString()} at {selectedOrder.time}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Location</h4>
                  <p>{selectedOrder.location}</p>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="border-t pt-4 flex flex-wrap gap-2">
                {selectedOrder.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 text-sm"
                    >
                      Cancel Booking
                    </button>
                  </>
                )}
                
                {selectedOrder.status === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Mark as Completed
                  </button>
                )}
                
                <button
                  onClick={closeOrderDetails}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm ml-auto"
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

export default AdminOrders;
