# 🚨 CLERK AUTHORIZATION FIX

## Vấn đề: 
```
{"errors":[{"message":"Unauthorized request","long_message":"You are not authorized to perform this request","code":"authorization_invalid"}]}
```

## ✅ Giải pháp:

### 1. Vào Clerk Dashboard:
https://dashboard.clerk.com/last-active

### 2. Thêm Production Domain:
- **Settings** → **Domains** 
- **Add domain**: `project-1-k21.vercel.app`
- **Save changes**

### 3. Kiểm tra CORS (nếu cần):
- **Settings** → **CORS**  
- **Add origin**: `https://project-1-k21.vercel.app`

### 4. Redirect URLs (quan trọng):
- **Settings** → **Paths**
- Đảm bảo redirect URLs include production domain:
  - Sign-in URL: `/`
  - Sign-up URL: `/` 
  - After sign-in: `/`
  - After sign-up: `/`

---

## 🔍 Debug Steps:

1. **Check Network Tab** trong browser:
   - Có request nào fail với 401/403 không?
   - API calls có đúng domain không?

2. **Check Clerk Console**:
   - Có warning về domain không?

3. **Test lại sau 2-3 phút** (Clerk cần thời gian propagate changes)

---

## ⚡ Quick Links:

- **Clerk Dashboard**: https://dashboard.clerk.com/last-active
- **Domain Settings**: Dashboard → Settings → Domains
- **CORS Settings**: Dashboard → Settings → CORS
- **Your App**: https://project-1-k21.vercel.app/

---

## 📋 Checklist:

- [ ] Add `project-1-k21.vercel.app` to Clerk domains
- [ ] Add CORS origin if needed  
- [ ] Wait 2-3 minutes for propagation
- [ ] Test sign-in again
- [ ] Check browser console for errors

**Expected Result**: Clerk sign-in should work without authorization errors.