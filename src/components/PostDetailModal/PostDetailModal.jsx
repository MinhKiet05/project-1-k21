import './PostDetailModal.css'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import { getDisplayName } from '../../utils/languageUtils'

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
  const { i18n, t } = useTranslation(['postDetail', 'common'])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  if (!isOpen || !post) return null

  const imageUrls = post.image_urls || post.imageUrls || []

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
    if (typeof price === 'number') {
      const formattedNumber = price.toLocaleString('vi-VN')
      return i18n.language === 'vi' ? `${formattedNumber} VNĐ` : `${formattedNumber} VND`
    }
    return price
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return { text: t('postDetail:pending'), class: 'status-pending' }
      case 'approved': return { text: t('postDetail:approved'), class: 'status-approved' }  
      case 'rejected': return { text: t('postDetail:rejected'), class: 'status-rejected' }
      case 'expired': return { text: t('postDetail:expired'), class: 'status-expired' }
      case 'sold': return { text: t('postDetail:sold'), class: 'status-sold' }
      default: return { text: t('postDetail:unknown'), class: 'status-unknown' }
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
          <h2>{t('postDetail:details')}</h2>
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
                  <div className="gallery-title">{t('postDetail:images')} ({imageUrls.length})</div>
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
                <label>{t('common:title')}:</label>
                <span>{post.title}</span>
              </div>
              
              <div className="detail-row">
                <label>{t('common:author')}:</label>
                <div className="author-info">
                  <img 
                    src={post.author?.avatar_url || 'https://via.placeholder.com/40'} 
                    alt="Author" 
                    className="author-avatar"
                  />
                  <span>{post.author?.full_name || (i18n.language === 'vi' ? 'Người dùng' : 'User')}</span>
                </div>
              </div>

              <div className="detail-row">
                <label>{t('common:price')}:</label>
                <span className="price">{formatPrice(post.price)}</span>
              </div>

              <div className="detail-row">
                <label>{t('postDetail:category')}:</label>
                <span>{getDisplayName(post.category, i18n.language) || '-'}</span>
              </div>

              <div className="detail-row">
                <label>{t('postDetail:location')}:</label>
                <span>{getDisplayName(post.location, i18n.language) || '-'}</span>
              </div>

              <div className="detail-row">
                <label>{t('postDetail:status')}:</label>
                <span className={`status-badge ${statusInfo.class}`}>
                  {statusInfo.text}
                </span>
              </div>

              <div className="detail-row">
                <label>{t('postDetail:createdAt')}:</label>
                <span>{formatDate(post.created_at)}</span>
              </div>

              <div className="detail-row">
                <label>{t('postDetail:expiresAt')}:</label>
                <span>{formatDate(post.expires_at)}</span>
              </div>

              <div className="detail-row description-row">
                <label>{t('postDetail:description')}:</label>
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
                  {isUpdating ? t('postDetail:processing') : t('postDetail:sold')}
                </button>
              )}
              {post.status === 'expired' && (
                <button 
                  className="extend-btn"
                  onClick={() => onExtendPost(post.id)}
                  disabled={isUpdating}
                >
                  {isUpdating ? t('postDetail:processing') : t('postDetail:notSoldYet')}
                </button>
              )}
              {(post.status === 'pending' || post.status === 'rejected' || post.status === 'sold') && (
                <div className="no-actions">
                  {post.status === 'pending' && t('postDetail:pendingApproval')}
                  {post.status === 'rejected' && t('postDetail:rejected')}
                  {post.status === 'sold' && t('postDetail:soldAlready')}
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
                {isUpdating ? t('postDetail:processing') : t('postDetail:reject')}
              </button>
              <button 
                className="approve-btn"
                onClick={() => onApprove(post.id)}
                disabled={isUpdating || post.status === 'approved'}
              >
                {isUpdating ? t('postDetail:processing') : t('postDetail:approve')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}