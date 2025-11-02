import "./Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation } from "react-router-dom";
import logo from '../../assets/logo.png';
import {
  faHouse,
  faPen,
  faInfoCircle,
  faBell,
  faUser,
  faSearch,
  faComment,
  faRightToBracket,
  faCrown

} from "@fortawesome/free-solid-svg-icons";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { useUserRole } from '../../contexts/UserRoleContext';


export default function Header() {
  const location = useLocation();
  const { isAdmin } = useUserRole();
  
  // Function to check if current path is active
  const isActive = (path) => {
    if (path === '/home') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* ==== NHÓM 1: LOGO ==== */}
        <div className="header-logo">
          <img src={logo} alt="Logo" />
          
          <div>
            <div className="header-name-top">Nổ Tung </div>
            <div className="header-name-bottom">Phố Cổ</div>
          </div>
        </div>

        {/* ==== NHÓM 2: NAV ==== */}
        <nav className="nav">
          <ul>
            <li>
              <Link to="/home" className={isActive('/home') ? 'active' : ''}>
                Trang chủ
              </Link>
            </li>
            <li>
              <Link to="/post" className={isActive('/post') ? 'active' : ''}>
                Đăng bài
              </Link>
            </li>
            <li>
              <Link to="/management" className={isActive('/management') ? 'active' : ''}>
                 Quản lý
              </Link>
            </li>
            <li>
              <Link to="/about" className={isActive('/about') ? 'active' : ''}>
                 Về chúng tôi
              </Link>
            </li>
            
          </ul>
        </nav>
        {/* ==== NHÓM 3: SEARCH BOX ==== */}
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input type="text" placeholder="Tìm kiếm..." />
        </div>

        {/* ==== NHÓM 4: USER ACTIONS & ICONS ==== */}
        <div className="header-user-actions">
          <SignedOut>
            <SignInButton mode="modal">
              <div className="login-button">
                <FontAwesomeIcon icon={faRightToBracket} className="login-icon" />
                Đăng nhập
              </div>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link to="/chat" className="header-icon-btn">
              <FontAwesomeIcon icon={faComment} className="icon-btn-bell" />
            </Link>
            <button className="header-icon-btn">
              <FontAwesomeIcon icon={faBell} className="icon-btn-bell" />
            </button>
            {isAdmin() && (
              <Link to="/dashboard" className="header-icon-btn">
                <FontAwesomeIcon icon={faCrown} className="icon-btn-bell" />
              </Link>
            )}

            <div className="header-user-display">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}