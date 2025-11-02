import { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, UserCheck, UserX, Mail, Calendar } from 'lucide-react';
import { mockUsers } from '../../services/mockData';

export default function UsersManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setUsers(users.map(u =>
      u.id === id
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ));
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: { bg: '#fee2e2', color: '#ef4444' },
      editor: { bg: '#dbeafe', color: '#3b82f6' },
      author: { bg: '#d1fae5', color: '#10b981' },
      user: { bg: '#f3f4f6', color: '#6b7280' }
    };
    return colors[role] || colors.user;
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 800,
            marginBottom: '0.5rem',
            color: '#111827'
          }}>
            Users Management
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Manage user accounts and permissions
          </p>
        </div>
        <button
          onClick={() => alert('Add user feature coming soon!')}
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
          <Plus size={18} />
          New User
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
            Total Users
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>
            {users.length}
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
            Active Users
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>
            {users.filter(u => u.status === 'active').length}
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
            Admins
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ef4444' }}>
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
            Authors
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>
            {users.filter(u => u.role === 'author').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '16px',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          gap: '1rem'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              minWidth: '150px'
            }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="author">Author</option>
            <option value="user">User</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              minWidth: '150px'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                User
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                Role
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                Status
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                Articles
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                Joined
              </th>
              <th style={{ padding: '1rem', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user.id}
                style={{
                  borderBottom: index < filteredUsers.length - 1 ? '1px solid #e5e7eb' : 'none'
                }}
              >
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%'
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={12} />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: getRoleBadgeColor(user.role).bg,
                    color: getRoleBadgeColor(user.role).color,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: user.status === 'active' ? '#d1fae5' : '#fee2e2',
                    color: user.status === 'active' ? '#10b981' : '#ef4444',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {user.status === 'active' ? <UserCheck size={12} /> : <UserX size={12} />}
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#6b7280', fontSize: '14px' }}>
                  {user.articlesCount}
                </td>
                <td style={{ padding: '1rem', color: '#6b7280', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} />
                    {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: user.status === 'active' ? '#fee2e2' : '#d1fae5',
                        border: 'none',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {user.status === 'active' ? (
                        <UserX size={16} color="#ef4444" />
                      ) : (
                        <UserCheck size={16} color="#10b981" />
                      )}
                    </button>
                    <button
                      onClick={() => alert(`Edit user ${user.id}`)}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={16} color="#6b7280" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: '#fee2e2',
                        border: 'none',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
