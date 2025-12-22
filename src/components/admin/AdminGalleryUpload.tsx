import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Trash2, Clock, CheckCircle, Smartphone, UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import QRCode from 'react-qr-code';

const AdminGalleryUpload = () => {
    const { token } = useAuth();
    const { toast } = useToast();
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [title, setTitle] = useState('');
    const [expiry, setExpiry] = useState('0'); // 0 = no expiry
    const [uploading, setUploading] = useState(false);

    // QR Code State
    const [showQrModal, setShowQrModal] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [publicToken, setPublicToken] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await fetch('/api/users?role=client', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setClients(data);
            }
        } catch (error) {
            console.error('Failed to load clients', error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const toggleClient = (clientId: string) => {
        setSelectedClients(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
        );
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedClients.length === 0 || selectedFiles.length === 0) {
            toast({ title: "Validation Error", description: "Select at least one client and one file.", variant: "destructive" });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        // Send userIds as JSON string
        formData.append('userIds', JSON.stringify(selectedClients));
        formData.append('title', title);
        formData.append('expiryHours', expiry);

        selectedFiles.forEach(file => {
            formData.append('photos', file);
        });

        try {
            const response = await fetch('/api/gallery/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                toast({ title: "Success", description: "Photos uploaded and shared successfully!" });

                // Show QR Modal
                setShareUrl(data.shareUrl);
                setPublicToken(data.publicToken);
                setShowQrModal(true);

                // Reset form
                setSelectedFiles([]);
                setTitle('');
                setSelectedClients([]);
                setExpiry('0');
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to upload photos.", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-playfair">Upload & Share Photos</CardTitle>
                    <CardDescription>Share photos with clients and generate QR codes for guests</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label className="mb-2 block">Select Clients (Multiple)</Label>
                                    <div className="border rounded-md max-h-[200px] overflow-y-auto p-2 space-y-1">
                                        {clients.map(client => (
                                            <div
                                                key={client._id}
                                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${selectedClients.includes(client._id) ? 'bg-primary/10 border-primary/20' : 'hover:bg-gray-50'}`}
                                                onClick={() => toggleClient(client._id)}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedClients.includes(client._id) ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                                                    {selectedClients.includes(client._id) && <CheckCircle className="h-3 w-3 text-white" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{client.name}</p>
                                                    <p className="text-xs text-gray-500">{client.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {clients.length === 0 && <p className="text-sm text-gray-500 p-2">No clients found.</p>}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {selectedClients.length} client{selectedClients.length !== 1 && 's'} selected
                                    </p>
                                </div>

                                <div>
                                    <Label>Gallery Title (Optional)</Label>
                                    <Input
                                        placeholder="e.g. Wedding Pre-shoot"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label className="flex items-center gap-2">
                                        Auto-Delete Timer <Clock className="h-4 w-4 text-amber-500" />
                                    </Label>
                                    <Select value={expiry} onValueChange={setExpiry}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select retention period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Never (Keep Forever)</SelectItem>
                                            <SelectItem value="24">24 Hours</SelectItem>
                                            <SelectItem value="48">48 Hours</SelectItem>
                                            <SelectItem value="168">7 Days</SelectItem>
                                            <SelectItem value="720">30 Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-500 mt-1">Photos will be permanently deleted after this time to save space.</p>
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-gray-50/50">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    id="file-upload"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full h-full">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <Upload className="h-6 w-6 text-primary" />
                                    </div>
                                    <span className="font-medium text-gray-900">Click to select photos</span>
                                    <span className="text-sm text-gray-500 mt-1">or drag and drop here</span>
                                    <span className="text-xs text-gray-400 mt-4">Max size 50MB per file</span>
                                </label>

                                {selectedFiles.length > 0 && (
                                    <div className="mt-6 w-full bg-white rounded-md border p-3">
                                        <div className="flex justify-between items-center mb-2 border-b pb-2">
                                            <span className="text-sm font-medium">{selectedFiles.length} files selected</span>
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])} className="h-6 w-6 p-0 text-gray-400 hover:text-red-500">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="max-h-[150px] overflow-y-auto text-left space-y-1">
                                            {selectedFiles.map((file, i) => (
                                                <div key={i} className="text-xs text-gray-600 truncate flex items-center justify-between group hover:bg-gray-50 p-1 rounded">
                                                    <span className="flex items-center gap-2 truncate">
                                                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                                        {file.name}
                                                    </span>
                                                    <X
                                                        className="h-3 w-3 text-gray-400 cursor-pointer opacity-0 group-hover:opacity-100 hover:text-red-500"
                                                        onClick={() => removeFile(i)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                            <Button type="submit" disabled={uploading} className="w-full md:w-auto min-w-[200px]">
                                {uploading ? "Uploading..." : "Upload & Share"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* QR Code Modal associated with upload */}
            <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-primary" />
                            Share Gallery via QR
                        </DialogTitle>
                        <DialogDescription>
                            Anyone can scan this code to access the "{title || 'Shared Gallery'}" instantly.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <QRCode value={shareUrl} size={200} />
                        </div>
                        <div className="text-center space-y-2 w-full">
                            <p className="text-xs text-gray-400 break-all bg-gray-50 p-2 rounded">
                                {shareUrl}
                            </p>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    navigator.clipboard.writeText(shareUrl);
                                    toast({ title: "Copied!", description: "Link copied to clipboard." });
                                }}
                            >
                                Copy Link
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminGalleryUpload;
