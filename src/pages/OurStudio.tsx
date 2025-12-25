
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Wifi, Coffee, Zap } from 'lucide-react';

const OurStudio = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="pt-24">
      {/* Header */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-playfair font-semibold mb-4">Our Studio</h1>
          <p className="max-w-2xl mx-auto">
            A state-of-the-art creative space designed for professional photography and videography
          </p>
        </div>
      </section>

      {/* Studio Info */}
      <section className="section">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-playfair mb-6">The Space</h2>
              <p className="text-gray-600 mb-6">
                Located in the heart of the city, our 1,500 sq ft studio offers a versatile environment for all your creative needs. 
                With 14ft high ceilings and ample natural light, it's the perfect canvas for your next project.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <Zap size={20} />
                  </div>
                  <span className="text-sm font-medium">Profoto Lighting</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <Wifi size={20} />
                  </div>
                  <span className="text-sm font-medium">High-Speed WiFi</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <Coffee size={20} />
                  </div>
                  <span className="text-sm font-medium">Lounge & Kitchenette</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <MapPin size={20} />
                  </div>
                  <span className="text-sm font-medium">Central Location</span>
                </div>
              </div>
              <p className="text-gray-600">
                Whether you're shooting fashion editorials, product photography, or video content, 
                our studio provides the professional amenities and privacy you require.
              </p>
            </div>
            <div className="w-full md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1590959651373-a3db0f38a961?q=80&w=1039&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Studio Interior" 
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery/Images Grid */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-playfair mb-12 text-center">Studio Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="overflow-hidden rounded-lg shadow-sm group">
               <img 
                 src="https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3" 
                 alt="Cyclorama Wall" 
                 className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
               />
               <div className="p-4 bg-white">
                 <h3 className="font-playfair text-lg">Cyclorama Wall</h3>
               </div>
             </div>
             <div className="overflow-hidden rounded-lg shadow-sm group">
               <img 
                 src="https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3" 
                 alt="Makeup Area" 
                 className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
               />
               <div className="p-4 bg-white">
                 <h3 className="font-playfair text-lg">Makeup Station</h3>
               </div>
             </div>
             <div className="overflow-hidden rounded-lg shadow-sm group">
               <img 
                 src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3" 
                 alt="Lounge Area" 
                 className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
               />
               <div className="p-4 bg-white">
                 <h3 className="font-playfair text-lg">Client Lounge</h3>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Location / Map */}
      <section className="section">
        <div className="container-custom">
           <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-playfair mb-4">Location</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Easily accessible with ample parking available.
            </p>
          </div>
          <div className="w-full h-[450px] bg-gray-200 rounded-lg overflow-hidden shadow-md">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d372.4220352739666!2d72.85112234210379!3d19.103732400056664!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b610e7569f09%3A0x4a60c19a8bf28119!2sstudio%20dubbing%20prince!5e0!3m2!1sen!2sin!4v1766648132326!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Studio Location"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="section bg-gray-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-playfair mb-6">Rent Our Studio</h2>
          <p className="max-w-2xl mx-auto mb-8">
            Ready to bring your vision to life? Book our studio for your next photoshoot or video production.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/booking" className="btn-primary" state={{ type: 'studio' }}>
              Book Studio Now
            </Link>
            <Link to="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-black">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default OurStudio;
