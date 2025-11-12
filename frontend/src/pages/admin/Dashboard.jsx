import { BarChart3, FileText, MessageSquare, Users, TrendingUp, Eye, Clock, Sparkles } from 'lucide-react';
import { getStats } from '../../services/mockData';

export default function Dashboard() {
  const data = getStats();
  
  const stats = [
    { label: 'Total Articles', value: data.publishedArticles, change: '+12%', icon: FileText, bgColor: '#eff6ff', iconColor: '#3b82f6' },
    { label: 'Comments', value: data.totalComments.toLocaleString(), change: '+23%', icon: MessageSquare, bgColor: '#f0fdf4', iconColor: '#22c55e' },
    { label: 'Active Users', value: data.activeUsers, change: '+5%', icon: Users, bgColor: '#faf5ff', iconColor: '#a855f7' },
    { label: 'Total Views', value: (data.totalViews / 1000).toFixed(1) + 'K', change: '+18%', icon: Eye, bgColor: '#fff7ed', iconColor: '#f97316' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Welcome back! Here's what's happening today.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: stat.bgColor,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={24} color={stat.iconColor} />
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#22c55e'
                }}>
                  {stat.change}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>{stat.label}</p>
              <p style={{ fontSize: '32px', fontWeight: 700, marginTop: '0.25rem' }}>{stat.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
