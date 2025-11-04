import { useState, useEffect } from "react";
import { SignedIn, useUser } from "@clerk/clerk-react";
import {
  locationService,
  categoryService,
  postService,
} from "../../lib/database.js";
import CardProduct from "../../components/cardProduct/CardProduct.jsx";
import "./HomePage.css";
import banner1 from '../../assets/banner1.webp';
import banner2 from '../../assets/banner2.webp';
import banner3 from '../../assets/banner3.webp';
import banner4 from '../../assets/banner4.webp';
import logoImg from '../../assets/logo.png';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const leftBanners = [banner1, banner2]; // Carousel bên trái
  const rightBanners = [banner3, banner4]; // Banner tĩnh bên phải

  // Auto slide every 5 seconds cho carousel bên trái
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % leftBanners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [leftBanners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % leftBanners.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + leftBanners.length) % leftBanners.length
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <>
      {/* Banner Section Layout */}
      <div className="banner-section">
        {/* Left Carousel */}
        <div className="left-carousel">
          <div className="carousel-wrapper">
            <div
              className="carousel-slides"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {leftBanners.map((banner, index) => (
                <div key={index} className="carousel-slide">
                  <img src={banner} alt={`Main Banner ${index + 1}`} />
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              className="carousel-btn carousel-btn-prev"
              onClick={prevSlide}
            >
              &#8249;
            </button>
            <button
              className="carousel-btn carousel-btn-next"
              onClick={nextSlide}
            >
              &#8250;
            </button>

            {/* Dots Indicators */}
            <div className="carousel-dots">
              {leftBanners.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${
                    index === currentSlide ? "active" : ""
                  }`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Banner Group */}
        <div className="right-banners">
          <div className="right-banner-top">
            <img src={rightBanners[0]} alt="Top Right Banner" />
          </div>
          <div className="right-banner-bottom">
            <img src={rightBanners[1]} alt="Bottom Right Banner" />
          </div>
        </div>
      </div>

      <div className="homepage-container">
        {/* Danh mục hot */}
        <div className="homepage-section">
          <h2 className="section-title">Danh mục hot</h2>
          <div className="products-grid">
            <CardProduct
              product={{
                name: "Sách quốc phòng quốc phòng quốc phòng quốc phòng",
                price: 15000,
                image: logoImg,
              }}
            />
            <CardProduct
              product={{
                name: "Sách quốc phòng quốc phòng quốc phòng quốc phòng",
                price: 15000,
                image: logoImg,
              }}
            />
            <CardProduct
              product={{
                name: "Sách quốc phòng quốc phòng quốc phòng quốc phòng",
                price: 15000,
                image: logoImg,
              }}
            />
            <CardProduct
              product={{
                name: "Sách quốc phòng quốc phòng quốc phòng quốc phòng",
                price: 15000,
                image: logoImg,
              }}
            />
          </div>
        </div>

        {/* Bài đăng mới nhất */}
        <div className="homepage-section">
          <h2 className="section-title">Bài đăng mới nhất</h2>
          <div className="products-grid">
            <CardProduct
              product={{
                name: "Sách quốc phòng quốc phòng quốc phòng quốc phòng",
                price: 15000,
                image: logoImg,
              }}
            />
            <CardProduct
              product={{
                name: "Sách quốc phòng quốc phòng quốc phòng quốc phòng",
                price: 15000,
                image: logoImg,
              }}
            />
            <CardProduct
              product={{
                name: "Sách quốc phòng quốc phòng quốc phòng quốc phòng",
                price: 15000,
                image: logoImg,
              }}
            />
            <CardProduct
              product={{
                name: "Sách quốc phòng quốc phòng quốc phòng quốc phòng",
                price: 15000,
                image: logoImg,
              }}
            />
          </div>
        </div>

        {/* Gợi ý cho bạn */}
        <div className="homepage-section">
          <h2 className="section-title">Gợi ý cho bạn</h2>
          <div className="products-grid">
            <CardProduct
              product={{
                name: "Sách quốc phòng quốc phòng quốc phòng quốc phòng",
                price: 15000,
                image: logoImg,
              }}
            />
            <CardProduct
              product={{
                name: "Sách quốc phòng quốc phòng quốc phòng quốc phòng",
                price: 15000,
                image: logoImg,
              }}
            />
            <CardProduct
              product={{
                name: "Sách quốc phòng quốc phòng quốc phòng quốc phòng",
                price: 15000,
                image: logoImg,
              }}
            />
            <CardProduct
              product={{
                name: "Sách quốc phòng quốc phòng quốc phòng quốc phòng",
                price: 15000,
                image: logoImg,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
