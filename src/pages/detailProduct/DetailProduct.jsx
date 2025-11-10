import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faArrowRight, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useChatContext } from '../../contexts/ChatContext';
import { getDisplayName } from '../../utils/languageUtils';
import { toast } from 'react-toastify';
import './DetailProduct.css';
import CardProduct from '../../components/cardProduct/CardProduct';
import logoImg from '../../assets/logo.webp';
import LoginRequiredDialog from '../../components/loginRequiredDialog/LoginRequiredDialog';
import { useAuthCheck } from '../../hooks/useAuthCheck';

export default function DetailProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const { t, i18n } = useTranslation(['detailProduct', 'common']);
    const { createOrFindConversation, openDirectChat } = useChatContext();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [chatLoading, setChatLoading] = useState(false);
    const [recommendedPosts, setRecommendedPosts] = useState([]);
    const [recommendedLoading, setRecommendedLoading] = useState(false);
    const [recommendedLoaded, setRecommendedLoaded] = useState(false);
    const { showLoginDialog, checkAuthAndExecute, closeLoginDialog } = useAuthCheck();
    const recommendedSectionRef = useRef(null);

    useEffect(() => {
        if (id) {
            fetchPostDetail();
        }
    }, [id]);

    // Lazy load recommended posts when section is visible
    useEffect(() => {
        if (!post?.category_id || recommendedLoaded) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !recommendedLoaded) {
                    fetchRecommendedPosts();
                    setRecommendedLoaded(true);
                }
            },
            {
                threshold: 0.1, // Trigger when 10% of the section is visible
                rootMargin: '50px' // Start loading 50px before the section comes into view
            }
        );

        if (recommendedSectionRef.current) {
            observer.observe(recommendedSectionRef.current);
        }

        return () => {
            if (recommendedSectionRef.current) {
                observer.unobserve(recommendedSectionRef.current);
            }
        };
    }, [post?.category_id, recommendedLoaded]);

    const fetchPostDetail = async () => {
        try {
            setLoading(true);
            
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    categories (name, name_en),
                    locations!location_id (name, name_en),
                    profiles!author_id (*)
                `)
                .eq('id', id)
                .eq('status', 'approved')
                .single();

            if (error) {
                throw error;
            }

            if (!data) {
                setError(t('detailProduct:notFound'));
                return;
            }

            setPost(data);
        } catch (error) {
            setError(t('detailProduct:errorLoadingProduct'));
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendedPosts = async () => {
        try {
            setRecommendedLoading(true);
            
            const { data: relatedData, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    categories (name, name_en),
                    locations!location_id (name, name_en),
                    profiles!author_id (full_name, avatar_url)
                `)
                .eq('category_id', post.category_id)
                .eq('status', 'approved')
                .neq('id', id) // Loại trừ bài đang xem
                .limit(8); // Lấy 8 bài để shuffle

            if (error) {
                console.error('Error fetching recommended posts:', error);
                return;
            }

            // Check if data exists and shuffle
            if (relatedData && relatedData.length > 0) {
                const shuffled = relatedData.sort(() => 0.5 - Math.random());
                setRecommendedPosts(shuffled.slice(0, 4));
            } else {
                setRecommendedPosts([]);
            }

        } catch (error) {
            console.error('Error fetching recommended posts:', error);
            setRecommendedPosts([]);
        } finally {
            setRecommendedLoading(false);
        }
    };

    const convertPostToProduct = (post) => {
        return {
            id: post.id,
            name: post.title,
            price: post.price,
            image: post.image_urls?.[0] || post.images?.[0] || post.image_url || logoImg,
            category: getDisplayName(post.categories, i18n.language),
            location: getDisplayName(post.locations, i18n.language),
            author: post.profiles?.full_name
        };
    };

    const handleClose = () => {
        navigate(-1); // Quay lại trang trước
    };

    const handlePrevImage = () => {
        if (post?.images && post.images.length > 0) {
            setCurrentImageIndex(prev => 
                prev === 0 ? post.images.length - 1 : prev - 1
            );
        }
    };

    const handleNextImage = () => {
        if (post?.images && post.images.length > 0) {
            setCurrentImageIndex(prev => 
                prev === post.images.length - 1 ? 0 : prev + 1
            );
        }
    };

    const handleThumbnailClick = (index) => {
        setCurrentImageIndex(index);
    };

    const sendProductInquiryMessage = async (conversationId, productData) => {
        try {
            const productInfo = {
                id: productData.id,
                title: productData.title,
                price: productData.price,
                original_price: productData.original_price,
                image_urls: productData.image_urls,
                images: productData.images,
                image_url: productData.image_url
            };

            // Send product card as a special message with prefix
            const { error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content: `PRODUCT_INQUIRY:${JSON.stringify(productInfo)}`
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error sending product inquiry message:', error);
            throw error;
        }
    };

    const handleContactSeller = async () => {
        if (!user) {
            toast.warning(t('detailProduct:loginRequiredMessage'));
            return;
        }

        if (post?.author_id === user.id) {
            toast.warning(t('detailProduct:cannotMessageYourself'));
            return;
        }

        try {
            setChatLoading(true);
            
            // Tạo hoặc tìm conversation
            const conversationId = await createOrFindConversation(post.id, post.author_id);
            
            // Gửi product card message
            await sendProductInquiryMessage(conversationId, post);
            
            // Mở ChatWindow trực tiếp với thông tin người bán (không cần product info nữa)
            const sellerInfo = {
                id: post.author_id,
                name: post.profiles?.full_name || post.profiles?.name || post.profiles?.username || 'Người bán',
                avatar: post.profiles?.avatar_url || post.profiles?.image_url || post.profiles?.profile_image_url
            };
            
            openDirectChat(conversationId, sellerInfo);
            
        } catch (error) {
            toast.error(t('detailProduct:errorLoadingProduct'));
        } finally {
            setChatLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="detail-container">
                <div className="detail-loading">
                    {t('detailProduct:loadingProductInfo')}
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="detail-container">
                <div className="detail-error">
                    <div className="detail-error-title">Oops!</div>
                    <div className="detail-error-message">
                        {error || t('detailProduct:notFound')}
                    </div>
                    <button 
                        className="detail-back-btn"
                        onClick={handleClose}
                    >
                        {t('detailProduct:backButton')}
                    </button>
                </div>
            </div>
        );
    }

    // Xử lý images từ nhiều field khác nhau
    const images = post.images || post.image_urls || [];
    let currentImage = null;
    
    if (images.length > 0) {
        currentImage = images[currentImageIndex];
    } else if (post.image_url) {
        currentImage = post.image_url;
    }
    
    const categoryName = getDisplayName(post.categories, i18n.language) || 'Chưa phân loại';

    return (
        <div className="detail-container">
            <div className="detail-wrapper">
                <div className="detail-content">
                    {/* Phần hình ảnh */}
                    <div className="detail-image-section">
                        <div className="detail-image-container">
                            <div className="detail-image-wrapper">
                                <img
                                    src={currentImage || `https://via.placeholder.com/450x450?text=${encodeURIComponent(t('detailProduct:noImages'))}`}
                                    alt={post.title}
                                    className="detail-main-image"
                                    onError={(e) => {
                                        e.target.src = `https://via.placeholder.com/450x450?text=${encodeURIComponent(t('detailProduct:noImages'))}`;
                                    }}
                                />
                            </div>
                        
                        {images.length > 1 && (
                            <div className="detail-thumbnail-nav">
                                <button 
                                    className="detail-nav-btn"
                                    onClick={handlePrevImage}
                                    disabled={images.length <= 1}
                                >
                                    ‹
                                </button>
                                
                                <div className="detail-thumbnails">
                                    {images.slice(0, 4).map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`${post.title} - ${index + 1}`}
                                            className={`detail-thumbnail ${
                                                index === currentImageIndex ? 'active' : ''
                                            }`}
                                            onClick={() => handleThumbnailClick(index)}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/60x60?text=IMG';
                                            }}
                                        />
                                    ))}
                                </div>
                                
                                <button 
                                    className="detail-nav-btn"
                                    onClick={handleNextImage}
                                    disabled={images.length <= 1}
                                >
                                    ›
                                </button>
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Phần thông tin */}
                    <div className="detail-info-section">
                        <h1 className="detail-title">{post.title}</h1>

                        <div className="detail-description-label">{t('detailProduct:description')}</div>
                        <div className="detail-description">
                            {post.description || t('detailProduct:noDescription')}
                        </div>

                        <div className="detail-category-label">{t('detailProduct:category')} {categoryName}</div>
                        <div className="detail-category">{t('detailProduct:location')} {getDisplayName(post.locations, i18n.language) || t('detailProduct:noLocationInfo')}</div>

                        <div className="detail-price">
                            {post.price ? post.price.toLocaleString() : '0'} VND
                        </div>
                        
                        <div className="detail-seller-section">
                            <div className="detail-seller-info">
                                <img 
                                    src={
                                        post.profiles?.avatar_url || 
                                        post.profiles?.image_url || 
                                        post.profiles?.profile_image_url ||
                                        'https://via.placeholder.com/40x40?text=👤'
                                    } 
                                    alt="Avatar người bán"
                                    className="detail-seller-avatar"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/40x40?text=👤';
                                    }}
                                />
                                <div className="detail-seller-details">
                                    <strong>{t('detailProduct:author')}</strong>
                                    <span className="detail-seller-name">
                                        {post.profiles?.full_name || 
                                         post.profiles?.name || 
                                         post.profiles?.username || 
                                         t('detailProduct:noSellerInfo')}
                                    </span>
                                </div>
                            </div>
                            
                        </div>
                        <button 
                                className="detail-contact-btn"
                                onClick={() => checkAuthAndExecute(handleContactSeller, t('detailProduct:loginRequiredMessage'))}
                                disabled={chatLoading}
                            >
                                <FontAwesomeIcon icon={faComment} />
                                {chatLoading ? t('detailProduct:creatingConversation') : t('detailProduct:contactNow')}
                            </button>
                    </div>
                </div>
            </div>

            <div className="suggestion-section" ref={recommendedSectionRef}>
                <h2 className="suggestion-section-title">{t('detailProduct:similarProducts')}</h2>
                <div className="suggestion-products-grid">
                    {!recommendedLoaded ? (
                        // Initial state - show placeholder until section is visible
                        <div className="recommendation-placeholder">
                            <div className="placeholder-text">{t('detailProduct:loadingRecommendations')}</div>
                        </div>
                    ) : recommendedLoading ? (
                        // Loading state - show skeleton cards
                        Array.from({ length: 4 }).map((_, index) => (
                            <div key={`skeleton-${index}`} className="skeleton-card"></div>
                        ))
                    ) : recommendedPosts.length > 0 ? (
                        // Success state - show actual products
                        recommendedPosts.map((recommendedPost, index) => (
                            <CardProduct
                                key={`recommended-${recommendedPost.id || index}`}
                                product={convertPostToProduct(recommendedPost)}
                            />
                        ))
                    ) : (
                        // Empty state - no recommendations found
                        <div className="empty-recommendations">
                            <i className="fas fa-search"></i>
                            <h3>{t('detailProduct:noSimilarProducts')}</h3>
                            <p>{t('detailProduct:tryOtherCategories')}</p>
                        </div>
                    )}
                </div>
                
                {/* See All Button - only show when we have recommendations */}
                {recommendedPosts.length > 0 && (
                    <div className="see-all-container">
                        <span 
                            className="see-all" 
                            onClick={() => navigate(`/search?category=${post?.category_id || ''}`)}
                        >
                            {t('detailProduct:seeAll')} <FontAwesomeIcon icon={faArrowRight} />
                        </span>
                    </div>
                )}
            </div>

            {/* Login Required Dialog */}
            <LoginRequiredDialog
                isOpen={showLoginDialog}
                onClose={closeLoginDialog}
                message={t('detailProduct:loginRequiredMessage')}
            />
        </div>
    );
}
