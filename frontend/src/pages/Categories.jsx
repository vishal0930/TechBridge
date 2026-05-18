import React, { useState, useEffect } from 'react';
import { categoryService } from '../api/services';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Categories = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'read-only';

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [color, setColor] = useState('#e74c3c');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data || []);
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    setError('');
    setIsSubmitting(true);
    try {
      await categoryService.create({ name, type, color });
      setName('');
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (isReadOnly) return;
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.remove(id);
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete category');
    }
  };

  if (isLoading && categories.length === 0) return <div style={{ padding: '2rem', color: '#fff' }}>Loading...</div>;

  return (
    <div className="dashboard-container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      
      <div style={{ flex: '1 1 60%' }}>
        <h1 className="dashboard-title" style={{ marginBottom: '1.5rem' }}>Categories</h1>
        {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        
        <div className="list-card">
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: '#a0a0a0', fontWeight: '500' }}>Name</th>
                <th style={{ padding: '1rem', color: '#a0a0a0', fontWeight: '500' }}>Type</th>
                <th style={{ padding: '1rem', color: '#a0a0a0', fontWeight: '500' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: c.color || '#fff' }}></div>
                      {c.name}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`tx-amount ${c.type === 'income' ? 'income' : 'expense'}`}>
                      {c.type.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {!isReadOnly ? (
                      <button 
                        onClick={() => handleDelete(c.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <span style={{ color: '#666' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#a0a0a0' }}>No categories found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sidebar for Creation */}
      {!isReadOnly && (
        <div style={{ flex: '1 1 30%', minWidth: '300px' }}>
          <div className="chart-card" style={{ position: 'sticky', top: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#fff' }}>Add Category</h2>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#e0e0e0', fontSize: '0.875rem' }}>Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#e0e0e0', fontSize: '0.875rem' }}>Type</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#e0e0e0', fontSize: '0.875rem' }}>Color (Hex)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)} 
                    style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                  />
                  <input 
                    type="text" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)} 
                    pattern="^#[0-9A-Fa-f]{6}$"
                    title="Valid hex color like #FF5733"
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary"
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
              >
                <Plus size={18} style={{ marginRight: '8px' }}/> {isSubmitting ? 'Adding...' : 'Add Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
