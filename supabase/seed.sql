-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert a demo Super Admin user into auth.users
-- The password is: TakiTakiBossBoss123/
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'taki@boss.dz',
  crypt('TakiTakiBossBoss123/', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Taki Boss","role":"super_admin"}',
  now(),
  now()
);

-- Note: The profile for this user will be automatically created by the
-- handle_new_user trigger in migrations/003_profile_trigger.sql
