# Fix Database Constraint Issue

## Vấn đề
Lỗi khi admin "Không duyệt" bài đăng: `new row for relation "posts" violates check constraint "posts_status_check"`

## Nguyên nhân
Database constraint chỉ cho phép status: `('pending','approved','sold','expired')` nhưng code cần thêm status `'rejected'`.

## Giải pháp

### 1. Chạy migration trong Supabase SQL Editor:

```sql
-- Copy và paste đoạn code này vào Supabase SQL Editor
BEGIN;

-- Drop the existing constraint
ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_status_check;

-- Add the new constraint with rejected included
ALTER TABLE public.posts 
ADD CONSTRAINT posts_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'sold', 'expired'));

COMMIT;
```

### 2. Hoặc chạy file migration:
Chạy nội dung file: `sql/005_fix_posts_status_constraint.sql`

### 3. Kiểm tra sau khi fix:
- Thử "Không duyệt" một bài đăng
- Kiểm tra notifications có hiển thị không
- Bài đăng có status "Không duyệt" đúng không

## Status values được support:
- `pending`: Chờ duyệt  
- `approved`: Đã duyệt
- `rejected`: Không duyệt ✅ (Mới thêm)
- `sold`: Đã bán
- `expired`: Hết hạn