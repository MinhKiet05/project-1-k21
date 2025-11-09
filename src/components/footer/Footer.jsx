import React from "react";
import "./Footer.css";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import logo from '../../assets/logo.webp';
function Footer() {
  const { t } = useTranslation(['common', 'header']);
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
          <h3>{t('quickLinks')}</h3>
          <ul>
            <li><Link to="/home" className={isActive('/home') ? 'active' : ''}><u>{t('header:home')}</u></Link></li>
            <li><Link to="/post" className={isActive('/post') ? 'active' : ''}><u>{t('header:post')}</u></Link></li>
            <li><Link to="/management" className={isActive('/management') ? 'active' : ''}><u>{t('header:management')}</u></Link></li>
            <li><Link to="/about" className={isActive('/about') ? 'active' : ''}><u>{t('header:about')}</u></Link></li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div className="footer-contact">
          <h3>{t('contact')}</h3>
          <ul>
            <li><b>{t('email')}:</b> <a href="mailto:notungphoco@gmail.com">notungphoco@gmail.com</a></li>
            <li><b>{t('phone')}:</b> <a href="tel:0336748385">0336748385</a></li>
            <li><b>{t('address')}:</b> {t('addressDetail')}</li>
          </ul>
        </div>

      </div>

      
    </footer>
    <div className="footer-bottom">
        <p>{t('copyright')}</p>
      </div>
      </>
  );
}

export default Footer;
