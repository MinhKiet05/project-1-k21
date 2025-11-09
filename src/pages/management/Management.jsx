import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-toastify';
import { useUser } from '@clerk/clerk-react';
import { usePosts } from "../../hooks/usePosts";
import { useCategories } from "../../hooks/useCategories";
import { useLocations } from "../../hooks/useLocations";
import { useUpdatePostStatus } from "../../hooks/useUpdatePostStatus";
import PostDetailModal from "../../components/PostDetailModal/PostDetailModal";
import "./Management.css";

export default function Manager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  // Modal state
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get current user from Clerk
  const { user } = useUser();

  // Hooks to fetch posts with filters - chỉ lấy bài đăng của user hiện tại
  const { posts, loading: postsLoading, error: postsError, refetch } = usePosts({
    status: statusFilter === 'all' ? null : statusFilter,
    categoryId: categoryFilter || null,
    locationId: locationFilter || null,
    userId: user?.id || null, // Filter theo user hiện tại
    sort: sortOrder,
    search: searchTerm
  });

  const { categories, loading: categoriesLoading } = useCategories();
  const { locations, loading: locationsLoading } = useLocations();
  const { isUpdating, approvePost, rejectPost, markAsSold, extendPost } = useUpdatePostStatus();

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Handle modal actions
  const handleViewDetail = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  // Handle mark as sold (for approved posts)
  const handleMarkAsSold = async (postId) => {
    const result = await markAsSold(postId);
    if (result.success) {
      toast.success('Đã đánh dấu bài đăng là đã bán!');
      handleCloseModal();
      refetch(); // Refresh danh sách
    } else {
      toast.error('Lỗi khi cập nhật trạng thái: ' + result.error);
    }
  };

  // Handle extend post (for expired posts)
  const handleExtendPost = async (postId) => {
    const result = await extendPost(postId);
    if (result.success) {
      toast.success('Đã gia hạn bài đăng thêm 7 ngày!');
      handleCloseModal();
      refetch(); // Refresh danh sách
    } else {
      toast.error('Lỗi khi gia hạn bài đăng: ' + result.error);
    }
  };

  // Hiển thị loading nếu đang kiểm tra user
  if (!user) {
    return (
      <div className="manager-container">
        <h2 className="manager-title">Quản lý các bài đăng</h2>
        <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
          Vui lòng đăng nhập để quản lý bài đăng của bạn.
        </div>
      </div>
    );
  }

  return (
  <div className="manager"> 
    <div className="manager-container">
      <h2 className="manager-title">Quản lý bài đăng</h2>

      {/* Thanh tìm kiếm + bộ lọc */}
      <div className="manager-search-section">
        <div className="search-box-admin">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên người đăng hoặc tên sản phẩm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="manager-filters-row">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Đang chờ</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Không duyệt</option>
            <option value="expired">Hết hạn</option>
            <option value="sold">Đã bán</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={categoriesLoading}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            disabled={locationsLoading}
          >
            <option value="">Tất cả khu vực</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="manager-search-result">
          {postsLoading ? "Đang tải..." : `Tìm thấy ${posts.length} bài đăng`}
          {postsError && (
            <div className="manager-field-error">
              Lỗi tải bài đăng: {postsError}
            </div>
          )}
        </div>
      </div>

      {/* Bảng bài đăng */}
      <table className="manager-table">
        <thead>
          <tr>
            <th style={{ width: "250px" }}>Tên Sản phẩm</th>
            <th>Hình ảnh</th>
            <th>Giá</th>
            <th>Danh mục</th>
            <th>Khu vực</th>
            <th>Trạng thái</th>
            <th>Thời gian tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {postsLoading ? (
            <tr>
              <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                Đang tải bài đăng...
              </td>
            </tr>
          ) : postsError ? (
            <tr>
              <td
                colSpan="9"
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#e74c3c",
                }}
              >
                Lỗi: {postsError}
              </td>
            </tr>
          ) : posts.length === 0 ? (
            <tr>
              <td
                colSpan="9"
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                Chưa có bài đăng nào
              </td>
            </tr>
          ) : (
            posts.map((post) => {
              const title = post.title || "Không có tiêu đề";
              const imageUrl =
                (post.image_urls && post.image_urls[0]) ||
                (post.imageUrls && post.imageUrls[0]) ||
                post.image_url ||
                post.images?.[0] ||
                "https://via.placeholder.com/60";
              const price = post.price
                ? typeof post.price === "number"
                  ? post.price.toLocaleString("vi-VN") + " VNĐ"
                  : post.price
                : "Chưa có giá";
              const categoryName = post.category?.name || "-";
              const locationName = post.location?.name || "-";
              const createdAt = post.created_at || "-";
              const username = post.user?.name || "Ẩn danh";

              // Trạng thái hiển thị
              let statusDisplay = "";
              let statusClass = "";
              switch (post.status) {
                case "pending":
                  statusDisplay = "Chưa duyệt";
                  statusClass = "status-pending";
                  break;
                case "approved":
                  statusDisplay = "Đã duyệt";
                  statusClass = "status-approved";
                  break;
                case "rejected":
                  statusDisplay = "Không được duyệt";
                  statusClass = "status-rejected";
                  break;
                case "expired":
                  statusDisplay = "Hết hạn";
                  statusClass = "status-expired";
                  break;
                case "sold":
                  statusDisplay = "Đã bán";
                  statusClass = "status-sold";
                  break;
                default:
                  statusDisplay = "Không xác định";
                  statusClass = "status-unknown";
              }

              return (
                <tr key={post.id}>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "300", color: "#000" }}>{title}</span>
                    </div>
                  </td>
                  <td>
                    <img src={imageUrl} alt={title} className="manager-img" />
                  </td>
                  <td style={{ color: "green", fontWeight: 600 }}>{price}</td>
                  <td>{categoryName}</td>
                  <td>{locationName}</td>
                  <td>
                    <span className={statusClass}>{statusDisplay}</span>
                  </td>
                  <td>{createdAt}</td>
                  <td>
                    <button
                      className="manager-btn"
                      onClick={() => handleViewDetail(post)}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>


              );
            })
          )}
        </tbody>
      </table>

      <PostDetailModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onMarkAsSold={handleMarkAsSold}
        onExtendPost={handleExtendPost}
        isUpdating={isUpdating}
        showUserActions={true}
      />
    </div>
  </div>
  );
}