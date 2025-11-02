import './ChatPage.css'

export default function ChatPage() {
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Tin nhắn</h2>
      </div>
      
      <div className="chat-content">
        <div className="chat-sidebar">
          <div className="chat-search">
            <input type="text" placeholder="Tìm kiếm cuộc trò chuyện..." />
          </div>
          
          <div className="chat-list">
            <div className="chat-item active">
              <div className="chat-avatar">
                <img src="https://via.placeholder.com/40" alt="User" />
              </div>
              <div className="chat-info">
                <div className="chat-name">Nguyễn Văn A</div>
                <div className="chat-last-message">Xin chào, tôi muốn hỏi về...</div>
              </div>
              <div className="chat-time">14:30</div>
            </div>
            
            <div className="chat-item">
              <div className="chat-avatar">
                <img src="https://via.placeholder.com/40" alt="User" />
              </div>
              <div className="chat-info">
                <div className="chat-name">Trần Thị B</div>
                <div className="chat-last-message">Cảm ơn bạn nhiều!</div>
              </div>
              <div className="chat-time">12:15</div>
            </div>
          </div>
        </div>
        
        <div className="chat-main">
          <div className="chat-messages">
            <div className="message received">
              <div className="message-avatar">
                <img src="https://via.placeholder.com/30" alt="User" />
              </div>
              <div className="message-content">
                <div className="message-text">Xin chào, tôi muốn hỏi về món ăn này</div>
                <div className="message-time">14:25</div>
              </div>
            </div>
            
            <div className="message sent">
              <div className="message-content">
                <div className="message-text">Chào bạn! Tôi sẵn sàng trả lời câu hỏi của bạn</div>
                <div className="message-time">14:26</div>
              </div>
            </div>
          </div>
          
          <div className="chat-input">
            <input type="text" placeholder="Nhập tin nhắn..." />
            <button>Gửi</button>
          </div>
        </div>
      </div>
    </div>
  )
}
