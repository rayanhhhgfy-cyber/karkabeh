-- Fix for sign-up RLS policy issue
-- Run this in Supabase SQL Editor

-- Allow any authenticated user to insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" 
ON users FOR INSERT 
WITH CHECK (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

-- Allow users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id OR auth.jwt() ->> 'email' IN ('admin@gmail.com', 'admin2211@gmail.com'));
