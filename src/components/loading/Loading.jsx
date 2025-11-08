import "./Loading.css";

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    </div>
  );
}