import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from './pages/Home';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import ArticlesManagement from './pages/admin/ArticlesManagement';
import ArticleDetailWithLogs from './pages/admin/ArticleDetailWithLogs';
import CategoriesManagement from './pages/admin/CategoriesManagement';
import UsersManagement from './pages/admin/UsersManagement';
import Settings from './pages/admin/Settings';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="articles" element={<Articles />} />
          <Route path="article/:id" element={<ArticleDetail />} />
        </Route>
        
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/admin"
          element={
            <PrivateRoute>
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
    </BrowserRouter>
  );
}

export default App;
