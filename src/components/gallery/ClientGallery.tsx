
import { useState, useEffect } from 'react';
import { Gallery, GalleryImage, dbService } from '@/services/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Image, X } from 'lucide-react';
import { format } from 'date-fns';

const ClientGallery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [viewingImage, setViewingImage] = useState<GalleryImage | null>(null);
  
  useEffect(() => {
    if (user) {
      const userGalleries = dbService.getGalleriesByUserId(user.id);
      setGalleries(userGalleries);
    }
  }, [user]);
  
  const handleGallerySelect = (gallery: Gallery) => {
    setSelectedGallery(gallery);
    const images = dbService.getImagesByGalleryId(gallery.id);
    setGalleryImages(images);
  };
  
  const handleBackToGalleries = () => {
    setSelectedGallery(null);
    setGalleryImages([]);
  };
  
  const handleToggleSelection = (image: GalleryImage) => {
    const updatedImage = dbService.toggleImageSelection(image.id);
    if (updatedImage) {
      setGalleryImages(galleryImages.map(img => 
        img.id === updatedImage.id ? updatedImage : img
      ));
      
      toast({
        title: updatedImage.selected ? "Image selected" : "Image deselected",
        description: updatedImage.selected ? 
          "This image has been added to your selection." : 
          "This image has been removed from your selection."
      });
    }
  };
  
  const handleViewImage = (image: GalleryImage) => {
    setViewingImage(image);
    document.body.style.overflow = "hidden";
  };
  
  const handleCloseImage = () => {
    setViewingImage(null);
    document.body.style.overflow = "auto";
  };
  
  // Helper to format the date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  const renderGalleryList = () => {
    if (galleries.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="mb-4 inline-flex bg-gray-100 p-3 rounded-full">
            <Image className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">No galleries yet</h3>
          <p className="text-gray-500 mb-6">
            Your photographer hasn't shared any photo galleries with you yet.
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery) => (
          <div 
            key={gallery.id}
            className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleGallerySelect(gallery)}
          >
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <Image className="h-12 w-12 text-gray-400" />
            </div>
            <div className="p-4">
              <h3 className="font-medium mb-1">{gallery.name}</h3>
              <p className="text-gray-500 text-sm mb-2">{gallery.description}</p>
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formatDate(gallery.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderGalleryDetail = () => {
    if (!selectedGallery) return null;
    
    return (
      <div>
        <div className="mb-6">
          <button 
            onClick={handleBackToGalleries}
            className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 inline-flex items-center gap-1 mb-4"
          >
            ← Back to galleries
          </button>
          <h2 className="text-xl font-playfair font-semibold">{selectedGallery.name}</h2>
          <p className="text-gray-600">{selectedGallery.description}</p>
          
          <div className="flex items-center gap-4 text-sm mt-2">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(selectedGallery.createdAt)}</span>
            </div>
            {selectedGallery.expiresAt && (
              <div className="text-amber-600">
                Expires {formatDate(selectedGallery.expiresAt)}
              </div>
            )}
          </div>
        </div>
        
        {galleryImages.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No images in this gallery yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image) => (
              <div 
                key={image.id}
                className="group relative aspect-square bg-gray-100 rounded-md overflow-hidden"
              >
                <div 
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => handleViewImage(image)}
                >
                  <img 
                    src={image.imageUrl} 
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSelection(image);
                    }}
                    className={`p-2 rounded-full ${image.selected ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
                  >
                    {image.selected ? '✓' : '+'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-playfair font-semibold">Your Galleries</h2>
      </div>
      
      {selectedGallery ? renderGalleryDetail() : renderGalleryList()}
      
      {/* Image Lightbox */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={handleCloseImage}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={handleCloseImage}
            aria-label="Close lightbox"
          >
            <X size={32} />
          </button>
          <div 
            className="max-w-5xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={viewingImage.imageUrl}
              alt={viewingImage.title}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <div className="mt-4 flex justify-between items-center">
              <p className="text-white text-lg">{viewingImage.title}</p>
              <button
                onClick={() => {
                  handleToggleSelection(viewingImage);
                }}
                className={`px-4 py-2 rounded-md ${viewingImage.selected ? 'bg-primary text-white' : 'bg-white text-gray-900'}`}
              >
                {viewingImage.selected ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientGallery;
