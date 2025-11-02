import { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { supabase } from '../lib/supabase'

const UserRoleContext = createContext()

export function UserRoleProvider({ children }) {
  const { user, isLoaded } = useUser()
  const [userRole, setUserRole] = useState(null)
  const [isLoadingRole, setIsLoadingRole] = useState(true)

  useEffect(() => {
    if (!isLoaded || !user) {
      setUserRole(null)
      setIsLoadingRole(false)
      return
    }

    const fetchUserRole = async () => {
      try {
        setIsLoadingRole(true)
        
        const { data, error } = await supabase
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single()

        if (error) {
          setUserRole('user') // Default to user role
        } else {
          // roles là array, lấy role cao nhất
          const rolesArray = data?.roles || ['user']
          
          if (rolesArray.includes('super_admin')) {
            setUserRole('super_admin')
          } else if (rolesArray.includes('admin')) {
            setUserRole('admin')  
          } else {
            setUserRole('user')
          }
        }
      } catch (err) {
        setUserRole('user')
      } finally {
        setIsLoadingRole(false)
      }
    }

    fetchUserRole()
  }, [user, isLoaded])

  const isAdmin = () => userRole === 'admin' || userRole === 'super_admin'
  const isSuperAdmin = () => userRole === 'super_admin'
  const canModerateContent = () => userRole === 'admin' || userRole === 'super_admin'
  const canEditRoles = () => userRole === 'super_admin'
  
  // Kiểm tra có thể chỉnh sửa role của user cụ thể không
  const canEditUserRole = (targetUserRoles) => {
    if (userRole !== 'super_admin') return false // Chỉ super_admin mới có quyền
    
    // Super_admin không thể chỉnh sửa role của super_admin khác (ngang hàng)
    if (Array.isArray(targetUserRoles) && targetUserRoles.includes('super_admin')) {
      return false
    }
    
    return true
  }
  
  // Lấy các role option được phép cấp
  const getAvailableRoles = () => {
    if (userRole === 'super_admin') {
      return [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' },
        // Super admin không thể cấp super_admin cho người khác
      ]
    }
    return [] // Chỉ super_admin mới được cấp role
  }

  const value = {
    userRole,
    isLoadingRole,
    isAdmin,
    isSuperAdmin,
    canModerateContent,
    canEditRoles,
    canEditUserRole,
    getAvailableRoles
  }

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  )
}

export function useUserRole() {
  const context = useContext(UserRoleContext)
  if (!context) {
    throw new Error('useUserRole must be used within a UserRoleProvider')
  }
  return context
}