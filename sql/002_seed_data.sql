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
('Quy Nhon', 'quy-nhon'),
('Vũng Tàu', 'vung-tau'),
('Đà Lạt', 'da-lat')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample categories for student marketplace
INSERT INTO public.categories (name, slug) VALUES 
('Sách giáo trình', 'sach-giao-trinh'),
('Đồ điện tử', 'do-dien-tu'),
('Quần áo', 'quan-ao'),
('Đồ dùng học tập', 'do-dung-hoc-tap'),
('Xe đạp - Xe máy', 'xe-dap-xe-may'),
('Đồ gia dụng', 'do-gia-dung'),
('Thể thao', 'the-thao'),
('Âm nhạc - Nhạc cụ', 'am-nhac-nhac-cu'),
('Mỹ phẩm', 'my-pham'),
('Đồ ăn - Thực phẩm', 'do-an-thuc-pham'),
('Khác', 'khac')
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- Notes:
-- Run this in Supabase SQL Editor after creating the schema
-- This provides basic seed data for locations (major Vietnamese cities) 
-- and categories (typical items students sell/buy)
-- You can add more locations/categories as needed