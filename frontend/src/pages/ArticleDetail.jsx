import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Clock, Eye, Calendar, Share2, Bookmark, TrendingUp, User, ThumbsUp, MessageCircle, Send } from 'lucide-react';
import { getArticleById, getPublishedArticles } from '../services/mockData';
import Chatbot from '../components/public/Chatbot';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = getArticleById(id);
  
  // Comments state
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'David Park',
      avatar: 'https://ui-avatars.com/api/?name=David+Park&background=8b5cf6&color=fff',
      date: '2025-10-26T15:30:00Z',
      content: 'Great article! The insights on GPT-5 are fascinating. I especially loved the section about multimodal capabilities.',
      likes: 24
    },
    {
      id: 2,
      author: 'Rachel Kim',
      avatar: 'https://ui-avatars.com/api/?name=Rachel+Kim&background=ec4899&color=fff',
      date: '2025-10-26T18:45:00Z',
      content: 'This is exactly what I was looking for. The performance benchmarks are impressive!',
      likes: 15
    },
    {
      id: 3,
      author: 'Tom Wilson',
      avatar: 'https://ui-avatars.com/api/?name=Tom+Wilson&background=3b82f6&color=fff',
      date: '2025-10-27T09:20:00Z',
      content: 'Looking forward to testing GPT-5 in our production environment. Thanks for the detailed analysis!',
      likes: 8
    }
  ]);
  const [newComment, setNewComment] = useState('');
  
  // Get related articles (same category, exclude current)
  const relatedArticles = getPublishedArticles()
    .filter(a => a.categoryId === article?.categoryId && a.id !== article?.id)
    .slice(0, 2);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        author: 'You',
        avatar: 'https://ui-avatars.com/api/?name=You&background=10b981&color=fff',
        date: new Date().toISOString(),
        content: newComment,
        likes: 0
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  if (!article) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h1 style={{ fontSize: '48px', color: '#9ca3af' }}>404</h1>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>Article not found</p>
        <button
          onClick={() => navigate('/articles')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Back to Articles
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1.5rem 1rem'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/articles')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: '#3b82f6',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft size={16} />
            Back to Articles
          </button>
        </div>
      </div>

      {/* Article Content */}
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem' }}>
        {/* Meta Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <span style={{
            padding: '0.5rem 1rem',
            background: '#eff6ff',
            color: '#3b82f6',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600
          }}>
            {article.category}
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <Calendar size={14} />
            {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <Clock size={14} />
            {article.readTime} read
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <Eye size={14} />
            {article.views.toLocaleString()} views
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: '2rem',
          color: '#111827'
        }}>
          {article.title}
        </h1>

        {/* Author Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem',
          background: 'white',
          borderRadius: '16px',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={article.authorAvatar}
              alt={article.author}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%'
              }}
            />
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '0.25rem'
              }}>
                {article.author}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                AI Technology Writer
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => alert('Share feature coming soon!')}
              style={{
                width: '40px',
                height: '40px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Share2 size={18} color="#374151" />
            </button>
            <button
              onClick={() => alert('Bookmark feature coming soon!')}
              style={{
                width: '40px',
                height: '40px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Bookmark size={18} color="#374151" />
            </button>
            <button
              onClick={() => alert(`You liked this article!`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0 1rem',
                height: '40px',
                background: '#eff6ff',
                color: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ThumbsUp size={18} />
              {article.likes}
            </button>
          </div>
        </div>

        {/* Featured Image */}
        <div style={{
          width: '100%',
          height: '400px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          borderRadius: '16px',
          marginBottom: '3rem'
        }} />

        {/* Article Body */}
        <div
          className="article-content"
          style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Related Articles */}
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '1.5rem',
            color: '#111827'
          }}>
            Related Articles
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem'
          }}>
            {relatedArticles.map((related) => (
              <div
                key={related.id}
                onClick={() => navigate(`/article/${related.id}`)}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{
                  height: '150px',
                  background: `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)})`
                }} />
                <div style={{ padding: '1.5rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: '#eff6ff',
                    color: '#3b82f6',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {related.category}
                  </span>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    marginTop: '0.75rem',
                    marginBottom: '0.5rem',
                    color: '#111827'
                  }}>
                    {related.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {related.excerpt.substring(0, 100)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '1.5rem',
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <MessageCircle size={28} />
            Comments ({comments.length})
          </h2>

          {/* Add Comment Form */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this article..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '1rem'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: newComment.trim() ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#e5e7eb',
                  color: newComment.trim() ? 'white' : '#9ca3af',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
              >
                <Send size={16} />
                Post Comment
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <img
                    src={comment.avatar}
                    alt={comment.author}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: '#111827'
                        }}>
                          {comment.author}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#6b7280'
                        }}>
                          {new Date(comment.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updated = comments.map(c =>
                            c.id === comment.id ? { ...c, likes: c.likes + 1 } : c
                          );
                          setComments(updated);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#6b7280',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#e5e7eb';
                          e.currentTarget.style.color = '#3b82f6';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '#f3f4f6';
                          e.currentTarget.style.color = '#6b7280';
                        }}
                      >
                        <ThumbsUp size={14} />
                        {comment.likes}
                      </button>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#374151',
                      lineHeight: 1.6
                    }}>
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>

      {/* AI Chatbot */}
      <Chatbot articleTitle={article?.title} articleExcerpt={article?.excerpt} />
    </div>
  );
}
