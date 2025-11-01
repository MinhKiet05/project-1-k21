import './UploadPost.css';

export default function UploadPost() {
    return (
        <div className="upload-post-page">
            <div className="upload-post-container">
                <h1>Thông tin cơ bản</h1>
                <form className="upload-post-form">
                    <div className='upload-post-form-row'>
                        <label>Thêm hình ảnh:<span>*</span></label>
                        <input type="file" name="image" accept="image/*" required />
                    </div>
                    <div className='upload-post-form-row'>
                        <label>Tên sản phẩm:<span>*</span></label>
                        <input type="text" name="productName" placeholder="Nhập tên sản phẩm" required />
                    </div>
                    <div className='upload-post-form-row price-row'>
                        <label>Giá bán:<span>*</span></label>
                        <div className="price-row-wrapper">
                            <input type="text" name="productPrice" placeholder="Nhập giá sản phẩm" required />
                        </div>
                    </div>
                    <div className='upload-post-form-row'>
                        <label>Danh mục:<span>*</span></label>
                        <select name="category" required>
                            <option value="">Chọn danh mục</option>
                            <option value="electronics">Điện tử</option>
                            <option value="fashion">Thời trang</option>
                            <option value="home">Nhà cửa</option>
                            <option value="food">Thực phẩm</option>
                            <option value="books">Sách</option>
                            <option value="sports">Thể thao</option>
                        </select>
                    </div>
                    <div className='upload-post-form-row'>
                        <label>Khu vực:<span>*</span></label>
                        <select name="location" required>
                            <option value="">Chọn khu vực</option>
                            <option value="hanoi">Hà Nội</option>
                            <option value="hochiminh">TP. Hồ Chí Minh</option>
                            <option value="danang">Đà Nẵng</option>
                            <option value="haiphong">Hải Phòng</option>
                            <option value="cantho">Cần Thơ</option>
                        </select>
                    </div>
                    <div className='upload-post-form-row'>
                        <label>Mô tả:<span>*</span></label>
                        <textarea name="description" placeholder="Nhập mô tả chi tiết về sản phẩm..." required></textarea>
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
                        <button type="submit" className="upload-post-submit-button">Hoàn tất</button>
                    </div>
                </form>
            </div>
        </div>
    );
}