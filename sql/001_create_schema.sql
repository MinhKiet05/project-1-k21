-- =========== START: 001_create_schema.sql ===========
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
  created_at timestamp DEFAULT now()
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
  created_at timestamp DEFAULT now(),
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
  created_at timestamp DEFAULT now()
);

-- Index to speed queries ordering messages by created_at per conversation
CREATE INDEX IF NOT EXISTS messages_conversation_created_at_idx ON public.messages (conversation_id, created_at DESC);

-- 8. notifications (Table definition was missing from file 001, added based on context)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('post_approved', 'post_rejected', 'message', 'system')),
  title text NOT NULL,
  content text,
  link text, -- URL hoặc slug để người dùng bấm vào
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Index để hiển thị nhanh các thông báo mới nhất
CREATE INDEX IF NOT EXISTS notifications_user_created_at_idx
ON public.notifications (user_id, created_at DESC);

COMMIT;

-- This ALTER TABLE was at the end of 001_create_schema.sql
-- It corresponds to the purpose of 002_add_message_type.sql
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text' 
CHECK (message_type IN ('text', 'product', 'product_inquiry', 'system'));

-- Notes from 001_create_schema.sql:
-- - Use Supabase SQL Editor (https://app.supabase.com/project/<project>/sql) and paste+run this script.
-- - If you prefer migrations, create a migration using the Supabase CLI and include this file.
-- - For profiles.id you'll write Clerk's user ID (text). Make sure Clerk is configured to sync or you'll insert/update via backend logic.
-- - Consider adding policies (RLS) for tables to secure user data; this script only creates schema and indexes.

-- =========== END: 001_create_schema.sql ===========


-- =========== START: 002_seed_data.sql ===========
-- 002_seed_data.sql
-- Seed data for project-1-k21
-- Run this AFTER 001_create_schema.sql

BEGIN;

-- Insert sample locations (Vietnamese provinces/cities)
INSERT INTO public.locations (name, slug) VALUES 
('Hà Nội', 'ha-noi'),
('TP. Hồ Chí Minh', 'tp-ho-chi-minh'),
('Đà Nẵng', 'da-nang'),
('Hải Phòng', 'hai-phong'),
('Cần Thơ', 'can-tho'),
('Huế', 'hue'),
('Nha Trang', 'nha-trang'),
('Quy Nhơn', 'quy-nhon'),
('Vũng Tàu', 'vung-tau'),
('Đà Lạt', 'da-lat')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample categories for student marketplace
INSERT INTO public.categories (name, slug) VALUES 
('Sách & Tài liệu', 'sach-tai-lieu'),
('Đồ dùng học tập', 'do-dung-hoc-tap'),
('Đồ điện tử', 'do-dien-tu'),
('Đồ gia dụng', 'do-gia-dung'),
('Thời trang', 'thoi-trang'),
('Nội thất', 'noi-that'),
('Thể thao & Giải trí', 'the-thao-giai-tri'),
('Khác', 'khac')
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- Notes from 002_seed_data.sql:
-- Run this in Supabase SQL Editor after creating the schema
-- This provides basic seed data for locations (major Vietnamese cities) 
-- and categories (typical items students sell/buy)
-- You can add more locations/categories as needed

-- =========== END: 002_seed_data.sql ===========


-- =========== START: 003_cleanup_duplicate_conversations.sql ===========
-- Clean up duplicate conversations between same users
-- This script merges duplicate conversations and moves all messages to the oldest conversation

-- Step 1: Find duplicate conversations (same participants)
WITH conversation_participants_agg AS (
  SELECT 
    conversation_id,
    array_agg(user_id ORDER BY user_id) as participants,
    MIN(c.created_at) as earliest_created_at
  FROM conversation_participants cp
  JOIN conversations c ON c.id = cp.conversation_id
  GROUP BY conversation_id
),
duplicate_groups AS (
  SELECT 
    participants,
    array_agg(conversation_id ORDER BY earliest_created_at) as conversation_ids,
    COUNT(*) as conversation_count
  FROM conversation_participants_agg
  GROUP BY participants
  HAVING COUNT(*) > 1
)
-- Step 2: For each group of duplicates, keep the oldest and merge others into it
SELECT 
  participants,
  conversation_ids[1] as keep_conversation_id,
  conversation_ids[2:] as merge_conversation_ids
FROM duplicate_groups;

-- Run this first to see what duplicates exist, then proceed with cleanup if needed

-- =========== END: 003_cleanup_duplicate_conversations.sql ===========