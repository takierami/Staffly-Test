/*
  # Fix Missing Auth Instance

  1. Problem
    - Supabase Auth requires a record in auth.instances table
    - Our seed data inserted users with instance_id = '00000000-0000-0000-0000-000000000000'
    - But the auth.instances table was empty, causing "Database error querying schema" on login

  2. Fix
    - Insert the required instance record with matching id
    - This allows Supabase Auth service to properly authenticate users

  3. Notes
    - This is a one-time fix for projects that seeded users directly into auth.users
    - Normal Supabase signup flow creates this automatically
*/

INSERT INTO auth.instances (
  id,
  uuid,
  raw_base_config,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  '{"external":{"user_user":{},"user_admin":{}}}',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;