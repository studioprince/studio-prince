
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Users, Award } from 'lucide-react';

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-black overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581591524425-c7e0978865fc?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3" 
            alt="Professional Photography" 
            className="w-full h-full object-cover opacity-70"
          />
        </div>

        {/* Hero Content */}
        <div className="container-custom relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-6 fade-in" style={{ animationDelay: '0.2s' }}>
            Capturing Life's<br />Precious Moments
          </h1>
          <p className="max-w-xl mx-auto text-lg md:text-xl opacity-90 mb-8 fade-in" style={{ animationDelay: '0.4s' }}>
            Professional photography services for weddings, events, portraits, and more.
          </p>
          <div className="fade-in" style={{ animationDelay: '0.6s' }}>
            <Link 
              to="/booking" 
              className="btn-primary inline-flex items-center"
            >
              Book a Session
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            <div className="w-full md:w-1/2 relative">
              <img 
                src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Professional Photographer" 
                className="rounded-md shadow-xl w-full h-[600px] object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-black p-6 rounded shadow-lg hidden md:block">
                <p className="text-white font-playfair">
                  <span className="block text-3xl font-semibold">10+</span>
                  <span className="text-sm">Years Experience</span>
                </p>
              </div>
            </div>
            
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-playfair mb-6">Meet Studio Prince</h2>
              <p className="text-gray-600 mb-6">
                Studio Prince is a premier photography studio dedicated to capturing life's most meaningful moments with artistry and precision. 
                With over a decade of experience, our team has mastered the art of storytelling through imagery.
              </p>
              <p className="text-gray-600 mb-8">
                We believe that photographs are more than just pictures – they're timeless treasures that preserve your most cherished memories. 
                Our approach combines technical excellence with a creative eye to deliver stunning, emotion-filled photographs.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-secondary rounded-full p-4 mb-3">
                    <Camera size={24} className="text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Premium Quality</h3>
                  <p className="text-sm text-gray-600">High-resolution professional images</p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-secondary rounded-full p-4 mb-3">
                    <Users size={24} className="text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Client Focused</h3>
                  <p className="text-sm text-gray-600">Personalized photography experience</p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-secondary rounded-full p-4 mb-3">
                    <Award size={24} className="text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Award Winning</h3>
                  <p className="text-sm text-gray-600">Recognized photography excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-playfair font-semibold mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer a wide range of professional photography services to capture your special moments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Wedding Photography */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1537907510278-8132afdafde4?q=80&w=1376&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Wedding Photography" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="font-playfair text-xl mb-2">Wedding Photography</h3>
                <p className="text-gray-600 mb-4">
                  Capturing the magic and emotion of your special day with timeless elegance.
                </p>
                <Link 
                  to="/portfolio?category=wedding" 
                  className="text-primary font-medium inline-flex items-center"
                >
                  View Gallery
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
            
            {/* Portrait Photography */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Portrait Photography" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="font-playfair text-xl mb-2">Portrait Photography</h3>
                <p className="text-gray-600 mb-4">
                  Professional portraits that capture personality and create lasting impressions.
                </p>
                <Link 
                  to="/portfolio?category=portrait" 
                  className="text-primary font-medium inline-flex items-center"
                >
                  View Gallery
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
            
            {/* Event Photography */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Event Photography" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="font-playfair text-xl mb-2">Event Photography</h3>
                <p className="text-gray-600 mb-4">
                  Documenting your special events with a keen eye for meaningful moments.
                </p>
                <Link 
                  to="/portfolio?category=event" 
                  className="text-primary font-medium inline-flex items-center"
                >
                  View Gallery
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/booking" className="btn-secondary">
              Book Your Session
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 bg-black text-white">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1506241537529-eefea1fbe44d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3" 
            alt="Photography Equipment" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-playfair font-semibold mb-6">Ready to Create Beautiful Memories?</h2>
          <p className="max-w-xl mx-auto mb-8 text-lg">
            Contact us today to discuss your photography needs and book your session.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-primary">
              Contact Us
            </Link>
            <Link to="/portfolio" className="btn-secondary border-white text-white hover:bg-white hover:text-black">
              Explore Our Work
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
