import React, { useState, useEffect } from 'react';
import { userService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Users = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getAll();
      setUsers(res.data?.rows || res.data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-container">
        <div style={{ padding: '2rem', color: '#ef4444', textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p style={{ marginTop: '1rem', color: '#a0a0a0' }}>Only administrators can view the Users directory.</p>
        </div>
      </div>
    );
  }

  if (isLoading && users.length === 0) return <div style={{ padding: '2rem', color: '#fff' }}>Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Users Directory</h1>
      </div>

      <div className="list-card" style={{ marginTop: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
              <th style={{ padding: '1rem', color: '#a0a0a0', fontWeight: '500' }}>User</th>
              <th style={{ padding: '1rem', color: '#a0a0a0', fontWeight: '500' }}>Email</th>
              <th style={{ padding: '1rem', color: '#a0a0a0', fontWeight: '500' }}>Role</th>
              <th style={{ padding: '1rem', color: '#a0a0a0', fontWeight: '500' }}>Status</th>
              <th style={{ padding: '1rem', color: '#a0a0a0', fontWeight: '500' }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                      {getInitials(u.name)}
                    </div>
                    <span>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem', color: '#a0a0a0' }}>{u.email}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    backgroundColor: u.role === 'admin' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    color: u.role === 'admin' ? '#c084fc' : '#60a5fa'
                  }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px',
                    color: u.is_active ? '#2ecc71' : '#e74c3c'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: u.is_active ? '#2ecc71' : '#e74c3c' }}></span>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#a0a0a0' }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#a0a0a0' }}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
