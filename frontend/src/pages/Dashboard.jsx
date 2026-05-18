import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell
} from 'recharts';
import { ArrowUp, ArrowDown, Wallet, FileText, ShoppingCart, Briefcase, Bus, ArrowRight, Plus } from 'lucide-react';
import { analyticsService, transactionService } from '../api/services';
import './Dashboard.css';

const COLORS = ['#e74c3c', '#f39c12', '#3498db', '#9b59b6', '#95a5a6', '#2ecc71'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Data States
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const [summaryRes, trendsRes, catRes, txRes] = await Promise.all([
        analyticsService.getSummary(month, year),
        analyticsService.getIncomeVsExpense(),
        analyticsService.getByCategory(month, year),
        transactionService.getAll({ limit: 5 })
      ]);

      setSummary({
        income: summaryRes.data?.income || 0,
        expense: summaryRes.data?.expense || 0,
        balance: summaryRes.data?.net || 0
      });
      
      // Map bar data
      if (trendsRes.data) {
        setBarData(trendsRes.data.map(d => ({
          name: d.month,
          income: Number(d.income),
          expense: Number(d.expense)
        })));
      }

      // Map pie data
      if (catRes.data) {
        setPieData(catRes.data.map((c, i) => ({
          name: c.category,
          value: Number(c.total),
          color: COLORS[i % COLORS.length]
        })));
      }

      // Map transactions
      if (txRes.data && txRes.data.rows) {
        setRecentTransactions(txRes.data.rows);
      }

    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconForCategory = (catName) => {
    const name = catName?.toLowerCase() || '';
    if (name.includes('food') || name.includes('grocer')) return <ShoppingCart size={20} />;
    if (name.includes('transport') || name.includes('travel') || name.includes('ride')) return <Bus size={20} />;
    if (name.includes('salary') || name.includes('job') || name.includes('work')) return <Briefcase size={20} />;
    return <FileText size={20} />;
  };

  if (isLoading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="header-actions">
          <div className="month-pill">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
          <button className="btn-primary" onClick={() => navigate('/transactions')}>
            <Plus size={16} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-header">
            <ArrowUp size={16} /> Total Income
          </div>
          <div className="card-value">₹{Number(summary.income).toLocaleString()}</div>
        </div>
        <div className="summary-card">
          <div className="card-header">
            <ArrowDown size={16} /> Total Expense
          </div>
          <div className="card-value">₹{Number(summary.expense).toLocaleString()}</div>
        </div>
        <div className="summary-card">
          <div className="card-header">
            <Wallet size={16} /> Net Balance
          </div>
          <div className="card-value">₹{Number(summary.balance).toLocaleString()}</div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Income vs Expense</span>
            <span className="chart-subtitle">Last 6 months</span>
          </div>
          <div style={{ width: '100%', height: 250 }}>
            {barData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a0a0', fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip cursor={{fill: '#2a2a2a'}} contentStyle={{ backgroundColor: '#222', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="income" fill="#2ecc71" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="expense" fill="#e74c3c" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#6a6a6a' }}>
                 No data available
               </div>
            )}
          </div>
        </div>
        
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Expense by Category</span>
          </div>
          <div style={{ width: '100%', height: 250 }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer>
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#222', border: 'none', borderRadius: '8px' }} />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
               <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#6a6a6a' }}>
                 No expenses this month
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="bottom-grid">
        <div className="list-card">
          <div className="list-header">
            <span className="list-title">Recent Transactions</span>
            <span className="view-all" onClick={() => navigate('/transactions')} style={{ cursor: 'pointer' }}>
              View all <ArrowRight size={14} />
            </span>
          </div>
          <div className="transaction-list">
            {recentTransactions.map(tx => (
              <div className="transaction-item" key={tx.id}>
                <div className="tx-left">
                  <div className={`tx-icon ${tx.type}`}>
                    {getIconForCategory(tx.category)}
                  </div>
                  <div className="tx-details">
                    <span className="tx-name">{tx.description || tx.category}</span>
                    <span className="tx-category">{tx.category} • {new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`tx-amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                </span>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div style={{ padding: '1rem 0', color: '#a0a0a0', textAlign: 'center' }}>
                No recent transactions
              </div>
            )}
          </div>
        </div>
        
        <div className="list-card">
          <div className="list-header">
            <span className="list-title">Top Spending</span>
          </div>
          <div className="spending-list">
            {pieData.map((item, idx) => {
              const maxVal = Math.max(...pieData.map(d => d.value));
              const pct = (item.value / maxVal) * 100;
              return (
                <div className="spending-item" key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="spending-name">{item.name}</span>
                    <span style={{ fontSize: '0.875rem', color: '#e0e0e0' }}>₹{item.value.toLocaleString()}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {pieData.length === 0 && (
              <div style={{ padding: '1rem 0', color: '#a0a0a0', textAlign: 'center' }}>
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
