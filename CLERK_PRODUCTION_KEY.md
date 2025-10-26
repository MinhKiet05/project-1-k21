# 🚨 CLERK PRODUCTION KEY FIX

## ⚠️ Root Cause: Development Key on Production

Bạn đang sử dụng **development key** (`pk_test_...`) trên production domain → Authorization error.

## ✅ Solution: Switch to Production Key

### 1. **Get Production Key:**
1. Vào **Clerk Dashboard**: https://dashboard.clerk.com/last-active
2. **Switch environment** từ "Development" sang "**Production**" (top-left dropdown)
3. Vào **Developers → API Keys**  
4. Copy **Publishable key** (sẽ bắt đầu với `pk_live_...`)

### 2. **Update Vercel Env Vars:**
1. Vào **Vercel Dashboard**: https://vercel.com/[username]/project-1-k21/settings/environment-variables
2. **Edit** `VITE_CLERK_PUBLISHABLE_KEY`
3. **Replace** với production key (`pk_live_...`)
4. **Save** và **Redeploy**

### 3. **Environment Keys:**
```bash
# Development (local)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlYXItYWFyZHZhcmstMzAuY2xlcmsuYWNjb3VudHMuZGV2JA

# Production (Vercel)  
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔧 Alternative: Fix Development Environment

Nếu bạn muốn giữ development key, hãy:

### 1. **Remove Production Domain:**
- **Clerk Dashboard → Developers → Domains**
- **Remove** `project-1-k21.vercel.app`

### 2. **Add to Development:**
- **Switch to Development environment** 
- **Add** `project-1-k21.vercel.app` vào development domains

---

## 🎯 Expected Result:

Sau khi fix:
- ✅ **No authorization errors**
- ✅ **Email authentication** works smoothly
- ✅ **Database Connection Test** appears
- ✅ **Google/GitHub login** (if enabled)

---

## 📱 Quick Test:

1. **Update production key** trên Vercel
2. **Redeploy** project
3. **Test**: https://project-1-k21.vercel.app/
4. **Click** "📧 Đăng nhập với Email" 
5. **Should work** without authorization errors!

**Recommended**: Sử dụng production key cho production deployment.