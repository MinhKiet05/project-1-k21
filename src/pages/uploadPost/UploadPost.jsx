import './UploadPost.css';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useCategories } from '../../hooks/useCategories';
import { useLocations } from '../../hooks/useLocations';
import { useCreatePost } from '../../hooks/useCreatePost';
import { uploadImages } from '../../utils/uploadImages';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';

export default function UploadPost() {
    const { t } = useTranslation();
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef(null);
    
    // Hooks
    const { user } = useUser(); // Lấy thông tin user từ Clerk
    const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
    const { locations, loading: locationsLoading, error: locationsError } = useLocations();
    const { createPost } = useCreatePost();

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setError('');

        // Kiểm tra số lượng file (tối đa 10 ảnh)
        if (files.length > 10) {
            setError(t('post.max_images_error'));
            toast.error(t('post.max_images_error'));
            return;
        }

        // Kiểm tra từng file
        const validFiles = [];
        let totalSize = 0;

        for (let file of files) {
            // Kiểm tra định dạng file (chỉ hỗ trợ hình ảnh)
            if (!file.type.startsWith('image/')) {
                setError(t('post.image_format_error'));
                toast.error(t('post.image_format_error'));
                return;
            }

            totalSize += file.size;
            validFiles.push(file);
        }

        // Kiểm tra tổng kích thước (tối đa 10MB = 10 * 1024 * 1024 bytes)
        if (totalSize > 10 * 1024 * 1024) {
            setError(t('post.image_size_error'));
            toast.error(t('post.image_size_error'));
            return;
        }

        // Tạo preview cho các file hợp lệ
        const previewList = validFiles.map((file, index) => ({
            id: Date.now() + index, // Thêm ID để tracking
            file,
            url: URL.createObjectURL(file)
        }));

        // Update state and sync the hidden file input's FileList using DataTransfer
        setImages(previewList);
        try {
            const dt = new DataTransfer();
            validFiles.forEach(f => dt.items.add(f));
            if (fileInputRef.current) fileInputRef.current.files = dt.files;
        } catch (err) {
            // DataTransfer may not be supported in some environments; ignore if so
        }
    };

    // Hàm xóa ảnh cụ thể
    const removeImage = (imageId) => {
        const updatedImages = images.filter(img => img.id !== imageId);
        setImages(updatedImages);

        // Sync the input's FileList so the browser file count updates
        try {
            const dt = new DataTransfer();
            updatedImages.forEach(img => dt.items.add(img.file));
            if (fileInputRef.current) fileInputRef.current.files = dt.files;
        } catch (err) {
            // ignore if not supported
        }
    };

    // Helpers để validate theo trường (dùng cho onBlur)
    const containsLetter = (s) => /\p{L}/u.test(s || '');
    const isValidNumber = (s) => {
        if (!s) return false;
        const normalized = s.replace(/[.,\s]/g, '');
        return /^-?\d+(\.\d+)?$/.test(normalized);
    };

    const validateField = (fieldName, value) => {
        setFormErrors(prev => {
            const next = { ...prev };
            if (fieldName === 'productName') {
                if (!value || !containsLetter(value)) {
                    next.productName = t('post.product_name_error');
                } else {
                    delete next.productName;
                }
            }

            if (fieldName === 'productPrice') {
                if (!value || !isValidNumber(value) || Number(value) <= 0) {
                    next.productPrice = t('post.product_price_error');
                } else {
                    delete next.productPrice;
                }
            }

            if (fieldName === 'description') {
                if (!value || !containsLetter(value)) {
                    next.description = t('post.description_error');
                } else {
                    delete next.description;
                }
            }

            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setError('');

        // Kiểm tra user đăng nhập
        if (!user) {
            setError(t('post.login_required'));
            toast.error(t('post.login_required'));
            return;
        }

        // Validate images
        const errors = {};
        if (images.length === 0) {
            errors.images = t('post.images_required');
        }

        const formData = new FormData(e.target);
        const name = (formData.get('productName') || '').toString().trim();
        const price = (formData.get('productPrice') || '').toString().trim();
        const description = (formData.get('description') || '').toString().trim();
        const categoryId = formData.get('category') || '';
        const locationId = formData.get('location') || '';

        const containsLetter = (s) => /\p{L}/u.test(s || '');
        const isValidNumber = (s) => {
            if (!s) return false;
            // Remove common formatting characters like commas and spaces
            const normalized = s.replace(/[.,\s]/g, '');
            return /^-?\d+(\.\d+)?$/.test(normalized);
        };

        if (!name || !containsLetter(name)) {
            errors.productName = t('post.product_name_error');
        }

        if (!price || !isValidNumber(price)) {
            errors.productPrice = t('post.product_price_valid_error');
        }

        if (!description || !containsLetter(description)) {
            errors.description = t('post.description_error');
        }

        if (!categoryId) {
            errors.category = t('post.category_required');
        }

        if (!locationId) {
            errors.location = t('post.location_required');
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            // scroll to first error field
            const firstKey = Object.keys(errors)[0];
            let el = null;
            if (firstKey === 'images') el = document.querySelector('.image-upload-section');
            else el = document.querySelector(`[name="${firstKey}"]`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        try {
            setIsSubmitting(true);

            // Debug: Kiểm tra user authentication


            // 1. Upload ảnh lên Supabase Storage
            const imageFiles = images.map(img => img.file);
            const uploadResult = await uploadImages(imageFiles, 'images');
            
            if (!uploadResult.success) {
                setError(t('post.upload_error') + ': ' + uploadResult.error);
                toast.error(t('post.upload_error') + ': ' + uploadResult.error);
                return;
            }

            // 2. Tạo post trong database
            const postData = {
                title: name,
                description: description,
                price: price.replace(/[.,\s]/g, ''), // Loại bỏ định dạng
                imageUrls: uploadResult.urls,
                authorId: user.id,
                categoryId: categoryId,
                locationId: locationId
            };

            const createResult = await createPost(postData);
            
            if (!createResult.success) {
                setError(t('post.create_error') + ': ' + createResult.error);
                toast.error(t('post.create_error') + ': ' + createResult.error);
                return;
            }

            // 3. Thành công - reset form
            toast.success(t('post.create_success'));
            e.target.reset();
            setImages([]);
            if (fileInputRef.current) {
                fileInputRef.current.files = new DataTransfer().files;
            }

        } catch (err) {
            setError(t('errors.generic_error') + ': ' + err.message);
            toast.error(t('errors.generic_error') + ': ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="upload-post-page">
            <div className="upload-post-container">
                <h1>{t('post.basic_information')}</h1>
                <form className="upload-post-form" onSubmit={handleSubmit}>
                    <div className='upload-post-form-row'>
                        <label>{t('post.add_images')}:<span>*</span></label>
                        <div className="image-upload-section">
                            <input
                                ref={fileInputRef}
                                type="file"
                                name="image"
                                accept="image/*"
                                multiple
                                required
                                onChange={handleImageChange}
                            />
                            
                            {/* Hiển thị thông tin hỗ trợ */}
                            <div className="upload-info">
                                <small>{t('post.upload_info')}</small>
                            </div>

                            {/* Hiển thị lỗi nếu có */}
                            {error && (
                                <div className="upload-error">
                                    {error}
                                </div>
                            )}
                            {formErrors.images && (
                                <div className="field-error">{formErrors.images}</div>
                            )}

                            {/* ✅ Preview ảnh hiển thị ở dưới */}
                            {images.length > 0 && (
                                <div className="image-preview-container">
                                    <div className="preview-header">
                                        <span>{t('post.selected_images', { count: images.length })}</span>
                                    </div>
                                    <div className="preview-grid">
                                        {images.map((img) => (
                                            <div key={img.id} className="image-preview-item">
                                                <img src={img.url} alt={`preview-${img.id}`} />
                                                <button 
                                                    type="button"
                                                    className="remove-image-btn"
                                                    onClick={() => removeImage(img.id)}
                                                    title={t('post.remove_image')}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='upload-post-form-row'>
                        <label>{t('post.product_name')}:<span>*</span></label>
                        <div className="field-input">
                            <input type="text" name="productName" placeholder={t('post.product_name_placeholder')} required onBlur={(e) => validateField('productName', e.target.value)} />
                            {formErrors.productName && (
                                <div className="field-error">{formErrors.productName}</div>
                            )}
                        </div>
                    </div>

                    <div className='upload-post-form-row price-row'>
                        <label>{t('post.selling_price')}:<span>*</span></label>
                        <div className="field-input">
                            <div className="price-row-wrapper">
                                <input type="text" name="productPrice" placeholder={t('post.price_placeholder')} required onBlur={(e) => validateField('productPrice', e.target.value)} />
                            </div>
                            {formErrors.productPrice && (
                                <div className="field-error">{formErrors.productPrice}</div>
                            )}
                        </div>
                    </div>

                    <div className='upload-post-form-row'>
                        <label>Danh mục:<span>*</span></label>
                        <select name="category" required disabled={categoriesLoading}>
                            <option value="">
                                {categoriesLoading ? t('common.loading') : 
                                 categoriesError ? t('errors.loading_error') : 
                                 t('post.select_category')}
                            </option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {categoriesError && (
                            <div className="field-error">{t('post.category_load_error')}: {categoriesError}</div>
                        )}
                    </div>

                    <div className='upload-post-form-row'>
                        <label>{t('post.location')}:<span>*</span></label>
                        <select name="location" required disabled={locationsLoading}>
                            <option value="">
                                {locationsLoading ? t('common.loading') : 
                                 locationsError ? t('errors.loading_error') : 
                                 t('post.select_location')}
                            </option>
                            {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                    {location.name}
                                </option>
                            ))}
                        </select>
                        {locationsError && (
                            <div className="field-error">{t('post.location_load_error')}: {locationsError}</div>
                        )}
                    </div>

                    <div className='upload-post-form-row'>
                        <label>{t('post.description')}:<span>*</span></label>
                        <div className="field-input">
                            <textarea name="description" placeholder={t('post.description_placeholder')} required onBlur={(e) => validateField('description', e.target.value)}></textarea>
                            {formErrors.description && (
                                <div className="field-error">{formErrors.description}</div>
                            )}
                        </div>
                    </div>

                    <div className='upload-post-form-row'>
                        <label>{t('post.posting_notes')}:</label>
                        <ul>
                            <li>{t('post.note_1')}</li>
                            <li>{t('post.note_2')}</li>
                            <li>{t('post.note_3')}</li>
                        </ul>
                    </div>

                    <div className='upload-post-form-row-btn'>
                        <button type="submit" className="upload-post-submit-button" disabled={isSubmitting}>
                            {isSubmitting ? t('post.submitting') : t('post.complete')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
