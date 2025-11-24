// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import LearnMore from "./pages/LearnMore";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import Chatbot from "./components/public/Chatbot";

// Pages
import Home from "./pages/Home";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import ArticlesManagement from "./pages/admin/ArticlesManagement";
import ArticleDetailWithLogs from "./pages/admin/ArticleDetailWithLogs";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import Settings from "./pages/admin/Settings";

// Route chỉ cho user đã đăng nhập
function PrivateRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/articles" />;
  }

  return children;
}

// Route chỉ cho người CHƯA đăng nhập
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return children;

  if (user?.role === "admin") return <Navigate to="/admin" />;

  return <Navigate to="/articles" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN: không dùng layout (không có header/footer) */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        {/* PUBLIC: dùng chung PublicLayout (có header/footer) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/article/:id" element={<ArticleDetail />} />

          {/* ⭐ Thêm Learn More ở đây */}
          <Route path="/learn-more" element={<LearnMore />} />
        </Route>

        {/* ADMIN: layout riêng */}
        <Route
          path="/admin"
          element={
            <PrivateRoute requireAdmin={true}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="articles" element={<ArticlesManagement />} />
          <Route path="articles/:id" element={<ArticleDetailWithLogs />} />
          <Route path="categories" element={<CategoriesManagement />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>

      <Chatbot />
    </BrowserRouter>
  );
}

export default App;
