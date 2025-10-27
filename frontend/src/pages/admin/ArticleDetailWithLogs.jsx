import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Calendar, Edit2, Trash2, CheckCircle, XCircle, Terminal, Zap, FileText, Search, Brain } from 'lucide-react';
import { getArticleById } from '../../services/mockData';
import { getAIAgentLogs, getAILogsSummary } from '../../services/aiAgentLogs';

export default function ArticleDetailWithLogs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = getArticleById(id);
  const [activeTab, setActiveTab] = useState('content');
  const [expandedLog, setExpandedLog] = useState(null);
  
  const aiLogs = getAIAgentLogs(id);
  const logsSummary = getAILogsSummary(id);

  if (!article) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h1 style={{ fontSize: '48px', color: '#9ca3af' }}>404</h1>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>Article not found</p>
        <button
          onClick={() => navigate('/admin/articles')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Back to Articles
        </button>
      </div>
    );
  }

  const getAgentIcon = (type) => {
    switch(type) {
      case 'generator': return <FileText size={20} />;
      case 'research': return <Search size={20} />;
      case 'verification': return <CheckCircle size={20} />;
      case 'optimization': return <Zap size={20} />;
      case 'media': return <Eye size={20} />;
      default: return <Brain size={20} />;
    }
  };

  const getAgentColor = (type) => {
    switch(type) {
      case 'generator': return '#3b82f6';
      case 'research': return '#8b5cf6';
      case 'verification': return '#10b981';
      case 'optimization': return '#f59e0b';
      case 'media': return '#ec4899';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1.5rem 2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/admin/articles')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: '#3b82f6',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft size={16} />
            Back to Articles Management
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 800,
                marginBottom: '0.5rem',
                color: '#111827'
              }}>
                {article.title}
              </h1>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  background: '#eff6ff',
                  color: '#3b82f6',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  {article.category}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '14px' }}>
                  <Calendar size={14} />
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '14px' }}>
                  <Eye size={14} />
                  {article.views.toLocaleString()} views
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => alert('Edit article')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => alert('Delete article')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <button
              onClick={() => setActiveTab('content')}
              style={{
                padding: '1rem 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'content' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === 'content' ? '#3b82f6' : '#6b7280',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Article Content
            </button>
            <button
              onClick={() => setActiveTab('ai-logs')}
              style={{
                padding: '1rem 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'ai-logs' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === 'ai-logs' ? '#3b82f6' : '#6b7280',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Terminal size={16} />
              AI Agent Logs
              <span style={{
                padding: '0.25rem 0.5rem',
                background: '#eff6ff',
                color: '#3b82f6',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {aiLogs.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
        {activeTab === 'content' ? (
          // Article Content Tab
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '3rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        ) : (
          // AI Logs Tab
          <div>
            {/* Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Total Agents Used
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>
                  {logsSummary.totalAgents}
                </div>
              </div>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Total Processing Time
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>
                  {logsSummary.totalTime}s
                </div>
              </div>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Success Rate
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>
                  {logsSummary.successRate}%
                </div>
              </div>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Quality Score
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>
                  {logsSummary.qualityScore}/10
                </div>
              </div>
            </div>

            {/* Agent Logs */}
            {aiLogs.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '4rem 2rem',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 1.5rem',
                  borderRadius: '50%',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Terminal size={40} color="#9ca3af" />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>
                  No AI Agent Logs Available
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  maxWidth: '500px',
                  margin: '0 auto'
                }}>
                  This article was not created using AI agents, or the logs are not available. 
                  AI-generated articles will show detailed logs of the generation process here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {aiLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Agent Header */}
                  <div
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      background: expandedLog === log.id ? '#f9fafb' : 'white',
                      borderBottom: expandedLog === log.id ? '1px solid #e5e7eb' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: `${getAgentColor(log.agentType)}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: getAgentColor(log.agentType)
                      }}>
                        {getAgentIcon(log.agentType)}
                      </div>
                      <div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#111827',
                          marginBottom: '0.25rem'
                        }}>
                          {log.agentName}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem'
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} />
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span>Duration: {log.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: log.status === 'completed' ? '#d1fae5' : '#fee2e2',
                        color: log.status === 'completed' ? '#10b981' : '#ef4444',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600
                      }}>
                        {log.status === 'completed' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {log.status}
                      </span>
                      <span style={{
                        fontSize: '18px',
                        color: '#9ca3af',
                        transform: expandedLog === log.id ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s'
                      }}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Expanded Logs */}
                  {expandedLog === log.id && (
                    <div style={{ padding: '1.5rem' }}>
                      {/* Output Summary */}
                      <div style={{
                        background: '#f9fafb',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#111827',
                          marginBottom: '0.75rem'
                        }}>
                          Output Summary
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: '1rem'
                        }}>
                          {Object.entries(log.output).map(([key, value]) => (
                            <div key={key}>
                              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '0.25rem' }}>
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </div>
                              <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                                {value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Detailed Logs */}
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#111827',
                        marginBottom: '0.75rem'
                      }}>
                        Execution Logs
                      </div>
                      <div style={{
                        background: '#1f2937',
                        borderRadius: '8px',
                        padding: '1rem',
                        fontFamily: 'Monaco, Courier New, monospace',
                        fontSize: '13px',
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}>
                        {log.logs.map((entry, idx) => (
                          <div
                            key={idx}
                            style={{
                              color: '#f3f4f6',
                              marginBottom: '0.5rem',
                              display: 'flex',
                              gap: '1rem'
                            }}
                          >
                            <span style={{ color: '#9ca3af', minWidth: '80px' }}>[{entry.time}]</span>
                            <span>{entry.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
