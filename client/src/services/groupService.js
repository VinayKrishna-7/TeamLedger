import api from './api.js';

export const groupService = {
  getAllGroups: async () => {
    const res = await api.get('/groups');
    return res.data;
  },

  getGroupById: async (groupId) => {
    const res = await api.get(`/groups/${groupId}`);
    return res.data;
  },

  createGroup: async ({ name, description, memberNames }) => {
    const res = await api.post('/groups', { name, description, memberNames });
    return res.data;
  },

  updateGroup: async (groupId, { name, description }) => {
    const res = await api.patch(`/groups/${groupId}`, { name, description });
    return res.data;
  },

  deleteGroup: async (groupId) => {
    const res = await api.delete(`/groups/${groupId}`);
    return res.data;
  },

  addMember: async (groupId, name) => {
    const res = await api.post(`/groups/${groupId}/members`, { name });
    return res.data;
  },

  updateMember: async (groupId, memberId, name) => {
    const res = await api.patch(`/groups/${groupId}/members/${memberId}`, { name });
    return res.data;
  },

  deleteMember: async (groupId, memberId) => {
    const res = await api.delete(`/groups/${groupId}/members/${memberId}`);
    return res.data;
  },
};
