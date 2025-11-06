import React from "react";
import { useNavigate } from "react-router-dom";
import "./CardProduct.css";

export default function CardProduct({ product }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (product?.id) {
      navigate(`/product/${product.id}`);
    }
  };

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
}