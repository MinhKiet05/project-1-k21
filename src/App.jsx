import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toastify-custom.css';

import Header from "./components/header/Header.jsx";
import Footer from "./components/footer/Footer.jsx";
import HomePage from "./pages/homePage/HomePage.jsx";
import UploadPost from "./pages/uploadPost/UploadPost.jsx";
import Management from "./pages/management/Management.jsx";
import AboutUs from "./pages/aboutUs/AboutUs.jsx";
import ChatPage from "./pages/chatPage/ChatPage.jsx";
import DetailProduct from "./pages/detailProduct/DetailProduct.jsx";
import DashboardLayout from "./pages/dashboard/DashboardLayout.jsx";
import DashboardUsers from "./pages/dashboard/DashboardUsers.jsx";
import DashboardPosts from "./pages/dashboard/DashboardPosts.jsx";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute/ProtectedAdminRoute.jsx";
import { useUserSync } from "./hooks/useUserSync";
import { UserRoleProvider } from "./contexts/UserRoleContext";

export default function App() {
  // 🔄 JIT Provisioning: Tự động tạo profile khi user đăng nhập
  useUserSync();

  return (
    <UserRoleProvider>
      <Router>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Header />

          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/post" element={<UploadPost />} />
              <Route path="/management" element={<Management />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/product/:id" element={<DetailProduct />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedAdminRoute>
                    <DashboardLayout />
                  </ProtectedAdminRoute>
                }
              >
                <Route path="users" element={<DashboardUsers />} />
                <Route path="posts" element={<DashboardPosts />} />
                <Route index element={<DashboardPosts />} />
              </Route>
            </Routes>
          </div>

          <Footer />
        </div>
        
        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </UserRoleProvider>
  );
}
