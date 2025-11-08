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
import { useChatContext } from "../../contexts/ChatContext";

// 👇 import component ChatPopup
import ChatPopup from "../chat/ChatPopUp";

// 👇 import i18n để đổi ngôn ngữ
import { useTranslation } from "react-i18next";
import "../../i18n";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const { showChatPopup, openChatPopup, closeChatPopup, conversations } =
    useChatContext();
  const searchInputRef = useRef(null);

  const { t, i18n } = useTranslation();

  // Check if there are unread messages
  const hasUnreadMessages = conversations.some(
    (conv) => conv.is_seen === false
  );

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
                {t("header.home")}
              </Link>
            </li>
            <li>
              <Link to="/post" className={isActive("/post") ? "active" : ""}>
                {t("header.post")}
              </Link>
            </li>
            <li>
              <Link
                to="/management"
                className={isActive("/management") ? "active" : ""}
              >
                {t("header.management")}
              </Link>
            </li>
            <li>
              <Link to="/about" className={isActive("/about") ? "active" : ""}>
                {t("header.about")}
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
            placeholder={t("header.search_placeholder")}
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
                {t("header.login")}
              </div>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            {/* Nút chat: toggle popup */}
            <button
              className={`header-icon-btn ${
                hasUnreadMessages ? "has-unread" : ""
              }`}
              onClick={() =>
                showChatPopup ? closeChatPopup() : openChatPopup()
              }
            >
              <FontAwesomeIcon icon={faComment} className="icon-btn-bell" />
              {hasUnreadMessages && <div className="unread-indicator"></div>}
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

            {/* ==== NÚT CHUYỂN NGÔN NGỮ ==== */}
            <div className="lang-switch">
              <button
                onClick={() => {
                  i18n.changeLanguage("vi");
                  localStorage.setItem("preferred-language", "vi");
                }}
                className={`flag-btn ${i18n.language === "vi" ? "active" : ""}`}
                title="Tiếng Việt"
              >
                🇻🇳
              </button>
              <button
                onClick={() => {
                  i18n.changeLanguage("en");
                  localStorage.setItem("preferred-language", "en");
                }}
                className={`flag-btn ${i18n.language === "en" ? "active" : ""}`}
                title="English"
              >
                🇺🇸
              </button>
            </div>
          </SignedIn>
        </div>
      </div>

      {/* ==== HIỂN THỊ POPUP CHAT ==== */}
      {showChatPopup && <ChatPopup />}
    </header>
  );
}
