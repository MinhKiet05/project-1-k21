import '../dashboard/DashboardLayout.css'
import { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch } from "@fortawesome/free-solid-svg-icons"
import { toast } from 'react-toastify'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import '../../styles/confirm-alert.css'
import { usePosts } from '../../hooks/usePosts'
import { useCategories } from '../../hooks/useCategories'
import { useLocations } from '../../hooks/useLocations'
import { useUserRole } from '../../contexts/UserRoleContext'
import { useUpdatePostStatus } from '../../hooks/useUpdatePostStatus'
import PostDetailModal from '../../components/PostDetailModal/PostDetailModal'

export default function DashboardPosts() {
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
      <h2 className="page-title">Quản lý bài đăng</h2>
      
      {/* Search & Filters */}
      <div className="search-section">
        <div className="search-box-admin">
          <div>
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên người đăng hoặc tên sản phẩm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

              <div className="filters-row">
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Đang chờ</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Không duyệt</option>
            <option value="expired">Hết hạn</option>
            <option value="sold">Đã bán</option>
          </select>

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} disabled={categoriesLoading}>
            <option value="">Tất cả danh mục</option>
            {categories
              .sort((a, b) => {
                // "Khác" luôn ở cuối
                if (a.name.toLowerCase().includes('khác')) return 1;
                if (b.name.toLowerCase().includes('khác')) return -1;
                // Các danh mục khác sắp xếp theo tên
                return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
              })
              .map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
          </select>

          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} disabled={locationsLoading}>
            <option value="">Tất cả khu vực</option>
            {locations.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          
        </div>

        <div className="search-result">
          {postsLoading ? 'Đang tải...' : `Tìm thấy ${posts.length} bài đăng`}
          {postsError && <div className="field-error">Lỗi tải bài đăng: {postsError}</div>}
        </div>
      </div>

      {/* Table */}
      <div className="post-table-container">
        {postsLoading ? (
          <div className="loading-state"><p>Đang tải bài đăng...</p></div>
        ) : postsError ? (
          <div className="error-state"><p>Lỗi: {postsError}</p></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên người dùng</th>
                <th >Tên sản phẩm</th>
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
              {posts.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                    Chưa có bài đăng nào
                  </td>
                </tr>
              ) : posts.map((post) => {
                const authorName = post.author?.full_name || 'Người dùng'
                const title = post.title || ''
                const imageUrl = (post.image_urls && post.image_urls[0]) || (post.imageUrls && post.imageUrls[0]) || post.image_url || post.images?.[0] || 'https://via.placeholder.com/60'
                const price = post.price ? (typeof post.price === 'number' ? post.price.toLocaleString('vi-VN') + ' VNĐ' : post.price) : '-'
                const categoryName = post.category?.name || '-'
                const locationName = post.location?.name || '-'
                const createdAt = post.created_at ? formatDate(post.created_at) : '-'
                
                // Check if post is expired
                const isExpired = post.status === 'expired' || 
                  (post.status === 'approved' && post.expires_at && new Date() > new Date(post.expires_at))

                // Determine status display
                let statusDisplay = '';
                let statusClass = '';
                
                switch(post.status) {
                  case 'pending':
                    statusDisplay = 'Đang chờ';
                    statusClass = 'status-pending';
                    break;
                  case 'approved':
                    statusDisplay = 'Đã duyệt';
                    statusClass = 'status-approved';
                    break;
                  case 'rejected':
                    statusDisplay = 'Không duyệt';
                    statusClass = 'status-rejected';
                    break;
                  case 'expired':
                    statusDisplay = 'Hết hạn';
                    statusClass = 'status-expired';
                    break;
                  case 'sold':
                    statusDisplay = 'Đã bán';
                    statusClass = 'status-sold';
                    break;
                  default:
                    statusDisplay = 'Không xác định';
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
                            Xem chi tiết
                          </button>
                        </>
                      ) : (
                        <span className="no-permission">Không có quyền duyệt</span>
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