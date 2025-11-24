import { useState, useEffect } from 'react';
import { Sparkles, Clock, Eye, ArrowRight, Zap, Brain, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { articlesAPI } from '../services/api';

export default function Home() {
  const navigate = useNavigate();

  // Dữ liệu cho AI NEWS HUB
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [topHeadlines, setTopHeadlines] = useState([]);
  const [hubLoading, setHubLoading] = useState(true);

  useEffect(() => {
    const fetchHubData = async () => {
      try {
        setHubLoading(true);

        // Lấy nhiều bài publish mới nhất (để dùng cho Spotlight + AI + Blockchain)
        const publishedRes = await articlesAPI.getPublished({ limit: 10 });
        const rawFeatured = publishedRes.data || [];

        const mappedFeatured = rawFeatured.map((article) => ({
          id: article._id || article.id,
          title: article.title,
          excerpt: article.excerpt || article.summary || '',
          category: article.category || 'AI',
          thumbnail:
            article.featured_image ||
            article.thumbnail ||
            'https://via.placeholder.com/800x400?text=No+Image',
          views: article.view_count || 0,
          // Dùng thời gian đăng bài
          publishedAt: article.published_at || article.publishedAt || article.created_at,
        }));

        setFeaturedArticles(mappedFeatured);

        // Lấy danh sách bài trending cho Top Headlines
        const trendingRes = await articlesAPI.getTrending(5);
        const rawTrending = trendingRes.data || [];

        const mappedHeadlines = rawTrending.map((article) => ({
          id: article._id || article.id,
          title: article.title,
          category: article.category || 'AI',
          // Thêm thời gian đăng bài cho headline
          publishedAt: article.published_at || article.publishedAt || article.created_at,
        }));

        setTopHeadlines(mappedHeadlines);
      } catch (err) {
        console.error('❌ Error fetching hub data:', err);
        setFeaturedArticles([]);
        setTopHeadlines([]);
      } finally {
        setHubLoading(false);
      }
    };

    fetchHubData();
  }, []);

  const mainArticle = featuredArticles[0] || null;
  const sideArticles = featuredArticles.slice(1, 3);

  // Tách bài theo category cho 2 khu vực AI & Blockchain
  const aiArticles = featuredArticles.filter(
    (a) => (a.category || '').toLowerCase() === 'ai'
  );
  const blockchainArticles = featuredArticles.filter(
    (a) => (a.category || '').toLowerCase() === 'blockchain'
  );

  // Hàm hiển thị thời gian đăng (ngày + giờ) từ publishedAt
  const renderPublishedTime = (dateString) => {
    if (!dateString) return 'Không rõ thời gian';
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Hàm render 1 section category (AI / BLOCKCHAIN)
  const renderCategorySection = (label, articles) => {
    if (!articles || articles.length === 0) {
      return null; // Không có bài thì ẩn khu vực đó
    }

    const hero = articles[0];
    const secondary = articles[1];
    const smallList = articles.slice(2, 4);

    return (
      <section style={{ padding: '3.5rem 1rem', background: '#f4f4f5' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          {/* Header: Title + See more */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.75rem',
            }}
          >
            <h2
              style={{
                fontSize: '32px',
                fontWeight: 900,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                background:
                  label === 'AI'
                    ? 'linear-gradient(90deg, #22c55e, #22c55e, #a3e635)'
                    : 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
              }}
            >
              {label}
            </h2>

            <button
              onClick={() => navigate(`/articles?category=${label.toLowerCase()}`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.3rem',
                borderRadius: '999px',
                border: '1px solid #111827',
                background: 'white',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Xem thêm
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Grid chính: bên trái 1 ô to, bên phải 1 ô vừa + 2 ô nhỏ */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1.2fr)',
              gap: '1.75rem',
              alignItems: 'stretch',
            }}
          >
            {/* LEFT: Hero card với overlay – chữ ở giữa, metadata ở cuối */}
            <div
              onClick={() => navigate(`/article/${hero.id}`)}
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                minHeight: '260px',
                cursor: 'pointer',
                boxShadow: '0 18px 45px rgba(15,23,42,0.16)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 22px 55px rgba(15,23,42,0.22)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 18px 45px rgba(15,23,42,0.16)';
              }}
            >
              {/* Background image */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${hero.thumbnail})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: 'scale(1.03)',
                }}
              />
              {/* Overlay để hạ màu hình ảnh */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(145deg, rgba(15,23,42,0.92), rgba(15,23,42,0.55))',
                }}
              />

              {/* Content */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  height: '100%',
                  padding: '1.8rem 1.8rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Category */}
                <div
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.09em',
                    color: 'rgba(209,213,219,0.9)',
                    marginBottom: '0.5rem',
                    textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  }}
                >
                  {hero.category}
                </div>

                {/* Title – nằm giữa khối */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    flexGrow: 1,
                  }}
                >
                  <h3
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      margin: 0,
                      maxWidth: '24rem',
                      color: 'white',
                      lineHeight: 1.35,
                      textShadow: '0 4px 12px rgba(0,0,0,0.55)',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {hero.title}
                  </h3>
                </div>

                {/* Metadata – dồn xuống đáy ô */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.9rem',
                    fontSize: '11px',
                    color: 'rgba(226,232,240,0.9)',
                    marginTop: 'auto',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Clock size={13} />
                    {renderPublishedTime(hero.publishedAt)}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Eye size={13} />
                    {hero.views || 0} lượt xem
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div
              style={{
                display: 'grid',
                gridTemplateRows: 'minmax(0, 1.1fr) minmax(0, 1fr)',
                gap: '1rem',
              }}
            >
              {/* Card trên: secondary (nếu có) */}
              {secondary && (
                <div
                  onClick={() => navigate(`/article/${secondary.id}`)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.1fr 1.4fr',
                    gap: '1rem',
                    background: 'white',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 26px rgba(15,23,42,0.14)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      backgroundImage: `url(${secondary.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div
                    style={{
                      padding: '1.25rem 1.4rem',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.09em',
                        color: '#6b7280',
                        marginBottom: '0.35rem',
                      }}
                    >
                      {secondary.category}
                    </span>
                    <h4
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        margin: 0,
                        marginBottom: '0.5rem',
                        color: '#111827',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {secondary.title}
                    </h4>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '11px',
                        color: '#6b7280',
                        marginTop: 'auto',
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Clock size={13} />
                        {renderPublishedTime(secondary.publishedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Hàng dưới: 2 ô nhỏ ngang */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '1rem',
                }}
              >
                {smallList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/article/${item.id}`)}
                    style={{
                      background: 'white',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 20px rgba(15,23,42,0.12)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        height: '110px',
                        backgroundImage: `url(${item.thumbnail})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div style={{ padding: '0.9rem 1rem 0.85rem' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.09em',
                          color: '#9ca3af',
                          marginBottom: '0.25rem',
                          display: 'block',
                        }}
                      >
                        {item.category}
                      </span>
                      <p
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          margin: 0,
                          marginBottom: '0.45rem',
                          color: '#111827',
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.title}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '11px',
                          color: '#6b7280',
                        }}
                      >
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <Clock size={12} />
                          {renderPublishedTime(item.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb, #8b5cf6)',
          color: 'white',
          padding: '5rem 1rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '999px',
              marginBottom: '1.5rem',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <Sparkles size={16} />
            <span>Nền tảng tin tức vận hành bởi AI</span>
          </div>

          <h1
            style={{
              fontSize: '56px',
              fontWeight: 800,
              marginBottom: '1.5rem',
              lineHeight: 1.2,
            }}
          >
            Dẫn đầu xu hướng với tin tức được chọn lọc bởi AI
          </h1>

          <p
            style={{
              fontSize: '20px',
              color: 'rgba(255,255,255,0.9)',
              maxWidth: '600px',
              margin: '0 auto 2rem',
            }}
          >
            Khám phá những góc nhìn mới nhất về trí tuệ nhân tạo, machine learning và
            công nghệ. Nội dung được AI sàng lọc để luôn phù hợp với bạn.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() =>
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 2rem',
                background: 'white',
                color: '#3b82f6',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Khám phá bài viết
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate('/learn-more')}
              style={{
                padding: '1rem 2rem',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Tìm hiểu thêm
            </button>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              maxWidth: '600px',
              margin: '4rem auto 0',
            }}
          >
            <div
              style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '0.25rem' }}>
                1000+
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                Bài viết
              </div>
            </div>
            <div
              style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '0.25rem' }}>
                50+
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                Chủ đề
              </div>
            </div>
            <div
              style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '0.25rem' }}>
                24/7
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                Cập nhật liên tục
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE Section */}
      <section style={{ padding: '4rem 1rem', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2
              style={{
                fontSize: '34px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem',
              }}
            >
              Vì sao chọn AI News Hub?
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            <div
              style={{
                padding: '2rem',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <Zap size={28} color="white" />
              </div>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  color: '#111827',
                }}
              >
                Chọn lọc nội dung bằng AI
              </h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>
                Thuật toán AI giúp lọc ra những tin tức quan trọng, phù hợp nhất với mối
                quan tâm của bạn.
              </p>
            </div>

            <div
              style={{
                padding: '2rem',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <Brain size={28} color="white" />
              </div>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  color: '#111827',
                }}
              >
                Phân tích thông minh
              </h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>
                Các phân tích chuyên sâu được hỗ trợ bởi những mô hình machine learning
                tiên tiến.
              </p>
            </div>

            <div
              style={{
                padding: '2rem',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #ec4899, #db2777)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <Rocket size={28} color="white" />
              </div>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  color: '#111827',
                }}
              >
                Cập nhật theo thời gian thực
              </h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>
                Không bỏ lỡ bất kỳ diễn biến quan trọng nào trong lĩnh vực AI và công
                nghệ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI NEWS HUB Spotlight Section */}
      <section
        style={{
          padding: '1.5rem 1rem 3rem',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
          color: 'white',
        }}
      >
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          {/* Header – chỉ title, căn giữa và làm nổi bật */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '40px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                margin: 0,
                color: '#f9fafb',
                textShadow: '0 6px 18px rgba(15,23,42,0.6)',
              }}
            >
              AI NEWS HUB
            </h2>
          </div>

          {/* Nếu đang load hoặc không có bài */}
          {hubLoading || !mainArticle ? (
            <div
              style={{
                padding: '2.5rem',
                borderRadius: '24px',
                background: 'rgba(15,23,42,0.85)',
                textAlign: 'center',
                boxShadow: '0 18px 45px rgba(15,23,42,0.6)',
              }}
            >
              <p style={{ fontSize: '14px', color: 'rgba(209,213,219,0.9)' }}>
                Đang tải dữ liệu AI Hub...
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 2.1fr) minmax(0, 1.2fr)',
                gap: '2rem',
                alignItems: 'stretch',
                minHeight: '430px',
              }}
            >
              {/* LEFT PANEL: 1 ô to + 2 ô nhỏ */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: '1.7fr 1fr',
                  gap: '1.25rem',
                  height: '100%',
                }}
              >
                {/* Ô to – bài mới nhất */}
                <div
                  onClick={() => navigate(`/article/${mainArticle.id}`)}
                  style={{
                    position: 'relative',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    minHeight: '260px',
                    cursor: 'pointer',
                    boxShadow: '0 18px 45px rgba(15,23,42,0.45)',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow =
                      '0 26px 60px rgba(15,23,42,0.6)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow =
                      '0 18px 45px rgba(15,23,42,0.45)';
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url(${mainArticle.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transform: 'scale(1.03)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(120deg, rgba(15,23,42,0.95), rgba(15,23,42,0.35))',
                    }}
                  />
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      padding: '2rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.2rem 0.7rem',
                        borderRadius: '999px',
                        background: 'rgba(34,197,94,0.18)',
                        border: '1px solid rgba(34,197,94,0.5)',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '1rem',
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '999px',
                          background: '#22c55e',
                        }}
                      />
                      {mainArticle.category} • Bài viết nổi bật
                    </div>

                    <h3
                      style={{
                        fontSize: '30px',
                        fontWeight: 900,
                        marginBottom: '0.75rem',
                        lineHeight: 1.25,
                        maxWidth: '30rem',
                        color: 'white',
                        textShadow: '0 3px 12px rgba(0,0,0,0.45)',
                      }}
                    >
                      {mainArticle.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '15px',
                        color: 'rgba(240,242,245,0.85)',
                        marginBottom: '1.2rem',
                        maxWidth: '26rem',
                        lineHeight: 1.55,
                        textShadow: '0 2px 8px rgba(0,0,0,0.35)',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {mainArticle.excerpt}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.2rem',
                        fontSize: '12px',
                        color: 'rgba(148,163,184,0.95)',
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Clock size={14} />
                        {renderPublishedTime(mainArticle.publishedAt)}
                      </span>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Eye size={14} />
                        {mainArticle.views || 0} lượt xem
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hàng dưới: 2 ô nhỏ cho 2 bài phụ */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {sideArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => navigate(`/article/${article.id}`)}
                      style={{
                        position: 'relative',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        minHeight: '180px',
                        cursor: 'pointer',
                        boxShadow: '0 14px 32px rgba(15,23,42,0.5)',
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow =
                          '0 20px 42px rgba(15,23,42,0.7)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow =
                          '0 14px 32px rgba(15,23,42,0.5)';
                      }}
                    >
                      {/* Background image */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundImage: `url(${article.thumbnail})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />

                      {/* Overlay làm tối mạnh hơn để chữ nổi */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(180deg, rgba(15,23,42,0.85), rgba(15,23,42,0.45))',
                        }}
                      />

                      {/* Content - căn giữa theo chiều dọc */}
                      <div
                        style={{
                          position: 'relative',
                          zIndex: 1,
                          height: '100%',
                          padding: '1rem 1.1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        {/* Category */}
                        <div
                          style={{
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.09em',
                            color: 'rgba(209,213,219,0.85)',
                            marginBottom: '0.35rem',
                            textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                          }}
                        >
                          {article.category}
                        </div>

                        {/* Title — nằm giữa */}
                        <h4
                          style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            marginBottom: '0.55rem',
                            maxWidth: '15rem',
                            color: 'rgba(255,255,255,0.97)',
                            lineHeight: 1.35,
                            textShadow: '0 3px 10px rgba(0,0,0,0.55)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {article.title}
                        </h4>                        
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.7rem',
                            fontSize: '11px',
                            color: 'rgba(226,232,240,0.88)',
                            marginTop: 'auto',
                          }}
                        >
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Clock size={13} />
                            {renderPublishedTime(article.publishedAt)}
                          </span>

                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Eye size={13} />
                            {article.views || 0} lượt xem
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT PANEL – Top Headlines */}
              <div
                style={{
                  background: 'rgba(15,23,42,0.95)',
                  borderRadius: '24px',
                  padding: '1.8rem 1.6rem',
                  boxShadow: '0 16px 40px rgba(15,23,42,0.55)',
                  border: '1px solid rgba(148,163,184,0.35)',
                  height: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    marginBottom: '1.2rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(249,250,251,0.9)',
                  }}
                >
                  Tiêu điểm
                </h4>

                {topHeadlines.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'rgba(148,163,184,0.9)' }}>
                    Chưa có bài nổi bật.
                  </p>
                ) : (
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'grid',
                      gap: '0.9rem',
                    }}
                  >
                    {topHeadlines.map((item) => (
                      <li
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.6rem',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/article/${item.id}`)}
                      >
                        <span
                          style={{
                            marginTop: 5,
                            width: 6,
                            height: 6,
                            borderRadius: '999px',
                            background: 'rgba(248,250,252,0.8)',
                          }}
                        />
                        <div>
                          <p
                            style={{
                              fontSize: '13px',
                              color: 'rgba(226,232,240,0.96)',
                              marginBottom: '0.2rem',
                            }}
                          >
                            {item.title}
                          </p>
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'rgba(148,163,184,0.9)',
                            }}
                          >
                            {item.category} • {renderPublishedTime(item.publishedAt)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Nút View more ở cuối box, căn giữa */}
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => navigate('/articles')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.7rem 1.4rem',
                      background: 'rgba(255,255,255,0.12)',
                      borderRadius: '999px',
                      border: '1px solid rgba(255,255,255,0.35)',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Xem thêm
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2 khu vực AI & BLOCKCHAIN */}
      {renderCategorySection('AI', aiArticles)}
      {renderCategorySection('BLOCKCHAIN', blockchainArticles)}

      {/* CTA Section */}
      <section
        style={{
          padding: '5rem 1rem',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Sparkles size={48} style={{ margin: '0 auto 1.5rem' }} />
          <h2
            style={{
              fontSize: '40px',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            Sẵn sàng khám phá thêm?
          </h2>
          <p
            style={{
              fontSize: '18px',
              marginBottom: '2rem',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            Cùng hàng nghìn độc giả luôn dẫn đầu xu hướng với tin tức được chọn lọc bởi
            AI.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '1rem 2rem',
              background: 'white',
              color: '#3b82f6',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Bắt đầu ngay
          </button>
        </div>
      </section>
    </div>
  );
}
