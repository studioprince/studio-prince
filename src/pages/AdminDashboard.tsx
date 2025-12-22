
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Booking as BaseBooking } from '@/services/database'; // We can keep type definition or move it
import { Eye, Check, X, LogOut, Clock, FileText, Calendar as CalendarIcon, List, Image as ImageIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminCalendar from '@/components/admin/AdminCalendar';
import AdminGalleryUpload from '@/components/admin/AdminGalleryUpload';
import { useToast } from '@/hooks/use-toast';

// Extended type for MongoDB documents
interface Booking extends BaseBooking {
    _id?: string;
    specialInstructions?: string;
    createdAt?: string | Date;
}

const AdminDashboard = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const fetchBookings = async () => {
        try {
            const response = await fetch('/api/bookings?role=admin');
            if (response.ok) {
                const data = await response.json();
                setBookings(data);
            }
        } catch (error) {
            console.error("Failed to load bookings", error);
            toast({
                title: "Error",
                description: "Failed to refresh bookings",
                variant: "destructive"
            });
        }
    };

    useEffect(() => {
        // Check admin role
        if (!user || user.role !== 'admin') {
            navigate('/auth'); // Or some access denied page
            return;
        }

        fetchBookings();
    }, [user, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            // Ensure we use the correct ID property (MongoDB usually uses _id)
            const bookingId = id;

            const response = await fetch(`/api/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                const updatedBooking = await response.json();

                // Update local state to reflect change immediately
                setBookings(prevBookings => prevBookings.map(b =>
                    (b._id === id || b.id === id) ? { ...b, status: newStatus as any } : b
                ));

                toast({
                    title: "Status Updated",
                    description: `Booking marked as ${newStatus}`,
                });
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                title: "Update Failed",
                description: "Could not update booking status",
                variant: "destructive"
            });
        }
    };

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
        <main className="pt-24 pb-20 container-custom relative">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-playfair font-bold">Admin Dashboard</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/invoices')}
                        className="text-sm px-3 py-1.5 bg-primary text-white rounded-md hover:opacity-90 inline-flex items-center gap-1"
                    >
                        <FileText className="h-4 w-4" />
                        <span>Manage Invoices</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 inline-flex items-center gap-1"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            <Tabs defaultValue="list" className="space-y-6">
                <div className="flex justify-between items-center">
                    <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            List View
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            My Calendar
                        </TabsTrigger>
                        <TabsTrigger value="gallery" className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Upload Photos
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="list" className="mt-0">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-semibold">All Bookings</h2>
                            <button
                                onClick={fetchBookings}
                                className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                            >
                                Refresh Data
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bookings.map((booking: any) => (
                                        <tr key={booking._id || booking.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                                                <div className="text-sm text-gray-500">{booking.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.serviceType}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {booking.status === 'pending' ? (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking._id || booking.id, 'confirmed')}
                                                            className="text-white bg-green-500 hover:bg-green-600 px-2 py-1 rounded text-xs"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking._id || booking.id, 'cancelled')}
                                                            className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                    <span className="sr-only">View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {bookings.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No bookings found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="calendar" className="mt-0">
                    <AdminCalendar bookings={bookings} />
                </TabsContent>

                <TabsContent value="gallery" className="mt-0">
                    <AdminGalleryUpload />
                </TabsContent>
            </Tabs>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-playfair font-semibold">Booking Details</h3>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Booking ID</h4>
                                <p>#{selectedBooking._id || selectedBooking.id}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Customer Details</h4>
                                <p className="font-medium">{selectedBooking.customerName}</p>
                                <p className="text-sm text-gray-600">{selectedBooking.email}</p>
                                <p className="text-sm text-gray-600">{selectedBooking.phone}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Service</h4>
                                <p>{selectedBooking.serviceType}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h4>
                                <p>{new Date(selectedBooking.date).toLocaleDateString()} at {selectedBooking.time}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                                <p>{selectedBooking.location}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(selectedBooking.status)}`}>
                                    {getStatusIcon(selectedBooking.status)}
                                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                                </span>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Request Date</h4>
                                <p>{selectedBooking.requestDate
                                    ? new Date(selectedBooking.requestDate).toLocaleDateString()
                                    : (selectedBooking.createdAt
                                        ? new Date(selectedBooking.createdAt).toLocaleDateString()
                                        : 'N/A')}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                                <div className="bg-gray-50 p-3 rounded-md min-h-[80px] text-sm text-gray-700 border border-gray-100">
                                    {selectedBooking.specialInstructions || selectedBooking.notes || "No notes provided."}
                                </div>
                            </div>

                            <div className="pt-4 border-t flex justify-end gap-2">
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                                >
                                    Close
                                </button>
                                {selectedBooking.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleStatusUpdate(selectedBooking._id || selectedBooking.id, 'cancelled');
                                                setSelectedBooking(null);
                                            }}
                                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleStatusUpdate(selectedBooking._id || selectedBooking.id, 'confirmed');
                                                setSelectedBooking(null);
                                            }}
                                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                        >
                                            Accept
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default AdminDashboard;
