import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, FileText, FolderTree, Users, Settings, LogOut, 
  Sparkles, Bell, Search 
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: FileText, label: 'Articles', path: '/admin/articles' },
    { icon: FolderTree, label: 'Categories', path: '/admin/categories' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return window.location.pathname === '/admin';
    }
    return window.location.pathname.startsWith(path);
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: '#111827',
        color: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Brand */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #374151',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '18px' }}>Admin Panel</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>AI News Platform</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem' }}>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleMenuClick(item.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  color: 'white',
                  textDecoration: 'none',
                  marginBottom: '0.5rem',
                  transition: 'all 0.2s',
                  background: active ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => !active && (e.currentTarget.style.background = '#1f2937')}
                onMouseOut={(e) => !active && (e.currentTarget.style.background = 'transparent')}
              >
                <item.icon size={20} />
                <span style={{ fontWeight: 500 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* AI Credits */}
        <div style={{
          padding: '1rem',
          margin: '1rem',
          background: '#1f2937',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '0.5rem' }}>AI Credits</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700 }}>750 / 1000</span>
            <span style={{ fontSize: '12px', color: '#22c55e' }}>75%</span>
          </div>
          <div style={{
            height: '6px',
            background: '#374151',
            borderRadius: '999px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: '75%',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
            }} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <header style={{
          height: '64px',
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '400px', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search..."
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{
              position: 'relative',
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              <Bell size={20} color="#6b7280" />
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                background: '#ef4444',
                borderRadius: '999px',
                border: '2px solid white'
              }} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              paddingLeft: '1rem',
              borderLeft: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600
              }}>
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{user?.full_name || 'Admin'}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{user?.role || 'Administrator'}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                background: '#fef2f2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '2rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
