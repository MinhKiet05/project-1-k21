import "./Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import logo from "../../assets/logo.webp";
import {
  faBell,
  faSearch,
  faComment,
  faRightToBracket,
  faCrown,
  faTimes,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

// Import flag WebP files
import vietnamFlag from "../../assets/flags/vietNamFlag.webp";
import ukFlag from "../../assets/flags/ukFlag.webp";

// Flag component with actual flag images
const FlagIcon = ({ countryCode, className }) => {
  const flagImages = {
    vi: vietnamFlag,
    en: ukFlag,
  };

  const flagAltTexts = {
    vi: "Vietnam Flag",
    en: "United Kingdom Flag",
    ch: "China Flag",
    ko: "South Korea Flag",
  };

  return (
    <img
      src={flagImages[countryCode]}
      alt={flagAltTexts[countryCode] || "Flag"}
      className={`flag-image ${className || ""}`}
    />
  );
};

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
import ChatWindow from "../chat/ChatWindow";
import NotificationsPopup from "../notificationsPopup/NotificationsPopup";
import LoginRequiredDialog from "../loginRequiredDialog/LoginRequiredDialog";
import { getUnreadNotificationsCount } from "../../utils/notificationUtils";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import { useAuthCheck } from "../../hooks/useAuthCheck";

export default function Header() {
  const { t, i18n } = useTranslation(["header", "common"]);
  const location = useLocation();
  const navigate = useNavigate();

  // Language configuration
  const languages = {
    vi: { text: "VIE" },
    en: { text: "ENG" },
  };
  const { user } = useUser();
  const { isAdmin } = useUserRole();
  const {
    showChatPopup,
    openChatPopup,
    closeChatPopup,
    conversations,
    directChatUser,
    closeDirectChat,
  } = useChatContext();
  const searchInputRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const { showLoginDialog, checkAuthAndExecute, closeLoginDialog } =
    useAuthCheck();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State để quản lý popup nào đang active
  const [activePopup, setActivePopup] = useState(null); // 'chat', 'notifications', 'directChat', null

  // Check if there are unread messages
  const hasUnreadMessages = conversations.some(
    (conv) => conv.is_seen === false
  );

  // Cập nhật activePopup khi các popup thay đổi
  useEffect(() => {
    if (directChatUser) {
      // Khi mở direct chat, đóng tất cả popup khác
      if (showNotifications) setShowNotifications(false);
      if (showChatPopup) closeChatPopup();
      setActivePopup("directChat");
    } else if (showChatPopup) {
      setActivePopup("chat");
    } else if (showNotifications) {
      setActivePopup("notifications");
    } else {
      setActivePopup(null);
    }
  }, [showChatPopup, showNotifications, directChatUser]);

  // Function để mở notifications và đóng các popup khác
  const handleNotificationsClick = () => {
    if (showNotifications) {
      setShowNotifications(false);
      setActivePopup(null);
    } else {
      // Đóng các popup khác trước khi mở notifications
      if (showChatPopup) closeChatPopup();
      if (directChatUser) closeDirectChat();
      setShowNotifications(true);
      setActivePopup("notifications");
    }
  };

  // Function để mở chat popup và đóng các popup khác
  const handleChatClick = () => {
    if (showChatPopup) {
      closeChatPopup();
      setActivePopup(null);
    } else {
      // Đóng các popup khác trước khi mở chat
      if (showNotifications) setShowNotifications(false);
      if (directChatUser) closeDirectChat();
      openChatPopup();
      setActivePopup("chat");
    }
  };

  // Function để đóng tất cả popup khi mở direct chat
  const handleDirectChatOpen = () => {
    if (showNotifications) setShowNotifications(false);
    if (showChatPopup) closeChatPopup();
    setActivePopup("directChat");
  };

  // Function to check if current path is active
  const isActive = (path) => {
    if (path === "/home") {
      return location.pathname === "/" || location.pathname === "/home";
    }
    return location.pathname === path;
  };

  // Handle search function
  const handleSearch = () => {
    if (!isSearchExpanded) {
      setIsSearchExpanded(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    } else {
      const query = searchInputRef.current?.value.trim();
      if (query) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
        setIsSearchExpanded(false);
      } else {
        // If no query, just close the search
        setIsSearchExpanded(false);
      }
    }
  };

  // Handle auth-protected navigation
  const handleProtectedNavigation = (path, message) => {
    checkAuthAndExecute(() => navigate(path), message);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle language change
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // Fetch unread notifications count
  useEffect(() => {
    if (user?.id) {
      getUnreadNotificationsCount(user.id).then(setUnreadNotificationsCount);

      // Subscribe to real-time notifications updates
      const subscription = supabase
        .channel("notifications_count")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Refetch count when notifications change
            getUnreadNotificationsCount(user.id).then(
              setUnreadNotificationsCount
            );
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.id]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".language-dropdown-container")) {
        setShowLanguageDropdown(false);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [showLanguageDropdown]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-container") && isSearchExpanded) {
        if (!searchInputRef.current?.value.trim()) {
          setIsSearchExpanded(false);
        }
      }
    };

    if (isSearchExpanded) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isSearchExpanded]);

  // Handle mobile menu overlay effect
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="header">
      <div className="header-container">
        {/* ==== NHÓM 1: LOGO ==== */}
        <div className="header-logo">
          
          <button className="burger-btn" onClick={toggleMobileMenu}>
            <FontAwesomeIcon 
              icon={isMobileMenuOpen ? faTimes : faBars} 
              className="burger-icon"
            />
          </button>
          <img src={logo} alt="Logo" />
        </div>

        {/* ==== NHÓM 2: NAV ==== */}
        <nav className={`nav ${isMobileMenuOpen ? 'nav-open' : ''}`}>
          <ul>
            <li>
              <Link to="/home" className={isActive("/home") ? "active" : ""}>
                {t("home")}
              </Link>
            </li>
            <li>
              <a
                href="#"
                className={isActive("/post") ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  handleProtectedNavigation("/post", t("loginRequired.post"));
                }}
              >
                {t("post")}
              </a>
            </li>
            <li>
              <a
                href="#"
                className={isActive("/management") ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  handleProtectedNavigation(
                    "/management",
                    t("loginRequired.management")
                  );
                }}
              >
                {t("management")}
              </a>
            </li>
            <li>
              <Link to="/about" className={isActive("/about") ? "active" : ""}>
                {t("about")}
              </Link>
            </li>
            {/* Mobile Search */}
              <li className="mobile-search-item">
                <div className="mobile-search-container">
                  <input
                    type="text"
                    placeholder={t("search")}
                    className="mobile-search-input"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        const query = e.target.value.trim();
                        if (query) {
                          navigate(`/search?q=${encodeURIComponent(query)}`);
                          setIsMobileMenuOpen(false);
                        }
                      }
                    }}
                  />
                  <FontAwesomeIcon icon={faSearch} className="mobile-search-icon" />
                </div>
              </li>
            {/* Mobile-only items */}
            <SignedIn>
              
              
              {/* Mobile Admin Link */}
              {isAdmin() && (
                <li className="mobile-admin-item-link-link">
                  <Link 
                    to="/dashboard" 
                    className={isActive("/dashboard") ? "active" : ""}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faCrown} className="mobile-admin-icon" />
                    Quản lý cho admin
                  </Link>
                </li>
              )}
            </SignedIn>
            
            {/* Mobile Language Selector */}
            <li className="mobile-language-item">
              <div className="mobile-language-selector">
                <span className="mobile-language-label">{t("common:language")}:</span>
                <div className="mobile-language-options">
                  {Object.entries(languages).map(([code, lang]) => (
                    <button
                      key={code}
                      className={`mobile-language-btn ${
                        i18n.language === code ? "active" : ""
                      }`}
                      onClick={() => {
                        changeLanguage(code);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <FlagIcon countryCode={code} className="flag-mobile" />
                      <span>{lang.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </li>
          </ul>
        </nav>

        {/* ==== NHÓM 4: USER ACTIONS & ICONS ==== */}
        <div className="header-user-actions">
          {/* Search Icon */}
          <div
              id="an-tren-tablet-mobile"
              className={`search-container ${
                isSearchExpanded ? "expanded" : "collapsed"
              }`}
            >
              {isSearchExpanded && (
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t("search")}
                  className="search-input-expanded"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  onBlur={() => {
                    if (!searchInputRef.current?.value.trim()) {
                      setTimeout(() => setIsSearchExpanded(false), 150);
                    }
                  }}
                />
              )}
              <button
                className="header-icon-btn search-icon-btn"
                onClick={handleSearch}
              >
                <FontAwesomeIcon
                  icon={isSearchExpanded ? faTimes : faSearch}
                  className="icon-btn-search"
                />
              </button>
            </div>
          <SignedOut>
            <SignInButton mode="modal">
              <div className="login-button">
                <FontAwesomeIcon
                  icon={faRightToBracket}
                  className="login-icon"
                />
                {t("login")}
              </div>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            

            {/* Nút chat: toggle popup */}
            <button
              className={`header-icon-btn ${
                hasUnreadMessages ? "has-unread" : ""
              } ${
                activePopup === "chat" || activePopup === "directChat"
                  ? "active"
                  : ""
              }`}
              onClick={handleChatClick}
            >
              <FontAwesomeIcon icon={faComment} className="icon-btn-chat" />
              {hasUnreadMessages && <div className="unread-indicator"></div>}
            </button>

            {/* Notifications Bell */}
            <button
              className={`header-icon-btn ${
                unreadNotificationsCount > 0 ? "has-unread" : ""
              } ${activePopup === "notifications" ? "active" : ""}`}
              onClick={handleNotificationsClick}
            >
              <FontAwesomeIcon icon={faBell} className="icon-btn-bell" />
              {unreadNotificationsCount > 0 && (
                <div className="unread-indicator"></div>
              )}
            </button>

            {/* Dashboard (admin) */}
            {isAdmin() && (
              <Link
                to="/dashboard"
                className={`header-icon-btn ${
                  isActive("/dashboard") ? "active" : ""
                }`}
              >
                <FontAwesomeIcon icon={faCrown} className="icon-btn-bell" />
              </Link>
            )}

            {/* User Button */}
            <div className="header-user-display">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>

        {/* ==== NHÓM 5: LANGUAGE ==== */}
        <div className="language-dropdown-container">
          <button
            className="language-dropdown-trigger"
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          >
            <span className="current-language">
              <FlagIcon countryCode={i18n.language} className="flag-main" />
              <span className="language-text">
                {languages[i18n.language]?.text}
              </span>
            </span>
            <span
              className={`dropdown-arrow ${showLanguageDropdown ? "open" : ""}`}
            >
              ▼
            </span>
          </button>

          {showLanguageDropdown && (
            <div className="language-dropdown-menu">
              {Object.entries(languages).map(([code, lang]) => (
                <div
                  key={code}
                  className={`language-option ${
                    i18n.language === code ? "active" : ""
                  }`}
                  onClick={() => {
                    changeLanguage(code);
                    setShowLanguageDropdown(false);
                  }}
                >
                  <FlagIcon countryCode={code} className="flag-option" />
                  <span className="language-text">{lang.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==== MOBILE MENU OVERLAY ==== */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* ==== HIỂN THỊ POPUP CHAT ==== */}
      {showChatPopup && <ChatPopup />}

      {/* ==== HIỂN THỊ NOTIFICATIONS POPUP ==== */}
      {showNotifications && (
        <NotificationsPopup onClose={() => setShowNotifications(false)} />
      )}

      {/* ==== HIỂN THỊ DIRECT CHATWINDOW ==== */}
      {directChatUser && (
        <ChatWindow
          user={directChatUser}
          conversationId={directChatUser.conversationId}
          onClose={closeDirectChat}
        />
      )}

      {/* ==== LOGIN REQUIRED DIALOG ==== */}
      <LoginRequiredDialog
        isOpen={showLoginDialog}
        onClose={closeLoginDialog}
      />
    </header>
  );
}
