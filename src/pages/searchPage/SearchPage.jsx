import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import CardProduct from '../../components/cardProduct/CardProduct';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './SearchPage.css';
import {
    faFilter,
    faSearch,
} from "@fortawesome/free-solid-svg-icons";

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
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
        fetchCategories();
        fetchLocations();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [filters, currentPage]);

    const fetchCategories = async () => {
        try {
            const { data } = await supabase
                .from('categories')
                .select('id, name')
                .order('name');
            setCategories(data || []);
        } catch (error) {
            // Error fetching categories
        }
    };

    const fetchLocations = async () => {
        try {
            const { data } = await supabase
                .from('locations')
                .select('id, name')
                .order('name');
            setLocations(data || []);
        } catch (error) {
            // Error fetching locations
        }
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);

            let query = supabase
                .from('posts')
                .select(`
                    *,
                    categories (name),
                    locations (name)
                `, { count: 'exact' })
                .eq('status', 'approved');

            // Apply filters
            if (filters.keyword) {
                query = query.or(`title.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%`);
            }

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

            // Apply pagination
            const from = (currentPage - 1) * postsPerPage;
            const to = from + postsPerPage - 1;
            query = query.range(from, to);

            const { data, count, error } = await query;

            if (error) throw error;

            setPosts(data || []);
            setTotalCount(count || 0);
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
                        <div className="filter-title"><FontAwesomeIcon icon={faFilter} /> BỘ LỌC TÌM KIẾM</div>

                        <div className="filter-group">
                            <label className="filter-label">Khu vực:</label>
                            <select
                                className="filter-select"
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                            >
                                <option value="all">Tất cả</option>
                                {locations.map(location => (
                                    <option key={location.id} value={location.id}>
                                        {location.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Theo Danh Mục:</label>
                            <select
                                className="filter-select"
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <option value="all">Tất cả</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Giá:</label>
                            <select
                                className="filter-select"
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            >
                                <option value="price-asc">Giá tăng dần</option>
                                <option value="price-desc">Giá giảm dần</option>
                            </select>
                            <span>Giá từ:</span>
                            <div className="price-range">
                                <input
                                    type="number"
                                    className="price-input"
                                    placeholder="Giá từ"
                                    value={filters.priceMin}
                                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                />
                                <span>Đến giá:</span>
                                <input
                                    type="number"
                                    className="price-input"
                                    placeholder="Giá đến"
                                    value={filters.priceMax}
                                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Thời gian</label>
                            <select
                                className="filter-select"
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                            </select>
                        </div>

                    </div>
                </div>

                {/* Main Content */}
                <div className="search-main">
                    <div className="search-header">
                        <div className="search-results-count">
                            Kết quả tìm kiếm cho từ khóa '<strong>{filters.keyword || 'Sách'}</strong>'
                        </div>
                    </div>

                    {loading ? (
                        <div className="search-loading">
                            Đang tải kết quả...
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
                            <div className="search-empty-title">Không tìm thấy kết quả</div>
                            <div className="search-empty-message">
                                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
