
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CategoryFilter from '@/components/CategoryFilter';
import PortfolioGallery, { GalleryImage } from '@/components/PortfolioGallery';

// Sample categories and images, would be fetched from API/database in production
const categories = [
  { id: 'wedding', name: 'Wedding' },
  { id: 'portrait', name: 'Portrait' },
  { id: 'event', name: 'Event' },
  { id: 'product', name: 'Product' },
];

// Updated image URLs to ensure all images are available
const galleryImages: GalleryImage[] = [
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1537907510278-8132afdafde4?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
    alt: 'Wedding photography',
    category: 'wedding',
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3',
    alt: 'Wedding couple',
    category: 'wedding',
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
    alt: 'Wedding details',
    category: 'wedding',
  },
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3',
    alt: 'Portrait of woman',
    category: 'portrait',
  },
  {
    id: '5',
    src: 'https://images.unsplash.com/photo-1605032644543-213ba617e941?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3',
    alt: 'Male portrait',
    category: 'portrait',
  },
  {
    id: '6',
    src: 'https://images.unsplash.com/photo-1611095973763-414019e72400?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3',
    alt: 'Family portrait',
    category: 'portrait',
  },
  {
    id: '7',
    src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3',
    alt: 'Corporate event',
    category: 'event',
  },
  {
    id: '8',
    src: 'https://images.unsplash.com/photo-1540317580384-e5d43867cfd4?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3',
    alt: 'Conference event',
    category: 'event',
  },
  {
    id: '9',
    src: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
    alt: 'Party event',
    category: 'event',
  },
  {
    id: '10',
    src: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1284&auto=format&fit=crop&ixlib=rb-4.0.3',
    alt: 'Product photography',
    category: 'product',
  },
  {
    id: '11',
    src: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1315&auto=format&fit=crop&ixlib=rb-4.0.3',
    alt: 'Product on white background',
    category: 'product',
  },
  {
    id: '12',
    src: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
    alt: 'Jewelry product photography',
    category: 'product',
  }
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Check if there's a category query parameter
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    
    if (categoryParam && categories.some(cat => cat.id === categoryParam)) {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory('all');
    }
  }, [location.search]);

  return (
    <main className="pt-24">
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-playfair font-semibold mb-4">Our Portfolio</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse through our collection of professional photography across various categories.
            </p>
          </div>

          <CategoryFilter 
            categories={categories} 
            activeCategory={activeCategory} 
            onSelectCategory={setActiveCategory} 
          />

          <PortfolioGallery 
            images={galleryImages} 
            filter={activeCategory} 
          />
        </div>
      </section>
    </main>
  );
};

export default Portfolio;
