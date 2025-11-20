import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Suspense, lazy } from 'react';

import Header from "./components/header/header.jsx";
import Footer from "./components/footer/Footer.jsx";
import TourOrchestrator from "./components/TourGuideButton/TourOrchestrator.jsx";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute/ProtectedAdminRoute.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop.jsx";
import Loading from "./components/loading/Loading.jsx";
import { useUserSync } from "./hooks/useUserSync";
import { UserRoleProvider } from "./contexts/UserRoleContext";
import { ChatProvider } from "./contexts/ChatContext";

// 🚀 Lazy loading for better performance - chỉ load khi cần
const HomePage = lazy(() => import("./pages/homePage/HomePage.jsx"));
const UploadPost = lazy(() => import("./pages/uploadPost/UploadPost.jsx"));
const Management = lazy(() => import("./pages/management/Management.jsx"));
const AboutUs = lazy(() => import("./pages/aboutUs/AboutUs.jsx"));
const SearchPage = lazy(() => import("./pages/searchPage/SearchPage.jsx"));
const DetailProduct = lazy(() => import("./pages/detailProduct/DetailProduct.jsx"));
const DashboardLayout = lazy(() => import("./pages/dashboard/DashboardLayout.jsx"));
const DashboardUsers = lazy(() => import("./pages/dashboard/DashboardUsers.jsx"));
const DashboardPosts = lazy(() => import("./pages/dashboard/DashboardPosts.jsx"));

export default function App() {
  // 🔄 JIT Provisioning: Tự động tạo profile khi user đăng nhập
  useUserSync();

  return (
    <UserRoleProvider>
      <ChatProvider>
        <Router>
          <ScrollToTop />
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Header />

          <div style={{ flex: 1 }}>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/post" element={
                  <ProtectedRoute message="Bạn cần đăng nhập để đăng bài">
                    <UploadPost />
                  </ProtectedRoute>
                } />
                <Route path="/management" element={
                  <ProtectedRoute message="Bạn cần đăng nhập để quản lý bài đăng">
                    <Management />
                  </ProtectedRoute>
                } />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/search" element={<SearchPage />} />
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
            </Suspense>
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
        
        {/* Tour Orchestrator - handles guided tours */}
        <TourOrchestrator />
      </Router>
      </ChatProvider>
    </UserRoleProvider>
  );
}
