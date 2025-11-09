import React, { useEffect } from "react";
import "./AboutUs.css";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useTranslation } from 'react-i18next';
import storyIMG from '../../assets/story.webp';
import gtri1IMG from '../../assets/gtri1.webp';
import gtri2IMG from '../../assets/gtri2.webp';
import gtri3IMG from '../../assets/gtri3.webp';
const AboutUs = () => {
  const { t } = useTranslation(['about', 'common']);
  
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
          <h2 className="section-title">{t('story.title')}</h2>
          <div className="story-content">
            <img src={storyIMG} alt="Our Story" className="story-image" />
            <div className="story-text">
              <h3 className="story-heading">{t('story.heading')}</h3>
              <p className="story-description">
                {t('story.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: Giá trị --- */}
      <section className="values-section">
        
        <div className="values-container">
          <h2 className="section-title value" data-aos="fade-up">{t('values.title')}</h2>
          <div className="value-item" data-aos="fade-up" data-aos-delay="200">
            <img src={gtri1IMG} alt="Tiện ích" className="value-image" />
            <div className="value-text">
              <h3 className="value-heading">{t('values.convenience.title')}</h3>
              <p>
                {t('values.convenience.description')}
              </p>
            </div>
          </div>

          <div className="value-item reverse" data-aos="fade-up" data-aos-delay="400">
            <div className="value-text">
              <h3 className="value-heading">{t('values.quality.title')}</h3>
              <p>
                {t('values.quality.description')}
              </p>
            </div>
            <img src={gtri2IMG} alt="Chất lượng sản phẩm" className="value-image" />
          </div>

          <div className="value-item" data-aos="fade-up" data-aos-delay="600">
            <img src={gtri3IMG} alt="Kết nối nhanh chóng" className="value-image" />
            <div className="value-text">
              <h3 className="value-heading">{t('values.connection.title')}</h3>
              <p>
                {t('values.connection.description')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
