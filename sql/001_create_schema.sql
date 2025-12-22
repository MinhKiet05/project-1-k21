-- *************************************************************
-- ** FILE SQL TỔNG HỢP CHO PROJECT-1-K21 (BẢN FINAL & CLEAN) **
-- *************************************************************
-- Tác vụ: Khởi tạo Schema, Seed Data, Trigger bảo mật và RLS
-- *************************************************************

BEGIN;

-- 1. THIẾT LẬP TIỆN ÍCH
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- 2. KHỞI TẠO CƠ SỞ DỮ LIỆU (TABLES)
-- =============================================================

-- 2.1 Locations (Khu vực)
CREATE TABLE IF NOT EXISTS public.locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    name_en text
);

-- 2.2 Profiles (Người dùng - ID khớp với Clerk)
CREATE TABLE IF NOT EXISTS public.profiles (
    id text PRIMARY KEY,
    email text NOT NULL UNIQUE,
    full_name text,
    avatar_url text,
    roles text[] NOT NULL DEFAULT ARRAY['user']::text[] 
        CHECK (
            (SELECT bool_and(r = ANY(ARRAY['user', 'admin', 'super_admin'])) FROM unnest(roles) AS t(r))
            AND array_length(roles, 1) > 0
        ),
    location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- 2.3 Categories (Danh mục)
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    name_en text
);

-- 2.4 Posts (Tin đăng)
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
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz
);

-- 2.5 Chat System (Hội thoại & Tin nhắn)
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    last_message_content text,
    last_message_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at timestamptz DEFAULT now(),
    is_seen boolean DEFAULT true,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz DEFAULT now(),
    message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'product', 'product_inquiry', 'system'))
);

-- 2.6 Notifications (Thông báo)
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

-- =============================================================
-- 3. SEED DATA (DỮ LIỆU TỈNH THÀNH & DANH MỤC)
-- =============================================================

INSERT INTO public.locations (name, slug, name_en) VALUES 
('Hà Nội', 'ha-noi', 'Ha Noi'), ('TP. Hồ Chí Minh', 'tp-ho-chi-minh', 'TP. Ho Chi Minh'),
('Đà Nẵng', 'da-nang', 'Da Nang'), ('Hải Phòng', 'hai-phong', 'Hai Phong'),
('Cần Thơ', 'can-tho', 'Can Thơ'), ('Huế', 'hue', 'Hue'),
('Nha Trang', 'nha-trang', 'Nha Trang'), ('Quy Nhơn', 'quy-nhon', 'Quy Nhon'),
('Vũng Tàu', 'vung-tau', 'Vung Tau'), ('Đà Lạt', 'da-lat', 'Da Lat'),
('An Giang', 'an-giang', 'An Giang'), ('Bà Rịa - Vũng Tàu', 'ba-ria-vung-tau', 'Ba Ria - Vung Tau'),
('Bạc Liêu', 'bac-lieu', 'Bac Lieu'), ('Bắc Giang', 'bac-giang', 'Bac Giang'),
('Bắc Kạn', 'bac-kan', 'Bac Kan'), ('Bắc Ninh', 'bac-ninh', 'Bac Ninh'),
('Bến Tre', 'ben-tre', 'Ben Tre'), ('Bình Dương', 'binh-duong', 'Binh Duong'),
('Bình Định', 'binh-dinh', 'Binh Dinh'), ('Bình Phước', 'binh-phuoc', 'Binh Phuoc'),
('Bình Thuận', 'binh-thuan', 'Binh Thuận'), ('Cà Mau', 'ca-mau', 'Ca Mau'),
('Cao Bằng', 'cao-bang', 'Cao Bang'), ('Đắk Lắk', 'dak-lak', 'Dak Lak'),
('Đắk Nông', 'dak-nong', 'Dak Nong'), ('Điện Biên', 'dien-bien', 'Dien Bien'),
('Đồng Nai', 'dong-nai', 'Dong Nai'), ('Đồng Tháp', 'dong-thap', 'Dong Thap'),
('Gia Lai', 'gia-lai', 'Gia Lai'), ('Hà Giang', 'ha-giang', 'Ha Giang'),
('Hà Nam', 'ha-nam', 'Ha Nam'), ('Hà Tĩnh', 'ha-tinh', 'Ha Tinh'),
('Hải Dương', 'hai-duong', 'Hai Duong'), ('Hậu Giang', 'hau-giang', 'Hau Giang'),
('Hòa Bình', 'hoa-binh', 'Hoa Binh'), ('Hưng Yên', 'hung-yen', 'Hung Yen'),
('Khánh Hòa', 'khanh-hoa', 'Khánh Hòa'), ('Kiên Giang', 'kien-giang', 'Kien Giang'),
('Kon Tum', 'kon-tum', 'Kon Tum'), ('Lai Châu', 'lai-chau', 'Lai Chau'),
('Lâm Đồng', 'lam-dong', 'Lam Dong'), ('Lạng Sơn', 'lang-son', 'Lang Son'),
('Lào Cai', 'lao-cai', 'Lao Cai'), ('Long An', 'long-an', 'Long An'),
('Nam Định', 'nam-dinh', 'Nam Dinh'), ('Nghệ An', 'nghe-an', 'Nghe An'),
('Ninh Bình', 'ninh-binh', 'Ninh Binh'), ('Ninh Thuận', 'ninh-thuan', 'Ninh Thuận'),
('Phú Thọ', 'phu-tho', 'Phu Tho'), ('Phú Yên', 'phu-yen', 'Phu Yen'),
('Quảng Bình', 'quang-binh', 'Quang Binh'), ('Quảng Nam', 'quang-nam', 'Quang Nam'),
('Quảng Ngãi', 'quang-ngai', 'Quang Ngai'), ('Quảng Ninh', 'quang-ninh', 'Quang Ninh'),
('Quảng Trị', 'quang-tri', 'Quang Tri'), ('Sóc Trăng', 'soc-trang', 'Soc Trang'),
('Sơn La', 'son-la', 'Son La'), ('Tây Ninh', 'tay-ninh', 'Tay Ninh'),
('Thái Bình', 'thai-binh', 'Thai Binh'), ('Thái Nguyên', 'thai-nguyen', 'Thai Nguyen'),
('Thanh Hóa', 'thanh-hoa', 'Thanh Hóa'), ('Thừa Thiên Huế', 'thua-thien-hue', 'Thua Thien Hue'),
('Tiền Giang', 'tien-giang', 'Tien Giang'), ('Trà Vinh', 'tra-vinh', 'Tra Vinh'),
('Tuyên Quang', 'tuyen-quang', 'Tuyen Quang'), ('Vĩnh Long', 'vinh-long', 'Vinh Long'),
('Vĩnh Phúc', 'vinh-phuc', 'Vinh Phuc'), ('Yên Bái', 'yen-bai', 'Yen Bai')
ON CONFLICT (slug) DO NOTHING;

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

-- =============================================================
-- 4. TRIGGER BẢO VỆ ROLES (CHỐNG GIẢ MẠO TỪ FRONTEND)
-- =============================================================

-- Hàm kiểm tra quyền thay đổi Roles dựa trên JWT Claim 'roles'
CREATE OR REPLACE FUNCTION public.protect_user_roles()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu không có quyền super_admin trong JWT (Key: 'roles'), cấm thay đổi cột roles
    IF NOT (
        COALESCE((auth.jwt() -> 'roles')::jsonb ? 'super_admin', false)
    ) THEN
        NEW.roles = OLD.roles;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gán Trigger vào bảng profiles
DROP TRIGGER IF EXISTS tr_protect_user_roles ON public.profiles;
CREATE TRIGGER tr_protect_user_roles
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_user_roles();

-- =============================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================

-- Kích hoạt RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5.1 Policies cho Profiles
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid()::text = id) WITH CHECK (auth.uid()::text = id);

DROP POLICY IF EXISTS "Super Admin manage all profiles" ON public.profiles;
CREATE POLICY "Super Admin manage all profiles" ON public.profiles 
FOR UPDATE USING ((auth.jwt() -> 'roles')::jsonb ? 'super_admin');

-- 5.2 Policies cho Posts
DROP POLICY IF EXISTS "Read posts access" ON public.posts;
CREATE POLICY "Read posts access" ON public.posts FOR SELECT USING (
    status = 'approved' 
    OR auth.uid()::text = author_id 
    OR (auth.jwt() -> 'roles')::jsonb ?| ARRAY['admin', 'super_admin']
);

DROP POLICY IF EXISTS "Create posts access" ON public.posts;
CREATE POLICY "Create posts access" ON public.posts 
FOR INSERT WITH CHECK (auth.uid()::text = author_id);

DROP POLICY IF EXISTS "Manage posts access" ON public.posts;
CREATE POLICY "Manage posts access" ON public.posts FOR ALL USING (
    auth.uid()::text = author_id 
    OR (auth.jwt() -> 'roles')::jsonb ?| ARRAY['admin', 'super_admin']
);

-- 5.3 Policies cho Messages
DROP POLICY IF EXISTS "Conversation participants access" ON public.messages;
CREATE POLICY "Conversation participants access" ON public.messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = messages.conversation_id 
    AND user_id = auth.uid()::text
  )
);

-- =============================================================
-- 6. DỌN DẸP DỮ LIỆU TRÙNG LẶP (Dọn dẹp Conversation)
-- =============================================================

WITH duplicate_groups AS (
  SELECT array_agg(conversation_id ORDER BY created_at ASC) as ids
  FROM (
    SELECT cp.conversation_id, array_agg(cp.user_id ORDER BY cp.user_id) as participants, c.created_at
    FROM public.conversation_participants cp
    JOIN public.conversations c ON c.id = cp.conversation_id
    GROUP BY cp.conversation_id, c.created_at
  ) t
  GROUP BY participants HAVING COUNT(*) > 1
),
merges AS (SELECT ids[1] as keep_id, unnest(ids[2:]) as merge_id FROM duplicate_groups)
UPDATE public.messages m SET conversation_id = merges.keep_id FROM merges WHERE m.conversation_id = merges.merge_id;

COMMIT;