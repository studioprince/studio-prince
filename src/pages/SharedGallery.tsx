import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Cloud, Clock, ArrowLeft, Camera } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SharedGallery = () => {
    const { token } = useParams();
    const [gallery, setGallery] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGallery();
    }, [token]);

    const fetchGallery = async () => {
        try {
            const response = await fetch(`/api/gallery/public/${token}`);
            if (response.ok) {
                const data = await response.json();
                setGallery(data);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to load gallery');
            }
        } catch (error) {
            console.error('Error fetching gallery:', error);
            setError('Failed to connect to server');
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
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <Cloud className="h-16 w-16 text-gray-300 mb-4" />
                <h1 className="text-2xl font-playfair font-bold text-gray-900 mb-2">Gallery Unavailable</h1>
                <p className="text-gray-500 mb-6">{error}</p>
                <Link to="/" className="btn-primary">Return Home</Link>
            </div>
        );
    }

    if (!gallery) return null;

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="container-custom py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary rounded-full p-2">
                            <Camera className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-playfair font-semibold text-lg md:text-xl line-clamp-1">{gallery.title}</h1>
                            <p className="text-xs text-gray-500">Shared Gallery</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                {gallery.isAutoDeleteEnabled && (
                    <div className="mb-6 flex justify-center">
                        <Badge variant="secondary" className="px-4 py-1 bg-amber-100 text-amber-800 text-sm flex gap-2 items-center shadow-sm">
                            <Clock className="w-4 h-4" />
                            This gallery expires on {new Date(gallery.expiresAt).toLocaleDateString()} at {new Date(gallery.expiresAt).toLocaleTimeString()}
                        </Badge>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gallery.photos.map((photo: any, index: number) => (
                        <Card key={index} className="overflow-hidden group relative border-0 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-0 relative aspect-square">
                                <img
                                    src={photo.path}
                                    alt={photo.originalName}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleDownload(photo.path, photo.originalName)}
                                        className="gap-2 font-medium"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-12 text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} Studio Prince. All rights reserved.</p>
                </div>
            </div>
        </main>
    );
};

export default SharedGallery;
