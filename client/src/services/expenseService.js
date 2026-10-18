import api from './api.js';

export const expenseService = {
  getGroupExpenses: async (groupId, params = {}) => {
    const res = await api.get(`/groups/${groupId}/expenses`, { params });
    return res.data;
  },

  getExpenseById: async (expenseId) => {
    const res = await api.get(`/expenses/${expenseId}`);
    return res.data;
  },

  createExpense: async (groupId, expenseData) => {
    const res = await api.post(`/groups/${groupId}/expenses`, expenseData);
    return res.data;
  },

  updateExpense: async (expenseId, expenseData) => {
    const res = await api.patch(`/expenses/${expenseId}`, expenseData);
    return res.data;
  },

  deleteExpense: async (expenseId) => {
    const res = await api.delete(`/expenses/${expenseId}`);
    return res.data;
  },
};
