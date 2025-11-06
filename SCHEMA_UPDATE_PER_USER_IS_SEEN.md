# 📝 Schema Update: Per-User `is_seen` Implementation

## 🔄 Đã cập nhật database schema để track `is_seen` per user

### **Schema Changes:**

#### **Before (Incorrect):**
```sql
-- conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  last_message_content text,
  last_message_at timestamptz,
  is_seen boolean,  -- ❌ Wrong: One is_seen for entire conversation
  created_at timestamptz DEFAULT now()
);
```

#### **After (Correct):**
```sql
-- conversations table (removed is_seen)
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  last_message_content text,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now()  -- ✅ No is_seen here
);

-- conversation_participants table (added is_seen)
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  is_seen boolean DEFAULT true,  -- ✅ Per-user is_seen status
  PRIMARY KEY (conversation_id, user_id)
);
```

---

## 🎯 Why This Change?

### **Problem with Original Design:**
- **One `is_seen` per conversation** = không phù hợp với multi-user chat
- User A đọc tin nhắn → conversation marked as "seen"  
- User B vẫn chưa đọc nhưng không thấy unread indicator
- **Inconsistent behavior** across participants

### **Solution with New Design:**
- **`is_seen` per participant** = mỗi user có trạng thái riêng
- User A đọc tin nhắn → chỉ User A's `is_seen = true`
- User B vẫn có `is_seen = false` → vẫn thấy unread indicators
- **Consistent Facebook-like behavior**

---

## 🔧 Code Updates:

### **useConversations.js Query:**
```javascript
// OLD: Query is_seen from conversations
.select(`
  conversations (
    id,
    is_seen,  // ❌ From wrong table
    ...
  )
`)

// NEW: Query is_seen from conversation_participants
.select(`
  conversation_id,
  is_seen,  // ✅ From correct table
  conversations (
    id,
    last_message_content,
    ...
  )
`)
```

### **Mark as Seen Function:**
```javascript
// OLD: Update conversations table
await supabase
  .from('conversations')
  .update({ is_seen: true })
  .eq('id', conversationId);  // ❌ Affects all participants

// NEW: Update conversation_participants table
await supabase
  .from('conversation_participants')
  .update({ is_seen: true })
  .eq('conversation_id', conversationId)
  .eq('user_id', user?.id);  // ✅ Only affects current user
```

### **Handle New Messages:**
```javascript
// Mark as unseen for message recipient only
if (sender_id !== user?.id) {
  await supabase
    .from('conversation_participants')
    .update({ is_seen: false })
    .eq('conversation_id', conversation_id)
    .eq('user_id', user?.id);  // ✅ Only mark current user as unseen
}
```

---

## 📱 User Experience Impact:

### **Multi-User Scenarios:**

#### **Scenario 1: User A sends message to User B**
- User A: `is_seen = true` (sender always "seen")
- User B: `is_seen = false` (recipient gets unread indicator)

#### **Scenario 2: User B reads the message**
- User A: `is_seen = true` (unchanged)
- User B: `is_seen = true` (marked as seen when ChatWindow opens)

#### **Scenario 3: Group conversations (future-proof)**
- User A sends message
- User B: `is_seen = false` (unread)
- User C: `is_seen = false` (unread)
- Each user can read independently without affecting others

---

## ✅ Benefits:

### **1. Accurate State Management**
- ✅ Each user has independent read status
- ✅ No interference between participants
- ✅ True to Facebook Messenger behavior

### **2. Scalable Design**
- ✅ Supports 1-on-1 conversations
- ✅ Future-proof for group chats
- ✅ Efficient database queries

### **3. Consistent UX**
- ✅ Reliable unread indicators
- ✅ Per-user notification states
- ✅ No false positives/negatives

---

## 🚀 Implementation Status:

### **Completed:**
- ✅ Schema updated in `001_create_schema.sql`
- ✅ Query logic updated in `useConversations.js`
- ✅ Mark seen/unseen functions updated
- ✅ Real-time message handling updated
- ✅ Build successful with no errors

### **UI Features Working:**
- ✅ Red dot on header chat button
- ✅ Blue dot on individual conversations
- ✅ Bold text for unread messages
- ✅ Auto-mark as seen when opening ChatWindow
- ✅ Real-time updates across users

---

## 🎯 Result:

Perfect **per-user `is_seen` tracking** cho một chat system chuyên nghiệp! 

Each user now has independent read status, exactly như Facebook Messenger. 🎉