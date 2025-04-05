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
  requestDate: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
}

// Initial admin user
const ADMIN_USER: User = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin'
};

// Initial client user
const CLIENT_USER: User = {
  id: 'client-1',
  name: 'Emily Johnson',
  email: 'emily@example.com', 
  role: 'client'
};

// Initialize the database with demo data
const initializeDB = () => {
  // Check if we already have data in localStorage
  if (!localStorage.getItem('studio_bookings')) {
    // Sample booking data
    const sampleBookings: Booking[] = [
      {
        id: 'booking-1',
        userId: 'client-1',
        customerName: 'Emily Johnson',
        email: 'emily@example.com',
        phone: '(555) 123-4567',
        serviceType: 'Wedding Photography',
        date: '2025-06-15',
        time: '14:00',
        location: 'Grand Plaza Hotel',
        status: 'pending',
        requestDate: '2025-04-02',
        notes: 'Outdoor ceremony, indoor reception'
      },
      {
        id: 'booking-2',
        userId: 'client-1',
        customerName: 'Emily Johnson',
        email: 'emily@example.com',
        phone: '(555) 123-4567',
        serviceType: 'Portrait Session',
        date: '2025-04-20',
        time: '10:00',
        location: 'Studio',
        status: 'confirmed',
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
    localStorage.setItem('user_pwd_admin-1', 'password');
  }
  
  if (!localStorage.getItem('user_pwd_client-1')) {
    localStorage.setItem('user_pwd_client-1', 'password');
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
  }
};
