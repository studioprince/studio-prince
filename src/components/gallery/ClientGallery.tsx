import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Download, Cloud, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ClientGallery = () => {
  const { user, token } = useAuth();
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const response = await fetch(`/api/gallery/${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGalleries(data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (photoUrl: string, originalName: string) => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading photos...</div>;
  }

  if (galleries.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <Cloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No photos yet</h3>
        <p className="text-gray-500 mt-2">Your photographer hasn't uploaded any photos to your gallery yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {galleries.map((gallery) => (
        <div key={gallery._id} className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-playfair font-semibold flex items-center gap-2">
                {gallery.title}
                {gallery.isAutoDeleteEnabled && (
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-100 flex gap-1 items-center">
                    <Clock className="w-3 h-3" />
                    Expires {new Date(gallery.expiresAt).toLocaleDateString()}
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-gray-500">
                Uploaded {new Date(gallery.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className="text-sm text-gray-400">{gallery.photos.length} photos</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.photos.map((photo: any, index: number) => (
              <Card key={index} className="overflow-hidden group relative border-0 shadow-none">
                <CardContent className="p-0 relative aspect-square">
                  <img
                    src={photo.path}
                    alt={photo.originalName}
                    className="w-full h-full object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(photo.path, photo.originalName)}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientGallery;
