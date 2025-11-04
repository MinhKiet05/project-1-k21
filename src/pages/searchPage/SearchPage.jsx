import './SearchPage.css';

export default function SearchPage() {
    return (
        <div className="search-page">
            <h1>Tìm kiếm</h1>
            <form className="search-form">
                <input type="text" placeholder="Nhập từ khóa..." />
                <button type="submit">Tìm kiếm</button>
            </form>
            <div className="search-results">
                {/* Kết quả tìm kiếm sẽ được hiển thị ở đây */}
            </div>
        </div>
    );
}
