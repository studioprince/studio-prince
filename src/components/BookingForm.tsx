
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types for form data
interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  date: string;
  time: string;
  location: string;
  specialInstructions: string;
}

// Initial form state
const initialFormState: BookingFormData = {
  name: '',
  email: '',
  phone: '',
  serviceType: '',
  date: '',
  time: '',
  location: '',
  specialInstructions: '',
};

const BookingForm = () => {
  const [formData, setFormData] = useState<BookingFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulating API call
    setTimeout(() => {
      // Success toast
      toast({
        title: "Booking Request Submitted",
        description: "We'll review your request and get back to you soon!",
      });

      // Reset form
      setFormData(initialFormState);
      setIsSubmitting(false);

      // Redirect to login/register if user is not authenticated
      navigate('/auth', { 
        state: { from: 'booking', message: 'Create an account to track your booking' }
      });
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="font-playfair text-xl">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="john@example.com"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone Number *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      {/* Booking Details */}
      <div className="space-y-4">
        <h3 className="font-playfair text-xl">Booking Details</h3>
        
        <div>
          <label htmlFor="serviceType" className="block text-sm font-medium mb-1">
            Service Type *
          </label>
          <select
            id="serviceType"
            name="serviceType"
            required
            value={formData.serviceType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a service</option>
            <option value="wedding">Wedding Photography</option>
            <option value="portrait">Portrait Session</option>
            <option value="event">Event Coverage</option>
            <option value="product">Product Photography</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Preferred Date *
            </label>
            <div className="relative">
              <input
                id="date"
                name="date"
                type="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label htmlFor="time" className="block text-sm font-medium mb-1">
              Preferred Time
            </label>
            <input
              id="time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">
            Location *
          </label>
          <input
            id="location"
            name="location"
            type="text"
            required
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Event location or 'Studio' for in-studio sessions"
          />
        </div>
        
        <div>
          <label htmlFor="specialInstructions" className="block text-sm font-medium mb-1">
            Special Instructions
          </label>
          <textarea
            id="specialInstructions"
            name="specialInstructions"
            rows={4}
            value={formData.specialInstructions}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Any special requests or information we should know..."
          />
        </div>
      </div>

      {/* Notes and Submit */}
      <div className="bg-blue-50 p-4 rounded-md flex items-start">
        <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
        <p className="text-sm text-blue-700">
          After submitting your booking request, we'll get back to you within 24 hours to confirm 
          availability and discuss any additional details.
        </p>
      </div>
      
      <button
        type="submit"
        className="btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Submit Booking Request"}
      </button>
    </form>
  );
};

export default BookingForm;
