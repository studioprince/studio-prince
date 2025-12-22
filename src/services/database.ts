import { toast } from "@/hooks/use-toast";

// Types for our database
export interface Booking {
  id: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  serviceType: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  requestDate?: string; // Optional now as we might use createdAt
  createdAt?: string | Date;
  notes?: string;
  specialInstructions?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
  phone?: string;
}

// Gallery types
export interface Gallery {
  id: string;
  name: string;
  description: string;
  userId: string; // The client who the gallery belongs to
  createdAt: string;
  expiresAt?: string;
  isPrivate: boolean;
  accessCode?: string;
}

export interface GalleryImage {
  id: string;
  galleryId: string;
  title: string;
  imageUrl: string;
  uploadedAt: string;
  selected: boolean; // If the client has selected this image
}

// Package types
export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  duration: string;
  includedImages: number;
  isPopular: boolean;
}

// Invoice types
export interface Invoice {
  id: string;
  userId: string;
  bookingId?: string;
  amount: number;
  description: string;
  createdAt: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Initial admin user
const ADMIN_USER: User = {
  id: 'admin-1',
  name: 'Aditya',
  email: 'aditya@admin.com',
  role: 'admin'
};

// Initial client user
const CLIENT_USER: User = {
  id: 'client-1',
  name: 'Omkar',
  email: 'omkar@client.com',
  role: 'client'
};

// Initialize the database with demo data
const initializeDB = () => {
  // Check if we already have data in localStorage
  if (!localStorage.getItem('studio_bookings')) {
    // Sample booking data - just one example booking
    const sampleBookings: Booking[] = [
      {
        id: 'booking-1',
        userId: 'client-1',
        customerName: 'Omkar',
        email: 'omkar@client.com',
        phone: '(555) 123-4567',
        serviceType: 'Portrait Session',
        date: '2025-04-20',
        time: '10:00',
        location: 'Studio',
        status: 'pending',
        requestDate: '2025-03-28',
      }
    ];

    localStorage.setItem('studio_bookings', JSON.stringify(sampleBookings));
  }

  // Set up users if not exists
  if (!localStorage.getItem('studio_users')) {
    const initialUsers = [ADMIN_USER, CLIENT_USER];
    localStorage.setItem('studio_users', JSON.stringify(initialUsers));
  }

  // Set up passwords for demo accounts
  if (!localStorage.getItem('user_pwd_admin-1')) {
    localStorage.setItem('user_pwd_admin-1', '123');
  }

  if (!localStorage.getItem('user_pwd_client-1')) {
    localStorage.setItem('user_pwd_client-1', '123');
  }

  // Initialize galleries if not exists
  if (!localStorage.getItem('studio_galleries')) {
    const initialGalleries: Gallery[] = [];
    localStorage.setItem('studio_galleries', JSON.stringify(initialGalleries));
  }

  // Initialize gallery images if not exists
  if (!localStorage.getItem('studio_gallery_images')) {
    const initialImages: GalleryImage[] = [];
    localStorage.setItem('studio_gallery_images', JSON.stringify(initialImages));
  }

  // Initialize packages if not exists
  if (!localStorage.getItem('studio_packages')) {
    const initialPackages: Package[] = [
      {
        id: 'package-1',
        name: 'Basic Portrait Session',
        description: 'Perfect for individuals or small families wanting quality portraits.',
        price: 150,
        features: ['1-hour session', '10 digital images', 'Online gallery', '1 outfit change'],
        duration: '1 hour',
        includedImages: 10,
        isPopular: false
      },
      {
        id: 'package-2',
        name: 'Premium Portrait Experience',
        description: 'Our most popular package with extended time and more photos.',
        price: 300,
        features: ['2-hour session', '25 digital images', 'Online gallery', '3 outfit changes', 'Basic retouching'],
        duration: '2 hours',
        includedImages: 25,
        isPopular: true
      },
      {
        id: 'package-3',
        name: 'Ultimate Portrait Collection',
        description: 'The complete portrait experience with all the extras.',
        price: 500,
        features: ['3-hour session', '50 digital images', 'Online gallery', 'Multiple locations', 'Unlimited outfit changes', 'Advanced retouching', 'Printed photo album'],
        duration: '3 hours',
        includedImages: 50,
        isPopular: false
      }
    ];
    localStorage.setItem('studio_packages', JSON.stringify(initialPackages));
  }

  // Initialize invoices if not exists
  if (!localStorage.getItem('studio_invoices')) {
    const initialInvoices: Invoice[] = [];
    localStorage.setItem('studio_invoices', JSON.stringify(initialInvoices));
  }
};

// Initialize the DB on module load
initializeDB();

// Database service
export const dbService = {
  // Booking methods
  getBookings: (): Booking[] => {
    const bookings = localStorage.getItem('studio_bookings');
    return bookings ? JSON.parse(bookings) : [];
  },

  getBookingById: (id: string): Booking | undefined => {
    const bookings = dbService.getBookings();
    return bookings.find(booking => booking.id === id);
  },

  getBookingsByUserId: (userId: string): Booking[] => {
    const bookings = dbService.getBookings();
    return bookings.filter(booking => booking.userId === userId);
  },

  saveBooking: (booking: Booking): Booking => {
    const bookings = dbService.getBookings();
    const index = bookings.findIndex(b => b.id === booking.id);

    if (index >= 0) {
      // Update existing booking
      bookings[index] = booking;
    } else {
      // Add new booking
      bookings.push(booking);
    }

    localStorage.setItem('studio_bookings', JSON.stringify(bookings));
    return booking;
  },

  updateBookingStatus: (id: string, status: Booking['status']): Booking | undefined => {
    const bookings = dbService.getBookings();
    const index = bookings.findIndex(b => b.id === id);

    if (index >= 0) {
      bookings[index].status = status;
      localStorage.setItem('studio_bookings', JSON.stringify(bookings));
      return bookings[index];
    }

    return undefined;
  },

  // User methods
  getUsers: (): User[] => {
    const users = localStorage.getItem('studio_users');
    return users ? JSON.parse(users) : [];
  },

  getUserByEmail: (email: string): User | undefined => {
    const users = dbService.getUsers();
    return users.find(user => user.email === email);
  },

  getUserById: (id: string): User | undefined => {
    const users = dbService.getUsers();
    return users.find(user => user.id === id);
  },

  saveUser: (user: User): User => {
    const users = dbService.getUsers();
    const index = users.findIndex(u => u.id === user.id);

    if (index >= 0) {
      // Update existing user
      users[index] = user;
    } else {
      // Add new user
      users.push(user);
    }

    localStorage.setItem('studio_users', JSON.stringify(users));
    return user;
  },

  // Authentication helpers
  registerUser: (name: string, email: string, password: string): User | null => {
    // Check if user already exists
    if (dbService.getUserByEmail(email)) {
      toast({
        title: "Registration failed",
        description: "An account with this email already exists.",
        variant: "destructive"
      });
      return null;
    }

    // Create new user
    const newUser: User = {
      id: `client-${Date.now()}`,
      name,
      email,
      role: 'client'
    };

    // In a real app, we would hash the password
    localStorage.setItem(`user_pwd_${newUser.id}`, password);

    // Save user to db
    dbService.saveUser(newUser);

    toast({
      title: "Registration successful",
      description: "Your account has been created."
    });

    return newUser;
  },

  loginUser: (email: string, password: string): User | null => {
    const user = dbService.getUserByEmail(email);

    if (!user) {
      toast({
        title: "Login failed",
        description: "No account found with this email.",
        variant: "destructive"
      });
      return null;
    }

    // Check password (in a real app, we would compare hash)
    const storedPassword = localStorage.getItem(`user_pwd_${user.id}`);
    if (storedPassword !== password) {
      toast({
        title: "Login failed",
        description: "Incorrect password.",
        variant: "destructive"
      });
      return null;
    }

    toast({
      title: "Login successful",
      description: "Welcome back, " + user.name + "!"
    });

    return user;
  },

  // Create new admin account
  createAdminAccount: (): User => {
    // Check if already exists
    const existingAdmin = dbService.getUserByEmail('admin@studio.com');
    if (existingAdmin) {
      return existingAdmin;
    }

    const newAdmin: User = {
      id: 'admin-new',
      name: 'Studio Admin',
      email: 'admin@studio.com',
      role: 'admin'
    };

    // Set password
    localStorage.setItem('user_pwd_admin-new', 'admin123');

    // Save to database
    dbService.saveUser(newAdmin);

    toast({
      title: "Admin account created",
      description: "New admin account is ready to use."
    });

    return newAdmin;
  },

  // Gallery methods
  getGalleries: (): Gallery[] => {
    const galleries = localStorage.getItem('studio_galleries');
    return galleries ? JSON.parse(galleries) : [];
  },

  getGalleriesByUserId: (userId: string): Gallery[] => {
    const galleries = dbService.getGalleries();
    return galleries.filter(gallery => gallery.userId === userId);
  },

  getGalleryById: (id: string): Gallery | undefined => {
    const galleries = dbService.getGalleries();
    return galleries.find(gallery => gallery.id === id);
  },

  saveGallery: (gallery: Gallery): Gallery => {
    const galleries = dbService.getGalleries();
    const index = galleries.findIndex(g => g.id === gallery.id);

    if (index >= 0) {
      // Update existing gallery
      galleries[index] = gallery;
    } else {
      // Add new gallery
      galleries.push(gallery);
    }

    localStorage.setItem('studio_galleries', JSON.stringify(galleries));
    return gallery;
  },

  deleteGallery: (id: string): boolean => {
    const galleries = dbService.getGalleries();
    const filteredGalleries = galleries.filter(gallery => gallery.id !== id);

    if (filteredGalleries.length !== galleries.length) {
      localStorage.setItem('studio_galleries', JSON.stringify(filteredGalleries));

      // Also delete associated images
      const images = dbService.getGalleryImages();
      const filteredImages = images.filter(image => image.galleryId !== id);
      localStorage.setItem('studio_gallery_images', JSON.stringify(filteredImages));

      return true;
    }

    return false;
  },

  // Gallery Image methods
  getGalleryImages: (): GalleryImage[] => {
    const images = localStorage.getItem('studio_gallery_images');
    return images ? JSON.parse(images) : [];
  },

  getImagesByGalleryId: (galleryId: string): GalleryImage[] => {
    const images = dbService.getGalleryImages();
    return images.filter(image => image.galleryId === galleryId);
  },

  saveGalleryImage: (image: GalleryImage): GalleryImage => {
    const images = dbService.getGalleryImages();
    const index = images.findIndex(img => img.id === image.id);

    if (index >= 0) {
      // Update existing image
      images[index] = image;
    } else {
      // Add new image
      images.push(image);
    }

    localStorage.setItem('studio_gallery_images', JSON.stringify(images));
    return image;
  },

  deleteGalleryImage: (id: string): boolean => {
    const images = dbService.getGalleryImages();
    const filteredImages = images.filter(image => image.id !== id);

    if (filteredImages.length !== images.length) {
      localStorage.setItem('studio_gallery_images', JSON.stringify(filteredImages));
      return true;
    }

    return false;
  },

  toggleImageSelection: (id: string): GalleryImage | undefined => {
    const images = dbService.getGalleryImages();
    const index = images.findIndex(img => img.id === id);

    if (index >= 0) {
      images[index].selected = !images[index].selected;
      localStorage.setItem('studio_gallery_images', JSON.stringify(images));
      return images[index];
    }

    return undefined;
  },

  // Package methods
  getPackages: (): Package[] => {
    const packages = localStorage.getItem('studio_packages');
    return packages ? JSON.parse(packages) : [];
  },

  getPackageById: (id: string): Package | undefined => {
    const packages = dbService.getPackages();
    return packages.find(pkg => pkg.id === id);
  },

  savePackage: (pkg: Package): Package => {
    const packages = dbService.getPackages();
    const index = packages.findIndex(p => p.id === pkg.id);

    if (index >= 0) {
      // Update existing package
      packages[index] = pkg;
    } else {
      // Add new package
      packages.push(pkg);
    }

    localStorage.setItem('studio_packages', JSON.stringify(packages));
    return pkg;
  },

  deletePackage: (id: string): boolean => {
    const packages = dbService.getPackages();
    const filteredPackages = packages.filter(pkg => pkg.id !== id);

    if (filteredPackages.length !== packages.length) {
      localStorage.setItem('studio_packages', JSON.stringify(filteredPackages));
      return true;
    }

    return false;
  },

  // Invoice methods
  getInvoices: (): Invoice[] => {
    const invoices = localStorage.getItem('studio_invoices');
    return invoices ? JSON.parse(invoices) : [];
  },

  getInvoicesByUserId: (userId: string): Invoice[] => {
    const invoices = dbService.getInvoices();
    return invoices.filter(invoice => invoice.userId === userId);
  },

  getInvoiceById: (id: string): Invoice | undefined => {
    const invoices = dbService.getInvoices();
    return invoices.find(invoice => invoice.id === id);
  },

  saveInvoice: (invoice: Invoice): Invoice => {
    const invoices = dbService.getInvoices();
    const index = invoices.findIndex(inv => inv.id === invoice.id);

    if (index >= 0) {
      // Update existing invoice
      invoices[index] = invoice;
    } else {
      // Add new invoice
      invoices.push(invoice);
    }

    localStorage.setItem('studio_invoices', JSON.stringify(invoices));
    return invoice;
  },

  deleteInvoice: (id: string): boolean => {
    const invoices = dbService.getInvoices();
    const filteredInvoices = invoices.filter(invoice => invoice.id !== id);

    if (filteredInvoices.length !== invoices.length) {
      localStorage.setItem('studio_invoices', JSON.stringify(filteredInvoices));
      return true;
    }

    return false;
  },

  updateInvoiceStatus: (id: string, status: Invoice['status']): Invoice | undefined => {
    const invoices = dbService.getInvoices();
    const index = invoices.findIndex(inv => inv.id === id);

    if (index >= 0) {
      invoices[index].status = status;
      localStorage.setItem('studio_invoices', JSON.stringify(invoices));
      return invoices[index];
    }

    return undefined;
  },

  // Calendar methods
  getAvailableDates: (month: number, year: number): string[] => {
    // This is a placeholder that returns random available dates
    // In a real implementation with Supabase, this would query the database
    const availableDates: string[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Generate 10 random available dates within the month
    const randomDays = new Set<number>();
    while (randomDays.size < 10) {
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      randomDays.add(day);
    }

    randomDays.forEach(day => {
      const date = new Date(year, month, day);
      availableDates.push(date.toISOString().split('T')[0]);
    });

    return availableDates;
  },

  getBookingsByDate: (date: string): Booking[] => {
    const bookings = dbService.getBookings();
    return bookings.filter(booking => booking.date === date);
  }
};

// Create new admin account on load
// dbService.createAdminAccount();
