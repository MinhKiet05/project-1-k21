import './Footer.css';
export default function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      padding: '40px 20px',
      borderTop: '1px solid #eee',
      background: '#f8f9fa',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '30px',
          marginBottom: '30px'
        }}>
          <div>
            <h4 style={{ margin: '0 0 15px 0' }}>🏪 NoTungPhoCo</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Marketplace dành riêng cho sinh viên. <br/>
              Mua bán đồ cũ, sách giáo trình, và nhiều thứ khác.
            </p>
          </div>
          
          <div>
            <h4 style={{ margin: '0 0 15px 0' }}>📂 Danh mục</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ margin: '8px 0' }}>
                <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                  📚 Sách giáo trình
                </a>
              </li>
              <li style={{ margin: '8px 0' }}>
                <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                  💻 Đồ điện tử
                </a>
              </li>
              <li style={{ margin: '8px 0' }}>
                <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                  👕 Quần áo
                </a>
              </li>
              <li style={{ margin: '8px 0' }}>
                <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                  🚲 Xe đạp
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ margin: '0 0 15px 0' }}>🤝 Hỗ trợ</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ margin: '8px 0' }}>
                <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                  ❓ Câu hỏi thường gặp
                </a>
              </li>
              <li style={{ margin: '8px 0' }}>
                <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                  📞 Liên hệ
                </a>
              </li>
              <li style={{ margin: '8px 0' }}>
                <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                  📜 Quy định
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div style={{ 
          paddingTop: '20px', 
          borderTop: '1px solid #ddd', 
          fontSize: '14px', 
          color: '#666' 
        }}>
          <p style={{ margin: 0 }}>
            © 2025 NoTungPhoCo Marketplace. Được phát triển bởi <strong>MinhKiet05</strong> 🚀
          </p>
        </div>
      </div>
    </footer>
  )
}