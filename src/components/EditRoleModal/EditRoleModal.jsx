import { useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import './EditRoleModal.css'
import { useUserRole } from '../../contexts/UserRoleContext'

export default function EditRoleModal({ user, isOpen, onClose, onUpdateRole }) {
  const { t } = useTranslation(['dashboard', 'common']);
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
      toast.success(t('roleUpdateSuccess'))
      onClose()
    } else {
      toast.error(t('roleUpdateError') + ': ' + result.error)
    }
    
    setIsUpdating(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t('editRole')}</h3>
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
              <label>{t('newRole')}:</label>
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
                  {t('roleNotes')}
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
              {t('common:cancel')}
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={isUpdating}
            >
              {isUpdating ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}