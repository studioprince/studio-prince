
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Change navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-white shadow-md py-3' 
          : 'bg-transparent py-6'
      )}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="font-playfair font-semibold text-2xl tracking-wider"
        >
          STUDIO PRINCE
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={cn("nav-link uppercase text-sm", 
              isActive('/') && "text-accent"
            )}
          >
            Home
          </Link>
          <Link 
            to="/portfolio" 
            className={cn("nav-link uppercase text-sm", 
              isActive('/portfolio') && "text-accent"
            )}
          >
            Portfolio
          </Link>
          <Link 
            to="/booking" 
            className={cn("nav-link uppercase text-sm", 
              isActive('/booking') && "text-accent"
            )}
          >
            Book Now
          </Link>
          <Link 
            to="/contact" 
            className={cn("nav-link uppercase text-sm", 
              isActive('/contact') && "text-accent"
            )}
          >
            Contact
          </Link>
          <Link
            to="/auth"
            className="ml-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Account"
          >
            <User size={18} />
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="container-custom py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className={cn("py-2 px-4 text-center", 
                isActive('/') && "text-accent"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/portfolio" 
              className={cn("py-2 px-4 text-center", 
                isActive('/portfolio') && "text-accent"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Portfolio
            </Link>
            <Link 
              to="/booking" 
              className={cn("py-2 px-4 text-center", 
                isActive('/booking') && "text-accent"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Now
            </Link>
            <Link 
              to="/contact" 
              className={cn("py-2 px-4 text-center", 
                isActive('/contact') && "text-accent"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              to="/auth" 
              className="py-2 px-4 text-center flex justify-center items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User size={18} />
              <span>Account</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
