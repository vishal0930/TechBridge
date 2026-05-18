import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, CartesianGrid,
  LineChart, Line
} from 'recharts';
import { analyticsService } from '../api/services';
import './Dashboard.css';

const COLORS = ['#e74c3c', '#f39c12', '#3498db', '#9b59b6', '#95a5a6', '#2ecc71', '#1abc9c', '#e67e22'];

const Analytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAnalyticsData();
  }, [month, year]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [trendsRes, catRes] = await Promise.all([
        analyticsService.getIncomeVsExpense(),
        analyticsService.getByCategory(month, year),
      ]);

      if (trendsRes.data) {
        setBarData(trendsRes.data.map(d => ({
          name: d.month,
          income: Number(d.income),
          expense: Number(d.expense)
        })));
      }

      if (catRes.data) {
        setPieData(catRes.data.map((c, i) => ({
          name: c.category,
          value: Number(c.total),
          color: COLORS[i % COLORS.length]
        })));
      }
    } catch (err) {
      console.error('Failed to load analytics data', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Analytics</h1>
        <div className="header-actions">
          <select 
            value={month} 
            onChange={e => setMonth(parseInt(e.target.value))}
            style={{ padding: '0.5rem', borderRadius: '8px', background: '#2a2a2a', color: '#fff', border: '1px solid #333' }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select 
            value={year} 
            onChange={e => setYear(parseInt(e.target.value))}
            style={{ padding: '0.5rem', borderRadius: '8px', background: '#2a2a2a', color: '#fff', border: '1px solid #333' }}
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '2rem', color: '#fff' }}>Loading Analytics...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
          
          <div className="chart-card" style={{ width: '100%' }}>
            <div className="chart-header">
              <span className="chart-title">Income vs Expense Trends</span>
            </div>
            <div style={{ width: '100%', height: 400 }}>
              {barData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                    <XAxis dataKey="name" stroke="#a0a0a0" />
                    <YAxis stroke="#a0a0a0" tickFormatter={(val) => `₹${val/1000}k`} />
                    <RechartsTooltip cursor={{fill: '#2a2a2a'}} contentStyle={{ backgroundColor: '#222', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="income" fill="#2ecc71" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#e74c3c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#6a6a6a' }}>
                  No trend data available
                </div>
              )}
            </div>
          </div>

          <div className="chart-card" style={{ width: '100%' }}>
            <div className="chart-header">
              <span className="chart-title">Net Balance Trends (Line Chart)</span>
            </div>
            <div style={{ width: '100%', height: 350 }}>
              {barData.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                    <XAxis dataKey="name" stroke="#a0a0a0" />
                    <YAxis stroke="#a0a0a0" tickFormatter={(val) => `₹${val/1000}k`} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#222', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="net" stroke="#3498db" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#6a6a6a' }}>
                  No trend data available
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div className="chart-card" style={{ flex: '1 1 400px' }}>
              <div className="chart-header">
                <span className="chart-title">Expenses Breakdown ({new Date(year, month-1).toLocaleString('default', { month: 'long', year: 'numeric' })})</span>
              </div>
              <div style={{ width: '100%', height: 350 }}>
                {pieData.length > 0 ? (
                  <ResponsiveContainer>
                    <RechartsPie>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={130}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
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
            
            <div className="list-card" style={{ flex: '1 1 300px' }}>
              <div className="list-header">
                <span className="list-title">Category Summary</span>
              </div>
              <div className="spending-list" style={{ marginTop: '1rem' }}>
                {pieData.map((item, idx) => {
                  const maxVal = Math.max(...pieData.map(d => d.value));
                  const pct = (item.value / maxVal) * 100;
                  return (
                    <div className="spending-item" key={idx} style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span className="spending-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></span>
                          {item.name}
                        </span>
                        <span style={{ fontSize: '1rem', color: '#fff', fontWeight: '500' }}>₹{item.value.toLocaleString()}</span>
                      </div>
                      <div className="progress-bar-bg" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${pct}%`, backgroundColor: item.color, height: '100%' }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                {pieData.length === 0 && (
                  <div style={{ padding: '2rem', color: '#a0a0a0', textAlign: 'center' }}>
                    No data for this month
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
