import api from './axios';

// ─── TRANSACTIONS ──────────────────────────────────────────────────────────────
export const transactionService = {
  getAll: async (params) => {
    const res = await api.get('/transactions', { params });
    return res.data;
  },
  getOne: async (id) => {
    const res = await api.get(`/transactions/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/transactions', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.patch(`/transactions/${id}`, data);
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`/transactions/${id}`);
    return res.data;
  }
};

// ─── CATEGORIES ────────────────────────────────────────────────────────────────
export const categoryService = {
  getAll: async () => {
    const res = await api.get('/categories');
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/categories', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.patch(`/categories/${id}`, data);
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  }
};

// ─── ANALYTICS ─────────────────────────────────────────────────────────────────
export const analyticsService = {
  getSummary: async (month, year) => {
    const res = await api.get('/analytics/summary', { params: { month, year } });
    return res.data;
  },
  getByCategory: async (month, year) => {
    const res = await api.get('/analytics/by-category', { params: { month, year } });
    return res.data;
  },
  getTrends: async () => {
    const res = await api.get('/analytics/trends');
    return res.data;
  },
  getIncomeVsExpense: async () => {
    const res = await api.get('/analytics/income-vs-expense');
    return res.data;
  },
  getTopCategories: async (month, year) => {
    const res = await api.get('/analytics/top-categories', { params: { month, year } });
    return res.data;
  }
};

// ─── USERS ─────────────────────────────────────────────────────────────────────
export const userService = {
  getAll: async (params) => {
    const res = await api.get('/users', { params });
    return res.data;
  },
  getOne: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
  updateRole: async (id, role, isActive) => {
    const res = await api.patch(`/users/${id}/role`, { role, is_active: isActive });
    return res.data;
  }
};
