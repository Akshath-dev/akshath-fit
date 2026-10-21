-- Run once in the Supabase SQL Editor as the project administrator.
-- First create your email/password user under Authentication → Users → Add user.
-- Replace the example UUID below with that user's UUID. Do not use a password here.
select app_private.provision_owner('00000000-0000-0000-0000-000000000000'::uuid);
-- Also turn OFF "Allow new users to sign up" in Authentication settings.
