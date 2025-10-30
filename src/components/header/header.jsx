import "./header.css";
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
        <div className="logo">
          <img src={HeaderLogo} alt="Logo" />
        </div>
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
                <FontAwesomeIcon icon={faInfoCircle} className="h-icon" /> Giới
                thiệu
              </a>
            </li>
          </ul>
        </nav>
        <div className="header-right">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input type="text" placeholder="Search" />
          </div>
          <a href="/comment">
            <FontAwesomeIcon icon={faComment} className="icon-btn" />
          </a>
          <a href="/bell">
            <FontAwesomeIcon icon={faBell} className="icon-btn" />
          </a>
          <SignedOut>
            <SignInButton mode="modal">
              <FontAwesomeIcon icon={faUser} className="icon-btn" />
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
