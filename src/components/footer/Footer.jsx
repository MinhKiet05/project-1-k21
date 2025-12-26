import React from "react";
import "./Footer.css";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import logo from '../../assets/logo.webp';
function Footer() {
  const { t } = useTranslation(['common', 'header', 'footer']);
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
                  <div className="footer-name">
                    <div className="footer-name-top">Nổ Tung </div>
                    <div className="footer-name-bottom">Phố Cổ</div>
                  </div>
                </div>

        {/* Liên kết nhanh */}
        <div className="footer-links">
          <h3>{t('footer:quickLinks')}</h3>
          <ul>
            <li><Link to="/home" className={isActive('/home') ? 'active' : ''}>{t('footer:home')}</Link></li>
            <li><Link to="/post" className={isActive('/post') ? 'active' : ''}>{t('footer:post')}</Link></li>
            <li><Link to="/management" className={isActive('/management') ? 'active' : ''}>{t('footer:management')}</Link></li>
            <li><Link to="/about" className={isActive('/about') ? 'active' : ''}>{t('footer:about')}</Link></li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div className="footer-contact">
          <h3>{t('footer:contact')}</h3>
          <ul>
            <li><b>{t('footer:email')}:</b> <a href="mailto:notungphoco@gmail.com">notungphoco@gmail.com</a></li>
            <li><b>{t('footer:phone')}:</b> <a href="tel:0949667463"></a></li>
            <li><b>{t('footer:address')}:</b> {t('footer:addressDetail')}</li>
          </ul>
        </div>

      </div>

      
    </footer>
    <div className="footer-bottom">
        <p>© 2025 No Tung Pho Co. All rights reserved.</p>
      </div>
      </>
  );
}

export default Footer;
