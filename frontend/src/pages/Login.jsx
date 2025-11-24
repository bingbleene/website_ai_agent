import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import {
  Loader,
  Mail,
  Lock,
  AlertCircle,
  User,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔹 Gửi yêu cầu đăng nhập...", { email, role });

      // Backend FastAPI: /auth/login nhận { email, password }
      const response = await authAPI.login({
        email,
        password,
      });

      console.log("✅ Login response:", response);
      console.log("✅ Response.data:", response?.data);

      const { user, access_token, refresh_token } = response.data || {};

      if (!user || !access_token) {
        console.error("❌ Missing user or access_token in response");
        setError("Không lấy được thông tin người dùng từ máy chủ.");
        setLoading(false);
        return;
      }

      console.log("✅ Extracted:", { user, access_token, refresh_token });

      // LƯU VÀO ZUSTAND (authStore)
      // setAuth(user, accessToken, refreshToken)
      setAuth(user, access_token, refresh_token);

      console.log("✅ Store after setAuth:", useAuthStore.getState());

      // Ưu tiên role từ backend, nếu chưa có thì fallback theo ô chọn
      const finalRole = user.role || role || "user";
      console.log("Final role:", finalRole);

      if (finalRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/articles");
      }
    } catch (err) {
      console.error("❌ Login error:", err);

      // Nếu backend FastAPI trả {"detail": "..."}
      const backendMessage =
        err?.response?.data?.detail || err?.message || null;

      setError(
        backendMessage === "Invalid credentials"
          ? "Email hoặc mật khẩu không đúng."
          : backendMessage || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = role === "admin" ? "Quản trị viên" : "Người dùng";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #111827 0, #020617 60%, #000 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        color: "#e5e7eb",
      }}
    >
      <div style={{ maxWidth: "420px", width: "100%", textAlign: "center" }}>
        {/* logo */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              width: "90px",
              height: "90px",
              margin: "0 auto 1.25rem",
              borderRadius: "24px",
              background:
                "linear-gradient(145deg, rgba(59,130,246,0.25), rgba(56,189,248,0.35))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "20px",
                backgroundColor: "#020617",
                border: "1px solid rgba(148,163,184,0.25)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "#e5e7eb",
                letterSpacing: "0.15em",
              }}
            >
              <span style={{ fontSize: "22px" }}>AI</span>
              <span style={{ opacity: 0.8, fontSize: "11px" }}>TODAY</span>
            </div>
          </div>

          <p
            style={{
              fontSize: "13px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#9ca3af",
            }}
          >
            Bản tin hằng ngày từ một AI engineer
          </p>

          <p
            style={{
              fontSize: "13px",
              color: "#9ca3af",
              marginBottom: "0.75rem",
            }}
          >
            Góc nhìn, thử nghiệm, công cụ và suy nghĩ thực tế về AI
          </p>

          <span
            style={{
              fontSize: "11px",
              color: "#38bdf8",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Khu vực đăng nhập riêng
          </span>
        </div>

        {/* Login card */}
        <div
          style={{
            backgroundColor: "#020617",
            borderRadius: "28px",
            padding: "2rem 1.75rem",
            boxShadow:
              "0 20px 70px rgba(0,0,0,0.70), 0 0 0 1px rgba(148,163,184,0.18)",
          }}
        >
          <h1
            style={{
              fontSize: "21px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              marginBottom: "0.75rem",
            }}
          >
            Chào mừng quay lại
          </h1>

          <p
            style={{
              fontSize: "13px",
              color: "#9ca3af",
              marginBottom: "1.8rem",
            }}
          >
            Đăng nhập để truy cập vùng quản lý tin tức và nội dung AI chuyên sâu
          </p>

          {/* Error */}
          {error && (
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                padding: "1rem",
                background: "rgba(248,113,113,0.15)",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: "12px",
                color: "#fecaca",
                marginBottom: "1.5rem",
              }}
            >
              <AlertCircle size={18} />
              <span style={{ fontSize: "13px" }}>{error}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            {/* ROLE SELECT */}
            <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.6rem",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Đăng nhập với vai trò
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                {/* USER */}
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  style={{
                    padding: "1rem",
                    borderRadius: "14px",
                    border:
                      role === "user"
                        ? "2px solid #3b82f6"
                        : "2px solid rgba(148,163,184,0.25)",
                    background:
                      role === "user" ? "rgba(59,130,246,0.15)" : "#0f172a",
                    cursor: "pointer",
                    color: role === "user" ? "#3b82f6" : "#9ca3af",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <User size={24} />
                  <span>Người dùng</span>
                </button>

                {/* ADMIN */}
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  style={{
                    padding: "1rem",
                    borderRadius: "14px",
                    border:
                      role === "admin"
                        ? "2px solid #3b82f6"
                        : "2px solid rgba(148,163,184,0.25)",
                    background:
                      role === "admin" ? "rgba(59,130,246,0.15)" : "#0f172a",
                    cursor: "pointer",
                    color: role === "admin" ? "#3b82f6" : "#9ca3af",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Shield size={24} />
                  <span>Quản trị viên</span>
                </button>
              </div>
            </div>

            {/* EMAIL */}
            <div style={{ marginBottom: "1.25rem", textAlign: "left" }}>
              <label style={{ fontSize: "13px", fontWeight: 600 }}>
                Địa chỉ email
              </label>
              <div style={{ position: "relative", marginTop: "0.4rem" }}>
                <Mail
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6b7280",
                  }}
                />
                <input
                  type="email"
                  placeholder={
                    role === "admin" ? "admin@example.com" : "user@example.com"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem 0.85rem 2.75rem",
                    background: "#0f172a",
                    border: "1px solid rgba(148,163,184,0.4)",
                    borderRadius: "14px",
                    color: "#e5e7eb",
                  }}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
              <label style={{ fontSize: "13px", fontWeight: 600 }}>
                Mật khẩu
              </label>

              <div style={{ position: "relative", marginTop: "0.4rem" }}>
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6b7280",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "#6b7280",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.85rem 2.75rem",
                    background: "#0f172a",
                    border: "1px solid rgba(148,163,184,0.4)",
                    borderRadius: "14px",
                    color: "#e5e7eb",
                  }}
                />
              </div>
            </div>

            {/* REMEMBER + FORGOT */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1.75rem",
                fontSize: "13px",
              }}
            >
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Ghi nhớ đăng nhập
              </label>

              <button
                type="button"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#38bdf8",
                  cursor: "pointer",
                }}
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.9rem",
                borderRadius: "100px",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                border: "none",
                color: "#fff",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "15px",
              }}
            >
              {loading ? "Đang xử lý..." : `Đăng nhập với tư cách ${roleLabel}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
