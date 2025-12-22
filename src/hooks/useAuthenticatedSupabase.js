import { useUserRole } from '../contexts/UserRoleContext'

export function useAuthenticatedSupabaseFromContext() {
  const { supabaseClient, isSupabaseReady, roleError } = useUserRole()

  const executeQuery = async (queryFn, options = {}) => {
    const { fallbackValue = null, throwError = false } = options

    if (!isSupabaseReady || !supabaseClient || roleError) {
      const error = new Error(roleError || 'Supabase client not ready')
      if (throwError) throw error
      return { data: fallbackValue, error }
    }

    try {
      return await queryFn(supabaseClient)
    } catch (err) {
      if (throwError) throw err
      return { data: fallbackValue, error: err }
    }
  }

  return {
    supabaseClient,
    isReady: isSupabaseReady && !roleError,
    executeQuery,
  }
}

export function useSupabaseCRUD(tableName) {
  const { executeQuery, isReady } = useAuthenticatedSupabaseFromContext()

  const select = (columns = '*', filters = {}) => 
    executeQuery(client => {
      let query = client.from(tableName).select(columns)
      Object.entries(filters).forEach(([key, value]) => {
        if (value != null) query = query.eq(key, value)
      })
      return query
    })

  const insert = (data, returning = true) => 
    executeQuery(client => 
      client.from(tableName).insert(data).select(returning ? '*' : '')
    )

  const update = (data, filters = {}) => 
    executeQuery(client => {
      let query = client.from(tableName).update(data)
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
      return query
    })

  const remove = (filters = {}) => 
    executeQuery(client => {
      let query = client.from(tableName).delete()
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
      return query
    })

  const upsert = (data, options = {}) => 
    executeQuery(client => 
      client.from(tableName).upsert(data, options).select()
    )

  return { select, insert, update, remove, upsert, isReady }
}

/**
 * Example usage:
 * 
 * // Basic usage với executeQuery
 * const { executeQuery, isReady } = useAuthenticatedSupabaseFromContext()
 * 
 * const fetchPosts = async () => {
 *   const result = await executeQuery(
 *     (client) => client.from('posts').select('*').eq('user_id', userId),
 *     { fallbackValue: [] }
 *   )
 *   setPosts(result.data || [])
 * }
 * 
 * // CRUD usage
 * const { select, insert, update } = useSupabaseCRUD('posts')
 * 
 * const handleCreatePost = async (postData) => {
 *   const result = await insert(postData, { returning: '*' })
 *   if (result.error) {
 *     console.error('Failed to create post:', result.error)
 *   } else {
 *     console.log('Created post:', result.data)
 *   }
 * }
 */