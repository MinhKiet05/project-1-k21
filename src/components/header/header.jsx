import "./Header.css";
import HeaderLogo from "../../assets/img/Headerlogo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faPen,
  faInfoCircle,
  faBell,
  faUser,
  faSearch,
  faComment,
} from "@fortawesome/free-solid-svg-icons";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        {/* ==== NHÓM 1: LOGO ==== */}
        <div className="logo">
          <img src={HeaderLogo} alt="Logo" />
        </div>

        {/* ==== NHÓM 2: NAV ==== */}
        <nav className="nav">
          <ul>
            <li>
              <a href="/home">
                <FontAwesomeIcon icon={faHouse} className="h-icon" /> Trang chủ
              </a>
            </li>
            <li>
              <a href="/post">
                <FontAwesomeIcon icon={faPen} className="h-icon" /> Đăng bài
              </a>
            </li>
            <li>
              <a href="/about">
                <FontAwesomeIcon icon={faInfoCircle} className="h-icon" /> Giới thiệu
              </a>
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
          <a href="/comment" className="header-icon-btn">
            <FontAwesomeIcon icon={faComment} className="icon-btn" />
          </a>

          <a href="/bell" className="header-icon-btn">
            <FontAwesomeIcon icon={faBell} className="icon-btn-bell" />
          </a>

          <div className="header-user-display">
            <SignedOut>
              <SignInButton mode="modal">
                <FontAwesomeIcon icon={faUser} className="icon-btn-user" />
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}