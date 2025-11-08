import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../../lib/supabase';
import { useChatContext } from '../../contexts/ChatContext';
import { toast } from 'react-toastify';
import './DetailProduct.css';

export default function DetailProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const { createOrFindConversation, openDirectChat } = useChatContext();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPostDetail();
        }
    }, [id]);

    const fetchPostDetail = async () => {
        try {
            setLoading(true);
            
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    categories (name),
                    locations!location_id (name),
                    profiles!author_id (*)
                `)
                .eq('id', id)
                .eq('status', 'approved')
                .single();

            if (error) {
                throw error;
            }

            if (!data) {
                setError('Không tìm thấy sản phẩm');
                return;
            }

            setPost(data);
        } catch (error) {
            setError('Có lỗi xảy ra khi tải thông tin sản phẩm');
        } finally {
            setLoading(false);
        }
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
            toast.warning('Bạn cần đăng nhập để liên hệ với người bán');
            return;
        }

        if (post?.author_id === user.id) {
            toast.warning('Bạn không thể nhắn tin với chính mình');
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
            toast.error('Có lỗi xảy ra khi tạo cuộc trò chuyện');
        } finally {
            setChatLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="detail-container">
                <div className="detail-loading">
                    Đang tải thông tin sản phẩm...
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
                        {error || 'Không tìm thấy sản phẩm'}
                    </div>
                    <button 
                        className="detail-back-btn"
                        onClick={handleClose}
                    >
                        Quay lại
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
    
    const categoryName = post.categories?.name || 'Chưa phân loại';

    return (
        <div className="detail-container">
            <div className="detail-wrapper">
                <div className="detail-content">
                    {/* Phần hình ảnh */}
                    <div className="detail-image-section">
                        <div className="detail-image-container">
                            <div className="detail-image-wrapper">
                                <img
                                    src={currentImage || 'https://via.placeholder.com/450x450?text=Không+có+hình+ảnh'}
                                    alt={post.title}
                                    className="detail-main-image"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/450x450?text=Không+có+hình+ảnh';
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

                        <div className="detail-description-label">Mô tả:</div>
                        <div className="detail-description">
                            {post.description || 'Chưa có mô tả chi tiết.'}
                        </div>

                        <div className="detail-category-label">Danh mục: {categoryName}</div>
                        <div className="detail-category">Khu vực: {post.locations?.name || 'Chưa có thông tin'}</div>

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
                                    <strong>Người bán:</strong>
                                    <span className="detail-seller-name">
                                        {post.profiles?.full_name || 
                                         post.profiles?.name || 
                                         post.profiles?.username || 
                                         'Chưa có thông tin'}
                                    </span>
                                </div>
                            </div>
                            
                        </div>
                        <button 
                                className="detail-contact-btn"
                                onClick={handleContactSeller}
                                disabled={chatLoading || !user}
                            >
                                <FontAwesomeIcon icon={faComment} />
                                {chatLoading ? 'Đang tạo cuộc trò chuyện...' : 'Liên hệ ngay'}
                            </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
