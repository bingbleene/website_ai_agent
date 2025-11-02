import { Sparkles, Clock, Eye, ArrowRight, Zap, Brain, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  
  const colors = [
    { bg: '#3b82f6', dark: '#2563eb' },
    { bg: '#8b5cf6', dark: '#7c3aed' },
    { bg: '#ec4899', dark: '#db2777' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #3b82f6, #2563eb, #8b5cf6)',
        color: 'white',
        padding: '5rem 1rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div style={{
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
            fontWeight: 600
          }}>
            <Sparkles size={16} />
            <span>AI-Powered News Platform</span>
          </div>

          <h1 style={{
            fontSize: '56px',
            fontWeight: 800,
            marginBottom: '1.5rem',
            lineHeight: 1.2
          }}>
            Stay Ahead with AI-Curated News
          </h1>

          <p style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Discover the latest insights in artificial intelligence, machine learning,
            and technology. Curated by advanced AI for maximum relevance.
          </p>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
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
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Explore Articles
              <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => alert('Learn more coming soon!')}
              style={{
                padding: '1rem 2rem',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Learn More
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            marginTop: '4rem',
            maxWidth: '600px',
            margin: '4rem auto 0'
          }}>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '0.25rem' }}>1000+</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Articles</div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '0.25rem' }}>50+</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Topics</div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '0.25rem' }}>24/7</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Updated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 1rem', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              padding: '2rem',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Zap size={28} color="white" />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '0.75rem',
                color: '#111827'
              }}>
                AI-Powered Curation
              </h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>
                Our advanced AI algorithms curate the most relevant and impactful news for you.
              </p>
            </div>

            <div style={{
              padding: '2rem',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Brain size={28} color="white" />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '0.75rem',
                color: '#111827'
              }}>
                Smart Analysis
              </h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>
                Deep insights and analysis powered by cutting-edge machine learning models.
              </p>
            </div>

            <div style={{
              padding: '2rem',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #ec4899, #db2777)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Rocket size={28} color="white" />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '0.75rem',
                color: '#111827'
              }}>
                Real-time Updates
              </h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>
                Stay updated with the latest developments in AI and technology as they happen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Preview Section */}
      <section style={{ padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#111827'
            }}>
              Latest Articles
            </h2>
            <button 
              onClick={() => alert('View all articles coming soon!')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              View All
              <ArrowRight size={18} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[1, 2, 3].map((i) => {
              const color = colors[i - 1];
              
              return (
                <div 
                  key={i} 
                  onClick={() => alert(`Reading article ${i}...`)}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{
                    height: '180px',
                    background: `linear-gradient(135deg, ${color.bg}, ${color.dark})`
                  }} />
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      marginBottom: '0.75rem',
                      color: '#111827'
                    }}>
                      AI Technology Article {i}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '1rem'
                    }}>
                      Brief description of the article content goes here...
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={14} />
                        <span>5 min read</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Eye size={14} />
                        <span>1.2K views</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 1rem',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Sparkles size={48} style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{
            fontSize: '40px',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            Ready to Explore More?
          </h2>
          <p style={{
            fontSize: '18px',
            marginBottom: '2rem',
            color: 'rgba(255,255,255,0.9)'
          }}>
            Join thousands of readers staying ahead with AI-powered news curation.
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
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
}
