// Utility functions for search functionality

/**
 * Remove Vietnamese diacritics from string
 * @param {string} str - Input string with diacritics
 * @returns {string} - String without diacritics
 */
export const removeDiacritics = (str) => {
  if (!str) return '';
  
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};

/**
 * Create search query that supports both with and without diacritics
 * @param {string} keyword - Search keyword
 * @returns {string} - Search query for Supabase
 */
export const createSearchQuery = (keyword) => {
  if (!keyword) return '';
  
  const normalizedKeyword = removeDiacritics(keyword);
  
  // Create multiple variations for search
  const searchTerms = [
    keyword, // original
    normalizedKeyword, // without diacritics
    keyword.toLowerCase(), // lowercase original
  ].filter((term, index, arr) => arr.indexOf(term) === index); // remove duplicates
  
  return searchTerms.map(term => `%${term}%`).join(',');
};

/**
 * Check if text matches search keyword (with diacritic support)
 * @param {string} text - Text to search in
 * @param {string} keyword - Search keyword
 * @returns {boolean} - Whether text matches keyword
 */
export const matchesSearch = (text, keyword) => {
  if (!text || !keyword) return false;
  
  const normalizedText = removeDiacritics(text);
  const normalizedKeyword = removeDiacritics(keyword);
  
  return normalizedText.includes(normalizedKeyword) || 
         text.toLowerCase().includes(keyword.toLowerCase());
};