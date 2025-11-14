import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useUser } from '@clerk/clerk-react';
import { usePosts } from "../../hooks/usePosts";
import { useCategories } from "../../hooks/useCategories";
import { useLocations } from "../../hooks/useLocations";
import { useUpdatePostStatus } from "../../hooks/useUpdatePostStatus";
import { getDisplayName } from "../../utils/languageUtils";
import PostDetailModal from "../../components/PostDetailModal/PostDetailModal";
import "./Management.css";

export default function Manager() {
  const { t, i18n } = useTranslation(['management', 'common']);
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
      toast.success(t('messages.markAsSoldSuccess'));
      handleCloseModal();
      refetch(); // Refresh danh sách
    } else {
      toast.error(t('messages.updateStatusError') + ': ' + result.error);
    }
  };

  // Handle extend post (for expired posts)
  const handleExtendPost = async (postId) => {
    const result = await extendPost(postId);
    if (result.success) {
      toast.success(t('messages.extendSuccess'));
      handleCloseModal();
      refetch(); // Refresh danh sách
    } else {
      toast.error(t('messages.extendError') + ': ' + result.error);
    }
  };

  // Hiển thị loading nếu đang kiểm tra user
  if (!user) {
    return (
      <div className="manager-container">
        <h2 className="manager-title">Quản lý các bài đăng</h2>
        <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
          {t('pleaseLogin')}
        </div>
      </div>
    );
  }

  return (
  <div className="manager"> 
    <div className="manager-container">
      <h2 className="manager-title">{t('title')}</h2>

      {/* Thanh tìm kiếm + bộ lọc */}
       <div className="search-section">
        <div className="search-box-admin">
          <div>
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
          </div>
          <input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="manager-filters-row">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">{t('filters.newest')}</option>
            <option value="oldest">{t('filters.oldest')}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t('filters.allStatus')}</option>
            <option value="pending">{t('status.pending')}</option>
            <option value="approved">{t('status.approved')}</option>
            <option value="rejected">{t('status.rejected')}</option>
            <option value="expired">{t('status.expired')}</option>
            <option value="sold">{t('status.sold')}</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={categoriesLoading}
          >
            <option value="">{t('filters.allCategories')}</option>
            {categories
              .sort((a, b) => {
                // "Khác" luôn ở cuối
                if (a.name.toLowerCase().includes('khác')) return 1;
                if (b.name.toLowerCase().includes('khác')) return -1;
                // Các danh mục khác sắp xếp theo tên
                return a.displayName.localeCompare(b.displayName, 'vi', { sensitivity: 'base' });
              })
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName}
                </option>
              ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            disabled={locationsLoading}
          >
            <option value="">{t('filters.allLocations')}</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.displayName}
              </option>
            ))}
          </select>
        </div>

        <div className="manager-search-result">
          {postsLoading ? t('common.loading') : t('results.found', { count: posts.length })}
          {postsError && (
            <div className="manager-field-error">
              {t('errors.loadPosts')}: {postsError}
            </div>
          )}
        </div>
      </div>

        {/* Bảng bài đăng */}
        <div className="manager-table-container">
          <table className="manager-table">
            <thead>
              <tr>
                <th>{t('table.productName')}</th>
                <th>{t('table.image')}</th>
                <th>{t('table.price')}</th>
                <th>{t('table.category')}</th>
                <th>{t('table.location')}</th>
                <th>{t('table.status')}</th>
                <th>{t('table.createdAt')}</th>
                <th>{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {postsLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    {t('loading.posts')}
                  </td>
                </tr>
              ) : postsError ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#e74c3c' }}>
                    {t('common.error')}: {postsError}
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    {t('noPosts')}
                  </td>
                </tr>
              ) : posts.map((post) => {
                const title = post.title || t('common.noTitle');
                const imageUrl = (post.image_urls && post.image_urls[0]) ||
                  (post.imageUrls && post.imageUrls[0]) ||
                  post.image_url ||
                  post.images?.[0] ||
                  'https://via.placeholder.com/60';
                const price = post.price ? (typeof post.price === 'number' ? post.price.toLocaleString('vi-VN') + ' VNĐ' : post.price) : t('common.noPrice');
                const categoryName = getDisplayName(post.category, i18n.language) || '-';
                const locationName = getDisplayName(post.location, i18n.language) || '-';
                const createdAt = post.created_at ? formatDate(post.created_at) : '-';

                // Determine status display
                let statusDisplay = '';
                let statusClass = '';

                switch (post.status) {
                  case 'pending':
                    statusDisplay = t('status.pending');
                    statusClass = 'status-pending';
                    break;
                  case 'approved':
                    statusDisplay = t('status.approved');
                    statusClass = 'status-approved';
                    break;
                  case 'rejected':
                    statusDisplay = t('status.rejected');
                    statusClass = 'status-rejected';
                    break;
                  case 'expired':
                    statusDisplay = t('status.expired');
                    statusClass = 'status-expired';
                    break;
                  case 'sold':
                    statusDisplay = t('status.sold');
                    statusClass = 'status-sold';
                    break;
                  default:
                    statusDisplay = t('status.unknown');
                    statusClass = 'status-unknown';
                }

                return (
                  <tr key={post.id}>
                    <td>{title}</td>
                    <td>
                      <img
                        src={imageUrl}
                        alt={title}
                        className="manager-img"
                      />
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
                        className="action-btn-view-detail"
                        onClick={() => handleViewDetail(post)}
                      >
                        {t('actions.viewDetail')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
