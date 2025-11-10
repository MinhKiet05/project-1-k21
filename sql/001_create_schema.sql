-- *************************************************************
-- ** FILE SQL TỔNG HỢP CHO PROJECT-1-K21          **
-- *************************************************************
-- Bao gồm:
-- 1. Create Schema
-- 2. Seed Data
-- 3. Cleanup Duplicates
-- *************************************************************


-- =========== START: 001_CREATE_SCHEMA ===========
-- Schema for project-1-k21
-- Run this in Supabase SQL editor or via psql connected to your Supabase DB

BEGIN;

-- Ensure pgcrypto for gen_random_uuid() is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. locations
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  name_en text -- Added from seed script
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
  slug text NOT NULL UNIQUE,
  name_en text -- Added from seed script
);

-- 4. posts
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  image_urls text[] DEFAULT ARRAY[]::text[],
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','sold','expired')),
  author_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  created_at timestamp DEFAULT now(),
  expires_at timestamptz
);

-- 5. conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  last_message_content text,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversations_last_message_at_idx ON public.conversations (last_message_at DESC NULLS LAST);

-- 6. conversation_participants
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
  created_at timestamp DEFAULT now(),
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'product', 'product_inquiry', 'system')) -- Added directly
);

CREATE INDEX IF NOT EXISTS messages_conversation_created_at_idx ON public.messages (conversation_id, created_at DESC);

-- 8. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('post_approved', 'post_rejected', 'post_expired', 'message', 'system')),
  title text NOT NULL,
  content text,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_created_at_idx
ON public.notifications (user_id, created_at DESC);

COMMIT;

-- =========== END: 001_CREATE_SCHEMA ===========


-- =========== START: 002_SEED_DATA ===========
-- Seed data for project-1-k21
-- Run this AFTER 001_create_schema.sql

BEGIN;

-- Insert sample locations (Vietnamese provinces/cities)
INSERT INTO public.locations (name, slug, name_en) VALUES 
('Hà Nội', 'ha-noi', 'Ha Noi'),
('TP. Hồ Chí Minh', 'tp-ho-chi-minh', 'TP. Ho Chi Minh'),
('Đà Nẵng', 'da-nang', 'Da Nang'),
('Hải Phòng', 'hai-phong', 'Hai Phong'),
('Cần Thơ', 'can-tho', 'Can Tho'),
('Huế', 'hue', 'Hue'),
('Nha Trang', 'nha-trang', 'Nha Trang'),
('Quy Nhơn', 'quy-nhon', 'Quy Nhon'),
('Vũng Tàu', 'vung-tau', 'Vung Tau'),
('Đà Lạt', 'da-lat', 'Da Lat'),
('An Giang', 'an-giang', 'An Giang'),
('Bà Rịa - Vũng Tàu', 'ba-ria-vung-tau', 'Ba Ria - Vung Tau'),
('Bạc Liêu', 'bac-lieu', 'Bac Lieu'),
('Bắc Giang', 'bac-giang', 'Bac Giang'),
('Bắc Kạn', 'bac-kan', 'Bac Kan'),
('Bắc Ninh', 'bac-ninh', 'Bac Ninh'),
('Bến Tre', 'ben-tre', 'Ben Tre'),
('Bình Dương', 'binh-duong', 'Binh Duong'),
('Bình Định', 'binh-dinh', 'Binh Dinh'),
('Bình Phước', 'binh-phuoc', 'Binh Phuoc'),
('Bình Thuận', 'binh-thuan', 'Binh Thuan'),
('Cà Mau', 'ca-mau', 'Ca Mau'),
('Cao Bằng', 'cao-bang', 'Cao Bang'),
('Đắk Lắk', 'dak-lak', 'Dak Lak'),
('Đắk Nông', 'dak-nong', 'Dak Nong'),
('Điện Biên', 'dien-bien', 'Dien Bien'),
('Đồng Nai', 'dong-nai', 'Dong Nai'),
('Đồng Tháp', 'dong-thap', 'Dong Thap'),
('Gia Lai', 'gia-lai', 'Gia Lai'),
('Hà Giang', 'ha-giang', 'Ha Giang'),
('Hà Nam', 'ha-nam', 'Ha Nam'),
('Hà Tĩnh', 'ha-tinh', 'Ha Tinh'),
('Hải Dương', 'hai-duong', 'Hai Duong'),
('Hậu Giang', 'hau-giang', 'Hau Giang'),
('Hòa Bình', 'hoa-binh', 'Hoa Binh'),
('Hưng Yên', 'hung-yen', 'Hung Yen'),
('Khánh Hòa', 'khanh-hoa', 'Khanh Hoa'),
('Kiên Giang', 'kien-giang', 'Kien Giang'),
('Kon Tum', 'kon-tum', 'Kon Tum'),
('Lai Châu', 'lai-chau', 'Lai Chau'),
('Lâm Đồng', 'lam-dong', 'Lam Dong'),
('Lạng Sơn', 'lang-son', 'Lang Son'),
('Lào Cai', 'lao-cai', 'Lao Cai'),
('Long An', 'long-an', 'Long An'),
('Nam Định', 'nam-dinh', 'Nam Dinh'),
('Nghệ An', 'nghe-an', 'Nghe An'),
('Ninh Bình', 'ninh-binh', 'Ninh Binh'),
('Ninh Thuận', 'ninh-thuan', 'Ninh Thuan'),
('Phú Thọ', 'phu-tho', 'Phu Tho'),
('Phú Yên', 'phu-yen', 'Phu Yen'),
('Quảng Bình', 'quang-binh', 'Quang Binh'),
('Quảng Nam', 'quang-nam', 'Quang Nam'),
('Quảng Ngãi', 'quang-ngai', 'Quang Ngai'),
('Quảng Ninh', 'quang-ninh', 'Quang Ninh'),
('Quảng Trị', 'quang-tri', 'Quang Tri'),
('Sóc Trăng', 'soc-trang', 'Soc Trang'),
('Sơn La', 'son-la', 'Son La'),
('Tây Ninh', 'tay-ninh', 'Tay Ninh'),
('Thái Bình', 'thai-binh', 'Thai Binh'),
('Thái Nguyên', 'thai-nguyen', 'Thai Nguyen'),
('Thanh Hóa', 'thanh-hoa', 'Thanh Hoa'),
('Thừa Thiên Huế', 'thua-thien-hue', 'Thua Thien Hue'),
('Tiền Giang', 'tien-giang', 'Tien Giang'),
('Trà Vinh', 'tra-vinh', 'Tra Vinh'),
('Tuyên Quang', 'tuyen-quang', 'Tuyen Quang'),
('Vĩnh Long', 'vinh-long', 'Vinh Long'),
('Vĩnh Phúc', 'vinh-phuc', 'Vinh Phuc'),
('Yên Bái', 'yen-bai', 'Yen Bai')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample categories for student marketplace
INSERT INTO public.categories (name, slug, name_en) VALUES 
('Sách & Tài liệu', 'sach-tai-lieu', 'Books & Documents'),
('Đồ dùng học tập', 'do-dung-hoc-tap', 'Study Supplies'),
('Đồ điện tử', 'do-dien-tu', 'Electronics'),
('Đồ gia dụng', 'do-gia-dung', 'Home Appliances'),
('Thời trang', 'thoi-trang', 'Fashion'),
('Nội thất', 'noi-that', 'Furniture'),
('Thể thao & Giải trí', 'the-thao-giai-tri', 'Sports & Entertainment'),
('Giáo trình tiếng Anh', 'giao-trinh-tieng-anh', 'English Textbooks'),
('Khác', 'khac', 'Others')
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- =========== END: 002_SEED_DATA ===========


-- =========== START: 003_CLEANUP_DUPLICATES ===========
-- Merges duplicate conversations and moves all messages to the oldest conversation.
-- This won't do anything on a fresh DB, but is safe to run.

BEGIN;

-- Step 1: Find duplicate groups and identify which to keep (oldest) and which to merge (newer)
WITH conversation_participants_agg AS (
  SELECT 
    cp.conversation_id,
    array_agg(cp.user_id ORDER BY cp.user_id) as participants,
    c.created_at
  FROM public.conversation_participants cp
  JOIN public.conversations c ON c.id = cp.conversation_id
  GROUP BY cp.conversation_id, c.created_at
),
duplicate_groups AS (
  SELECT 
    participants,
    array_agg(conversation_id ORDER BY created_at ASC) as conversation_ids -- Oldest first
  FROM conversation_participants_agg
  GROUP BY participants
  HAVING COUNT(*) > 1
),
-- Create a list of (keep_id, merge_id) pairs
duplicates_to_merge AS (
  SELECT 
    conversation_ids[1] as keep_id,
    unnest(conversation_ids[2:]) as merge_id -- Get all IDs except the first one
  FROM duplicate_groups
)
-- Step 2: Move messages from 'merge_id' conversations to 'keep_id' conversation
UPDATE public.messages m
SET conversation_id = d.keep_id
FROM duplicates_to_merge d
WHERE m.conversation_id = d.merge_id;


-- Step 3: Delete participants from the merged (now empty) conversations
DELETE FROM public.conversation_participants cp
USING duplicates_to_merge d
WHERE cp.conversation_id = d.merge_id;


-- Step 4: Delete the merged (now empty) conversations
DELETE FROM public.conversations c
USING duplicates_to_merge d
WHERE c.id = d.merge_id;

COMMIT;

-- NOTE: After running this, you may want to update the 
-- 'last_message_content' and 'last_message_at' fields 
-- on the 'keep_id' conversations to reflect the newly moved messages.

-- =========== END: 003_CLEANUP_DUPLICATES ===========