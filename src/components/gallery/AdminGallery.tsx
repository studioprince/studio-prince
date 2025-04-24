
import { useState, useEffect, useContext } from 'react';
import { Gallery, GalleryImage, User, dbService } from '@/services/database';
import { AuthContext } from '@/App';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Image, Plus, Edit, Trash, Upload, X } from 'lucide-react';
import { format } from 'date-fns';

const AdminGallery = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    userId: '',
    isPrivate: true,
    accessCode: '',
    expiresAt: ''
  });
  
  useEffect(() => {
    // Get all galleries
    const allGalleries = dbService.getGalleries();
    setGalleries(allGalleries);
    
    // Get all clients
    const allUsers = dbService.getUsers();
    const clientUsers = allUsers.filter(user => user.role === 'client');
    setClients(clientUsers);
  }, []);
  
  const handleGallerySelect = (gallery: Gallery) => {
    setSelectedGallery(gallery);
    const images = dbService.getImagesByGalleryId(gallery.id);
    setGalleryImages(images);
  };
  
  const handleBackToGalleries = () => {
    setSelectedGallery(null);
    setGalleryImages([]);
  };
  
  const handleCreateGallery = () => {
    setFormData({
      name: '',
      description: '',
      userId: clients.length > 0 ? clients[0].id : '',
      isPrivate: true,
      accessCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      expiresAt: ''
    });
    setShowCreateModal(true);
  };
  
  const handleEditGallery = (gallery: Gallery) => {
    setFormData({
      name: gallery.name,
      description: gallery.description,
      userId: gallery.userId,
      isPrivate: gallery.isPrivate,
      accessCode: gallery.accessCode || '',
      expiresAt: gallery.expiresAt || ''
    });
    setSelectedGallery(gallery);
    setShowCreateModal(true);
  };
  
  const handleDeleteGallery = (gallery: Gallery) => {
    if (confirm(`Are you sure you want to delete the gallery "${gallery.name}"?`)) {
      const deleted = dbService.deleteGallery(gallery.id);
      if (deleted) {
        setGalleries(galleries.filter(g => g.id !== gallery.id));
        toast({
          title: "Gallery deleted",
          description: `"${gallery.name}" has been deleted successfully.`
        });
      }
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleSubmitGallery = (e: React.FormEvent) => {
    e.preventDefault();
    
    const galleryData: Gallery = {
      id: selectedGallery ? selectedGallery.id : `gallery-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      userId: formData.userId,
      createdAt: selectedGallery ? selectedGallery.createdAt : new Date().toISOString(),
      expiresAt: formData.expiresAt || undefined,
      isPrivate: formData.isPrivate,
      accessCode: formData.isPrivate ? formData.accessCode : undefined
    };
    
    const savedGallery = dbService.saveGallery(galleryData);
    
    if (selectedGallery) {
      // Update existing gallery
      setGalleries(galleries.map(gallery => 
        gallery.id === savedGallery.id ? savedGallery : gallery
      ));
      
      setSelectedGallery(savedGallery);
      
      toast({
        title: "Gallery updated",
        description: `"${savedGallery.name}" has been updated successfully.`
      });
    } else {
      // New gallery
      setGalleries([...galleries, savedGallery]);
      
      toast({
        title: "Gallery created",
        description: `"${savedGallery.name}" has been created successfully.`
      });
    }
    
    setShowCreateModal(false);
  };
  
  const handleUploadImage = () => {
    if (!selectedGallery) return;
    
    setShowUploadModal(true);
  };
  
  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // This is a placeholder for image upload
    // In a real implementation with Supabase, this would upload the image to storage
    
    const newImage: GalleryImage = {
      id: `image-${Date.now()}`,
      galleryId: selectedGallery!.id,
      title: `Sample Image ${galleryImages.length + 1}`,
      imageUrl: `https://source.unsplash.com/random/800x600?sig=${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      selected: false
    };
    
    const savedImage = dbService.saveGalleryImage(newImage);
    
    setGalleryImages([...galleryImages, savedImage]);
    
    toast({
      title: "Image added",
      description: "The image has been added to the gallery."
    });
    
    setShowUploadModal(false);
  };
  
  const handleDeleteImage = (image: GalleryImage) => {
    if (confirm("Are you sure you want to delete this image?")) {
      const deleted = dbService.deleteGalleryImage(image.id);
      if (deleted) {
        setGalleryImages(galleryImages.filter(img => img.id !== image.id));
        toast({
          title: "Image deleted",
          description: "The image has been removed from the gallery."
        });
      }
    }
  };
  
  const getClientName = (userId: string) => {
    const client = clients.find(c => c.id === userId);
    return client ? client.name : 'Unknown Client';
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
    return (
      <>
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-playfair font-semibold">Client Galleries</h2>
          <button
            onClick={handleCreateGallery}
            className="btn-primary text-sm py-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Gallery
          </button>
        </div>
        
        {galleries.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <div className="mb-4 inline-flex bg-gray-100 p-3 rounded-full">
              <Image className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No galleries yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first gallery to share photos with your clients.
            </p>
            <button
              onClick={handleCreateGallery}
              className="btn-secondary"
            >
              Create First Gallery
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gallery Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {galleries.map((gallery) => (
                  <tr key={gallery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                          <Image className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{gallery.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{gallery.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getClientName(gallery.userId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(gallery.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${gallery.isPrivate ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {gallery.isPrivate ? 'Private' : 'Public'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleGallerySelect(gallery)}
                        className="text-primary hover:text-primary-dark mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditGallery(gallery)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGallery(gallery)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
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
          
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-playfair font-semibold">{selectedGallery.name}</h2>
              <p className="text-gray-600">{selectedGallery.description}</p>
              
              <div className="flex items-center gap-4 text-sm mt-2">
                <div>
                  Client: <span className="font-medium">{getClientName(selectedGallery.userId)}</span>
                </div>
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
              
              {selectedGallery.isPrivate && selectedGallery.accessCode && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-500">Access code:</span>{" "}
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">{selectedGallery.accessCode}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEditGallery(selectedGallery)}
                className="text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 inline-flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
                Edit Gallery
              </button>
              <button
                onClick={handleUploadImage}
                className="btn-primary text-sm py-1.5"
              >
                <Upload className="h-4 w-4 mr-1" />
                Add Images
              </button>
            </div>
          </div>
        </div>
        
        {galleryImages.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">No images in this gallery yet.</p>
            <button
              onClick={handleUploadImage}
              className="btn-secondary"
            >
              Upload Images
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image) => (
              <div 
                key={image.id}
                className="group relative aspect-square bg-gray-100 rounded-md overflow-hidden"
              >
                <img 
                  src={image.imageUrl} 
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleDeleteImage(image)}
                    className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <Trash className="h-4 w-4" />
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
      {selectedGallery ? renderGalleryDetail() : renderGalleryList()}
      
      {/* Create/Edit Gallery Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {selectedGallery ? 'Edit Gallery' : 'Create New Gallery'}
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitGallery} className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Gallery Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="userId" className="block text-sm font-medium mb-1">
                  Client
                </label>
                <select
                  id="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isPrivate"
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
                  Password protected gallery
                </label>
              </div>
              
              {formData.isPrivate && (
                <div>
                  <label htmlFor="accessCode" className="block text-sm font-medium mb-1">
                    Access Code
                  </label>
                  <input
                    id="accessCode"
                    type="text"
                    value={formData.accessCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This code will be required to access the gallery.
                  </p>
                </div>
              )}
              
              <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium mb-1">
                  Expiry Date (optional)
                </label>
                <input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="pt-4 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {selectedGallery ? 'Save Changes' : 'Create Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Upload Images Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Add Images</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleImageSubmit} className="p-6">
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg mb-4">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-1">
                  Drag and drop image files, or click to select
                </p>
                <p className="text-xs text-gray-400">
                  (This is a placeholder - once connected to Supabase, real file uploads will work)
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Add Sample Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
