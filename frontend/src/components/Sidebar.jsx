import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Tags, Users as UsersIcon, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/transactions', icon: <Receipt size={20} />, label: 'Transactions' },
    { path: '/analytics', icon: <PieChart size={20} />, label: 'Analytics' },
  ];

  if (user?.role !== 'read-only') {
    navItems.push({ path: '/categories', icon: <Tags size={20} />, label: 'Categories' });
  }

  if (user?.role === 'admin') {
    navItems.push({ path: '/users', icon: <UsersIcon size={20} />, label: 'Users' });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Receipt size={28} />
        <span>MoneyLens</span>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
          <div className="user-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="user-info" style={{ flex: 1 }}>
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role || 'user'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <button 
            onClick={toggleTheme}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0', fontSize: '0.875rem' }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button 
            onClick={logout} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', background: 'none', 
              border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '0',
              fontSize: '0.875rem'
            }}
            title="Logout"
          >
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;
