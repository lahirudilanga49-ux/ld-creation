# LD Creation - GitHub Pages + Supabase

This version is prepared for a static GitHub Pages frontend with Supabase for authentication, database, orders and product-image storage.

## 1. Create Supabase project
Create a project in Supabase.

## 2. Run the database script
Open Supabase -> SQL Editor, paste the complete contents of `supabase_schema.sql`, and run it.

## 3. Get API settings
Open Supabase -> Project Settings -> API. Copy:
- Project URL
- Publishable/anon public key

Open `config.js` and replace:
`YOUR_SUPABASE_PROJECT_URL`
`YOUR_SUPABASE_ANON_KEY`

Do NOT use or upload a `service_role` key.

## 4. Create the admin account
Open Supabase -> Authentication -> Users and create your admin email/password.
Then run this SQL in SQL Editor:

update public.profiles set role='admin' where email='YOUR_ADMIN_EMAIL';

The admin dashboard and RLS policies use `profiles.role = 'admin'`. If you also created a separate `user_roles` table during setup, that table is not required by this project.

Replace `YOUR_ADMIN_EMAIL` with your actual admin email.

## 5. Email confirmation
For the first test, you can disable email confirmation under Supabase Authentication settings, or keep it enabled and confirm the registration email.

## 6. Upload to GitHub
Upload all files/folders in this package to the root of your GitHub Pages repository. `index.html` must be in the repository root.

## 7. Open the website
Your GitHub Pages URL should be:
https://lahirudilanga49-ux.github.io/

## What is connected
- Customer registration/login: Supabase Auth
- Customer details: profiles table
- Products: products table
- Product image upload: Supabase Storage bucket `product-images`
- Cart: browser localStorage
- Orders: orders + order_items tables
- Admin: Supabase Auth + profiles.role = admin
- Order status: Pending / Confirmed / Processing / Delivered / Cancelled

## Important security note
The browser contains only the Supabase public/anon key. Security is enforced with Supabase Row Level Security (RLS). Never place the Supabase service_role key in this website.
