# Project K21 - E-commerce Platform

Nền tảng thương mại điện tử hiện đại được xây dựng với React + Vite, hỗ trợ đa ngôn ngữ và có tính năng chat thời gian thực.

## 🚀 Tính năng chính

### 🏪 **Thương mại điện tử**
- 🛒 Hiển thị và tìm kiếm sản phẩm
- 🔍 Bộ lọc thông minh (danh mục, vị trí, giá cả)
- 📱 Thiết kế responsive hoàn toàn
- 🎯 Gợi ý sản phẩm thông minh
- 📄 Phân trang và "Xem thêm" động

### 👥 **Quản lý người dùng**
- 🔐 Đăng nhập/đăng ký với Clerk Authentication
- 👤 Quản lý profile người dùng
- 🛡️ Phân quyền Admin/User
- 📊 Dashboard quản trị

### 💬 **Hệ thống Chat**
- 💬 Chat trực tiếp giữa người dùng
- 🔔 Thông báo thời gian thực
- ✅ Trạng thái đã xem/chưa xem
- 🎯 Chat popup và cửa sổ chat riêng biệt

### 🌐 **Đa ngôn ngữ**
- 🇻🇳 Tiếng Việt
- 🇬🇧 Tiếng Anh
- 🔄 Chuyển đổi ngôn ngữ linh hoạt

### 📱 **Mobile-First Design**
- 📱 Menu burger responsive
- 🎨 Overlay effects
- 👆 Touch-friendly interface
- 🔍 Mobile search optimization

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** - UI Library
- **Vite** - Build tool & Dev server
- **React Router** - Client-side routing
- **i18next** - Internationalization
- **FontAwesome** - Icons
- **CSS3** - Styling với Flexbox & Grid

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database
- **Real-time subscriptions** - Live updates

### Authentication & Authorization
- **Clerk** - Authentication service
- **Role-based access control** - Phân quyền người dùng

### Development Tools
- **ESLint** - Code linting
- **Vite HMR** - Hot Module Replacement
- **Git** - Version control

## 📂 Cấu trúc dự án

```
src/
├── assets/                 # Hình ảnh, icons, fonts
│   ├── flags/             # Cờ quốc gia
│   └── *.webp             # Optimized images
├── components/            # React components
│   ├── cardProduct/       # Product card component
│   ├── chat/              # Chat system components
│   ├── header/            # Header với navigation
│   ├── notificationsPopup/ # Thông báo
│   └── ...
├── contexts/              # React Context providers
│   ├── ChatContext.jsx    # Chat state management
│   └── UserRoleContext.jsx # User role management
├── hooks/                 # Custom React hooks
│   ├── useAuthCheck.js    # Authentication helpers
│   ├── useCategories.js   # Categories data
│   └── useLocations.js    # Locations data
├── lib/                   # External libraries config
│   └── supabase.js        # Supabase client
├── locales/               # i18n translations
│   ├── en/                # English translations
│   └── vi/                # Vietnamese translations
├── pages/                 # Page components
│   ├── homePage/          # Trang chủ
│   ├── searchPage/        # Trang tìm kiếm
│   └── ...
└── utils/                 # Utility functions
    ├── searchUtils.js     # Search helpers
    └── notificationUtils.js # Notification helpers
```

## 🚀 Cài đặt & Chạy dự án

### Yêu cầu hệ thống
- **Node.js** >= 18.0.0
- **npm** hoặc **yarn**
- **Git**

### 1. Clone repository
```bash
git clone https://github.com/MinhKiet05/project-1-k21.git
cd project-1-k21
```

### 2. Cài đặt dependencies
```bash
npm install
# hoặc
yarn install
```

### 3. Cấu hình môi trường
Tạo file `.env` trong thư mục gốc:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 4. Chạy development server
```bash
npm run dev
# hoặc
yarn dev
```

Mở [http://localhost:5173](http://localhost:5173) để xem ứng dụng.

### 5. Build cho production
```bash
npm run build
# hoặc
yarn build
```

## 🔧 Scripts có sẵn

```bash
npm run dev          # Chạy development server
npm run build        # Build cho production
npm run preview      # Preview production build
npm run lint         # Chạy ESLint
```

## 🌟 Tính năng nổi bật

### 🎨 **Responsive Design**
- Desktop: Header đầy đủ với navigation, search, user actions
- Tablet (≤1200px): Burger menu, layout tối ưu
- Mobile (≤768px): Mobile-first interface, touch-friendly

### 🔍 **Smart Search**
- Tìm kiếm theo từ khóa có dấu/không dấu
- Lọc theo danh mục và vị trí
- Sắp xếp theo giá, thời gian
- Phân trang thông minh

### 💬 **Real-time Chat**
- Chat trực tiếp 1-1
- Thông báo real-time với Supabase subscriptions
- UI/UX tối ưu với popup management

### 🌐 **i18n Support**
- Hỗ trợ đầy đủ Tiếng Việt và Tiếng Anh
- Hot-switching languages
- Fallback cho missing translations

## 📱 Responsive Breakpoints

- **Desktop**: > 1200px
- **Tablet**: 768px - 1200px  
- **Mobile**: ≤ 768px

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Tạo Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Team

- **MinhKiet05** - Lead Developer

## 🐛 Bug Reports

Nếu bạn phát hiện bug, vui lòng tạo issue với thông tin:
- Mô tả chi tiết bug
- Các bước tái tạo
- Screenshots (nếu có)
- Browser/Device information

## 📞 Liên hệ

- GitHub: [@MinhKiet05](https://github.com/MinhKiet05)
- Project Link: [https://github.com/MinhKiet05/project-1-k21](https://github.com/MinhKiet05/project-1-k21)
