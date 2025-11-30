import { useState, useEffect } from 'react';
import { Sparkles, Clock, Eye, ArrowRight, Zap, Brain, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { articlesAPI } from '../services/api';
import RobotImage from '../assets/Robot.png';

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
      {/* CSS hero + particles + robot */}
      <style>{`
        /* ==== HERO SECTION – gradient match AI NEWS HUB ==== */
        .home-hero {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 0% 0%, rgba(96,165,250,0.65) 0%, transparent 55%),
            radial-gradient(circle at 100% 100%, rgba(244,114,182,0.55) 0%, transparent 55%),
            linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
          color: #ffffff;
          padding: 4.75rem 1.5rem 4rem;
        }

        @media (min-width: 1024px) {
          .home-hero {
            padding-top: 5.5rem;
            padding-bottom: 4.5rem;
          }
        }

        .home-hero-particles {
          position: absolute;
          inset: -60px;
          pointer-events: none;
          opacity: 0.55;
          mix-blend-mode: screen;
          background-image:
            radial-gradient(2px 2px at 10% 20%, rgba(248,250,252,0.9), transparent 60%),
            radial-gradient(2px 2px at 30% 80%, rgba(219,234,254,0.7), transparent 60%),
            radial-gradient(2px 2px at 80% 30%, rgba(221,214,254,0.9), transparent 60%),
            radial-gradient(2px 2px at 60% 65%, rgba(252,231,243,0.9), transparent 60%),
            radial-gradient(2px 2px at 20% 55%, rgba(248,250,252,0.9), transparent 60%),
            radial-gradient(2px 2px at 75% 75%, rgba(248,250,252,0.9), transparent 60%),
            radial-gradient(2px 2px at 45% 35%, rgba(248,250,252,0.9), transparent 60%);
          background-size: 260px 260px;
          animation: heroParticles1 26s linear infinite;
          z-index: 0;
        }

        .home-hero-particles--2 {
          opacity: 0.5;
          background-image:
            radial-gradient(3px 3px at 15% 10%, rgba(251,146,60,0.9), transparent 60%),
            radial-gradient(3px 3px at 45% 75%, rgba(96,165,250,0.95), transparent 60%),
            radial-gradient(3px 3px at 80% 50%, rgba(251,113,133,0.95), transparent 60%),
            radial-gradient(3px 3px at 55% 20%, rgba(167,139,250,0.95), transparent 60%),
            radial-gradient(3px 3px at 25% 70%, rgba(52,211,153,0.95), transparent 60%);
          background-size: 320px 320px;
          animation: heroParticles2 34s linear infinite;
        }

        @keyframes heroParticles1 {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-120px, -60px, 0); }
        }

        @keyframes heroParticles2 {
          0%   { transform: translate3d(40px, 20px, 0); }
          100% { transform: translate3d(-40px, -30px, 0); }
        }

        .home-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 3rem;
        }

        .home-hero-left {
          flex: 1 1 380px;
          max-width: 560px;
        }

        .home-kicker-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 1rem;
          border-radius: 999px;
          background: rgba(15,23,42,0.7);
          border: 1px solid rgba(148,163,184,0.6);
          backdrop-filter: blur(10px);
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.4rem;
        }

        .home-kicker-pill span {
          font-weight: 600;
          color: #e5e7eb;
        }

        .home-hero-title {
          font-weight: 800;
          font-size: 2.5rem;
          line-height: 1.15;
          margin: 0 auto 1.1rem auto;
          color: #f9fafb;
          text-shadow: 0 4px 18px rgba(0,0,0,0.7);
          max-width: 20ch;
          text-align: center;
        }

        @media (min-width: 768px) {
          .home-hero-title {
            font-size: 3.2rem;
          }
        }

        .home-hero-title-highlight {
          display: inline-block;
          border-bottom: 4px solid #fb923c;
          padding-bottom: 4px;
        }

        .home-hero-subtext {
          font-size: 0.98rem;
          color: rgba(226,232,240,0.92);
          max-width: 32rem;
          line-height: 1.6;
          margin: 0 auto 1.8rem auto;
          text-align: justify;
          text-align-last: center;
        }

        .home-hero-ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 0.85rem;
          margin-bottom: 2.2rem;
          justify-content: center;
        }

        .home-hero-btn {
          border-radius: 999px;
          padding: 0.9rem 1.7rem;
          font-size: 0.95rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          cursor: pointer;
          border: none;
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            background 0.18s ease,
            color 0.18s ease;
        }

        .home-hero-btn-primary {
          background: #f9fafb;
          color: #1d4ed8;
          box-shadow: 0 18px 40px rgba(15,23,42,0.45);
        }

        .home-hero-btn-primary:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 22px 55px rgba(15,23,42,0.7);
        }

        .home-hero-btn-outline {
          background: transparent;
          color: #e5e7eb;
          border: 1px solid rgba(209,213,219,0.6);
        }

        .home-hero-btn-outline:hover {
          background: rgba(15,23,42,0.6);
          transform: translateY(-1px);
        }

        .home-hero-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 1.1rem;
          justify-content: center;
        }

        .home-hero-stat-card {
          min-width: 140px;
          height: 90px;
          padding: 0 1.4rem;
          border-radius: 1rem;
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(148,163,184,0.4);
          box-shadow: 0 14px 40px rgba(15,23,42,0.7);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .home-hero-stat-value {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .home-hero-stat-label {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(156,163,175,0.95);
        }

        .home-hero-robot-wrapper {
          flex: 1 1 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .home-hero-robot-circle {
          position: relative;
          width: 340px;
          height: 340px;
          border-radius: 999px;
          background:
            radial-gradient(circle at 30% 15%, rgba(248,250,252,0.18), transparent 55%),
            radial-gradient(circle at 75% 80%, rgba(251,113,133,0.35), transparent 60%),
            radial-gradient(circle at 10% 80%, rgba(52,211,153,0.25), transparent 60%),
            #020617;
          box-shadow:
            0 0 0 1px rgba(148,163,184,0.4),
            0 40px 120px rgba(15,23,42,0.9),
            0 0 80px rgba(56,189,248,0.5);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 1024px) {
          .home-hero-robot-circle {
            width: 380px;
            height: 380px;
          }
        }

        .home-hero-robot-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transform: translateY(8px);
          filter: drop-shadow(0 24px 40px rgba(15,23,42,0.85));
        }

        .home-hero-robot-caption {
          font-size: 0.8rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;

          /* màu + độ tương phản mạnh hơn */
          color: #f9fafb;
          text-shadow: 0 0 12px rgba(15, 23, 42, 0.9);

          /* làm thành pill nổi trên nền gradient */
          background: rgba(15, 23, 42, 0.55);
          padding: 0.45rem 1.1rem;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);

          /* căn giữa đẹp hơn một chút */
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

      `}</style>

      {/* HERO SECTION – robot + particles toàn khu vực */}
      <section className="home-hero">
        <div className="home-hero-particles" />
        <div className="home-hero-particles home-hero-particles--2" />

        <div className="home-hero-inner">
          {/* LEFT: Text */}
          <div className="home-hero-left">
            <div className="home-kicker-pill">
              <Sparkles size={16} />
              <span>Nền tảng tin tức vận hành bởi AI</span>
            </div>

            <h1 className="home-hero-title">
              Kỷ nguyên{' '}
              <span className="home-hero-title-highlight">tin tức trí tuệ nhân tạo</span>{' '}
              dành riêng cho bạn
            </h1>

            <p className="home-hero-subtext">
              AI phân tích hàng nghìn nguồn tin mỗi ngày để chọn lọc những câu chuyện,
              xu hướng và phân tích quan trọng nhất về AI, machine learning và công
              nghệ – phù hợp với mối quan tâm của bạn.
            </p>

            <div className="home-hero-ctas">
              <button
                className="home-hero-btn home-hero-btn-primary"
                onClick={() =>
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                }
              >
                Khám phá bài viết
                <ArrowRight size={18} />
              </button>
              <button
                className="home-hero-btn home-hero-btn-outline"
                onClick={() => navigate('/articles')}
              >
                Xem tin mới nhất
              </button>
            </div>

            <div className="home-hero-stats">
              <div className="home-hero-stat-card">
                <div className="home-hero-stat-value">1000+</div>
                <div className="home-hero-stat-label">Bài viết</div>
              </div>
              <div className="home-hero-stat-card">
                <div className="home-hero-stat-value">50+</div>
                <div className="home-hero-stat-label">Chủ đề</div>
              </div>
              <div className="home-hero-stat-card">
                <div className="home-hero-stat-value">24/7</div>
                <div className="home-hero-stat-label">Cập nhật liên tục</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Robot */}
          <div className="home-hero-robot-wrapper">
            <div className="home-hero-robot-circle">
              <img
                src={RobotImage}
                alt="AI robot chọn lọc tin tức"
                className="home-hero-robot-image"
              />
            </div>
            <div className="home-hero-robot-caption">AI chọn lọc tin tức 24/7</div>
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
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundImage: `url(${article.thumbnail})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(180deg, rgba(15,23,42,0.85), rgba(15,23,42,0.45))',
                        }}
                      />
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

      {/* CTA Section cuối trang */}
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
