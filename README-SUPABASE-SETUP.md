
# Supabase Setup Instructions

Follow these steps to set up your Supabase database for the Studio Prince photography application.

## 1. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the `supabase-setup.sql` file and paste it into the SQL Editor
4. Run the SQL script to create all necessary tables and functions

## 2. Database Security Model

The project uses security definer functions to prevent infinite recursion in RLS policies:

- `get_client_by_id`: Safely retrieves a client profile by ID without triggering recursive policies
- `handle_client_profile`: Creates or updates a client profile

## 3. Storage Setup

1. Go to the Storage section in your Supabase dashboard
2. Create the following buckets:
   - `profile-images`: For user profile images
   - `galleries`: For client gallery images

3. Set the appropriate bucket policies:
   - `profile-images`: Authenticated users can upload, only owner can view
   - `galleries`: Gallery owners can view

## 4. Authentication Setup

1. Go to Authentication → Settings → URL configuration
2. Set the Site URL to your application URL
3. Add Redirect URLs for your application
4. If testing locally, you may want to disable email confirmations temporarily

## 5. Environment Variables

Add these environment variables to your app:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Testing the Setup

Once everything is set up, you should be able to:

1. Create a new client account using the registration form
2. Log in with the client account
3. Complete profile setup
4. Access the dashboard to manage bookings and galleries
