import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { profileService } from '../../lib/database.js'

export default function ProfileSync({ children }) {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    async function syncProfile() {
      if (isLoaded && user) {
        try {
          console.log('Syncing user profile with Supabase...', user.id)
          await profileService.upsertProfile(user)
          console.log('✅ Profile synced successfully')
        } catch (error) {
          console.error('❌ Error syncing profile:', error)
        }
      }
    }

    syncProfile()
  }, [user, isLoaded])

  return children
}