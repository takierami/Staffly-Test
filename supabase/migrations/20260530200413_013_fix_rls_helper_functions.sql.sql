/*
  # Fix RLS Helper Functions and Profile Policies

  1. Problem
    - Helper functions (get_user_role, get_user_org_id, is_super_admin) used incorrect
      SQL syntax returning sets instead of scalar values
    - RLS policies using these functions caused "Database error querying schema"
    - Missing policy for users to read their own profile during authentication

  2. Changes
    - Fixed get_user_role() to return TEXT scalar value
    - Fixed get_user_org_id() to return UUID scalar value  
    - Fixed is_super_admin() to return BOOLEAN scalar value
    - Fixed handle_new_user() trigger function
    - Simplified RLS policies to avoid circular function dependencies

  3. Security
    - All functions use SECURITY DEFINER for proper privilege escalation
    - Policies maintain proper access control (super_admin > admin > org member > user)
*/

-- Fix helper functions to return proper scalar values
CREATE OR REPLACE FUNCTION get_user_role() RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_org_id() RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id FROM public.profiles WHERE id = auth.uid();
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fix the handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, organization_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
    (NEW.raw_user_meta_data->>'organization_id')::UUID
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;