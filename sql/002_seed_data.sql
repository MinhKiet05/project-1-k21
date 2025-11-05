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

-- Notes:
-- Run this in Supabase SQL Editor after creating the schema
-- This provides basic seed data for locations (major Vietnamese cities) 
-- and categories (typical items students sell/buy)
-- You can add more locations/categories as needed