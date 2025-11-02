// frontend/src/components/public/Chatbot.jsx
// --- PHIÊN BẢN NÂNG CẤP (ĐÃ KẾT NỐI API) ---

import { Bot, X, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react'; // Thêm useEffect và useRef

export default function Chatbot({ articleTitle, articleExcerpt }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: articleTitle
        ? `Hi! I'm your AI assistant. I've read the article "${articleTitle}". Feel free to ask me anything about it!`
        : "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // <-- (MỚI) State loading
  const chatBodyRef = useRef(null); // <-- (MỚI) Ref để auto-scroll

  // --- (MỚI) Tự động cuộn xuống khi có tin nhắn mới ---
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Lấy URL API từ file .env của Vite
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  // --- (NÂNG CẤP) Xử lý logic gọi API ---
  const handleSendMessage = async () => { // Chuyển sang async
    const trimmedInput = inputMessage.trim();
    if (!trimmedInput) return;

    // 1. Thêm tin nhắn của người dùng vào UI
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: trimmedInput,
      timestamp: new Date().toISOString()
    };
    
    // Lấy 5 tin nhắn cuối làm lịch sử (loại bỏ tin nhắn chào)
    const history = messages.length > 1 ? messages.slice(-5) : [];
    
    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // (MỚI) Thêm context (tiêu đề bài viết) vào câu hỏi
    // để giúp backend RAG tìm kiếm chính xác hơn
    const contextualMessage = articleTitle
      ? `Regarding the article "${articleTitle}": ${trimmedInput}`
      : trimmedInput;

    // 2. Gọi API Backend (thay thế cho setTimeout)
    try {
      // Convert messages to the format backend expects
      const chatHistory = history.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await fetch(`${API_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: contextualMessage,
          conversation_history: chatHistory
        }),
      });

      if (!response.ok) {
        throw new Error('API response error');
      }

      const data = await response.json(); // Đây là ChatResponse từ backend

      // 3. Thêm tin nhắn phản hồi của Bot
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: data.message, // Lấy nội dung từ API
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Failed to fetch chatbot response:", error);
      // Xử lý lỗi (vẫn gửi tin nhắn lỗi cho người dùng)
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: "Sorry, I'm having trouble connecting to my brain. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false); // Dừng loading
    }
  };

  // --- (Render UI - Giữ nguyên của bạn, chỉ thêm ref và disabled) ---
  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem',
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            color: 'white', border: 'none',
            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', transition: 'all 0.3s', zIndex: 1000
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(139, 92, 246, 0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.4)';
          }}
        >
          <Bot size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          width: '380px', height: '500px', background: 'white',
          borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1000
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            color: 'white', padding: '1.5rem', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <Bot size={24} />
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>
                  AI Assistant
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  {articleTitle ? 'Ask me about the article' : 'How can I help?'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
                width: '32px', height: '32px', borderRadius: '50%',
                cursor: 'pointer', fontSize: '20px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={chatBodyRef} // <-- (MỚI) Thêm ref
            style={{
              flex: 1, padding: '1.5rem', overflowY: 'auto',
              background: '#f9fafb', display: 'flex',
              flexDirection: 'column', gap: '1rem'
          }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                <div style={{
                  maxWidth: '80%', padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: message.type === 'user'
                    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                    : 'white',
                  color: message.type === 'user' ? 'white' : '#374151',
                  fontSize: '14px', lineHeight: 1.6,
                  boxShadow: message.type === 'bot' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}>
                  {message.content}
                </div>
              </div>
            ))}
             {/* (MỚI) Hiển thị "đang suy nghĩ" */}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: '12px',
                  background: 'white', color: '#374151', fontSize: '14px',
                  lineHeight: 1.6, boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <i>Đang suy nghĩ...</i>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '1rem', borderTop: '1px solid #e5e7eb', background: 'white'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder="Type your question..."
                disabled={isLoading} // <-- (MỚI)
                style={{
                  flex: 1, padding: '0.75rem 1rem',
                  border: '1px solid #e5e7eb', borderRadius: '12px',
                  fontSize: '14px', fontFamily: 'inherit',
                  outline: 'none',
                  disabled: { background: '#f3f4f6' }
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading} // <-- (MỚI)
                style={{
                  width: '44px', height: '44px',
                  background: (inputMessage.trim() && !isLoading)
                    ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                    : '#e5e7eb',
                  color: (inputMessage.trim() && !isLoading) ? 'white' : '#9ca3af',
                  border: 'none', borderRadius: '12px',
                  cursor: (inputMessage.trim() && !isLoading) ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', transition: 'all 0.2s'
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Thêm CSS cho animation
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleSheet);