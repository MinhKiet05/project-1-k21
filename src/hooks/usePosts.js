import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook để lấy posts với filter và sort
 * @param {Object} params
 * @param {string|null} params.status - 'pending'|'approved'|'rejected' hoặc null để lấy tất cả
 * @param {string|null} params.categoryId
 * @param {string|null} params.locationId
 * @param {string|null} params.userId - filter theo user ID
 * @param {'newest'|'oldest'} params.sort
 * @param {string} params.search - client-side search (title or author full_name)
 */
export function usePosts({ status = null, categoryId = null, locationId = null, userId = null, sort = 'newest', search = '' } = {}) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url),
          category:categories(id, name),
          location:locations(id, name)
        `)

      if (status) {
        query = query.eq('status', status)
      }

      if (categoryId) query = query.eq('category_id', categoryId)
      if (locationId) query = query.eq('location_id', locationId)
      if (userId) query = query.eq('author_id', userId)

      const ascending = sort === 'oldest'
      query = query.order('created_at', { ascending })

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      let results = data || []

      // Check and update expired posts
      const now = new Date()
      const expiredPosts = []
      
      results = results.map(post => {
        if (post.status === 'approved' && post.expires_at) {
          const expiresAt = new Date(post.expires_at)
          if (now > expiresAt) {
            expiredPosts.push(post.id)
            return { ...post, status: 'expired' }
          }
        }
        return post
      })

      // Update expired posts in database
      if (expiredPosts.length > 0) {
        try {
          await supabase
            .from('posts')
            .update({ status: 'expired' })
            .in('id', expiredPosts)
        } catch (err) {
          console.warn('Failed to update expired posts:', err)
        }
      }

      // Client-side search by title or author full_name
      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase()
        results = results.filter(p => {
          const title = (p.title || '').toString().toLowerCase()
          const authorName = (p.author?.full_name || '').toString().toLowerCase()
          return title.includes(q) || authorName.includes(q)
        })
      }

      setPosts(results)
    } catch (err) {
      setError(err.message)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, categoryId, locationId, userId, sort, search])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts
  }
}
