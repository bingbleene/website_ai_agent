import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { LogIn, Loader, Mail, Lock, Sparkles, AlertCircle, User, Shield } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' or 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Mock login - không cần xác thực thật
      const mockUser = {
        id: role === 'admin' ? 1 : 2,
        email: email || 'user@example.com',
        name: role === 'admin' ? 'Admin User' : 'Regular User',
        role: role,
        avatar: `https://ui-avatars.com/api/?name=${role === 'admin' ? 'Admin' : 'User'}&background=${role === 'admin' ? '3b82f6' : '8b5cf6'}&color=fff`
      };
      
      const mockToken = 'mock_token_' + Date.now();
      
      // Save to auth store
      setAuth(mockUser, mockToken, mockToken);
      
      // Navigate based on role
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Side */}
      <div style={{
        display: 'none',
        width: '50%',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb, #8b5cf6)',
        padding: '3rem',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }} className="lg-flex">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={28} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'white' }}>AI News Platform</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Powered by Advanced AI</div>
            </div>
          </div>
          
          <h1 style={{
            fontSize: '48px',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.2,
            marginBottom: '1.5rem'
          }}>
            Welcome Back to<br />the Future of News
          </h1>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
            Manage your AI-powered news platform with intelligent content generation.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem'
        }}>
          {['1000+ Articles', '50+ Categories', '24/7 Support'].map((text, i) => (
            <div key={i} style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.2)',
              textAlign: 'center',
              fontSize: '14px',
              color: 'white',
              fontWeight: 600
            }}>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#f9fafb'
      }}>
        <div style={{ width: '100%', maxWidth: '448px' }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            padding: '2rem'
          }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '0.5rem' }}>Sign In</h2>
              <p style={{ color: '#6b7280' }}>Enter your credentials to access your account</p>
            </div>

            {error && (
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '1rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                color: '#dc2626'
              }}>
                <AlertCircle size={20} />
                <span style={{ fontSize: '14px' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '0.75rem'
                }}>Login As</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem'
                }}>
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    style={{
                      padding: '1rem',
                      border: role === 'user' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      background: role === 'user' ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: role === 'user' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#f3f4f6',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User size={24} color={role === 'user' ? 'white' : '#9ca3af'} />
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: role === 'user' ? '#3b82f6' : '#6b7280'
                    }}>
                      User
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      textAlign: 'center'
                    }}>
                      Browse articles
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    style={{
                      padding: '1rem',
                      border: role === 'admin' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      background: role === 'admin' ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: role === 'admin' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#f3f4f6',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Shield size={24} color={role === 'admin' ? 'white' : '#9ca3af'} />
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: role === 'admin' ? '#3b82f6' : '#6b7280'
                    }}>
                      Admin
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      textAlign: 'center'
                    }}>
                      Manage content
                    </div>
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'admin' ? 'admin@example.com' : 'user@example.com'}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              {/* Demo Note */}
              <div style={{
                padding: '0.75rem 1rem',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                fontSize: '13px',
                color: '#92400e'
              }}>
                💡 <strong>Demo Mode:</strong> Enter any email/password to login as {role === 'admin' ? 'Admin' : 'User'}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: loading ? '#9ca3af' : (role === 'admin' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)'),
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Signing in as {role}...
                  </>
                ) : (
                  <>
                    {role === 'admin' ? <Shield size={20} /> : <User size={20} />}
                    Sign In as {role === 'admin' ? 'Admin' : 'User'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
