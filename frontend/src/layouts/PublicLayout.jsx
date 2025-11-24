// layouts/PublicLayout.jsx
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Facebook, Twitter, Linkedin } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function PublicLayout() {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#020617",
          borderBottom: "1px solid #020617",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "68px",
            gap: "1.5rem",
          }}
        >
          {/* LOGO */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            <img
              src="https://static.vecteezy.com/system/resources/previews/014/022/754/non_2x/ai-technology-digital-artificial-intelligence-future-circuit-electronic-colorful-logo-design-vector.jpg"
              alt="AI News Hub"
              style={{ width: 45, height: 45, objectFit: "contain" }}
            />
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#f9fafb",
              }}
            >
              Tin tức AI
            </span>
          </Link>

          {/* SEARCH BAR */}
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{
              flex: 1,
              maxWidth: "720px",
              display: "flex",
              alignItems: "stretch",
              background: "#ffffff",
              borderRadius: "999px",
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
            }}
          >
            <input
              type="text"
              placeholder="Tìm kiếm tin tức, chủ đề, công ty liên quan AI..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "0.65rem 1.1rem",
                fontSize: "14px",
                color: "#111827",
              }}
            />
            <button
              type="submit"
              style={{
                border: "none",
                outline: "none",
                padding: "0 2.2rem",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                background: "#22c55e",
                color: "#022c22",
                borderRadius: "999px",
              }}
            >
              Tìm kiếm
            </button>
          </form>

          {/* NAVIGATION */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.75rem",
              color: "#e5e7eb",
              fontSize: "14px",
              whiteSpace: "nowrap",
            }}
          >
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: isActive("/") ? "#22c55e" : "#e5e7eb",
                fontWeight: isActive("/") ? 600 : 500,
              }}
            >
              Trang chủ
            </Link>

            <Link
              to="/articles"
              style={{
                textDecoration: "none",
                color: isActive("/articles") ? "#22c55e" : "#e5e7eb",
                fontWeight: isActive("/articles") ? 600 : 500,
              }}
            >
              Bài viết
            </Link>

            {!isAuthenticated && (
              <Link
                to="/login"
                style={{
                  marginLeft: "0.25rem",
                  padding: "0.35rem 0.9rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.9)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  textDecoration: "none",
                  color: "#e5e7eb",
                  fontSize: "14px",
                  fontWeight: 500,
                  boxShadow: "0 0 0 1px rgba(15,23,42,0.7)",
                }}
              >
                <span>Đăng nhập</span>
              </Link>
            )}

            {isAuthenticated && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    style={{
                      textDecoration: "none",
                      color: isActive("/admin") ? "#22c55e" : "#e5e7eb",
                      fontWeight: isActive("/admin") ? 600 : 500,
                    }}
                  >
                    Quản trị
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  style={{
                    marginLeft: "0.25rem",
                    padding: "0.35rem 0.9rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(148,163,184,0.9)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "transparent",
                    textDecoration: "none",
                    color: "#e5e7eb",
                    fontSize: "14px",
                    fontWeight: 500,
                    boxShadow: "0 0 0 1px rgba(15,23,42,0.7)",
                    cursor: "pointer",
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* NỘI DUNG TRANG */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer
        style={{
          background: "linear-gradient(135deg, #111827, #1f2937)",
          color: "#d1d5db",
          padding: "3rem 1rem",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <Sparkles size={20} color="white" />
            <span
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "white",
              }}
            >
              AI News
            </span>
          </div>

          <p
            style={{
              fontSize: "14px",
              marginBottom: "1rem",
              color: "#9ca3af",
            }}
          >
            Vận hành bởi AI để chọn lọc và phân phối tin tức thông minh.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <a
              href="#"
              style={{
                width: "36px",
                height: "36px",
                background: "#374151",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Facebook size={18} color="white" />
            </a>
            <a
              href="#"
              style={{
                width: "36px",
                height: "36px",
                background: "#374151",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Twitter size={18} color="white" />
            </a>
            <a
              href="#"
              style={{
                width: "36px",
                height: "36px",
                background: "#374151",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Linkedin size={18} color="white" />
            </a>
          </div>

          <div
            style={{
              borderTop: "1px solid #374151",
              paddingTop: "1.5rem",
              fontSize: "14px",
              color: "#9ca3af",
            }}
          >
            © 2025 Hệ thống quản lý tin tức AI. Đã đăng ký bản quyền.
          </div>
        </div>
      </footer>
    </div>
  );
}
