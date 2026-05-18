import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { transactionService, categoryService } from '../api/services';
import { Plus, Trash2, X, Edit2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Transactions = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'read-only';

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form Data
  const initialFormState = { id: null, amount: '', type: 'expense', category_id: '', date: new Date().toISOString().split('T')[0], description: '' };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchData();
  }, [page, filterType, filterCategory]); // refetch when these change

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [txRes, catRes] = await Promise.all([
        transactionService.getAll({ 
          page, 
          limit: 20, 
          search: search || undefined,
          type: filterType || undefined,
          category_id: filterCategory || undefined
        }),
        categoryService.getAll()
      ]);
      setTransactions(txRes.data?.rows || txRes.data || []);
      setTotalPages(txRes.meta?.totalPages || 1);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // reset to first page on search
    fetchData();
  };

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await transactionService.remove(id);
      await fetchData();
    } catch (err) {
      alert('Failed to delete transaction');
    }
  }, [page, search, filterType, filterCategory]);

  const openEditModal = (tx) => {
    setFormError('');
    setIsEditMode(true);
    setFormData({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      category_id: tx.category_id || '',
      date: new Date(tx.date).toISOString().split('T')[0],
      description: tx.description || '',
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setFormError('');
    setIsEditMode(false);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category_id, 10)
      };
      
      if (isEditMode) {
        await transactionService.update(formData.id, payload);
      } else {
        await transactionService.create(payload);
      }
      
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      setFormError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isEditMode, page, search, filterType, filterCategory]);

  // Memoize filtered categories for the form
  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.type === formData.type);
  }, [categories, formData.type]);

  const getCategoryName = useCallback((id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  }, [categories]);

  // Virtual Row rendering for react-window
  const Row = ({ index, style }) => {
    const tx = transactions[index];
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ flex: 1, padding: '0 1rem' }}>{new Date(tx.date).toLocaleDateString()}</div>
        <div style={{ flex: 2, padding: '0 1rem' }}>{tx.description || '-'}</div>
        <div style={{ flex: 1, padding: '0 1rem' }}>{tx.category_name || getCategoryName(tx.category_id)}</div>
        <div style={{ flex: 1, padding: '0 1rem', textAlign: 'right' }}>
          <span className={`tx-amount ${tx.type === 'income' ? 'income' : 'expense'}`}>
            {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
          </span>
        </div>
        <div style={{ flex: 1, padding: '0 1rem', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {!isReadOnly && (
            <>
              <button onClick={() => openEditModal(tx)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(tx.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            </>
          )}
          {isReadOnly && <span style={{ color: '#666' }}>-</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="dashboard-title">Transactions</h1>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', background: '#2a2a2a', borderRadius: '8px', padding: '0.25rem 0.5rem' }}>
            <Search size={16} color="#a0a0a0" style={{ margin: '0 8px' }} />
            <input 
              type="text" 
              placeholder="Search description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', padding: '0.5rem' }}
            />
          </form>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} color="#a0a0a0" />
            <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} style={{ padding: '0.5rem', borderRadius: '8px', background: '#2a2a2a', color: '#fff', border: '1px solid #333' }}>
              <option value="">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} style={{ padding: '0.5rem', borderRadius: '8px', background: '#2a2a2a', color: '#fff', border: '1px solid #333' }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {!isReadOnly && (
            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={16} /> Add
            </button>
          )}
        </div>
      </div>

      <div className="list-card" style={{ marginTop: '2rem', padding: '0' }}>
        {/* Header Row */}
        <div style={{ display: 'flex', padding: '1rem 0', borderBottom: '1px solid #333', color: '#a0a0a0', fontWeight: '500' }}>
          <div style={{ flex: 1, padding: '0 1rem' }}>Date</div>
          <div style={{ flex: 2, padding: '0 1rem' }}>Description</div>
          <div style={{ flex: 1, padding: '0 1rem' }}>Category</div>
          <div style={{ flex: 1, padding: '0 1rem', textAlign: 'right' }}>Amount</div>
          <div style={{ flex: 1, padding: '0 1rem', textAlign: 'center' }}>Actions</div>
        </div>
        
        {/* Transactions List */}
        {isLoading && transactions.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Loading...</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#a0a0a0' }}>No transactions found.</div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto', color: '#fff' }}>
            {transactions.map((tx, index) => (
              <Row key={tx.id} index={index} style={{ height: '60px' }} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem', gap: '1rem', color: '#fff' }}>
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          disabled={page === 1}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: page === 1 ? '#333' : '#2a2a2a', color: '#fff', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
          disabled={page === totalPages || totalPages === 0}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: page === totalPages ? '#333' : '#2a2a2a', color: '#fff', border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && !isReadOnly && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="auth-card" style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#a0a0a0', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#fff' }}>
              {isEditMode ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            
            {formError && <div className="auth-error" style={{ marginBottom: '1rem' }}>{formError}</div>}
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: '#e0e0e0', fontSize: '0.875rem' }}>Type</label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value, category_id: ''})}
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: '#e0e0e0', fontSize: '0.875rem' }}>Amount (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={formData.amount} 
                    onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                    required
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#e0e0e0', fontSize: '0.875rem' }}>Category</label>
                <select 
                  value={formData.category_id} 
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  required
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                >
                  <option value="" disabled>Select a category</option>
                  {filteredCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {filteredCategories.length === 0 && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>
                    No {formData.type} categories found. Please <Link to="/categories" onClick={() => setIsModalOpen(false)} style={{ color: '#a855f7', textDecoration: 'underline' }}>create one</Link> first.
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#e0e0e0', fontSize: '0.875rem' }}>Date</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                  required
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#e0e0e0', fontSize: '0.875rem' }}>Description (Optional)</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Grocery shopping"
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || filteredCategories.length === 0}
                className="btn-primary"
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
              >
                {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Transaction')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
