import React from "react";
import "./CardProduct.css";

export default function CardProduct({ product }) {
  return (
    <>
      <div className="card">
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
              <button className="card-btn">Liên hệ ngay</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}