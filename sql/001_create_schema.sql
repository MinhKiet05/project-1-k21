-- 001_create_schema.sql
-- Schema for project-1-k21
-- Run this in Supabase SQL editor or via psql connected to your Supabase DB

BEGIN;

-- Ensure pgcrypto for gen_random_uuid() is available (Supabase commonly allows this)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. locations
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE
);

-- 2. profiles (Clerk user id is text)
CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE
);

-- 4. posts
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  image_urls text[] DEFAULT ARRAY[]::text[],
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','sold','expired')),
  author_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- 5. conversations (room between users about a post). Add denormalized last message fields for inbox rendering.
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  last_message_content text,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Index to quickly order inbox by last_message_at (nulls last)
CREATE INDEX IF NOT EXISTS conversations_last_message_at_idx ON public.conversations (last_message_at DESC NULLS LAST);

-- 6. conversation_participants (many-to-many between conversations and profiles)
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  is_seen boolean DEFAULT true,
  PRIMARY KEY (conversation_id, user_id)
);

-- 7. messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index to speed queries ordering messages by created_at per conversation
CREATE INDEX IF NOT EXISTS messages_conversation_created_at_idx ON public.messages (conversation_id, created_at DESC);

COMMIT;

-- Notes:
-- - Use Supabase SQL Editor (https://app.supabase.com/project/<project>/sql) and paste+run this script.
-- - If you prefer migrations, create a migration using the Supabase CLI and include this file.
-- - For profiles.id you'll write Clerk's user ID (text). Make sure Clerk is configured to sync or you'll insert/update via backend logic.
-- - Consider adding policies (RLS) for tables to secure user data; this script only creates schema and indexes.
