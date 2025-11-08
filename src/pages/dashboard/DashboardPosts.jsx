import "../dashboard/DashboardLayout.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import "../../styles/confirm-alert.css";
import { usePosts } from "../../hooks/usePosts";
import { useCategories } from "../../hooks/useCategories";
import { useLocations } from "../../hooks/useLocations";
import { useUserRole } from "../../contexts/UserRoleContext";
import { useUpdatePostStatus } from "../../hooks/useUpdatePostStatus";
import PostDetailModal from "../../components/PostDetailModal/PostDetailModal";
import { useTranslation } from "react-i18next";

export default function DashboardPosts() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  // Filters for posts
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  // Modal state
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hooks to fetch posts with filters
  const {
    posts,
    loading: postsLoading,
    error: postsError,
    refetch,
  } = usePosts({
    status: statusFilter === "all" ? null : statusFilter,
    categoryId: categoryFilter || null,
    locationId: locationFilter || null,
    sort: sortOrder,
    search: searchTerm,
  });

  const { categories, loading: categoriesLoading } = useCategories();
  const { locations, loading: locationsLoading } = useLocations();
  const { canModerateContent } = useUserRole();
  const { isUpdating, approvePost, rejectPost } = useUpdatePostStatus();

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

  const handleApprove = async (postId) => {
    const result = await approvePost(postId);
    if (result.success) {
      toast.success(t("dashboard.approve_success"));
      handleCloseModal();
      refetch(); // Refresh danh sách
    } else {
      toast.error(t("dashboard.approve_error") + ": " + result.error);
    }
  };

  const handleReject = async (postId) => {
    confirmAlert({
      title: t("dashboard.confirm_reject"),
      message: t("dashboard.confirm_reject_message"),
      buttons: [
        {
          label: t("common.cancel"),
          onClick: () => {},
        },
        {
          label: t("dashboard.reject"),
          onClick: async () => {
            const result = await rejectPost(postId);
            if (result.success) {
              toast.success(t("dashboard.reject_success"));
              handleCloseModal();
              refetch(); // Refresh danh sách
            } else {
              toast.error(t("dashboard.reject_error") + ": " + result.error);
            }
          },
        },
      ],
    });
  };

  return (
    <div className="users-management">
      <h2 className="page-title">{t("dashboard.post_management")}</h2>

      {/* Search & Filters */}
      <div className="search-section">
        <div className="search-box-admin">
          <div>
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
          </div>
          <input
            type="text"
            placeholder={t("dashboard.search_posts_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-row">
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
            <option value="all">{t("dashboard.all_status")}</option>
            <option value="pending">{t("dashboard.status_pending")}</option>
            <option value="approved">{t("dashboard.status_approved")}</option>
            <option value="rejected">{t("dashboard.status_rejected")}</option>
            <option value="expired">{t("dashboard.status_expired")}</option>
            <option value="sold">{t("dashboard.status_sold")}</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={categoriesLoading}
          >
            <option value="">{t("dashboard.all_categories")}</option>
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
            <option value="">{t("dashboard.all_locations")}</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="search-result">
          {postsLoading
            ? t("common.loading")
            : t("dashboard.found_posts", { count: posts.length })}
          {postsError && (
            <div className="field-error">
              {t("dashboard.load_posts_error")}: {postsError}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="post-table-container">
        {postsLoading ? (
          <div className="loading-state">
            <p>{t("dashboard.loading_posts")}</p>
          </div>
        ) : postsError ? (
          <div className="error-state">
            <p>
              {t("common.error")}: {postsError}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("dashboard.username")}</th>
                <th>{t("dashboard.product_name")}</th>
                <th>{t("dashboard.image")}</th>
                <th>{t("dashboard.price")}</th>
                <th>{t("dashboard.category")}</th>
                <th>{t("dashboard.location")}</th>
                <th>{t("dashboard.status")}</th>
                <th>{t("dashboard.created_time")}</th>
                <th>{t("dashboard.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#666",
                    }}
                  >
                    {t("dashboard.no_posts")}
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const authorName =
                    post.author?.full_name || t("dashboard.default_user");
                  const title = post.title || "";
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
                    : "-";
                  const categoryName = post.category?.name || "-";
                  const locationName = post.location?.name || "-";
                  const createdAt = post.created_at
                    ? formatDate(post.created_at)
                    : "-";

                  // Check if post is expired
                  const isExpired =
                    post.status === "expired" ||
                    (post.status === "approved" &&
                      post.expires_at &&
                      new Date() > new Date(post.expires_at));

                  // Determine status display
                  let statusDisplay = "";
                  let statusClass = "";

                  switch (post.status) {
                    case "pending":
                      statusDisplay = t("dashboard.status_pending");
                      statusClass = "status-pending";
                      break;
                    case "approved":
                      statusDisplay = t("dashboard.status_approved");
                      statusClass = "status-approved";
                      break;
                    case "rejected":
                      statusDisplay = t("dashboard.status_rejected");
                      statusClass = "status-rejected";
                      break;
                    case "expired":
                      statusDisplay = t("dashboard.status_expired");
                      statusClass = "status-expired";
                      break;
                    case "sold":
                      statusDisplay = t("dashboard.status_sold");
                      statusClass = "status-sold";
                      break;
                    default:
                      statusDisplay = t("dashboard.status_unknown");
                      statusClass = "status-unknown";
                  }

                  return (
                    <tr key={post.id}>
                      <td className="name-cell">{authorName}</td>
                      <td>{title}</td>
                      <td className="image-cell">
                        <img src={imageUrl} alt="Post" />
                      </td>
                      <td className="price-cell">{price}</td>
                      <td className="category-cell">{categoryName}</td>
                      <td className="location-cell">{locationName}</td>
                      <td className="status-cell">
                        <span className={statusClass}>{statusDisplay}</span>
                      </td>
                      <td className="date-cell">{createdAt}</td>
                      <td className="action-cell">
                        {canModerateContent() ? (
                          <>
                            <button
                              className="action-btn-view-detail"
                              onClick={() => handleViewDetail(post)}
                            >
                              {t("dashboard.view_detail")}
                            </button>
                          </>
                        ) : (
                          <span className="no-permission">
                            {t("dashboard.no_permission")}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        onReject={handleReject}
        isUpdating={isUpdating}
      />
    </div>
  );
}
