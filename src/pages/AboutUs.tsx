
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Camera, Users } from 'lucide-react';

const AboutUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="pt-24">
      {/* Header */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-playfair font-semibold mb-4">About Studio Prince</h1>
          <p className="max-w-2xl mx-auto">
            Capturing life's most precious moments with artistic excellence since 2015
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="section">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-playfair mb-6">Our Story</h2>
              <p className="text-gray-600 mb-6">
                Studio Prince was founded by award-winning photographer Michael Prince with a vision to create 
                timeless photographic art that captures the essence of special moments. What began as a passion 
                project quickly evolved into one of the region's most sought-after photography studios.
              </p>
              <p className="text-gray-600 mb-6">
                Over the past decade, we've had the privilege of documenting thousands of weddings, events, 
                portraits, and commercial projects. Each photograph we take tells a unique story, preserving 
                memories that will be cherished for generations.
              </p>
              <p className="text-gray-600">
                Our approach combines technical excellence with artistic vision, allowing us to create 
                images that are both beautiful and meaningful. We believe that great photography is about 
                capturing authentic moments and emotions, not just poses.
              </p>
            </div>
            <div className="w-full md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1552168324-d612d77725e3?q=80&w=1376&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Photography Studio" 
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-playfair mb-12 text-center">Meet Our Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Michael Prince" 
                className="w-40 h-40 object-cover rounded-full mx-auto mb-4"
              />
              <h3 className="font-playfair text-xl mb-1">Michael Prince</h3>
              <p className="text-gray-500 mb-3">Founder & Lead Photographer</p>
              <p className="text-gray-600 text-sm">
                With over 15 years of experience, Michael specializes in wedding and portrait photography.
              </p>
            </div>
            
            {/* Team Member 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <img 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="Sarah Johnson" 
                className="w-40 h-40 object-cover rounded-full mx-auto mb-4"
              />
              <h3 className="font-playfair text-xl mb-1">Sarah Johnson</h3>
              <p className="text-gray-500 mb-3">Senior Photographer</p>
              <p className="text-gray-600 text-sm">
                Sarah's eye for detail and composition makes her an expert in event and product photography.
              </p>
            </div>
            
            {/* Team Member 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3" 
                alt="David Kim" 
                className="w-40 h-40 object-cover rounded-full mx-auto mb-4"
              />
              <h3 className="font-playfair text-xl mb-1">David Kim</h3>
              <p className="text-gray-500 mb-3">Creative Director</p>
              <p className="text-gray-600 text-sm">
                David brings his artistic vision to ensure every project exceeds client expectations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="section">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-playfair mb-12 text-center">Our Process</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-secondary rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-semibold">1</span>
              </div>
              <h3 className="font-medium mb-2">Consultation</h3>
              <p className="text-gray-600 text-sm">
                We begin with understanding your vision and requirements
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-secondary rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-semibold">2</span>
              </div>
              <h3 className="font-medium mb-2">Planning</h3>
              <p className="text-gray-600 text-sm">
                Detailed planning ensures we capture all important moments
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-secondary rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-semibold">3</span>
              </div>
              <h3 className="font-medium mb-2">Photo Session</h3>
              <p className="text-gray-600 text-sm">
                Professional photography with attention to detail
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-secondary rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-semibold">4</span>
              </div>
              <h3 className="font-medium mb-2">Delivery</h3>
              <p className="text-gray-600 text-sm">
                Professionally edited photos delivered in your preferred format
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-playfair mb-8 text-center">Awards & Recognition</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="text-center">
              <div className="bg-primary rounded-full p-4 mb-3 inline-block">
                <Award size={32} className="text-white" />
              </div>
              <h3 className="font-medium mb-1">Best Wedding Photography Studio</h3>
              <p className="text-gray-600 text-sm">Regional Photography Awards, 2023</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary rounded-full p-4 mb-3 inline-block">
                <Camera size={32} className="text-white" />
              </div>
              <h3 className="font-medium mb-1">Excellence in Portrait Photography</h3>
              <p className="text-gray-600 text-sm">National Photography Association, 2022</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary rounded-full p-4 mb-3 inline-block">
                <Users size={32} className="text-white" />
              </div>
              <h3 className="font-medium mb-1">Top 10 Photography Studios</h3>
              <p className="text-gray-600 text-sm">Professional Photography Magazine, 2021</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gray-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-playfair mb-6">Ready to Work With Us?</h2>
          <p className="max-w-2xl mx-auto mb-8">
            Let's create beautiful memories together. Contact us today to discuss your photography needs or book a session.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/booking" className="btn-primary">
              Book a Session
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

export default AboutUs;
