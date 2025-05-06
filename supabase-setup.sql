
-- Create role enum type
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'client');

-- Create users table - this will store ALL users, both clients and admins
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  name VARCHAR,
  role app_role NOT NULL DEFAULT 'client',
  profile_completed BOOLEAN DEFAULT false,
  phone VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Setup RLS for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER FUNCTIONS - these prevent recursive policies
-- Function to get role without recursion
CREATE OR REPLACE FUNCTION public.get_role(uid UUID)
RETURNS app_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM users WHERE id = uid;
$$;

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role IN ('admin', 'super_admin') FROM users WHERE id = uid;
$$;

-- Function to check if a user is a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role = 'super_admin' FROM users WHERE id = uid;
$$;

-- Function to get full user profile safely
CREATE OR REPLACE FUNCTION public.get_user_by_id(uid UUID)
RETURNS SETOF users
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM users WHERE id = uid;
$$;

-- Function to create/update user profile safely
CREATE OR REPLACE FUNCTION public.handle_user_profile(
  uid UUID,
  user_email VARCHAR,
  user_name VARCHAR DEFAULT NULL,
  user_role app_role DEFAULT 'client',
  user_phone VARCHAR DEFAULT NULL
)
RETURNS users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result users;
BEGIN
  INSERT INTO users (id, email, name, role, phone)
  VALUES (uid, user_email, user_name, user_role, user_phone)
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    phone = COALESCE(EXCLUDED.phone, users.phone),
    updated_at = NOW()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- RLS POLICIES for users table
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM users WHERE id = auth.uid()));

-- Admins can view all client profiles
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Super admins can update any profile
CREATE POLICY "Super admins can do anything" ON users
  USING (public.is_super_admin(auth.uid()));

-- The rest of the database tables follow the same pattern
-- with proper references to the users table and secure policies

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users NOT NULL,
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
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Admins can manage all bookings" ON bookings
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Clients can view own bookings" ON bookings
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Clients can create bookings" ON bookings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create galleries table
CREATE TABLE public.galleries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  user_id UUID REFERENCES users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_private BOOLEAN DEFAULT TRUE,
  access_code VARCHAR,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS for galleries
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;

-- Gallery policies
CREATE POLICY "Admins can manage all galleries" ON galleries
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Clients can view own galleries" ON galleries
  FOR SELECT
  USING (user_id = auth.uid());

-- Gallery images table
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID REFERENCES galleries NOT NULL,
  title VARCHAR,
  image_url VARCHAR NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS for gallery images
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Gallery image policies
CREATE POLICY "Admins can manage all gallery images" ON gallery_images
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Clients can view own gallery images" ON gallery_images
  FOR SELECT
  USING (gallery_id IN (SELECT id FROM galleries WHERE user_id = auth.uid()));

CREATE POLICY "Clients can select/unselect images" ON gallery_images
  FOR UPDATE
  USING (gallery_id IN (SELECT id FROM galleries WHERE user_id = auth.uid()))
  WITH CHECK (gallery_id IN (SELECT id FROM galleries WHERE user_id = auth.uid()));

-- Photography packages
CREATE TABLE public.packages (
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

-- RLS for packages
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Package policies
CREATE POLICY "Everyone can view packages" ON packages
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage packages" ON packages
  USING (public.is_admin(auth.uid()));

-- Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users NOT NULL,
  booking_id UUID REFERENCES bookings,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  due_date DATE NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  items JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS for invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Invoice policies
CREATE POLICY "Admins can manage all invoices" ON invoices
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Clients can view own invoices" ON invoices
  FOR SELECT
  USING (user_id = auth.uid());
