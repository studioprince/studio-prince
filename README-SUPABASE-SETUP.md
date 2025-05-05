
# Supabase Setup Instructions

Follow these steps to set up your Supabase database for the Studio Prince photography application.

## 1. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the `supabase-setup.sql` file and paste it into the SQL Editor
4. Run the SQL script to create all necessary tables
5. Note: You'll need to replace the `REPLACE_WITH_AUTH_USER_ID` placeholders with actual user IDs

## 2. Create Initial Super Admin User

1. Create a new user in Supabase Auth:
   - Email: koyande.om27@gmail.com
   - Password: Swami@459

2. After creating the user, get their UUID from the Auth > Users section
3. Replace the `REPLACE_WITH_AUTH_USER_ID` placeholder in the SQL script with this UUID
4. Run the INSERT statement for the super admin user

## 3. Create Initial Admin User

1. Create another user in Supabase Auth:
   - Email: StudioAdmin@gmail.com
   - Password: admin123

2. After creating the user, get their UUID and replace the second `REPLACE_WITH_AUTH_USER_ID` placeholder
3. Run the INSERT statement for the admin user

## 4. Security Definer Functions

The project uses security definer functions to prevent infinite recursion in RLS policies:

- `get_user_role_safe`: Safely retrieves a user's role without triggering recursive policies
- `get_profile_by_id`: Gets a user profile by ID
- `create_user_profile`: Creates or updates a user profile
- `is_admin`: Checks if a user has admin privileges
- `is_super_admin`: Checks if a user has super admin privileges

## 5. Storage Setup

1. Go to the Storage section in your Supabase dashboard
2. Create the following buckets:
   - `profile-images`: For user profile images
   - `galleries`: For client gallery images
   - `portfolio`: For public portfolio images

3. Set the appropriate bucket policies:
   - `profile-images`: Authenticated users can upload, only owner can view
   - `galleries`: Admin users can upload, owner (client) can view
   - `portfolio`: Admin users can upload, public can view

## 6. Environment Variables

Add these environment variables to your Lovable app:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Testing the Setup

Once everything is set up, you should be able to:

1. Log in with the super admin account:
   - Email: koyande.om27@gmail.com
   - Password: Swami@459

2. Log in with the admin account:
   - Email: StudioAdmin@gmail.com
   - Password: admin123

3. Create new client accounts using the registration form

## User Roles

- **Super Admin**: Can manage all users, bookings, galleries, and invoices
- **Admin**: Can manage bookings, galleries, and invoices
- **Client**: Can see their own bookings, galleries, and invoices

## Next Steps

After setting up Supabase, you'll need to:

1. Update the booking system to use Supabase
2. Implement the gallery system with image uploads
3. Set up invoicing with Supabase
4. Implement real-time updates using Supabase's realtime feature
