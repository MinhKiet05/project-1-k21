import { useState } from 'react'
import { toast } from 'react-toastify'
import './EditRoleModal.css'
import { useUserRole } from '../../contexts/UserRoleContext'

export default function EditRoleModal({ user, isOpen, onClose, onUpdateRole }) {
  const { getAvailableRoles } = useUserRole()
  // Get highest role from array
  const getHighestRole = (roles) => {
    if (!Array.isArray(roles)) return 'user'
    if (roles.includes('super_admin')) return 'super_admin'
    if (roles.includes('admin')) return 'admin'
    return 'user'
  }
  
  const [selectedRole, setSelectedRole] = useState(getHighestRole(user?.roles) || 'user')
  const [isUpdating, setIsUpdating] = useState(false)

  if (!isOpen || !user) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    
    const result = await onUpdateRole(user.id, selectedRole)
    
    if (result.success) {
      toast.success('Cập nhật vai trò thành công!')
      onClose()
    } else {
      toast.error('Lỗi khi cập nhật role: ' + result.error)
    }
    
    setIsUpdating(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Chỉnh sửa vai trò</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="user-info">
              <img src={user.avatar_url} alt="Avatar" className="modal-avatar" />
              <div>
                <div className="modal-name">{user.full_name}</div>
                <div className="modal-email">{user.email}</div>
              </div>
            </div>
            
            <div className="role-selection">
              <label>Vai trò mới:</label>
              <select 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={isUpdating}
              >
                {getAvailableRoles().map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <div className="role-note">
                <small>
                  * Chỉ Super Admin mới có thể cấp quyền Admin<br/>
                  * Không thể chỉnh sửa quyền của Super Admin khác
                </small>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={isUpdating}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={isUpdating}
            >
              {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}