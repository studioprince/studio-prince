
import { useEffect, useState } from 'react';
import { Package, dbService } from '@/services/database';
import { Check } from 'lucide-react';

const PackageDisplay = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  
  useEffect(() => {
    const availablePackages = dbService.getPackages();
    setPackages(availablePackages);
  }, []);
  
  return (
    <section className="py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-semibold mb-4">Photography Packages</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the perfect photography package for your needs. All packages include professional editing and online gallery access.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`rounded-lg overflow-hidden border transition-shadow hover:shadow-md ${pkg.isPopular ? 'border-primary' : 'border-gray-200'}`}
            >
              {pkg.isPopular && (
                <div className="bg-primary text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-playfair font-semibold mb-2">{pkg.name}</h3>
                <p className="text-gray-600 mb-4">{pkg.description}</p>
                
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-bold">₹{pkg.price}</span>
                  <span className="text-gray-500 ml-1">/ session</span>
                </div>
                
                <div className="space-y-3 mb-8">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button className={`w-full py-2 rounded-md ${pkg.isPopular ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                  Book This Package
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PackageDisplay;
