import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { User } from './models/User.js';
import { Booking } from './models/Booking.js';
import { Session } from './models/Session.js';
import { Invoice } from './models/Invoice.js';
import { Gallery } from './models/Gallery.js';
import crypto from 'crypto';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your_development_secret_key_123';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(cors());
app.use(express.json());

// Multer Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'studio-prince-gallery',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        resource_type: 'auto'
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Connect to MongoDB
if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env file.');
    // Don't exit process in Vercel environment, just log error
    if (process.env.NODE_ENV !== 'production') process.exit(1);
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
}

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// Middleware to verify JWT and Session
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const session = await Session.findOne({
            userId: decoded.id,
            token: token,
            isActive: true
        });

        if (!session) {
            return res.status(403).json({ message: 'Session expired or invalid' });
        }

        // Update lastActive
        session.lastActive = new Date();
        await session.save();

        req.user = decoded;
        req.sessionId = session._id;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name, email, password: hashedPassword, phone, role: 'client'
        });

        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, profile_completed: user.profile_completed, phone: user.phone, verified: user.verified }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        const isMatchOld = user.password === password;

        if (!isMatch && !isMatchOld) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await Session.create({
            userId: user._id, token, userAgent: req.headers['user-agent'], ipAddress: req.ip, expiresAt
        });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, profile_completed: user.profile_completed, phone: user.phone, verified: user.verified }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Logout
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        if (req.sessionId) await Session.findByIdAndUpdate(req.sessionId, { isActive: false });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Logout failed' });
    }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const baseUrl = process.env.VITE_API_URL || 'http://localhost:5173'; // Frontend URL
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request',
            text: `Reset your password here: ${resetUrl}`
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            res.json({ message: 'Password reset link sent to email' });
        } else {
            console.log(`[MOCK EMAIL] Reset Link: ${resetUrl}`);
            res.json({ message: 'Reset link generated (Mock)' });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error sending reset email' });
    }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password updated' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// Send OTP
app.post('/api/auth/send-otp', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        if (process.env.EMAIL_USER) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Verify Email',
                text: `Your OTP is: ${otp}`
            });
            res.json({ message: 'OTP sent' });
        } else {
            console.log(`[MOCK OTP]: ${otp}`);
            res.json({ message: 'OTP generated (Mock)' });
        }
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

// Verify OTP
app.post('/api/auth/verify-otp', authenticateToken, async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findById(req.user.id);

        if (!user || user.otp !== otp || new Date() > user.otpExpires) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.verified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: 'Verified successfully', user: { ...user.toObject(), verified: true } });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
});

// --- USER ROUTES ---
app.put('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, { name, phone, profile_completed: true }, { new: true });
        res.json({ message: 'Profile updated', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
});

app.get('/api/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const users = await User.find({ role: req.query.role || 'client' }).select('-password');
    res.json(users);
});

// --- BOOKING ROUTES ---
app.post('/api/bookings', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        res.status(201).json({ message: 'Booking created', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking' });
    }
});

app.get('/api/bookings', async (req, res) => {
    try {
        const { userId, role } = req.query;
        let query = {};
        if (role !== 'admin' && userId) query = { userId };
        const bookings = await Booking.find(query).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings' });
    }
});

app.put('/api/bookings/:id/status', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json({ message: 'Status updated', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error updating status' });
    }
});

// --- GALLERY ROUTES ---
app.post('/api/gallery/upload', authenticateToken, upload.array('photos', 20), async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

        const { userIds, title, expiryHours } = req.body;
        let parsedUserIds = [];
        try { parsedUserIds = JSON.parse(userIds); } catch (e) { if (userIds) parsedUserIds = [userIds]; }

        if (!parsedUserIds || !req.files) return res.status(400).json({ message: 'Missing data' });

        const photos = req.files.map(file => ({
            path: file.path, // Cloudinary URL
            publicId: file.filename, // Cloudinary Public ID
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size
        }));

        let expiresAt = null;
        let isAutoDeleteEnabled = false;
        if (expiryHours && parseInt(expiryHours) > 0) {
            expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + parseInt(expiryHours));
            isAutoDeleteEnabled = true;
        }

        const publicToken = crypto.randomBytes(16).toString('hex');
        const gallery = new Gallery({ userIds: parsedUserIds, adminId: req.user.id, photos, title, expiresAt, isAutoDeleteEnabled, publicToken });
        await gallery.save();

        const baseUrl = process.env.VITE_API_URL || 'http://localhost:5173'; // Frontend URL
        res.status(201).json({
            message: 'Uploaded',
            gallery,
            shareUrl: `${baseUrl}/gallery/shared/${publicToken}`,
            publicToken
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

app.get('/api/gallery/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    if (req.user.id !== userId && req.user.role !== 'admin') return res.status(403).json({ message: 'Denied' });
    const galleries = await Gallery.find({ userIds: userId }).sort({ createdAt: -1 });
    res.json(galleries);
});

app.get('/api/gallery/public/:token', async (req, res) => {
    const gallery = await Gallery.findOne({ publicToken: req.params.token });
    if (!gallery) return res.status(404).json({ message: 'Not found' });
    if (gallery.isAutoDeleteEnabled && new Date() > gallery.expiresAt) return res.status(410).json({ message: 'Expired' });
    res.json(gallery);
});

app.delete('/api/gallery/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: 'Not found' });

    // Delete from Cloudinary
    for (const photo of gallery.photos) {
        if (photo.publicId) await cloudinary.uploader.destroy(photo.publicId);
    }

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

// Auto-delete Cleanup (Cron Endpoint)
app.get('/api/cron/cleanup', async (req, res) => {
    try {
        const now = new Date();
        const expired = await Gallery.find({ isAutoDeleteEnabled: true, expiresAt: { $lt: now } });

        for (const gallery of expired) {
            for (const photo of gallery.photos) {
                if (photo.publicId) await cloudinary.uploader.destroy(photo.publicId);
            }
            await Gallery.findByIdAndDelete(gallery._id);
        }
        res.json({ message: `Cleaned ${expired.length} galleries` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- INVOICE ROUTES ---
app.post('/api/invoices', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json({ message: 'Invoice created', invoice });
});

app.get('/api/invoices', authenticateToken, async (req, res) => {
    let query = {};
    if (req.user.role === 'client') query = { userId: req.user.id };
    else if (req.query.userId) query = { userId: req.query.userId };

    const invoices = await Invoice.find(query).sort({ createdAt: -1 });
    res.json(invoices);
});

// Only start server if not running in Vercel (Vercel exports app)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
