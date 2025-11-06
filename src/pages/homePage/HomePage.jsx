import { useState, useEffect } from "react";
import { SignedIn, useUser } from "@clerk/clerk-react";
import {
  locationService,
  categoryService,
  postService,
} from "../../lib/database.js";
import { supabase } from "../../lib/supabase.js";
import CardProduct from "../../components/cardProduct/CardProduct.jsx";
import "./HomePage.css";
import banner1 from '../../assets/banner1.webp';
import banner2 from '../../assets/banner2.webp';
import banner3 from '../../assets/banner3.webp';
import banner4 from '../../assets/banner4.webp';
import logoImg from '../../assets/logo.webp';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const leftBanners = [banner1, banner2]; // Carousel bên trái
  const rightBanners = [banner3, banner4]; // Banner tĩnh bên phải
  
  // States for data
  const [hotCategories, setHotCategories] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto slide every 5 seconds cho carousel bên trái
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

        // 1. Fetch random 4 posts từ danh mục "Giáo trình" cho "Danh mục hot"
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
            .limit(20); // Lấy nhiều hơn để random
          
          if (categoryPosts && categoryPosts.length > 0) {
            // Shuffle và lấy 4 bài ngẫu nhiên
            const shuffled = [...categoryPosts].sort(() => Math.random() - 0.5);
            setHotCategories(shuffled.slice(0, 4));
          } else {
            setHotCategories([]);
          }
        }

        // 2. Fetch 4 bài đăng được duyệt gần đây nhất
        // Thử multiple approaches để đảm bảo có dữ liệu
        let latest = null;

        // Cách 1: Sử dụng expires_at (khi approve, expires_at được set)
        const { data: latestByExpires } = await supabase
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

        if (latestByExpires && latestByExpires.length > 0) {
          latest = latestByExpires;
        } else {
          // Cách 2: Fallback - sử dụng updated_at
          const { data: latestByUpdated } = await supabase
            .from('posts')
            .select(`
              *,
              category:categories(id, name),
              location:locations(id, name)
            `)
            .eq('status', 'approved')
            .order('updated_at', { ascending: false })
            .limit(4);
          
          if (latestByUpdated && latestByUpdated.length > 0) {
            latest = latestByUpdated;
          } else {
            // Cách 3: Fallback cuối - sử dụng created_at  
            const { data: latestByCreated } = await supabase
              .from('posts')
              .select(`
                *,
                category:categories(id, name),
                location:locations(id, name)
              `)
              .eq('status', 'approved')
              .order('created_at', { ascending: false })
              .limit(4);
            
            latest = latestByCreated;
          }
        }

        console.log('Latest approved posts:', latest); // Debug log
        setLatestPosts(latest || []);

        // 3. Fetch 4 bài đăng ngẫu nhiên để gợi ý
        const { data: random } = await supabase
          .from('posts')
          .select(`
            *,
            category:categories(id, name),
            location:locations(id, name)
          `)
          .eq('status', 'approved')
          .limit(20); // Lấy nhiều hơn để chọn ngẫu nhiên

        if (random && random.length > 0) {
          // Shuffle và lấy 4 bài ngẫu nhiên
          const shuffled = [...random].sort(() => Math.random() - 0.5);
          setRecommendedPosts(shuffled.slice(0, 4));
        }

      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomePageData();
  }, []);

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

  // Convert post data to CardProduct format
  const convertPostToProduct = (post) => {
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
          <h2 className="homepage-section-title">Danh mục hot - Giáo trình</h2>
          <div className="homepage-products-grid">
            {loading ? (
              // Loading placeholder
              Array.from({ length: 4 }).map((_, index) => (
                <CardProduct
                  key={`hot-loading-${index}`}
                  product={{
                    name: "Đang tải...",
                    price: 1,
                    image: logoImg,
                  }}
                />
              ))
            ) : hotCategories.length > 0 ? (
              hotCategories.map((post, index) => (
                <CardProduct
                  key={`hot-${post.id || index}`}
                  product={convertPostToProduct(post)}
                />
              ))
            ) : (
              // Fallback khi không có dữ liệu
              Array.from({ length: 4 }).map((_, index) => (
                <CardProduct
                  key={`hot-fallback-${index}`}
                  product={{
                    name: "Chưa có sản phẩm",
                    price: 0,
                    image: logoImg,
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Bài đăng mới nhất */}
        <div className="homepage-section">
          <h2 className="homepage-section-title">Bài đăng mới nhất</h2>
          <div className="homepage-products-grid">
            {loading ? (
              // Loading placeholder
              Array.from({ length: 4 }).map((_, index) => (
                <CardProduct
                  key={`latest-loading-${index}`}
                  product={{
                    name: "Đang tải...",
                    price: 0,
                    image: logoImg,
                  }}
                />
              ))
            ) : latestPosts.length > 0 ? (
              latestPosts.map((post, index) => (
                <CardProduct
                  key={`latest-${post.id || index}`}
                  product={convertPostToProduct(post)}
                />
              ))
            ) : (
              // Fallback khi không có dữ liệu
              Array.from({ length: 4 }).map((_, index) => (
                <CardProduct
                  key={`latest-fallback-${index}`}
                  product={{
                    name: "Chưa có bài đăng mới",
                    price: 0,
                    image: logoImg,
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Gợi ý cho bạn */}
        <div className="homepage-section">
          <h2 className="homepage-section-title">Gợi ý cho bạn</h2>
          <div className="homepage-products-grid">
            {loading ? (
              // Loading placeholder
              Array.from({ length: 4 }).map((_, index) => (
                <CardProduct
                  key={`recommended-loading-${index}`}
                  product={{
                    name: "Đang tải...",
                    price: 0,
                    image: logoImg,
                  }}
                />
              ))
            ) : recommendedPosts.length > 0 ? (
              recommendedPosts.map((post, index) => (
                <CardProduct
                  key={`recommended-${post.id || index}`}
                  product={convertPostToProduct(post)}
                />
              ))
            ) : (
              // Fallback khi không có dữ liệu
              Array.from({ length: 4 }).map((_, index) => (
                <CardProduct
                  key={`recommended-fallback-${index}`}
                  product={{
                    name: "Chưa có gợi ý",
                    price: 0,
                    image: logoImg,
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
