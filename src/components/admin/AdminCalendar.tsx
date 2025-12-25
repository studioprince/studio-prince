import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, addDays, startOfDay, isWithinInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Booking } from '@/services/database';
import { Clock, MapPin, User, AlertCircle, CalendarDays } from 'lucide-react';

// Extended type compatible with the one in AdminDashboard
interface AdminBooking extends Booking {
    _id?: string;
    bookingType?: 'shoot' | 'studio';
}

interface AdminCalendarProps {
    bookings: AdminBooking[];
}

const AdminCalendar = ({ bookings }: AdminCalendarProps) => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [viewMode, setViewMode] = useState<'shoot' | 'studio'>('shoot');

    // Filter bookings based on view mode
    const filteredBookings = bookings.filter(booking => {
        if (viewMode === 'studio') {
            return booking.serviceType?.includes('Rental') || booking.bookingType === 'studio';
        } else {
            return !booking.serviceType?.includes('Rental') && booking.bookingType !== 'studio';
        }
    });

    // Create a set of dates that have bookings for quick lookup
    const bookedDays = filteredBookings.map((booking) => {
        try {
            return new Date(booking.date);
        } catch (e) {
            return null;
        }
    }).filter(Boolean) as Date[];

    const bookingsOnSelectedDate = filteredBookings.filter((booking) => {
        if (!date) return false;
        try {
            // Handle both ISO strings and YYYY-MM-DD
            const bookingDate = new Date(booking.date);
            return isSameDay(bookingDate, date);
        } catch (e) {
            return false;
        }
    });

    // Calculate upcoming bookings (next 7 days)
    const upcomingBookings = filteredBookings.filter(booking => {
        try {
            const bookingDate = new Date(booking.date);
            const today = startOfDay(new Date());
            const nextWeek = addDays(today, 7);

            return isWithinInterval(bookingDate, { start: today, end: nextWeek });
        } catch (e) {
            return false;
        }
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return "bg-green-100 text-green-800 hover:bg-green-200";
            case 'pending': return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
            case 'completed': return "bg-blue-100 text-blue-800 hover:bg-blue-200";
            case 'cancelled': return "bg-red-100 text-red-800 hover:bg-red-200";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-center bg-white p-4 rounded-lg shadow-sm border">
                <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('shoot')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'shoot'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Shoot Bookings
                    </button>
                    <button
                        onClick={() => setViewMode('studio')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'studio'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Studio Rentals
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex-shrink-0 flex flex-col gap-6 md:w-[320px]">
                    <Card className="border-none shadow-none">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle>Calendar</CardTitle>
                            <CardDescription>Overview of all scheduled sessions</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border p-4 shadow-sm w-full bg-white"
                                modifiers={{
                                    booked: bookedDays
                                }}
                                modifiersClassNames={{
                                    booked: "font-bold underline text-primary aria-selected:text-primary-foreground"
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* Upcoming Events Section */}
                    <Card className="border shadow-none bg-gray-50/50">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-primary" />
                                Upcoming (7 Days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            {upcomingBookings.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingBookings.slice(0, 5).map(booking => (
                                        <div
                                            key={booking._id || booking.id}
                                            className="text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0 cursor-pointer hover:bg-gray-100/50 p-1 rounded transition-colors"
                                            onClick={() => setDate(new Date(booking.date))}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-gray-900 line-clamp-1">{booking.customerName}</span>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {format(new Date(booking.date), 'MMM d')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <span className="truncate max-w-[120px]">{booking.serviceType}</span>
                                                <span className={`px-1.5 py-0.5 rounded-[2px] text-[10px] capitalize ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {upcomingBookings.length > 5 && (
                                        <p className="text-xs text-center text-gray-400 mt-2">
                                            + {upcomingBookings.length - 5} more events
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 text-center py-4">No upcoming events.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="flex-grow">
                    <CardHeader className="px-0 pt-0 pb-6 border-b mb-6">
                        <CardTitle className="flex justify-between items-center">
                            <span className="font-playfair text-2xl">
                                {date ? format(date, 'MMMM do, yyyy') : 'Select a date'}
                            </span>
                            <Badge variant="outline" className="text-sm py-1 px-3">
                                {bookingsOnSelectedDate.length} Bookings
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            {bookingsOnSelectedDate.length > 0
                                ? `You have ${bookingsOnSelectedDate.length} session(s) scheduled for this day.`
                                : "No bookings scheduled for this date."}
                        </CardDescription>
                    </CardHeader>

                    <div className="space-y-4">
                        {bookingsOnSelectedDate.length > 0 ? (
                            bookingsOnSelectedDate.map((booking) => (
                                <Card key={booking._id || booking.id} className="overflow-hidden border transition-all hover:shadow-md">
                                    <div className={`h-full min-h-[5px] w-full ${booking.status === 'confirmed' ? 'bg-green-500' :
                                        booking.status === 'pending' ? 'bg-yellow-500' :
                                            booking.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                                        }`} />
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                                    {booking.serviceType}
                                                    <Badge className={`${getStatusColor(booking.status)} border-none`}>
                                                        {booking.status}
                                                    </Badge>
                                                </h3>
                                            </div>
                                            <div className="text-right text-sm text-gray-500 flex flex-col items-end">
                                                <span className="font-medium text-gray-900 flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {booking.time}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <User className="w-4 h-4" />
                                                <span className="font-medium text-gray-900">{booking.customerName}</span>
                                                <span className="text-gray-400">|</span>
                                                <span>{booking.phone}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="w-4 h-4" />
                                                <span>{booking.location}</span>
                                            </div>
                                        </div>

                                        {(booking.specialInstructions || booking.notes) && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600 border border-gray-100">
                                                <span className="font-semibold block mb-1">Notes:</span>
                                                {booking.specialInstructions || booking.notes}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed text-gray-500">
                                <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p>No conflicts or bookings found for this date.</p>
                                <p className="text-sm mt-1">Enjoy your free time!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCalendar;
