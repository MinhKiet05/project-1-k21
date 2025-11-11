import '../dashboard/DashboardLayout.css'
import { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import { usePosts } from '../../hooks/usePosts'
import { useCategories } from '../../hooks/useCategories'
import { useLocations } from '../../hooks/useLocations'
import { useUserRole } from '../../contexts/UserRoleContext'
import { useUpdatePostStatus } from '../../hooks/useUpdatePostStatus'
import { getDisplayName } from '../../utils/languageUtils'
import PostDetailModal from '../../components/PostDetailModal/PostDetailModal'

export default function DashboardPosts() {
  const { t, i18n } = useTranslation(['dashboard', 'common'])
  const [searchTerm, setSearchTerm] = useState('')
  // Filters for posts
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  // Modal state
  const [selectedPost, setSelectedPost] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Hooks to fetch posts with filters
  const { posts, loading: postsLoading, error: postsError, refetch } = usePosts({
    status: statusFilter === 'all' ? null : statusFilter,
    categoryId: categoryFilter || null,
    locationId: locationFilter || null,
    sort: sortOrder,
    search: searchTerm
  })

  const { categories, loading: categoriesLoading } = useCategories()
  const { locations, loading: locationsLoading } = useLocations()
  const { canModerateContent } = useUserRole()
  const { isUpdating, approvePost, rejectPost } = useUpdatePostStatus()

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  // Handle modal actions
  const handleViewDetail = (post) => {
    setSelectedPost(post)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedPost(null)
    setIsModalOpen(false)
  }

  const handleApprove = async (postId) => {
    const result = await approvePost(postId)
    if (result.success) {
      toast.success('Đã duyệt bài đăng thành công!')
      handleCloseModal()
      refetch() // Refresh danh sách
    } else {
      toast.error('Lỗi khi duyệt bài đăng: ' + result.error)
    }
  }

  const handleReject = async (postId) => {
    confirmAlert({
      title: 'Xác nhận từ chối',
      message: 'Bạn có chắc chắn muốn từ chối bài đăng này?',
      buttons: [
        {
          label: 'Hủy',
          onClick: () => {}
        },
        {
          label: 'Từ chối',
          onClick: async () => {
            const result = await rejectPost(postId)
            if (result.success) {
              toast.success('Đã từ chối bài đăng!')
              handleCloseModal()
              refetch() // Refresh danh sách
            } else {
              toast.error('Lỗi khi từ chối bài đăng: ' + result.error)
            }
          }
        }
      ]
    })
  }

  return (
    <div className="users-management">
      <h2 className="page-title">{t('posts.title')}</h2>
      
      {/* Search & Filters */}
      <div className="search-section">
        <div className="search-box-admin">
          <div>
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
          </div>
          <input
            type="text"
            placeholder={t('posts.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

              <div className="filters-row">
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="newest">{t('posts.newest')}</option>
            <option value="oldest">{t('posts.oldest')}</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">{t('posts.allStatuses')}</option>
            <option value="pending">{t('posts.status.pending')}</option>
            <option value="approved">{t('posts.status.approved')}</option>
            <option value="rejected">{t('posts.status.rejected')}</option>
            <option value="expired">{t('posts.status.expired')}</option>
            <option value="sold">{t('posts.status.sold')}</option>
          </select>

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} disabled={categoriesLoading}>
            <option value="">{t('posts.allCategories')}</option>
            {categories
              .sort((a, b) => {
                // "Khác" luôn ở cuối
                if (a.name.toLowerCase().includes('khác')) return 1;
                if (b.name.toLowerCase().includes('khác')) return -1;
                // Các danh mục khác sắp xếp theo tên
                return a.displayName.localeCompare(b.displayName, 'vi', { sensitivity: 'base' });
              })
              .map(c => (
                <option key={c.id} value={c.id}>{c.displayName}</option>
              ))}
          </select>

          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} disabled={locationsLoading}>
            <option value="">{t('posts.allLocations')}</option>
            {locations.map(l => (
              <option key={l.id} value={l.id}>{l.displayName}</option>
            ))}
          </select>

          
        </div>

        <div className="search-result">
          {postsLoading ? t('common:loading') : `${t('posts.found')} ${posts.length} ${t('posts.posts')}`}
          {postsError && <div className="field-error">{t('common:error')}: {postsError}</div>}
        </div>
      </div>

      {/* Table */}
      <div className="post-table-container">
        {postsLoading ? (
          <div className="loading-state"><p>{t('common:loading')}</p></div>
        ) : postsError ? (
          <div className="error-state"><p>{t('common:error')}: {postsError}</p></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('posts.table.userName')}</th>
                <th>{t('posts.table.productName')}</th>
                <th>{t('posts.table.image')}</th>
                <th>{t('posts.table.price')}</th>
                <th>{t('posts.table.category')}</th>
                <th>{t('posts.table.location')}</th>
                <th>{t('posts.table.status')}</th>
                <th>{t('posts.table.createdTime')}</th>
                <th>{t('posts.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                    {t('posts.noPosts')}
                  </td>
                </tr>
              ) : posts.map((post) => {
                const authorName = post.author?.full_name || 'Người dùng'
                const title = post.title || ''
                const imageUrl = (post.image_urls && post.image_urls[0]) || (post.imageUrls && post.imageUrls[0]) || post.image_url || post.images?.[0] || 'https://via.placeholder.com/60'
                const price = post.price ? (typeof post.price === 'number' ? post.price.toLocaleString('vi-VN') + ' VNĐ' : post.price) : '-'
                const categoryName = getDisplayName(post.category, i18n.language) || '-'
                const locationName = getDisplayName(post.location, i18n.language) || '-'
                const createdAt = post.created_at ? formatDate(post.created_at) : '-'
                
                // Check if post is expired
                const isExpired = post.status === 'expired' || 
                  (post.status === 'approved' && post.expires_at && new Date() > new Date(post.expires_at))

                // Determine status display
                let statusDisplay = '';
                let statusClass = '';
                
                switch(post.status) {
                  case 'pending':
                    statusDisplay = t('posts.status.pending');
                    statusClass = 'status-pending';
                    break;
                  case 'approved':
                    statusDisplay = t('posts.status.approved');
                    statusClass = 'status-approved';
                    break;
                  case 'rejected':
                    statusDisplay = t('posts.status.rejected');
                    statusClass = 'status-rejected';
                    break;
                  case 'expired':
                    statusDisplay = t('posts.status.expired');
                    statusClass = 'status-expired';
                    break;
                  case 'sold':
                    statusDisplay = t('posts.status.sold');
                    statusClass = 'status-sold';
                    break;
                  default:
                    statusDisplay = t('common.unknown');
                    statusClass = 'status-unknown';
                }

                return (
                  <tr key={post.id}>
                    <td className="name-cell">{authorName}</td>
                    <td style={{maxWidth: '300px'}}>{title}</td>
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
                            {t('posts.viewDetail')}
                          </button>
                        </>
                      ) : (
                        <span className="no-permission">{t('posts.noPermission')}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
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
  )
}
