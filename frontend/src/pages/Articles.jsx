import { useState, useEffect } from "react";
import {
  Search,
  Clock,
  Eye,
  TrendingUp,
  Sparkles,
  Calendar,
  Tag,
  RefreshCcw,
  Zap,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { articlesAPI } from "../services/api";

export default function Articles() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [allArticles, setAllArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [categories, setCategories] = useState([{ name: "All", count: null }]);

  // HH:MM · dd/MM/yyyy
  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // dd/MM/yyyy (dùng cho dòng ngày nếu cần)
  const formatDateOnly = (value) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Fetch data từ backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Published articles
        const articlesRes = await articlesAPI.getPublished({ limit: 50 });
        const rawArticles = articlesRes.data || [];

        const mappedArticles = rawArticles.map((article) => {
          const publishedAtRaw =
            article.published_at || article.publishedAt || article.created_at;

          return {
            id: article._id || article.id,
            title: article.title,
            excerpt: article.excerpt || article.summary || "",
            content: article.content || "",
            category: article.category || "Uncategorized",
            thumbnail:
              article.featured_image ||
              article.thumbnail ||
              "https://via.placeholder.com/800x400?text=No+Image",
            views: article.view_count || 0,
            readTime: formatDateTime(publishedAtRaw),
            publishedAt: publishedAtRaw,
            author: article.author_name || "AI News Bot",
          };
        });

        setAllArticles(mappedArticles);

        // Trending articles
        const trendingRes = await articlesAPI.getTrending(3);
        const rawTrending = trendingRes.data || [];
        const mappedTrending = rawTrending.map((article) => {
          const publishedAtRaw =
            article.published_at || article.publishedAt || article.created_at;

          return {
            id: article._id || article.id,
            title: article.title,
            excerpt: article.excerpt || article.summary || "",
            category: article.category || "Tổng hợp",
            views: article.view_count || 0,
            readTime: formatDateTime(publishedAtRaw),
            publishedAt: publishedAtRaw,
          };
        });
        setTrendingArticles(mappedTrending);

        // Categories
        const categoriesRes = await articlesAPI.getCategories();
        const rawCategories = categoriesRes.data.categories || [];
        setCategories([{ name: "All", count: null }, ...rawCategories]);

        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching articles:", error);
        setLoading(false);
        setAllArticles([]);
        setTrendingArticles([]);
      }
    };

    fetchData();
  }, []);

  // Filter articles
  const filteredArticles = allArticles.filter((article) => {
    const title = (article.title || "").toLowerCase();
    const excerpt = (article.excerpt || "").toLowerCase();
    const q = (searchQuery || "").toLowerCase();

    const matchesSearch = !q || title.includes(q) || excerpt.includes(q);

    const matchesCategory =
      selectedCategory === "All" ||
      (article.category || "").trim().toLowerCase() ===
        selectedCategory.trim().toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const heroArticle = filteredArticles[0] || null;
  const latestArticles = filteredArticles.slice(1, 6);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        paddingBottom: "3rem",
      }}
    >
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}
      >
        {/* Header title cũ – giữ nguyên */}
        <header style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#111827",
              marginBottom: "0.75rem",
            }}
          >
            BÀI VIẾT AI NEWS
          </h1>
          <p
            style={{ color: "#6b7280", fontSize: "14px", marginBottom: "1rem" }}
          >
            Khám phá những góc nhìn và xu hướng mới nhất về trí tuệ nhân tạo
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1.5rem",
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <RefreshCcw size={14} />
              Làm mới
            </button>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <Zap size={14} color="#f97316" />
              Đồng bộ AI
            </span>
          </div>
        </header>

        {/* Hero + Top trending – CHỈ CHỈNH STYLE / THÊM, KHÔNG XOÁ */}
        <section style={{ marginBottom: "2rem" }}>
          {/* Banner gradient giống hình */}
          <div
            style={{
              background: "linear-gradient(90deg, #E33B8C 0%, #4C60EF 100%)",
              borderRadius: "24px",
              padding: "2.5rem 2rem",
              minHeight: "200px",
              boxShadow: "0 20px 50px rgba(15,23,42,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f9fafb",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {heroArticle ? (
              <div
                style={{
                  maxWidth: "820px",
                  textAlign: "center",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/article/${heroArticle.id}`)}
              >
                {/* Tiêu đề lớn BÀI VIẾT NỔI BẬT */}
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginBottom: "1rem",
                  }}
                >
                  BÀI VIẾT NỔI BẬT
                </h2>

                {/* Tiêu đề bài */}
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    marginBottom: "0.7rem",
                    lineHeight: 1.4,
                  }}
                >
                  {heroArticle.title}
                </h3>

                {/* Đoạn mô tả */}
                <p
                  style={{
                    fontSize: "13px",
                    maxWidth: "760px",
                    margin: "0 auto 1.1rem",
                    lineHeight: 1.6,
                    opacity: 0.96,
                  }}
                >
                  {heroArticle.excerpt}
                </p>

                {/* Dòng thông tin dưới (giữa ô) */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "2.5rem",
                    fontSize: "11px",
                    opacity: 0.95,
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Calendar size={12} />
                    {formatDateOnly(heroArticle.publishedAt)}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Clock size={12} />
                    {heroArticle.readTime}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Eye size={12} />
                    {heroArticle.views || 0} lượt xem
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#e5e7eb" }}>
                Chưa có bài viết nổi bật.
              </div>
            )}
          </div>

          {/* Thanh category giống dòng dưới banner trong hình – CHỈ ADD */}
          <nav
            style={{
              marginTop: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              padding: "0.5rem 0.25rem 0",
              overflowX: "auto",
              position: "relative",
            }}
          >
            {/* Nút Home */}
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "999px",
                border: "none",
                background: selectedCategory === "All" ? "#111827" : "transparent",
                boxShadow:
                  selectedCategory === "All"
                    ? "0 4px 12px rgba(0,0,0,0.25)"
                    : "none",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Home
                size={16}
                color={selectedCategory === "All" ? "#ffffff" : "#111827"}
              />
            </button>

            {/* Categories */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                fontSize: "14px",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {categories
                .filter((cat) => cat.name !== "All")
                .map((cat) => (
                  <span
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    style={{
                      cursor: "pointer",
                      color: selectedCategory === cat.name ? "#111827" : "#444",
                      borderBottom:
                        selectedCategory === cat.name
                          ? "2px solid transparent"
                          : "none",
                    }}
                  >
                    {cat.name.toUpperCase()}
                  </span>
                ))}
            </div>

            {/* LINE GRADIENT */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "2px",
                background: "linear-gradient(90deg, #4C60EF, #E33B8C)",
              }}
            />
          </nav>

          {/* KHUNG TOP TRENDING CHẠY – GIỮ NGUYÊN CODE CỦA CẬU */}
          <div
            style={{
              marginTop: "1.2rem",
              background: "linear-gradient(90deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: "12px",
              padding: "0.75rem 0",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2rem",
                animation: "marquee 30s linear infinite",
                whiteSpace: "nowrap",
              }}
            >
              <style>
                {`
                  @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                  }
                `}
              </style>
              {/* Nhân đôi content để tạo hiệu ứng liền mạch */}
              {[...Array(2)].map((_, repeatIndex) => (
                <div
                  key={repeatIndex}
                  style={{
                    display: "flex",
                    gap: "2rem",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: "#22c55e",
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <TrendingUp size={14} /> Đang thịnh hành
                  </span>
                  {trendingArticles.map((item) => (
                    <span
                      key={`${repeatIndex}-${item.id}`}
                      style={{
                        color: "#e2e8f0",
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/article/${item.id}`)}
                    >
                      {item.title} · {item.readTime}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MAIN GRID – giữ nguyên từ đây xuống */}
        <main
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr)",
            gap: "1.5rem",
            alignItems: "flex-start",
          }}
        >
          {/* Left big card list */}
          <section>
            {/* Loading */}
            {loading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  background: "white",
                  borderRadius: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    width: "40px",
                    height: "40px",
                    border: "4px solid #e5e7eb",
                    borderTop: "4px solid #3b82f6",
                    borderRadius: "999px",
                    animation: "spin 1s linear infinite",
                  }}
                >
                  <style>
                    {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                  </style>
                </div>
                <p style={{ marginTop: "1rem", color: "#6b7280" }}>
                  Đang tải danh sách bài viết...
                </p>
              </div>
            )}

            {!loading && filteredArticles.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  background: "white",
                  borderRadius: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <p style={{ fontSize: "16px", color: "#6b7280" }}>
                  Không tìm thấy bài viết phù hợp. Hãy thử từ khóa hoặc bộ lọc
                  khác.
                </p>
              </div>
            )}

            {!loading && filteredArticles.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {filteredArticles.map((article) => (
                  <article
                    key={article.id}
                    onClick={() => navigate(`/article/${article.id}`)}
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      padding: "1rem",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      cursor: "pointer",
                      display: "grid",
                      gridTemplateColumns: "200px 1fr",
                      gap: "1rem",
                      alignItems: "center",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 25px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(0,0,0,0.08)";
                    }}
                  >
                    {/* Thumbnail */}
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      style={{
                        width: "100%",
                        height: "140px",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />

                    {/* Content */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.4rem",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                        }}
                      >
                        <span style={{ color: "#10b981", fontWeight: 700 }}>
                          {article.category}
                        </span>
                      </div>

                      <h2
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          marginBottom: "0.4rem",
                          color: "#111827",
                          lineHeight: 1.3,
                        }}
                      >
                        {article.title}
                      </h2>

                      <p
                        style={{
                          fontSize: "13px",
                          color: "#6b7280",
                          marginBottom: "0.65rem",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {article.excerpt}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "11px",
                          color: "#9ca3af",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <Clock size={12} />
                            {article.readTime}
                          </span>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <Eye size={12} />
                            {article.views || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Right: Latest news panel */}
          <aside>
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                padding: "1.5rem",
                maxHeight: "600px",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  Tin mới nhất
                </h3>
              </div>

              {latestArticles.length === 0 && !loading && (
                <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                  Chưa có tin mới.
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {latestArticles.map((article) => (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => navigate(`/article/${article.id}`)}
                    style={{
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      paddingBottom: "0.75rem",
                      borderBottom: "1px solid #e5e7eb",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f9fafb";
                      e.currentTarget.style.padding = "0.5rem";
                      e.currentTarget.style.borderRadius = "8px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.padding = "0";
                      e.currentTarget.style.paddingBottom = "0.75rem";
                      e.currentTarget.style.borderRadius = "0";
                    }}
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        marginBottom: "0.3rem",
                        color: "#111827",
                        lineHeight: 1.4,
                      }}
                    >
                      {article.title}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "0.4rem",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {article.excerpt}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11px",
                        color: "#9ca3af",
                      }}
                    >
                      <span>{article.category}</span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Clock size={11} />
                        {article.readTime}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
