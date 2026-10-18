import api from './api.js';

export const dashboardService = {
  getSummary: async () => {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },

  getRecentExpenses: async (limit = 10) => {
    const res = await api.get('/dashboard/recent-expenses', { params: { limit } });
    return res.data;
  },
};
