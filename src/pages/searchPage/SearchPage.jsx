import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import CardProduct from '../../components/cardProduct/CardProduct';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './SearchPage.css';
import {
    faFilter,
    faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { removeDiacritics } from '../../utils/searchUtils';
import { useCategories } from '../../hooks/useCategories';
import { useLocations } from '../../hooks/useLocations';

export default function SearchPage() {
    const { t } = useTranslation(['search', 'common']);
    const [searchParams, setSearchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const { categories } = useCategories();
    const { locations } = useLocations();
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const postsPerPage = 9;

    // Filter states
    const [filters, setFilters] = useState({
        keyword: searchParams.get('q') || '',
        category: searchParams.get('category') || 'all',
        location: searchParams.get('location') || 'all',
        priceMin: searchParams.get('priceMin') || '',
        priceMax: searchParams.get('priceMax') || '',
        sortBy: searchParams.get('sort') || 'newest'
    });

    useEffect(() => {
        fetchPosts();
    }, [filters, currentPage]);

    // Listen to URL changes and update filters
    useEffect(() => {
        const newFilters = {
            keyword: searchParams.get('q') || '',
            category: searchParams.get('category') || 'all',
            location: searchParams.get('location') || 'all',
            priceMin: searchParams.get('priceMin') || '',
            priceMax: searchParams.get('priceMax') || '',
            sortBy: searchParams.get('sort') || 'newest'
        };
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchParams]);



    const fetchPosts = async () => {
        try {
            setLoading(true);

            let query = supabase
                .from('posts')
                .select(`
                    *,
                    categories (name, name_en),
                    locations (name, name_en)
                `)
                .eq('status', 'approved');

            // Apply filters (except keyword - we'll handle that client-side)
            if (filters.category && filters.category !== 'all') {
                query = query.eq('category_id', filters.category);
            }

            if (filters.location && filters.location !== 'all') {
                query = query.eq('location_id', filters.location);
            }

            if (filters.priceMin) {
                query = query.gte('price', parseInt(filters.priceMin));
            }

            if (filters.priceMax) {
                query = query.lte('price', parseInt(filters.priceMax));
            }

            // Apply sorting
            switch (filters.sortBy) {
                case 'price-asc':
                    query = query.order('price', { ascending: true });
                    break;
                case 'price-desc':
                    query = query.order('price', { ascending: false });
                    break;
                case 'oldest':
                    query = query.order('created_at', { ascending: true });
                    break;
                case 'newest':
                default:
                    query = query.order('created_at', { ascending: false });
                    break;
            }

            const { data, error } = await query;

            if (error) throw error;

            let filteredData = data || [];

            // Apply keyword filtering with diacritic support (client-side)
            if (filters.keyword) {
                const normalizedKeyword = removeDiacritics(filters.keyword.toLowerCase());
                
                filteredData = filteredData.filter(post => {
                    const titleMatch = removeDiacritics((post.title || '').toLowerCase()).includes(normalizedKeyword);
                    const descMatch = removeDiacritics((post.description || '').toLowerCase()).includes(normalizedKeyword);
                    return titleMatch || descMatch;
                });
            }

            // Apply pagination to filtered results
            const totalCount = filteredData.length;
            const from = (currentPage - 1) * postsPerPage;
            const to = from + postsPerPage;
            const paginatedData = filteredData.slice(from, to);

            setPosts(paginatedData);
            setTotalCount(totalCount);
        } catch (error) {
            setPosts([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        setCurrentPage(1);

        // Update URL params
        const newParams = new URLSearchParams(searchParams);
        if (value && value !== 'all' && value !== '') {
            newParams.set(key === 'keyword' ? 'q' : key, value);
        } else {
            newParams.delete(key === 'keyword' ? 'q' : key);
        }
        setSearchParams(newParams);
    };

    const convertPostToProduct = (post) => {
        const imageUrl = (post.image_urls && post.image_urls[0]) ||
            (post.images && post.images[0]) ||
            post.image_url;

        return {
            id: post.id,
            name: post.title || 'Không có tiêu đề',
            price: post.price || 0,
            image: imageUrl
        };
    };

    const totalPages = Math.ceil(totalCount / postsPerPage);

    return (
        <div className="search-page">
            <div className="search-container">
                {/* Sidebar Filters */}
                <div className="search-sidebar">
                    <div className="filter-section">
                        <div className="filter-title"><FontAwesomeIcon icon={faFilter} /> {t('filters')}</div>

                        <div className="filter-group">
                            <label className="filter-label">{t('location')}</label>
                            <select
                                className="filter-select"
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                            >
                                <option value="all">{t('all')}</option>
                                {locations.map(location => (
                                    <option key={location.id} value={location.id}>
                                        {location.displayName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">{t('category')}</label>
                            <select
                                className="filter-select"
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <option value="all">{t('all')}</option>
                                {categories
                                    .sort((a, b) => {
                                        // "Khác" luôn ở cuối
                                        if (a.name?.toLowerCase().includes('khác')) return 1;
                                        if (b.name?.toLowerCase().includes('khác')) return -1;
                                        // Các danh mục khác sắp xếp theo tên
                                        const aName = a.displayName || a.name || '';
                                        const bName = b.displayName || b.name || '';
                                        return aName.localeCompare(bName, 'vi', { sensitivity: 'base' });
                                    })
                                    .map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.displayName}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">{t('price')}</label>
                            <select
                                className="filter-select"
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            >
                                <option value="price-asc">{t('priceAsc')}</option>
                                <option value="price-desc">{t('priceDesc')}</option>
                            </select>
                            <span>{t('priceFrom')}:</span>
                            <div className="price-range">
                                <input
                                    type="number"
                                    className="price-input"
                                    placeholder={t('priceFrom')}
                                    value={filters.priceMin}
                                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                />
                                <span>{t('priceTo')}:</span>
                                <input
                                    type="number"
                                    className="price-input"
                                    placeholder={t('priceTo')}
                                    value={filters.priceMax}
                                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">{t('time')}</label>
                            <select
                                className="filter-select"
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            >
                                <option value="newest">{t('newest')}</option>
                                <option value="oldest">{t('oldest')}</option>
                            </select>
                        </div>

                    </div>
                </div>

                {/* Main Content */}
                <div className="search-main">
                    <div className="search-header">
                        <div className="search-results-count">
                            {t('resultsFor')} '<strong>{filters.keyword || t('allProducts')}</strong>' ({totalCount} {t('results')})
                        </div>
                    </div>

                    {loading ? (
                        <div className="search-loading">
                            {t('loading')}
                        </div>
                    ) : posts.length > 0 ? (
                        <>
                            <div className="search-results">
                                {posts.map((post) => (
                                    <CardProduct
                                        key={post.id}
                                        product={convertPostToProduct(post)}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="search-pagination">
                                <div className="pagination-nav">
                                    <button
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        ‹
                                    </button>

                                    <span className="pagination-info">
                                        {currentPage}/{totalPages}
                                    </span>

                                    <button
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="search-empty">
                            <div className="search-empty-icon"><FontAwesomeIcon icon={faSearch} className="search-icon" /></div>
                            <div className="search-empty-title">{t('noResults')}</div>
                            <div className="search-empty-message">
                                {t('noResultsMessage')}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
