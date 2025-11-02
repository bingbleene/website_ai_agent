import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sparkles, TrendingUp, BookOpen, Mail, Facebook, Twitter, Linkedin } from 'lucide-react';

export default function PublicLayout() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          {/* Logo */}
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none'
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
              <Sparkles size={24} color="white" />
            </div>
            <span style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#3b82f6'
            }}>
              AI News
            </span>
          </Link>

          {/* Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              color: isActive('/') ? '#3b82f6' : '#374151',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: isActive('/') ? 600 : 500,
              background: isActive('/') ? '#eff6ff' : 'transparent',
              transition: 'all 0.2s'
            }}>
              <TrendingUp size={16} />
              <span>Home</span>
            </Link>
            <Link to="/articles" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              color: isActive('/articles') ? '#3b82f6' : '#374151',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: isActive('/articles') ? 600 : 500,
              background: isActive('/articles') ? '#eff6ff' : 'transparent',
              transition: 'all 0.2s'
            }}>
              <BookOpen size={16} />
              <span>Articles</span>
            </Link>
            <Link to="/login" style={{
              padding: '0.625rem 1.25rem',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              marginLeft: '0.5rem',
              transition: 'transform 0.2s'
            }}>
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{
        background: 'linear-gradient(135deg, #111827, #1f2937)',
        color: '#d1d5db',
        padding: '3rem 1rem'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto',
          textAlign: 'center'
        }}>
          {/* Brand */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem', 
            marginBottom: '1rem' 
          }}>
            <Sparkles size={20} color="white" />
            <span style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              color: 'white' 
            }}>
              AI News
            </span>
          </div>
          
          {/* Description */}
          <p style={{ 
            fontSize: '14px', 
            marginBottom: '1rem',
            color: '#9ca3af'
          }}>
            Powered by AI for intelligent news curation and delivery.
          </p>
          
          {/* Social Links */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '0.5rem', 
            marginBottom: '1.5rem' 
          }}>
            <a href="#" style={{
              width: '36px',
              height: '36px',
              background: '#374151',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Facebook size={18} color="white" />
            </a>
            <a href="#" style={{
              width: '36px',
              height: '36px',
              background: '#374151',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Twitter size={18} color="white" />
            </a>
            <a href="#" style={{
              width: '36px',
              height: '36px',
              background: '#374151',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Linkedin size={18} color="white" />
            </a>
          </div>
          
          {/* Copyright */}
          <div style={{ 
            borderTop: '1px solid #374151', 
            paddingTop: '1.5rem', 
            fontSize: '14px',
            color: '#9ca3af'
          }}>
            © 2025 AI News Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
