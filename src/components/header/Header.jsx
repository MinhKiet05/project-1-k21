import "./Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
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
import ChatWindow from "../chat/ChatWindow";
import NotificationsPopup from "../notificationsPopup/NotificationsPopup";
import LoginRequiredDialog from "../loginRequiredDialog/LoginRequiredDialog";
import { getUnreadNotificationsCount } from "../../utils/notificationUtils";
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../../lib/supabase';
import { useAuthCheck } from '../../hooks/useAuthCheck';

export default function Header() {
  const { t, i18n } = useTranslation(['header', 'common']);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { isAdmin } = useUserRole();
  const { showChatPopup, openChatPopup, closeChatPopup, conversations, directChatUser, closeDirectChat } = useChatContext();
  const searchInputRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const { showLoginDialog, checkAuthAndExecute, closeLoginDialog } = useAuthCheck();
  
  // State để quản lý popup nào đang active
  const [activePopup, setActivePopup] = useState(null); // 'chat', 'notifications', 'directChat', null
  
  // Check if there are unread messages
  const hasUnreadMessages = conversations.some(conv => conv.is_seen === false);

  // Cập nhật activePopup khi các popup thay đổi
  useEffect(() => {
    if (directChatUser) {
      // Khi mở direct chat, đóng tất cả popup khác
      if (showNotifications) setShowNotifications(false);
      if (showChatPopup) closeChatPopup();
      setActivePopup('directChat');
    } else if (showChatPopup) {
      setActivePopup('chat');
    } else if (showNotifications) {
      setActivePopup('notifications');
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
      setActivePopup('notifications');
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
      setActivePopup('chat');
    }
  };

  // Function để đóng tất cả popup khi mở direct chat
  const handleDirectChatOpen = () => {
    if (showNotifications) setShowNotifications(false);
    if (showChatPopup) closeChatPopup();
    setActivePopup('directChat');
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
    const query = searchInputRef.current?.value.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Handle auth-protected navigation
  const handleProtectedNavigation = (path, message) => {
    checkAuthAndExecute(() => navigate(path), message);
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
        .channel('notifications_count')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          // Refetch count when notifications change
          getUnreadNotificationsCount(user.id).then(setUnreadNotificationsCount);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.id]);

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
                {t('home')}
              </Link>
            </li>
            <li>
              <a 
                href="#" 
                className={isActive("/post") ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  handleProtectedNavigation('/post', t('loginRequired.post'));
                }}
              >
                {t('post')}
              </a>
            </li>
            <li>
              <a
                href="#"
                className={isActive("/management") ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  handleProtectedNavigation('/management', t('loginRequired.management'));
                }}
              >
                {t('management')}
              </a>
            </li>
            <li>
              <Link to="/about" className={isActive("/about") ? "active" : ""}>
                {t('about')}
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
            placeholder={t('search')}
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
                {t('login')}
              </div>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            {/* Nút chat: toggle popup */}
            <button
              className={`header-icon-btn ${hasUnreadMessages ? 'has-unread' : ''} ${activePopup === 'chat' || activePopup === 'directChat' ? 'active' : ''}`}
              onClick={handleChatClick}
            >
              <FontAwesomeIcon icon={faComment} className="icon-btn-chat" />
              {hasUnreadMessages && <div className="unread-indicator"></div>}
            </button>

            {/* Notifications Bell */}
            <button 
              className={`header-icon-btn ${unreadNotificationsCount > 0 ? 'has-unread' : ''} ${activePopup === 'notifications' ? 'active' : ''}`}
              onClick={handleNotificationsClick}
            >
              <FontAwesomeIcon icon={faBell} className="icon-btn-bell" />
              {unreadNotificationsCount > 0 && (
                <div className="unread-indicator"></div>
              )}
            </button>

            {/* Dashboard (admin) */}
            {isAdmin() && (
              <Link to="/dashboard" className={`header-icon-btn ${isActive("/dashboard") ? "active" : ""}`}>
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
        <div>
          <select 
            name="language" 
            id="language-select"
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
        
      </div>

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
