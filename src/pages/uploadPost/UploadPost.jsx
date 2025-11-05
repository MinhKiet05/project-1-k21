import './UploadPost.css';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useCategories } from '../../hooks/useCategories';
import { useLocations } from '../../hooks/useLocations';
import { useCreatePost } from '../../hooks/useCreatePost';
import { uploadImages } from '../../utils/uploadImages';
import { useUser } from '@clerk/clerk-react';

export default function UploadPost() {
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
            setError('Chỉ được chọn tối đa 10 ảnh');
            toast.error('Chỉ được chọn tối đa 10 ảnh');
            return;
        }

        // Kiểm tra từng file
        const validFiles = [];
        let totalSize = 0;

        for (let file of files) {
            // Kiểm tra định dạng file (chỉ hỗ trợ hình ảnh)
            if (!file.type.startsWith('image/')) {
                setError('Chỉ hỗ trợ các file hình ảnh (JPG, PNG, GIF, etc.)');
                toast.error('Chỉ hỗ trợ các file hình ảnh (JPG, PNG, GIF, etc.)');
                return;
            }

            totalSize += file.size;
            validFiles.push(file);
        }

        // Kiểm tra tổng kích thước (tối đa 10MB = 10 * 1024 * 1024 bytes)
        if (totalSize > 10 * 1024 * 1024) {
            setError('Tổng kích thước ảnh không được vượt quá 10MB');
            toast.error('Tổng kích thước ảnh không được vượt quá 10MB');
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
                    next.productName = 'Tên sản phẩm phải chứa ít nhất một chữ cái';
                } else {
                    delete next.productName;
                }
            }

            if (fieldName === 'productPrice') {
                if (!value || !isValidNumber(value) || Number(value) <= 0) {
                    next.productPrice = 'Giá bán phải là số hợp lệ và lớn hơn 0';
                } else {
                    delete next.productPrice;
                }
            }

            if (fieldName === 'description') {
                if (!value || !containsLetter(value)) {
                    next.description = 'Mô tả phải chứa ít nhất một chữ cái';
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
            setError('Vui lòng đăng nhập để đăng bài');
            toast.error('Vui lòng đăng nhập để đăng bài');
            return;
        }

        // Validate images
        const errors = {};
        if (images.length === 0) {
            errors.images = 'Vui lòng thêm ít nhất một ảnh';
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
            errors.productName = 'Tên sản phẩm phải chứa ít nhất một chữ cái';
        }

        if (!price || !isValidNumber(price)) {
            errors.productPrice = 'Giá bán phải là số hợp lệ';
        }

        if (!description || !containsLetter(description)) {
            errors.description = 'Mô tả phải chứa ít nhất một chữ cái';
        }

        if (!categoryId) {
            errors.category = 'Vui lòng chọn danh mục';
        }

        if (!locationId) {
            errors.location = 'Vui lòng chọn khu vực';
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
            console.log('User info:', { id: user?.id, email: user?.emailAddresses?.[0]?.emailAddress });

            // 1. Upload ảnh lên Supabase Storage
            const imageFiles = images.map(img => img.file);
            const uploadResult = await uploadImages(imageFiles, 'images');
            
            if (!uploadResult.success) {
                setError('Lỗi khi tải ảnh lên: ' + uploadResult.error);
                toast.error('Lỗi khi tải ảnh lên: ' + uploadResult.error);
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
                setError('Lỗi khi tạo bài đăng: ' + createResult.error);
                toast.error('Lỗi khi tạo bài đăng: ' + createResult.error);
                return;
            }

            // 3. Thành công - reset form
            toast.success('Đã tạo bài đăng thành công! Bài đăng đang chờ duyệt.');
            e.target.reset();
            setImages([]);
            if (fileInputRef.current) {
                fileInputRef.current.files = new DataTransfer().files;
            }

        } catch (err) {
            setError('Có lỗi xảy ra: ' + err.message);
            toast.error('Có lỗi xảy ra: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="upload-post-page">
            <div className="upload-post-container">
                <h1>Thông tin cơ bản</h1>
                <form className="upload-post-form" onSubmit={handleSubmit}>
                    <div className='upload-post-form-row'>
                        <label>Thêm hình ảnh:<span>*</span></label>
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
                                <small>Chỉ hỗ trợ file hình ảnh • Tối đa 10 ảnh • Tổng dung lượng ≤ 10MB</small>
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
                                        <span>Đã chọn {images.length}/10 ảnh</span>
                                    </div>
                                    <div className="preview-grid">
                                        {images.map((img) => (
                                            <div key={img.id} className="image-preview-item">
                                                <img src={img.url} alt={`preview-${img.id}`} />
                                                <button 
                                                    type="button"
                                                    className="remove-image-btn"
                                                    onClick={() => removeImage(img.id)}
                                                    title="Xóa ảnh này"
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
                        <label>Tên sản phẩm:<span>*</span></label>
                        <div className="field-input">
                            <input type="text" name="productName" placeholder="Nhập tên sản phẩm" required onBlur={(e) => validateField('productName', e.target.value)} />
                            {formErrors.productName && (
                                <div className="field-error">{formErrors.productName}</div>
                            )}
                        </div>
                    </div>

                    <div className='upload-post-form-row price-row'>
                        <label>Giá bán:<span>*</span></label>
                        <div className="field-input">
                            <div className="price-row-wrapper">
                                <input type="text" name="productPrice" placeholder="Nhập giá sản phẩm" required onBlur={(e) => validateField('productPrice', e.target.value)} />
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
                                {categoriesLoading ? 'Đang tải...' : 
                                 categoriesError ? 'Lỗi tải dữ liệu' : 
                                 'Chọn danh mục'}
                            </option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {categoriesError && (
                            <div className="field-error">Không thể tải danh mục: {categoriesError}</div>
                        )}
                    </div>

                    <div className='upload-post-form-row'>
                        <label>Khu vực:<span>*</span></label>
                        <select name="location" required disabled={locationsLoading}>
                            <option value="">
                                {locationsLoading ? 'Đang tải...' : 
                                 locationsError ? 'Lỗi tải dữ liệu' : 
                                 'Chọn khu vực'}
                            </option>
                            {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                    {location.name}
                                </option>
                            ))}
                        </select>
                        {locationsError && (
                            <div className="field-error">Không thể tải khu vực: {locationsError}</div>
                        )}
                    </div>

                    <div className='upload-post-form-row'>
                        <label>Mô tả:<span>*</span></label>
                        <div className="field-input">
                            <textarea name="description" placeholder="Nhập mô tả chi tiết về sản phẩm..." required onBlur={(e) => validateField('description', e.target.value)}></textarea>
                            {formErrors.description && (
                                <div className="field-error">{formErrors.description}</div>
                            )}
                        </div>
                    </div>

                    <div className='upload-post-form-row'>
                        <label>Lưu ý khi đăng bài:</label>
                        <ul>
                            <li>Không dùng những từ ngữ, hình ảnh không phù hợp, phản cảm.</li>
                            <li>Bài đăng của bạn sẽ hết hạn sau 7 ngày sau khi được duyệt.</li>
                            <li>Nếu sản phẩm chưa được bán, vui lòng gia hạn lại sau 7 ngày.</li>
                        </ul>
                    </div>

                    <div className='upload-post-form-row-btn'>
                        <button type="submit" className="upload-post-submit-button" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang gửi...' : 'Hoàn tất'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
