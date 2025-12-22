import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, ArrowLeft, Plus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/services/database';

const AdminInvoices = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Using any to handle both local and mongoDB user objects flexbily
    const [clients, setClients] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [selectedClientId, setSelectedClientId] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');

    // Booking linking
    const [bookings, setBookings] = useState<any[]>([]);
    const [clientBookings, setClientBookings] = useState<any[]>([]);
    const [selectedBookingId, setSelectedBookingId] = useState('');

    useEffect(() => {
        const fetchClientsAndBookings = async () => {
            if (!token) return;
            try {
                // Fetch clients
                const clientsRes = await fetch('/api/users?role=client', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (clientsRes.ok) {
                    const data = await clientsRes.json();
                    setClients(data);
                }

                // Fetch bookings (using admin role to get all)
                const bookingsRes = await fetch('/api/bookings?role=admin');
                if (bookingsRes.ok) {
                    const data = await bookingsRes.json();
                    setBookings(data);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchClientsAndBookings();
    }, [token]);

    // Filter bookings when client is selected
    useEffect(() => {
        if (selectedClientId && bookings.length > 0) {
            // Filter bookings where userId matches selectedClientId
            // Note: Booking userId might be string, compare safely
            const filtered = bookings.filter(b =>
                b.userId === selectedClientId ||
                (b.userId && b.userId.toString() === selectedClientId)
            );
            setClientBookings(filtered);
        } else {
            setClientBookings([]);
        }
        setSelectedBookingId(''); // Reset booking selection on client change
    }, [selectedClientId, bookings]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedClientId || !amount || !description || !dueDate) {
            toast({
                title: "Validation Error",
                description: "Please fill in all fields",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const invoiceData = {
                userId: selectedClientId,
                bookingId: selectedBookingId || undefined, // Add booking ID if selected
                adminName: user?.name, // Add admin name
                amount: parseFloat(amount),
                description,
                dueDate: new Date(dueDate).toISOString(),
                items: [{
                    description,
                    quantity: 1,
                    unitPrice: parseFloat(amount),
                    total: parseFloat(amount)
                }]
            };

            const response = await fetch('/api/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(invoiceData)
            });

            if (response.ok) {
                toast({
                    title: "Invoice Sent",
                    description: "Invoice created and sent to client successfully."
                });
                // Reset form
                setAmount('');
                setDescription('');
                setDueDate('');
                setSelectedClientId('');
                setSelectedBookingId('');
            } else {
                throw new Error('Failed to create invoice');
            }
        } catch (error) {
            console.error("Error creating invoice:", error);
            toast({
                title: "Error",
                description: "Failed to create invoice",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="pt-24 pb-20 container-custom relative">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-3xl font-playfair font-bold">Manage Invoices</h1>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 inline-flex items-center gap-1"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 border">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Create New Invoice
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Client
                                </label>
                                <select
                                    value={selectedClientId}
                                    onChange={(e) => setSelectedClientId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                    required
                                >
                                    <option value="">-- Select a client --</option>
                                    {clients.map(client => (
                                        <option key={client.id || client._id} value={client._id || client.id}>
                                            {client.name} ({client.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Booking Selection (Optional) */}
                            {selectedClientId && clientBookings.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Link to Booking (Optional)
                                    </label>
                                    <select
                                        value={selectedBookingId}
                                        onChange={(e) => setSelectedBookingId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                    >
                                        <option value="">-- No specific booking --</option>
                                        {clientBookings.map(booking => (
                                            <option key={booking._id || booking.id} value={booking._id || booking.id}>
                                                {booking.serviceType} on {booking.date} (#{booking._id?.slice(-4) || booking.id?.slice(-4)})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Linking a booking helps organize records.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description / Service
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g. Wedding Photography Package"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-3 bg-primary text-white rounded-md hover:opacity-90 transition-opacity font-medium w-full md:w-auto flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Send Invoice
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="md:col-span-1">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-800 mb-2">How this works</h3>
                        <p className="text-sm text-blue-600 mb-4">
                            When you create an invoice here, it will instantly appear in the selected client's "My Invoices" tab.
                        </p>
                        <h3 className="font-semibold text-blue-800 mb-2">Available Clients</h3>
                        <p className="text-sm text-blue-600 mb-4">
                            You currently have {clients.length} registered clients.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AdminInvoices;
