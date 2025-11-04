import React from "react";
import "./Footer.css";
import { Link, useLocation } from "react-router-dom";
import logo from '../../assets/logo.webp';
function Footer() {
  const location = useLocation();
  
  // Function to check if current path is active
  const isActive = (path) => {
    if (path === '/home') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === path;
  };
  return (
    <>
    
    <footer className="footer">
      <div className="footer-container">
        {/* Logo */}
        <div className="footer-logo">
                  <img src={logo} alt="Logo" />
                  <div>
                    <div className="footer-name-top">Nổ Tung </div>
                    <div className="footer-name-bottom">Phố Cổ</div>
                  </div>
                </div>

        {/* Liên kết nhanh */}
        <div className="footer-links">
          <h3>Các liên kết</h3>
          <ul>
            <li><Link to="/home" className={isActive('/home') ? 'active' : ''}><u>Trang chủ</u></Link></li>
            <li><Link to="/post" className={isActive('/post') ? 'active' : ''}><u>Đăng bài</u></Link></li>
            <li><Link to="/management" className={isActive('/management') ? 'active' : ''}><u>Quản lý</u></Link></li>
            <li><Link to="/about" className={isActive('/about') ? 'active' : ''}><u>Về chúng tôi</u></Link></li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div className="footer-contact">
          <h3>Liên hệ</h3>
          <ul>
            <li><b>Email:</b> <a href="mailto:notungphoco@gmail.com">notungphoco@gmail.com</a></li>
            <li><b>Số điện thoại:</b> <a href="tel:0336748385">0336748385</a></li>
            <li><b>Địa chỉ:</b> 13 Nguyễn Văn Bảo, Gò Vấp, TP.HCM</li>
          </ul>
        </div>

      </div>

      
    </footer>
    <div className="footer-bottom">
        <p>© 2025 Nổ Tung Phố Cổ. All rights reserved.</p>
      </div>
      </>
  );
}

export default Footer;
