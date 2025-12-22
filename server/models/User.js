
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In production, hash this!
    phone: { type: String },
    role: { type: String, default: 'client', enum: ['client', 'admin'] },
    profile_completed: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
