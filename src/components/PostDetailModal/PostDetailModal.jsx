import './PostDetailModal.css'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

export default function PostDetailModal({ 
  post, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject, 
  onMarkAsSold, 
  onExtendPost, 
  isUpdating,
  showUserActions = false 
}) {
  if (!isOpen || !post) return null

  const imageUrls = post.image_urls || post.imageUrls || []
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price) => {
    if (!price) return '-'
    return typeof price === 'number' ? price.toLocaleString('vi-VN') + ' VNĐ' : price
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return { text: 'Đang chờ duyệt', class: 'status-pending' }
      case 'approved': return { text: 'Đã duyệt', class: 'status-approved' }  
      case 'rejected': return { text: 'Không duyệt', class: 'status-rejected' }
      case 'expired': return { text: 'Hết hạn', class: 'status-expired' }
      case 'sold': return { text: 'Đã bán', class: 'status-sold' }
      default: return { text: 'Không xác định', class: 'status-unknown' }
    }
  }

  const statusInfo = getStatusBadge(post.status)
  const mainImage = imageUrls[selectedImageIndex] || imageUrls[0] || post.image_url || 'https://via.placeholder.com/300'

  // Handle image selection
  const handleImageClick = (index) => {
    setSelectedImageIndex(index)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Chi tiết bài đăng</h2>
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content-1">
          <div className="post-info">
            {/* Images */}
            <div className="post-images">
              <img src={mainImage} alt="Post" className="main-image" />
              
              {/* All Images Gallery */}
              {imageUrls.length > 0 && (
                <div className="all-images-gallery">
                  <div className="gallery-title">Tất cả hình ảnh ({imageUrls.length})</div>
                  <div className="gallery-grid">
                    {imageUrls.map((url, index) => (
                      <img 
                        key={index} 
                        src={url} 
                        alt={`Post ${index + 1}`} 
                        className={`gallery-thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                        onClick={() => handleImageClick(index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="post-details">
              <div className="detail-row">
                <label>Tiêu đề:</label>
                <span>{post.title}</span>
              </div>
              
              <div className="detail-row">
                <label>Người đăng:</label>
                <div className="author-info">
                  <img 
                    src={post.author?.avatar_url || 'https://via.placeholder.com/40'} 
                    alt="Author" 
                    className="author-avatar"
                  />
                  <span>{post.author?.full_name || 'Người dùng'}</span>
                </div>
              </div>

              <div className="detail-row">
                <label>Giá:</label>
                <span className="price">{formatPrice(post.price)}</span>
              </div>

              <div className="detail-row">
                <label>Danh mục:</label>
                <span>{post.category?.name || '-'}</span>
              </div>

              <div className="detail-row">
                <label>Khu vực:</label>
                <span>{post.location?.name || '-'}</span>
              </div>

              <div className="detail-row">
                <label>Trạng thái:</label>
                <span className={`status-badge ${statusInfo.class}`}>
                  {statusInfo.text}
                </span>
              </div>

              <div className="detail-row">
                <label>Ngày đăng:</label>
                <span>{formatDate(post.created_at)}</span>
              </div>

              <div className="detail-row">
                <label>Ngày hết hạn:</label>
                <span>{formatDate(post.expires_at)}</span>
              </div>

              <div className="detail-row description-row">
                <label>Mô tả:</label>
                <div className="description">{post.description}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          {showUserActions ? (
            // User actions (Management page)
            <>
              {post.status === 'approved' && (
                <button 
                  className="sold-btn"
                  onClick={() => onMarkAsSold(post.id)}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Đang xử lý...' : 'Đã bán'}
                </button>
              )}
              {post.status === 'expired' && (
                <button 
                  className="extend-btn"
                  onClick={() => onExtendPost(post.id)}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Đang xử lý...' : 'Chưa bán được'}
                </button>
              )}
              {(post.status === 'pending' || post.status === 'rejected' || post.status === 'sold') && (
                <div className="no-actions">
                  {post.status === 'pending' && 'Bài đăng đang chờ duyệt'}
                  {post.status === 'rejected' && 'Bài đăng không được duyệt'}
                  {post.status === 'sold' && 'Bài đăng đã bán'}
                </div>
              )}
            </>
          ) : (
            // Admin actions (Dashboard page)
            <>
              <button 
                className="reject-btn" 
                onClick={() => onReject(post.id)}
                disabled={isUpdating || post.status === 'rejected'}
              >
                {isUpdating ? 'Đang xử lý...' : 'Không duyệt'}
              </button>
              <button 
                className="approve-btn"
                onClick={() => onApprove(post.id)}
                disabled={isUpdating || post.status === 'approved'}
              >
                {isUpdating ? 'Đang xử lý...' : 'Duyệt'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}