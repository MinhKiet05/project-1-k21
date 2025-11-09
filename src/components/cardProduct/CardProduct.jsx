import React, { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LazyImage from "../lazyImage/LazyImage.jsx";
import "./CardProduct.css";

const CardProduct = memo(({ product }) => {
  const navigate = useNavigate();

  const handleCardClick = useCallback(() => {
    if (product?.id) {
      navigate(`/product/${product.id}`);
    }
  }, [product?.id, navigate]);

  return (
    <>
      <div className="card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <img
          src={product?.image || "#"}
          alt={product?.name || "Sản phẩm"}
          className="card-img"
        />
        <div className="card-content">
          <p className="card-title">{product?.name || "Sách quốc phòng"}</p>

          <div className="price-section">
            <p className="price-label">Giá</p>
            <div className="card-bottom">
              <p className="card-price">
                <span>{product?.price ? product.price.toLocaleString() : "15,000"}</span>
                <span>VND</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

CardProduct.displayName = 'CardProduct';

export default CardProduct;