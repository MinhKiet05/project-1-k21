import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SignedIn, useUser } from "@clerk/clerk-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../../lib/supabase.js";
import CardProduct from "../../components/cardProduct/CardProduct.jsx";
import LazyImage from "../../components/lazyImage/LazyImage.jsx";
import LoadingSkeleton from "../../components/loadingSkeleton/LoadingSkeleton.jsx";
import "./HomePage.css";
import banner1 from '../../assets/banner1.webp';
import banner2 from '../../assets/banner2.webp';
import banner3 from '../../assets/banner3.webp';
import banner4 from '../../assets/banner4.webp';
import logoImg from '../../assets/logo.webp';

function HomePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const leftBanners = useMemo(() => [banner1, banner2], []);
  const rightBanners = useMemo(() => [banner3, banner4], []);
  
  // States for data
  const [hotCategories, setHotCategories] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % leftBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [leftBanners.length]);

  // Fetch data for homepage
  useEffect(() => {
    const fetchHomePageData = async () => {
      try {
        setLoading(true);

        // 1. Fetch categories for hot section
        const { data: categories } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', '%giáo trình%')
          .limit(1);

        if (categories && categories.length > 0) {
          const { data: categoryPosts } = await supabase
            .from('posts')
            .select(`
              *,
              category:categories(id, name),
              location:locations(id, name)
            `)
            .eq('category_id', categories[0].id)
            .eq('status', 'approved')
            .limit(10);
          
          if (categoryPosts && categoryPosts.length > 0) {
            const shuffled = [...categoryPosts].sort(() => Math.random() - 0.5);
            setHotCategories(shuffled.slice(0, 4));
          }
        }

        // 2. Fetch latest approved posts - sắp xếp theo expires_at xa nhất (mới duyệt nhất)
        const { data: latestPosts } = await supabase
          .from('posts')
          .select(`
            *,
            category:categories(id, name),
            location:locations(id, name)
          `)
          .eq('status', 'approved')
          .not('expires_at', 'is', null)
          .order('expires_at', { ascending: false })
          .limit(4);

        setLatestPosts(latestPosts || []);

        // 3. Fetch random posts for recommendations
        const { data: randomPosts } = await supabase
          .from('posts')
          .select(`
            *,
            category:categories(id, name),
            location:locations(id, name)
          `)
          .eq('status', 'approved')
          .limit(20);

        if (randomPosts && randomPosts.length > 0) {
          const shuffled = [...randomPosts].sort(() => Math.random() - 0.5);
          setRecommendedPosts(shuffled.slice(0, 8));
        }

      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };

    fetchHomePageData();
  }, []);

  // Carousel handlers
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % leftBanners.length);
  }, [leftBanners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + leftBanners.length) % leftBanners.length);
  }, [leftBanners.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  // Convert post to product format
  const convertPostToProduct = useCallback((post) => {
    const imageUrl = (post.image_urls && post.image_urls[0]) || 
                    (post.imageUrls && post.imageUrls[0]) || 
                    post.image_url || 
                    post.images?.[0] || 
                    logoImg;
    
    return {
      id: post.id,
      name: post.title || 'Không có tiêu đề',
      price: post.price || 0,
      image: imageUrl
    };
  }, []);

  return (
    <>
      {/* Banner Section */}
      <div className="banner-section">
        <div className="left-carousel">
          <div className="carousel-wrapper">
            <div className="carousel-slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {leftBanners.map((banner, index) => (
                <div key={index} className="carousel-slide">
                  <LazyImage src={banner} alt={`Main Banner ${index + 1}`} />
                </div>
              ))}
            </div>
            <button className="carousel-btn carousel-btn-prev" onClick={prevSlide}>&#8249;</button>
            <button className="carousel-btn carousel-btn-next" onClick={nextSlide}>&#8250;</button>
            <div className="carousel-dots">
              {leftBanners.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${index === currentSlide ? "active" : ""}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="right-banners">
          <div className="right-banner-top">
            <LazyImage src={rightBanners[0]} alt="Top Right Banner" />
          </div>
          <div className="right-banner-bottom">
            <LazyImage src={rightBanners[1]} alt="Bottom Right Banner" />
          </div>
        </div>
      </div>

      <div className="homepage-container">
        {/* Hot Categories */}
        <div className="homepage-section">
          <h2 className="homepage-section-title">Danh mục hot - Giáo trình</h2>
          <div className="homepage-products-grid">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <LoadingSkeleton key={`hot-loading-${index}`} />
              ))
            ) : hotCategories.length > 0 ? (
              hotCategories.map((post, index) => (
                <CardProduct key={`hot-${post.id || index}`} product={convertPostToProduct(post)} />
              ))
            ) : (
              Array.from({ length: 4 }).map((_, index) => (
                <CardProduct
                  key={`hot-fallback-${index}`}
                  product={{ name: "Chưa có sản phẩm", price: 0, image: logoImg }}
                />
              ))
            )}
          </div>
          <div className="see-all-container">
            <span 
              className="see-all" 
              onClick={() => navigate('/search?q=&category=d1261632-4ade-4a65-ab34-d1804e31210a')}
            >
              Xem tất cả <FontAwesomeIcon icon={faArrowRight} />
            </span>
          </div>
        </div>

        {/* Latest Posts */}
        <div className="homepage-section">
          <h2 className="homepage-section-title">Bài đăng mới nhất</h2>
          <div className="homepage-products-grid">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <LoadingSkeleton key={`latest-loading-${index}`} />
              ))
            ) : latestPosts.length > 0 ? (
              latestPosts.map((post, index) => (
                <CardProduct key={`latest-${post.id || index}`} product={convertPostToProduct(post)} />
              ))
            ) : (
              Array.from({ length: 4 }).map((_, index) => (
                <CardProduct
                  key={`latest-fallback-${index}`}
                  product={{ name: "Chưa có bài đăng mới", price: 0, image: logoImg }}
                />
              ))
            )}
          </div>
          <div className="see-all-container">
            <span 
              className="see-all" 
              onClick={() => navigate('/search?sortBy=latest')}
            >
              Xem tất cả <FontAwesomeIcon icon={faArrowRight} />
            </span>
          </div>
        </div>

        {/* Recommendations */}
        <div className="homepage-section">
          <h2 className="homepage-section-title">Gợi ý cho bạn</h2>
          <div className="homepage-products-grid">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <LoadingSkeleton key={`recommended-loading-${index}`} />
              ))
            ) : recommendedPosts.length > 0 ? (
              recommendedPosts.map((post, index) => (
                <CardProduct key={`recommended-${post.id || index}`} product={convertPostToProduct(post)} />
              ))
            ) : (
              Array.from({ length: 4 }).map((_, index) => (
                <CardProduct
                  key={`recommended-fallback-${index}`}
                  product={{ name: "Chưa có gợi ý", price: 0, image: logoImg }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(HomePage);