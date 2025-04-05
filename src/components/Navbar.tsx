
import { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthContext } from '@/App';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { toast } = useToast();

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

  // Determine if we're on the homepage for styling
  const isHomepage = location.pathname === '/';
  const textColor = isHomepage && !isScrolled ? 'text-white nav-text-shadow' : '';

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

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
          className={cn(
            "font-playfair font-semibold text-2xl tracking-wider",
            textColor
          )}
        >
          STUDIO PRINCE
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={cn(
              "nav-link uppercase text-sm", 
              isHomepage && !isScrolled ? "text-white hover:text-accent nav-text-shadow" : "",
              isActive('/') && "text-accent"
            )}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={cn(
              "nav-link uppercase text-sm", 
              isHomepage && !isScrolled ? "text-white hover:text-accent nav-text-shadow" : "",
              isActive('/about') && "text-accent"
            )}
          >
            About
          </Link>
          <Link 
            to="/portfolio" 
            className={cn(
              "nav-link uppercase text-sm", 
              isHomepage && !isScrolled ? "text-white hover:text-accent nav-text-shadow" : "",
              isActive('/portfolio') && "text-accent"
            )}
          >
            Portfolio
          </Link>
          <Link 
            to="/booking" 
            className={cn(
              "nav-link uppercase text-sm", 
              isHomepage && !isScrolled ? "text-white hover:text-accent nav-text-shadow" : "",
              isActive('/booking') && "text-accent"
            )}
          >
            Book Now
          </Link>
          <Link 
            to="/contact" 
            className={cn(
              "nav-link uppercase text-sm", 
              isHomepage && !isScrolled ? "text-white hover:text-accent nav-text-shadow" : "",
              isActive('/contact') && "text-accent"
            )}
          >
            Contact
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-2">
              <Link
                to="/dashboard"
                className={cn(
                  "nav-link uppercase text-sm",
                  isHomepage && !isScrolled ? "text-white hover:text-accent nav-text-shadow" : "",
                  isActive('/dashboard') && "text-accent"
                )}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className={cn(
                  "ml-2 p-2 rounded-full transition-colors flex items-center",
                  isHomepage && !isScrolled ? "text-white hover:bg-white/20" : "hover:bg-gray-100"
                )}
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className={cn(
                "ml-2 p-2 rounded-full transition-colors",
                isHomepage && !isScrolled ? "text-white hover:bg-white/20" : "hover:bg-gray-100"
              )}
              aria-label="Account"
            >
              <User size={18} />
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={cn(
            "md:hidden p-2",
            isHomepage && !isScrolled ? "text-white nav-text-shadow" : ""
          )}
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
              to="/about" 
              className={cn("py-2 px-4 text-center", 
                isActive('/about') && "text-accent"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
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
            
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={cn("py-2 px-4 text-center", 
                    isActive('/dashboard') && "text-accent"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 px-4 text-center flex justify-center items-center gap-2"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="py-2 px-4 text-center flex justify-center items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={18} />
                <span>Account</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
