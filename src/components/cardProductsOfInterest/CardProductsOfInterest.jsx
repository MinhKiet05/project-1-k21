import React from 'react';
import './CardProductsOfInterest.css';

const CardProductsOfInterest = ({ product }) => {
    if (!product) return null;

    // Get the first image from the product
    const getProductImage = (product) => {
        if (product.image_urls && product.image_urls.length > 0) {
            return product.image_urls[0];
        }
        if (product.images && product.images.length > 0) {
            return product.images[0];
        }
        if (product.image_url) {
            return product.image_url;
        }
        if (product.image) {
            return product.image;
        }
        return '/placeholder-image.jpg'; // fallback image
    };

    // Format price
    const formatPrice = (price) => {
        if (!price) return '0đ';
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    const productImage = getProductImage(product);
    const productName = product.title || product.name || 'Không có tên';
    const productPrice = formatPrice(product.price);

    return (
        <div className="card-products-of-interest">
            <div className="interest-card-header">
                <span className="interest-inquiry-text">Đang hỏi về sản phẩm này</span>
            </div>
            
            <div className="interest-card-content">
                <div className="interest-product-image">
                    <img 
                        src={productImage} 
                        alt={productName}
                        onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                        }}
                    />
                </div>
                
                <div className="interest-product-info">
                    <h3 className="interest-product-name">{productName}</h3>
                    <div className="interest-product-price">
                        <span className="current-price">{productPrice}</span>
                        {product.original_price && product.original_price > product.price && (
                            <span className="original-price">
                                {formatPrice(product.original_price)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardProductsOfInterest;
