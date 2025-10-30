import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo */}
        <div className="footer-logo">
          <img src="images/LOGO.jpg" alt="Logo Nổ Tung Phố Cổ" />
        </div>

        {/* Liên kết nhanh */}
        <div className="footer-links">
          <h3>Liên kết nhanh</h3>
          <ul>
            <li><a href="#"><u>Trang chủ</u></a></li>
            <li><a href="#"><u>Về chúng tôi</u></a></li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div className="footer-contact">
          <h3>Liên hệ giúp đỡ</h3>
          <ul>
            <li><b>Email:</b> <a href="mailto:notungphoco@gmail.com">notungphoco@gmail.com</a></li>
            <li><b>Số điện thoại:</b> <a href="tel:0336748385">0336748385</a></li>
            <li><b>Địa chỉ:</b> 13 Nguyễn Văn Bảo, Gò Vấp, TP.HCM</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Nổ Tung Phố Cổ. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
