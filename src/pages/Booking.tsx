
import { useEffect } from 'react';
import BookingForm from '@/components/BookingForm';

const Booking = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="pt-24">
      {/* Booking Header */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-playfair font-semibold mb-4">Book a Session</h1>
          <p className="max-w-2xl mx-auto">
            Fill out the form below to request a photography session with Studio Prince.
          </p>
        </div>
      </section>

      {/* Admin Instructions Alert */}
      <section className="section bg-blue-50">
        <div className="container-custom max-w-4xl">
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
            <h3 className="font-semibold text-blue-800 mb-2">How the booking system works:</h3>
            <ol className="list-decimal pl-5 text-blue-700 space-y-1">
              <li>Client fills out and submits this booking form</li>
              <li>The booking gets stored in the system with "Pending" status</li>
              <li>Admin logs in with <strong>aditya@admin.com / 123</strong> to view all booking requests</li>
              <li>Admin can confirm, cancel or mark bookings as completed from the dashboard</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="section">
        <div className="container-custom max-w-4xl">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
            <BookingForm />
          </div>
          
          <div className="mt-12 text-center text-gray-600">
            <p>
              If you prefer to book by phone, you can also call us at{' '}
              <a href="tel:+15551234567" className="text-primary font-semibold">
                (555) 123-4567
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section bg-gray-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-playfair font-semibold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Common questions about our booking process and photography services
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">How far in advance should I book?</h3>
              <p className="text-gray-600">
                We recommend booking at least 4-6 weeks in advance for portrait sessions and 6-12 months 
                in advance for weddings to ensure availability. However, we do accommodate last-minute 
                bookings when our schedule permits.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">What is your cancellation policy?</h3>
              <p className="text-gray-600">
                We understand that plans change. For portrait sessions, we request at least 48 hours' 
                notice for cancellations or rescheduling. For weddings and events, our policy varies 
                based on the agreement, but typically requires 30 days' notice.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Do you require a deposit?</h3>
              <p className="text-gray-600">
                Yes, we require a non-refundable deposit to secure your booking date. The deposit amount 
                varies depending on the service. The remaining balance is due before or on the day of 
                the photography session.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">How long until I receive my photos?</h3>
              <p className="text-gray-600">
                Delivery time varies by service. Typically, portrait sessions are delivered within 1-2 weeks, 
                while weddings and larger events can take 4-6 weeks. We provide a few preview images sooner 
                so you can share while waiting for the full gallery.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Booking;
