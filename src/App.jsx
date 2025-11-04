import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/header/header.jsx";
import Footer from "./components/footer/Footer.jsx";
import HomePage from "./pages/homePage/HomePage.jsx";
import UploadPost from "./pages/uploadPost/UploadPost.jsx";
import Management from "./pages/management/Management.jsx";
import AboutUs from "./pages/aboutUs/AboutUs.jsx";
import ChatPage from "./pages/chatPage/ChatPage.jsx";
import AdminManagement from "./pages/adminManagement/AdminManagement.jsx";
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
              <Route
                path="/dashboard"
                element={
                  <ProtectedAdminRoute>
                    <AdminManagement />
                  </ProtectedAdminRoute>
                }
              />
            </Routes>
          </div>

          <Footer />
        </div>
      </Router>
    </UserRoleProvider>
  );
}
