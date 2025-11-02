import { useUserRole } from '../../contexts/UserRoleContext'
import { useUser } from '@clerk/clerk-react'

export default function ProtectedAdminRoute({ children }) {
  const { user, isLoaded } = useUser()
  const { isAdmin, isLoadingRole } = useUserRole()

  if (!isLoaded || isLoadingRole) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Đang tải...
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '18px',
        color: '#dc3545'
      }}>
        Vui lòng đăng nhập để truy cập trang này
      </div>
    )
  }

  if (!isAdmin()) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '18px',
        color: '#dc3545',
        textAlign: 'center'
      }}>
        <h2>⛔ Truy cập bị từ chối</h2>
        <p>Bạn không có quyền truy cập trang quản trị này.</p>
        <p>Chỉ Admin và Super Admin mới có thể truy cập.</p>
      </div>
    )
  }

  return children
}