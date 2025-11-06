import "./Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import logo from "../../assets/logo.webp";
import {
  faBell,
  faSearch,
  faComment,
  faRightToBracket,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { useUserRole } from "../../contexts/UserRoleContext";

// 👇 import component ChatPopup
import ChatPopup from "../Chat/ChatPopup";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const searchInputRef = useRef(null);

  // 👉 State điều khiển popup chat
  const [showChat, setShowChat] = useState(false);

  // Function to check if current path is active
  const isActive = (path) => {
    if (path === "/home") {
      return location.pathname === "/" || location.pathname === "/home";
    }
    return location.pathname === path;
  };

  // Handle search function
  const handleSearch = () => {
    const query = searchInputRef.current?.value.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* ==== NHÓM 1: LOGO ==== */}
        <div className="header-logo">
          <img src={logo} alt="Logo" />
        </div>

        {/* ==== NHÓM 2: NAV ==== */}
        <nav className="nav">
          <ul>
            <li>
              <Link to="/home" className={isActive("/home") ? "active" : ""}>
                Trang chủ
              </Link>
            </li>
            <li>
              <Link to="/post" className={isActive("/post") ? "active" : ""}>
                Đăng bài
              </Link>
            </li>
            <li>
              <Link
                to="/management"
                className={isActive("/management") ? "active" : ""}
              >
                Quản lý
              </Link>
            </li>
            <li>
              <Link to="/about" className={isActive("/about") ? "active" : ""}>
                Về chúng tôi
              </Link>
            </li>
          </ul>
        </nav>

        {/* ==== NHÓM 3: SEARCH BOX ==== */}
        <div className="search-box">
          <FontAwesomeIcon
            icon={faSearch}
            className="search-icon-header"
            onClick={handleSearch}
            style={{ cursor: "pointer" }}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Tìm kiếm..."
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>

        {/* ==== NHÓM 4: USER ACTIONS & ICONS ==== */}
        <div className="header-user-actions">
          <SignedOut>
            <SignInButton mode="modal">
              <div className="login-button">
                <FontAwesomeIcon
                  icon={faRightToBracket}
                  className="login-icon"
                />
                Đăng nhập
              </div>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            {/* Nút chat: toggle popup */}
            <button
              className="header-icon-btn"
              onClick={() => setShowChat(!showChat)}
            >
              <FontAwesomeIcon icon={faComment} className="icon-btn-bell" />
            </button>

            {/* Bell */}
            <button className="header-icon-btn">
              <FontAwesomeIcon icon={faBell} className="icon-btn-bell" />
            </button>

            {/* Dashboard (admin) */}
            {isAdmin() && (
              <Link to="/dashboard" className="header-icon-btn">
                <FontAwesomeIcon icon={faCrown} className="icon-btn-bell" />
              </Link>
            )}

            {/* User Button */}
            <div className="header-user-display">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </div>

      {/* ==== HIỂN THỊ POPUP CHAT ==== */}
      {showChat && <ChatPopup />}
    </header>
  );
}
