import { useUserRole } from '../../contexts/UserRoleContext'
import { useUser } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'

export default function ProtectedAdminRoute({ children }) {
  const { t } = useTranslation(['common']);
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
        {t('loading')}
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
        {t('loginRequired')}
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
        <h2>⛔ {t('accessDenied')}</h2>
        <p>{t('noPermission')}</p>
        <p>{t('adminOnly')}</p>
      </div>
    )
  }

  return children
}