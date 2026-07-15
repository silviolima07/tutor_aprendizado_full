// frontend/src/config.js
// Configuração centralizada da API

// Em desenvolvimento, usa localhost
// Em produção (build), usa URL relativa (mesmo domínio)
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment
    ? 'http://localhost:8000/api'  // Desenvolvimento local
    : '/api';  // Produção (mesmo domínio)

export const API_URL = API_BASE_URL;

// Endpoints específicos (opcional, mas organizado)
export const API_ENDPOINTS = {
    adminMetrics: `${API_BASE_URL}/admin/metrics`,
    adminDashboard: `${API_BASE_URL}/admin/dashboard`,
    users: `${API_BASE_URL}/mock/users`,
    createUser: `${API_BASE_URL}/mock/users`,
    dashboard: `${API_BASE_URL}/mock/dashboard`,
    finops: `${API_BASE_URL}/mock/finops`,
    // Adicione outros endpoints conforme necessário
};