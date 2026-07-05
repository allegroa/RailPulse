import api from "./api";

// CLIENTS
export const listClients = async () => (await api.get("/api/admin/clients")).data;
export const createClient = async (body) => (await api.post("/api/admin/clients", body)).data;
export const createClientFolder = async (body) => (await api.post("/api/admin/clients/create-folder", body)).data;
export const deleteClient = async (id) => (await api.delete(`/api/admin/clients/${id}`)).data;

// USERS
export const listUsers = async (params) => (await api.get("/api/admin/users", { params })).data;
export const createUser = async (body) => (await api.post("/api/admin/users", body)).data;
export const changeUserRole = async (id, role) =>
  (await api.patch(`/api/admin/users/${id}/role`, { role })).data;
export const resetUserPassword = async (id, newPassword) =>
  (await api.post(`/api/admin/users/${id}/reset-password`, { newPassword })).data;
export const deleteUserProfile = async (id) =>
  (await api.delete(`/api/admin/users/${id}`)).data;

// GROUPS
export const listGroups = async (params) => (await api.get("/api/admin/groups", { params })).data;
export const createGroup = async (body) => (await api.post("/api/admin/groups", body)).data;
export const addGroupMembers = async (groupId, userIds) =>
  (await api.post(`/api/admin/groups/${groupId}/members`, { userIds })).data;
export const removeGroupMember = async (groupId, userId) =>
  (await api.delete(`/api/admin/groups/${groupId}/members/${userId}`)).data;

export const getMetrics = async () => (await api.get('/api/admin/metrics')).data;
