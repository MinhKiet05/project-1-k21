import React from "react";
import "./footer.css";

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
            <li><a href="#">Trang chủ</a></li>
            <li><a href="#">Về chúng tôi</a></li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div className="footer-contact">
          <h3>Liên hệ giúp đỡ</h3>
          <p>Gmail: <a href="mailto:notungphoco@gmail.com">notungphoco@gmail.com</a></p>
          <p>Số điện thoại: <a href="tel:0336748385">0336748385</a></p>
          <p>Địa chỉ: 13 Nguyễn Văn Bảo, Gò Vấp, TP.HCM</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Nổ Tung Phố Cổ. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
