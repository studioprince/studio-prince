
# Supabase Setup Instructions

Follow these steps to set up your Supabase database for the Studio Prince photography application.

## 1. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the `supabase-setup.sql` file and paste it into the SQL Editor
4. Run the SQL script to create all necessary tables

## 2. Create Initial Admin Users

After setting up the database, you need to create admin users:

1. First, create a new user in Supabase Auth (Authentication → Users → Add user):
   - Email: koyande.om27@gmail.com
   - Password: Swami@459

2. After creating the user, get their UUID from the Auth > Users section

3. Run this SQL to make them a super admin:
```sql
INSERT INTO public.users (id, email, name, role) 
VALUES ('PASTE_USER_UUID_HERE', 'koyande.om27@gmail.com', 'Super Admin', 'super_admin');
```

4. Create another user for regular admin:
   - Email: StudioAdmin@gmail.com
   - Password: admin123

5. Run this SQL to make them a regular admin:
```sql
INSERT INTO public.users (id, email, name, role) 
VALUES ('PASTE_USER_UUID_HERE', 'StudioAdmin@gmail.com', 'Studio Admin', 'admin');
```

## 3. Database Security Model

The project uses security definer functions to prevent infinite recursion in RLS policies:

- `get_role`: Safely retrieves a user's role without triggering recursive policies
- `get_user_by_id`: Gets a user profile by ID
- `handle_user_profile`: Creates or updates a user profile
- `is_admin`: Checks if a user has admin privileges
- `is_super_admin`: Checks if a user has super admin privileges

## 4. Storage Setup

1. Go to the Storage section in your Supabase dashboard
2. Create the following buckets:
   - `profile-images`: For user profile images
   - `galleries`: For client gallery images
   - `portfolio`: For public portfolio images

3. Set the appropriate bucket policies:
   - `profile-images`: Authenticated users can upload, only owner can view
   - `galleries`: Admin users can upload, owner (client) can view
   - `portfolio`: Admin users can upload, public can view

## 5. Authentication Setup

1. Go to Authentication → Settings → URL configuration
2. Set the Site URL to your application URL
3. Add Redirect URLs for your application
4. If testing locally, you may want to disable email confirmations temporarily

## 6. Environment Variables

Add these environment variables to your app:

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
