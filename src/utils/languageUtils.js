import { useTranslation } from 'react-i18next'

/**
 * Utility function để lấy tên hiển thị theo ngôn ngữ hiện tại
 * @param {Object} item - Object chứa name và name_en
 * @param {string} language - Ngôn ngữ hiện tại ('vi' hoặc 'en')
 * @returns {string} - Tên để hiển thị
 */
export const getDisplayName = (item, language) => {
  if (!item) return ''
  
  if (language === 'en' && item.name_en) {
    return item.name_en
  }
  
  return item.name || ''
}

/**
 * Custom hook để lấy tên hiển thị theo ngôn ngữ hiện tại
 * @param {Object} item - Object chứa name và name_en
 * @returns {string} - Tên để hiển thị
 */
export const useDisplayName = (item) => {
  const { i18n } = useTranslation()
  return getDisplayName(item, i18n.language)
}