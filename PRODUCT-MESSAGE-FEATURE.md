# Cập nhật Database cho Tin nhắn Sản phẩm

## Các thay đổi đã thực hiện:

### 1. **Logic mới cho Liên hệ ngay**
- Khi ấn nút "Liên hệ ngay" ở DetailProduct
- Hệ thống sẽ tìm cuộc trò chuyện hiện có giữa người bán và người mua
- Nếu chưa có → tạo cuộc trò chuyện mới
- Tự động gửi tin nhắn hiển thị thông tin sản phẩm

### 2. **Tính năng mới**
- ✅ **Một cuộc trò chuyện duy nhất** giữa mỗi cặp người bán-mua cho cùng sản phẩm
- ✅ **Tin nhắn sản phẩm tự động** với design đặc biệt (background gradient, icon 🛍️)
- ✅ **Không duplicate tin nhắn sản phẩm** (chỉ gửi 1 lần cho mỗi sản phẩm)
- ✅ **Hiển thị đầy đủ**: Tên sản phẩm, giá, khu vực

### 3. **Cập nhật Database**
Chạy file `database-updates.sql` trong Supabase SQL Editor:

```sql
-- Add new columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES posts(id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_messages_product_id ON messages(product_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
```

### 4. **Cách hoạt động**

1. **User ấn "Liên hệ ngay"** ở trang sản phẩm
2. **Hệ thống check** có cuộc trò chuyện nào giữa 2 người này chưa
3. **Nếu chưa có** → tạo conversation mới
4. **Check tin nhắn sản phẩm** đã tồn tại chưa
5. **Nếu chưa có** → gửi tin nhắn sản phẩm với format đặc biệt
6. **Mở chat popup** với cuộc trò chuyện đó

### 5. **Format tin nhắn sản phẩm**
```
🛍️ Sản phẩm: [Tên sản phẩm]
💰 Giá: [Giá] VND  
📍 Khu vực: [Tên khu vực]

Tôi quan tâm đến sản phẩm này.
```

**Kết quả**: Mỗi cặp người bán-mua chỉ có 1 cuộc trò chuyện, và sản phẩm được hiển thị rõ ràng trong chat! 🎯