import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Edit2, Trash2, Eye, Calendar, User, TrendingUp, Cpu } from 'lucide-react';
import { mockArticles, getStats, getUserById } from '../../services/mockData';
import { getArticlesWithAILogs } from '../../services/aiAgentLogs';

export default function ArticlesManagement() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState(mockArticles);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = getStats();
  const articlesWithAILogs = getArticlesWithAILogs();

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this article?')) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  const getStatusColor = (status) => {
    return status === 'published' ? '#10b981' : '#f59e0b';
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 800,
            marginBottom: '0.5rem',
            color: '#111827'
          }}>
            Articles Management
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Manage your AI news articles
          </p>
        </div>
        <button
          onClick={() => alert('Create article feature coming soon!')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={18} />
          New Article
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
            Total Articles
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#111827' }}>
            {articles.length}
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
            Published
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>
            {articles.filter(a => a.status === 'published').length}
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
            Drafts
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>
            {articles.filter(a => a.status === 'draft').length}
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
            Total Views
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>
            {articles.reduce((sum, a) => sum + a.views, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '16px',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '1rem'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} size={18} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                Title
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                Category
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                Author
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                Status
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                Views
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                Date
              </th>
              <th style={{ padding: '1rem', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((article, index) => (
              <tr
                key={article.id}
                style={{
                  borderBottom: index < filteredArticles.length - 1 ? '1px solid #e5e7eb' : 'none'
                }}
              >
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>
                      {article.title}
                    </div>
                    {articlesWithAILogs.includes(article.id.toString()) && (
                      <span
                        title="AI Generated with Logs"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600
                        }}
                      >
                        <Cpu size={12} />
                        AI
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: '#eff6ff',
                    color: '#3b82f6',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {article.category}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#6b7280', fontSize: '14px' }}>
                  {getUserById(article.authorId)?.name || 'Unknown'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: article.status === 'published' ? '#d1fae5' : '#fef3c7',
                    color: getStatusColor(article.status),
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}>
                    {article.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#6b7280', fontSize: '14px' }}>
                  {article.views.toLocaleString()}
                </td>
                <td style={{ padding: '1rem', color: '#6b7280', fontSize: '14px' }}>
                  {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => navigate(`/admin/articles/${article.id}`)}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: '#eff6ff',
                        border: 'none',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#dbeafe';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#eff6ff';
                      }}
                    >
                      <Eye size={16} color="#3b82f6" />
                    </button>
                    <button
                      onClick={() => alert(`Edit article ${article.id}`)}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={16} color="#6b7280" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: '#fee2e2',
                        border: 'none',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredArticles.length === 0 && (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            No articles found
          </div>
        )}
      </div>
    </div>
  );
}
