import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useUser } from "@clerk/clerk-react";
import { usePosts } from "../../hooks/usePosts";
import { useCategories } from "../../hooks/useCategories";
import { useLocations } from "../../hooks/useLocations";
import { useUpdatePostStatus } from "../../hooks/useUpdatePostStatus";
import PostDetailModal from "../../components/PostDetailModal/PostDetailModal";
import "./Management.css";
import { useTranslation } from "react-i18next";

export default function Manager() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  // Modal state
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get current user from Clerk
  const { user } = useUser();

  // Hooks to fetch posts with filters - chỉ lấy bài đăng của user hiện tại
  const {
    posts,
    loading: postsLoading,
    error: postsError,
    refetch,
  } = usePosts({
    status: statusFilter === "all" ? null : statusFilter,
    categoryId: categoryFilter || null,
    locationId: locationFilter || null,
    userId: user?.id || null, // Filter theo user hiện tại
    sort: sortOrder,
    search: searchTerm,
  });

  const { categories, loading: categoriesLoading } = useCategories();
  const { locations, loading: locationsLoading } = useLocations();
  const { isUpdating, approvePost, rejectPost, markAsSold, extendPost } =
    useUpdatePostStatus();

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
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
      toast.success(t("management.mark_sold_success"));
      handleCloseModal();
      refetch(); // Refresh danh sách
    } else {
      toast.error(t("management.status_update_error") + ": " + result.error);
    }
  };

  // Handle extend post (for expired posts)
  const handleExtendPost = async (postId) => {
    const result = await extendPost(postId);
    if (result.success) {
      toast.success(t("management.extend_success"));
      handleCloseModal();
      refetch(); // Refresh danh sách
    } else {
      toast.error(t("management.extend_error") + ": " + result.error);
    }
  };

  // Hiển thị loading nếu đang kiểm tra user
  if (!user) {
    return (
      <div className="manager-container">
        <h2 className="manager-title">{t("management.manage_posts")}</h2>
        <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
          {t("management.login_required")}
        </div>
      </div>
    );
  }

  return (
    <div className="manager-container">
      <h2 className="manager-title">{t("management.my_posts")}</h2>

      {/* Search & Filters */}
      <div className="manager-search-section">
        <div className="search-box-admin">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder={t("management.search_posts")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="manager-filters-row">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">{t("common.newest")}</option>
            <option value="oldest">{t("common.oldest")}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t("management.all_status")}</option>
            <option value="pending">{t("management.status_pending")}</option>
            <option value="approved">{t("management.status_approved")}</option>
            <option value="rejected">{t("management.status_rejected")}</option>
            <option value="expired">{t("management.status_expired")}</option>
            <option value="sold">{t("management.status_sold")}</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={categoriesLoading}
          >
            <option value="">{t("management.all_categories")}</option>
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
            <option value="">{t("management.all_locations")}</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="manager-search-result">
          {postsLoading
            ? t("common.loading")
            : t("management.found_posts", { count: posts.length })}
          {postsError && (
            <div className="manager-field-error">
              {t("management.load_posts_error")}: {postsError}
            </div>
          )}
        </div>
      </div>

      <table className="manager-table">
        <thead>
          <tr>
            <th>{t("management.product_name")}</th>
            <th>{t("management.image")}</th>
            <th>{t("management.price")}</th>
            <th>{t("management.category")}</th>
            <th>{t("management.location")}</th>
            <th>{t("management.status")}</th>
            <th>{t("management.created_time")}</th>
            <th>{t("management.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {postsLoading ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                {t("management.loading_posts")}
              </td>
            </tr>
          ) : postsError ? (
            <tr>
              <td
                colSpan="8"
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#e74c3c",
                }}
              >
                {t("common.error")}: {postsError}
              </td>
            </tr>
          ) : posts.length === 0 ? (
            <tr>
              <td
                colSpan="8"
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                {t("management.no_posts")}
              </td>
            </tr>
          ) : (
            posts.map((post) => {
              const title = post.title || t("management.no_title");
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
                : t("management.no_price");
              const categoryName = post.category?.name || "-";
              const locationName = post.location?.name || "-";
              const createdAt = post.created_at
                ? formatDate(post.created_at)
                : "-";

              // Determine status display
              let statusDisplay = "";
              let statusClass = "";

              switch (post.status) {
                case "pending":
                  statusDisplay = t("management.status_pending");
                  statusClass = "status-pending";
                  break;
                case "approved":
                  statusDisplay = t("management.status_approved");
                  statusClass = "status-approved";
                  break;
                case "rejected":
                  statusDisplay = t("management.status_rejected");
                  statusClass = "status-rejected";
                  break;
                case "expired":
                  statusDisplay = t("management.status_expired");
                  statusClass = "status-expired";
                  break;
                case "sold":
                  statusDisplay = t("management.status_sold");
                  statusClass = "status-sold";
                  break;
                default:
                  statusDisplay = t("management.status_unknown");
                  statusClass = "status-unknown";
              }

              return (
                <tr key={post.id}>
                  <td>{title}</td>
                  <td>
                    <img src={imageUrl} alt={title} className="manager-img" />
                  </td>
                  <td>{price}</td>
                  <td>{categoryName}</td>
                  <td>{locationName}</td>
                  <td>
                    <p className={statusClass}>{statusDisplay}</p>
                  </td>
                  <td>{createdAt}</td>
                  <td>
                    <button
                      className="manager-btn"
                      onClick={() => handleViewDetail(post)}
                    >
                      {t("management.view_detail")}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Post Detail Modal */}
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
  );
}
