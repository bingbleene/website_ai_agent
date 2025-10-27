import { Bot, X, Send } from 'lucide-react';
import { useState } from 'react';

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

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      // Add user message
      const userMessage = {
        id: messages.length + 1,
        type: 'user',
        content: inputMessage,
        timestamp: new Date().toISOString()
      };
      
      setMessages([...messages, userMessage]);
      setInputMessage('');
      
      // Simulate bot response
      setTimeout(() => {
        const botResponses = articleTitle ? [
          `That's a great question about ${articleTitle}! Based on the article, ${articleExcerpt?.substring(0, 100)}...`,
          `According to the article, the key points are highlighted in the content. Would you like me to elaborate on any specific section?`,
          `Interesting perspective! The article mentions that this technology could have significant implications for the industry.`,
          `From what I've read in the article, the author emphasizes the importance of understanding these developments.`,
          `Let me help clarify that. The article discusses several aspects of this topic in detail.`
        ] : [
          "I'm here to help! Could you please provide more details about what you'd like to know?",
          "That's an interesting question. Let me think about that...",
          "I'd be happy to assist you with that. Can you elaborate a bit more?",
          "Great question! Let me provide you with some information on that.",
          "I'm analyzing that for you. One moment please..."
        ];
        
        const botMessage = {
          id: messages.length + 2,
          type: 'bot',
          content: botResponses[Math.floor(Math.random() * botResponses.length)],
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            zIndex: 1000
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
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '380px',
          height: '500px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1000
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            color: 'white',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '1.5rem',
            overflowY: 'auto',
            background: '#f9fafb',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
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
                  maxWidth: '80%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: message.type === 'user'
                    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                    : 'white',
                  color: message.type === 'user' ? 'white' : '#374151',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  boxShadow: message.type === 'bot' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid #e5e7eb',
            background: 'white'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your question..."
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                style={{
                  width: '44px',
                  height: '44px',
                  background: inputMessage.trim()
                    ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                    : '#e5e7eb',
                  color: inputMessage.trim() ? 'white' : '#9ca3af',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
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

