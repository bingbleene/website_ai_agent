import { useState, useEffect } from 'react';
import { Search, Clock, Eye, TrendingUp, Sparkles, Calendar, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { articlesAPI } from '../services/api';

export default function Articles() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [allArticles, setAllArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [categories, setCategories] = useState(['All']);

  // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch published articles
        const articlesRes = await articlesAPI.getPublished({ limit: 50 });
        const rawArticles = articlesRes.data || [];
        
        // Map MongoDB fields to frontend format
        const mappedArticles = rawArticles.map(article => ({
          id: article._id || article.id,
          title: article.title,
          excerpt: article.excerpt || article.summary,
          content: article.content,
          category: article.category,
          thumbnail: article.featured_image || article.thumbnail || 'https://via.placeholder.com/800x400?text=No+Image',
          views: article.view_count || 0,
          readTime: `${Math.ceil((article.content?.length || 0) / 1000)} min read`,
          publishedAt: article.published_at || article.publishedAt || article.created_at,
          author: article.author_name || 'AI News Bot'
        }));
        
        setAllArticles(mappedArticles);
        
        // Fetch trending articles
        const trendingRes = await articlesAPI.getTrending(3);
        const rawTrending = trendingRes.data || [];
        const mappedTrending = rawTrending.map(article => ({
          id: article._id || article.id,
          title: article.title,
          excerpt: article.excerpt || article.summary,
          category: article.category,
          views: article.view_count || 0,
          readTime: `${Math.ceil((article.content?.length || 0) / 1000)} min read`,
        }));
        setTrendingArticles(mappedTrending);
        
        // Fetch categories
        const categoriesRes = await articlesAPI.getCategories();
        const categoryNames = categoriesRes.data.categories?.map(cat => cat.name) || [];
        setCategories(['All', ...categoryNames]);
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching articles:', error);
        setLoading(false);
        // Fallback to empty arrays on error
        setAllArticles([]);
        setTrendingArticles([]);
      }
    };
    
    fetchData();
  }, []);

  // Filter articles
  const filteredArticles = allArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #3b82f6, #2563eb, #8b5cf6)',
        color: 'white',
        padding: '4rem 1rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 800,
            marginBottom: '1rem'
          }}>
            AI News Articles
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '2rem'
          }}>
            Discover the latest insights and breakthroughs in artificial intelligence
          </p>

          {/* Search Bar */}
          <div style={{
            position: 'relative',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <Search style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} size={20} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
          {/* Main Content */}
          <div>
            {/* Category Filter */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '2rem'
            }}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: selectedCategory === category ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'white',
                    color: selectedCategory === category ? 'white' : '#374151',
                    border: selectedCategory === category ? 'none' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ 
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f4f6',
                  borderTop: '4px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}>
                  <style>
                    {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                  </style>
                </div>
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading articles...</p>
              </div>
            )}

            {/* No Results */}
            {!loading && filteredArticles.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'white',
                borderRadius: '16px'
              }}>
                <p style={{ fontSize: '18px', color: '#6b7280' }}>
                  No articles found. Try different filters.
                </p>
              </div>
            )}

            {/* Articles Grid */}
            {!loading && filteredArticles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredArticles.map(article => (
                <article
                  key={article._id || article.id}
                  onClick={() => navigate(`/article/${article._id || article.id}`)}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: '300px 1fr',
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
                  {/* Image */}
                  <div style={{
                    height: '200px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={article.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'} 
                      alt={article.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzM3OTlmZiIvPjwvc3ZnPg==';
                      }}
                    />
                    {article.featured && (
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        background: '#ef4444',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <TrendingUp size={14} />
                        TRENDING
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.75rem',
                      fontSize: '13px'
                    }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: '#eff6ff',
                        color: '#3b82f6',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        {article.category}
                      </span>
                      <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={14} />
                        {article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>

                    <h2 style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      marginBottom: '0.75rem',
                      color: '#111827'
                    }}>
                      {article.title}
                    </h2>

                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '1rem',
                      lineHeight: 1.6
                    }}>
                      {article.excerpt}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      color: '#9ca3af'
                    }}>
                      <span>By {article.author_name || 'Anonymous'}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={14} />
                          {article.read_time || '5 min'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Eye size={14} />
                          {article.view_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            {/* Trending Articles */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem'
              }}>
                <TrendingUp size={20} color="#ef4444" />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#111827'
                }}>
                  Trending Now
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {trendingArticles.map((article, index) => (
                  <div
                    key={article.id}
                    onClick={() => navigate(`/article/${article.id}`)}
                    style={{
                      cursor: 'pointer',
                      paddingBottom: '1rem',
                      borderBottom: index < trendingArticles.length - 1 ? '1px solid #e5e7eb' : 'none'
                    }}
                  >
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#3b82f6',
                      marginBottom: '0.5rem'
                    }}>
                      #{index + 1}
                    </div>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#111827'
                    }}>
                      {article.title}
                    </h4>
                    <div style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Eye size={12} />
                      {article.views.toLocaleString()} views
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories Widget */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem'
              }}>
                <Tag size={20} color="#3b82f6" />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#111827'
                }}>
                  Categories
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {categories.slice(1).map(category => {
                  const count = allArticles.filter(a => a.category === category).length;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: selectedCategory === category ? '#eff6ff' : 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                      onMouseOut={(e) => e.currentTarget.style.background = selectedCategory === category ? '#eff6ff' : 'transparent'}
                    >
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151'
                      }}>
                        {category}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        background: '#f3f4f6',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
