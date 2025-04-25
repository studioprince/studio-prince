
-- Create user profiles table for storing user roles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL CHECK (role IN ('super_admin', 'admin', 'client')),
  phone VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Set up RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Super admin can do anything
CREATE POLICY "Super admins can do anything" ON user_profiles
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'admin')
  );

-- Users can view their own profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  customer_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  service_type VARCHAR NOT NULL,
  date DATE NOT NULL,
  time VARCHAR NOT NULL,
  location VARCHAR NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  request_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Set up RLS for bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Super admin and admin can do anything with bookings
CREATE POLICY "Super admins and admins can do anything with bookings" ON bookings
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'admin')
  );

-- Clients can see their own bookings
CREATE POLICY "Clients can see their own bookings" ON bookings
  FOR SELECT
  USING (user_id = auth.uid());

-- Clients can create bookings
CREATE POLICY "Clients can create bookings" ON bookings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create galleries table
CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_private BOOLEAN DEFAULT TRUE,
  access_code VARCHAR,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Set up RLS for galleries
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;

-- Super admin and admin can do anything with galleries
CREATE POLICY "Super admins and admins can do anything with galleries" ON galleries
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'admin')
  );

-- Clients can see their own galleries
CREATE POLICY "Clients can see their own galleries" ON galleries
  FOR SELECT
  USING (user_id = auth.uid());

-- Create gallery images table
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID REFERENCES galleries NOT NULL,
  title VARCHAR,
  image_url VARCHAR NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Set up RLS for gallery images
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Super admin and admin can do anything with gallery images
CREATE POLICY "Super admins and admins can do anything with gallery images" ON gallery_images
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'admin')
  );

-- Clients can see their own gallery images
CREATE POLICY "Clients can see gallery images in their galleries" ON gallery_images
  FOR SELECT
  USING (
    gallery_id IN (
      SELECT id FROM galleries WHERE user_id = auth.uid()
    )
  );

-- Clients can select/unselect images
CREATE POLICY "Clients can select/unselect images in their galleries" ON gallery_images
  FOR UPDATE
  USING (
    gallery_id IN (
      SELECT id FROM galleries WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    gallery_id IN (
      SELECT id FROM galleries WHERE user_id = auth.uid()
    )
  );

-- Create packages table
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  features JSONB NOT NULL,
  duration VARCHAR NOT NULL,
  included_images INTEGER NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Set up RLS for packages
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Everyone can view packages
CREATE POLICY "Everyone can view packages" ON packages
  FOR SELECT
  USING (true);

-- Only super admins and admins can modify packages
CREATE POLICY "Only super admins and admins can modify packages" ON packages
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'admin')
  );

-- Create invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  booking_id UUID REFERENCES bookings,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  due_date DATE NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  items JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Set up RLS for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Super admin and admin can do anything with invoices
CREATE POLICY "Super admins and admins can do anything with invoices" ON invoices
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'admin')
  );

-- Clients can see their own invoices
CREATE POLICY "Clients can see their own invoices" ON invoices
  FOR SELECT
  USING (user_id = auth.uid());

-- Insert initial super admin user
-- Note: You'll need to create this user via the auth API first,
-- then add their UUID to this insertion
INSERT INTO user_profiles (id, email, name, role)
VALUES 
  ('REPLACE_WITH_AUTH_USER_ID', 'koyande.om27@gmail.com', 'Super Admin', 'super_admin');

-- Insert initial admin user
INSERT INTO user_profiles (id, email, name, role)
VALUES 
  ('REPLACE_WITH_AUTH_USER_ID', 'StudioAdmin@gmail.com', 'Studio Admin', 'admin');
