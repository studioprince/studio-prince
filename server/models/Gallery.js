import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Changed from single userId to array
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    photos: [{
        path: { type: String, required: true },
        originalName: String,
        mimeType: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now }
    }],
    title: { type: String, default: 'My Gallery' },
    publicToken: { type: String, unique: true, sparse: true }, // For QR/Link sharing
    expiresAt: { type: Date },
    isAutoDeleteEnabled: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Calculate when photos should be auto-deleted
gallerySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion of document, but we handle file deletion in logic

export const Gallery = mongoose.model('Gallery', gallerySchema);
