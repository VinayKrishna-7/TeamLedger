import api from './api.js';

export const settlementService = {
  getBalances: async (groupId) => {
    const res = await api.get(`/groups/${groupId}/balances`);
    return res.data;
  },

  getSettlementPlan: async (groupId) => {
    const res = await api.get(`/groups/${groupId}/settlement-plan`);
    return res.data;
  },

  getGroupSettlements: async (groupId) => {
    const res = await api.get(`/groups/${groupId}/settlements`);
    return res.data;
  },

  recordSettlement: async (groupId, settlementData) => {
    const res = await api.post(`/groups/${groupId}/settlements`, settlementData);
    return res.data;
  },
};
