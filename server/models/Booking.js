
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Can be 'guest' or user _id
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    serviceType: { type: String, required: true },
    date: { type: String, required: true }, // Store as string YYYY-MM-DD or Date
    time: { type: String },
    location: { type: String, required: true },
    specialInstructions: { type: String },
    bookingType: { type: String, default: 'shoot', enum: ['shoot', 'studio'] },
    status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'completed', 'cancelled'] },
    createdAt: { type: Date, default: Date.now }
});

export const Booking = mongoose.model('Booking', bookingSchema);
