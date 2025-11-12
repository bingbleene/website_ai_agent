import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Users, 
  BarChart3,
  Settings,
  Bot,
  Sparkles
} from 'lucide-react';

export default function AdminSidebar() {
  const location = useLocation();
  
  const menuSections = [
    {
      title: 'Main',
      items: [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
      ]
    },
    {
      title: 'Content',
      items: [
        { path: '/admin/articles', icon: FileText, label: 'Articles' },
        { path: '/admin/comments', icon: MessageSquare, label: 'Comments' },
      ]
    },
    {
      title: 'Management',
      items: [
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/ai', icon: Bot, label: 'AI Tools' },
      ]
    },
    {
      title: 'System',
      items: [
        { path: '/admin/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ];
  
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Brand */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Admin Panel</h2>
            <p className="text-xs text-gray-400">AI News System</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto">
        {menuSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <div className="space-y-1 px-3">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition group ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold">AI Credits</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <p className="text-xs text-gray-400">750 / 1000 credits</p>
        </div>
      </div>
    </aside>
  );
}
