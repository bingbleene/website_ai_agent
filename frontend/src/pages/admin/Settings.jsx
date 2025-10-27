import { useState } from 'react';
import { User, Mail, Lock, Bell, Key, Database, Server, Save, Upload, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@ainews.com',
    bio: 'System Administrator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // App Settings
  const [appSettings, setAppSettings] = useState({
    siteName: 'AI News Hub',
    siteDescription: 'Your source for AI and technology news',
    logo: '/logo.png',
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'MM/DD/YYYY'
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    newArticleNotification: true,
    newCommentNotification: true,
    weeklyDigest: true,
    securityAlerts: true
  });

  // API Settings
  const [apiSettings, setApiSettings] = useState({
    apiKey: 'sk-proj-••••••••••••••••••••••••••••',
    apiEndpoint: 'https://api.openai.com/v1',
    rateLimit: '60',
    timeout: '30'
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'app', label: 'Application', icon: Server },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API Settings', icon: Key },
    { id: 'system', label: 'System Info', icon: Database }
  ];

  const handleSaveProfile = () => {
    alert('Profile settings saved successfully!');
  };

  const handleSaveApp = () => {
    alert('Application settings saved successfully!');
  };

  const handleSaveNotifications = () => {
    alert('Notification settings saved successfully!');
  };

  const handleSaveAPI = () => {
    alert('API settings saved successfully!');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 800,
          marginBottom: '0.5rem',
          color: '#111827'
        }}>
          Settings
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Manage your application settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '0.5rem',
        overflowX: 'auto'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>
            Profile Settings
          </h2>

          {/* Avatar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              Profile Picture
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                src={profileData.avatar}
                alt="Profile"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%'
                }}
              />
              <button
                onClick={() => alert('Upload avatar feature coming soon!')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Upload size={16} />
                Change Avatar
              </button>
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              Full Name
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              Email Address
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Bio */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              Bio
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Change Password */}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '1rem', color: '#111827' }}>
              Change Password
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={profileData.currentPassword}
                  onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '3rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={18} color="#6b7280" /> : <Eye size={18} color="#6b7280" />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={profileData.newPassword}
                onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={profileData.confirmPassword}
                onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveProfile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '1.5rem'
            }}
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      )}

      {/* App Settings */}
      {activeTab === 'app' && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>
            Application Settings
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              Site Name
            </label>
            <input
              type="text"
              value={appSettings.siteName}
              onChange={(e) => setAppSettings({ ...appSettings, siteName: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              Site Description
            </label>
            <textarea
              value={appSettings.siteDescription}
              onChange={(e) => setAppSettings({ ...appSettings, siteDescription: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              Timezone
            </label>
            <select
              value={appSettings.timezone}
              onChange={(e) => setAppSettings({ ...appSettings, timezone: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (US & Canada)</option>
              <option value="America/Chicago">Central Time (US & Canada)</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              Language
            </label>
            <select
              value={appSettings.language}
              onChange={(e) => setAppSettings({ ...appSettings, language: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="en">English</option>
              <option value="vi">Vietnamese</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              Date Format
            </label>
            <select
              value={appSettings.dateFormat}
              onChange={(e) => setAppSettings({ ...appSettings, dateFormat: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <button
            onClick={handleSaveApp}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>
            Notification Settings
          </h2>

          {Object.entries(notificationSettings).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                marginBottom: '0.5rem',
                background: '#f9fafb',
                borderRadius: '12px'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {key === 'emailNotifications' && 'Receive notifications via email'}
                  {key === 'pushNotifications' && 'Receive push notifications'}
                  {key === 'newArticleNotification' && 'Get notified when new articles are published'}
                  {key === 'newCommentNotification' && 'Get notified about new comments'}
                  {key === 'weeklyDigest' && 'Receive weekly summary of activities'}
                  {key === 'securityAlerts' && 'Receive important security alerts'}
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: value ? '#3b82f6' : '#cbd5e1',
                  borderRadius: '24px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '',
                    height: '18px',
                    width: '18px',
                    left: value ? '29px' : '3px',
                    bottom: '3px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: '0.3s'
                  }}></span>
                </span>
              </label>
            </div>
          ))}

          <button
            onClick={handleSaveNotifications}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '1.5rem'
            }}
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      )}

      {/* API Settings */}
      {activeTab === 'api' && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>
            API Settings
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              API Key
            </label>
            <input
              type="text"
              value={apiSettings.apiKey}
              onChange={(e) => setApiSettings({ ...apiSettings, apiKey: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'monospace'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              API Endpoint
            </label>
            <input
              type="text"
              value={apiSettings.apiEndpoint}
              onChange={(e) => setApiSettings({ ...apiSettings, apiEndpoint: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              Rate Limit (requests/minute)
            </label>
            <input
              type="number"
              value={apiSettings.rateLimit}
              onChange={(e) => setApiSettings({ ...apiSettings, rateLimit: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              Timeout (seconds)
            </label>
            <input
              type="number"
              value={apiSettings.timeout}
              onChange={(e) => setApiSettings({ ...apiSettings, timeout: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={handleSaveAPI}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      )}

      {/* System Info */}
      {activeTab === 'system' && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>
            System Information
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{
              padding: '1.5rem',
              background: '#f9fafb',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
                Application Version
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>
                v1.0.0
              </div>
            </div>

            <div style={{
              padding: '1.5rem',
              background: '#f9fafb',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
                Database Status
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                Connected
              </div>
            </div>

            <div style={{
              padding: '1.5rem',
              background: '#f9fafb',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
                Storage Used
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>
                2.4 GB
              </div>
            </div>

            <div style={{
              padding: '1.5rem',
              background: '#f9fafb',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
                API Calls Today
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>
                1,234
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '1rem', color: '#111827' }}>
              Environment
            </h3>
            <div style={{
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '12px',
              fontFamily: 'monospace',
              fontSize: '13px'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>Node Version: v18.17.0</div>
              <div style={{ marginBottom: '0.5rem' }}>React Version: 18.2.0</div>
              <div style={{ marginBottom: '0.5rem' }}>Build Date: {new Date().toLocaleDateString()}</div>
              <div>Environment: Production</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
