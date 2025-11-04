import '../dashboard/DashboardLayout.css'
import { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch } from "@fortawesome/free-solid-svg-icons"
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
      alert('Đã duyệt bài đăng thành công!')
      handleCloseModal()
      refetch() // Refresh danh sách
    } else {
      alert('Lỗi khi duyệt bài đăng: ' + result.error)
    }
  }

  const handleReject = async (postId) => {
    if (confirm('Bạn có chắc chắn muốn từ chối bài đăng này?')) {
      const result = await rejectPost(postId)
      if (result.success) {
        alert('Đã từ chối bài đăng!')
        handleCloseModal()
        refetch() // Refresh danh sách
      } else {
        alert('Lỗi khi từ chối bài đăng: ' + result.error)
      }
    }
  }

  return (
    <div className="users-management">
      <h2 className="page-title">Quản lý bài đăng</h2>
      
      {/* Search & Filters */}
      <div className="search-section">
        <div className="search-box-admin">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên người đăng hoặc tiêu đề"
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
          </select>

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} disabled={categoriesLoading}>
            <option value="">Tất cả danh mục</option>
            {categories.map(c => (
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
      <div className="table-container">
        {postsLoading ? (
          <div className="loading-state"><p>Đang tải bài đăng...</p></div>
        ) : postsError ? (
          <div className="error-state"><p>Lỗi: {postsError}</p></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên người dùng</th>
                <th>Tiêu đề</th>
                <th>Hình ảnh</th>
                <th>Giá</th>
                <th>Danh mục</th>
                <th>Khu vực</th>
                <th>Thời gian tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{textAlign: 'center', padding: '20px', color: '#666'}}>
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