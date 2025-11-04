import React, { useEffect } from "react";
import "./AboutUs.css";
import AOS from 'aos';
import 'aos/dist/aos.css';
import storyIMG from '../../assets/story.webp';
import gtri1IMG from '../../assets/gtri1.webp';
import gtri2IMG from '../../assets/gtri2.webp';
import gtri3IMG from '../../assets/gtri3.webp';
const AboutUs = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in milliseconds
      easing: 'ease-out', // Easing function
      once: true, // Whether animation should happen only once
      offset: 100, // Offset (in px) from the original trigger point
    });
  }, []);

  return (
    <div className="about-us">
      {/* --- SECTION 1: Câu chuyện --- */}
      <section className="story-section" data-aos="fade-up">
        <div className="story-container">
          <h2 className="section-title">Câu chuyện</h2>
          <div className="story-content">
            <img src={storyIMG} alt="Our Story" className="story-image" />
            <div className="story-text">
              <h3 className="story-heading">Nổ Tung Phố Cổ</h3>
              <p className="story-description">
                Chúng tôi ra đời từ mong muốn đơn giản là kết nối những người có
                cùng nhu cầu mua và bán một cách trực tiếp, không rào cản. Nổ
                Tung Phố Cổ là dự án phi lợi nhuận, được xây dựng để tạo ra một
                không gian trao đổi minh bạch, hiệu quả, nơi cộng đồng có thể
                tin cậy lẫn nhau mà không cần trung gian thương mại.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: Giá trị --- */}
      <section className="values-section">
        
        <div className="values-container">
          <h2 className="section-title value" data-aos="fade-up">Giá trị</h2>
          <div className="value-item" data-aos="fade-up" data-aos-delay="200">
            <img src={gtri1IMG} alt="Tiện ích" className="value-image" />
            <div className="value-text">
              <h3 className="value-heading">Tiện ích</h3>
              <p>
                Nổ Tung Phố Cổ cung cấp một nền tảng tìm kiếm và kết nối
                chuyên biệt hoàn toàn miễn phí, loại bỏ mọi rào cản thương mại.
                Tiện ích cốt lõi của chúng tôi là tạo ra môi trường giao tiếp
                trực tiếp, minh bạch, giúp người mua và người bán dễ dàng trao
                đổi thông tin để đạt được thỏa thuận cá nhân nhanh chóng nhất.
              </p>
            </div>
          </div>

          <div className="value-item reverse" data-aos="fade-up" data-aos-delay="400">
            <div className="value-text">
              <h3 className="value-heading">Chất lượng sản phẩm</h3>
              <p>
                Chúng tôi đặt tiêu chí minh bạch thông tin lên hàng đầu để người
                mua tự đánh giá chất lượng. Nổ Tung Phố Cổ yêu cầu người bán cam
                kết cung cấp mô tả chi tiết, hình ảnh chân thực và lịch sử giao
                dịch rõ ràng, nhằm giúp bạn đưa ra quyết định mua bán sáng suốt
                nhất.
              </p>
            </div>
            <img src={gtri2IMG} alt="Chất lượng sản phẩm" className="value-image" />
          </div>

          <div className="value-item" data-aos="fade-up" data-aos-delay="600">
            <img src={gtri3IMG} alt="Kết nối nhanh chóng" className="value-image" />
            <div className="value-text">
              <h3 className="value-heading">Kết nối nhanh chóng</h3>
              <p>
                Nổ Tung Phố Cổ là cầu nối tối giản giúp bạn tìm thấy đối tác giao
                dịch (mua/bán) ngay lập tức. Chúng tôi rút ngắn mọi quy trình,
                cho phép người dùng liên hệ trực tiếp với nhau thông qua tin
                nhắn sản phẩm. Mục tiêu là tạo ra sự trao đổi thân thiện, dễ
                hiểu, giúp giao dịch cá nhân khởi động dễ dàng và không chậm
                trễ.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
