// CRM Frontend konfiguratsiya
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Auth header yaratish uchun yordamchi funksiya
export function getAuthHeaders() {
    const token = localStorage.getItem('crm_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// Auth bilan fetch qilish uchun yordamchi funksiya
export async function authFetch(url, options = {}) {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: { ...headers, ...options.headers }
    });

    // Token muddati tugagan bo'lsa
    if (response.status === 401) {
        localStorage.removeItem('crm_token');
        window.location.reload();
        throw new Error('Avtorizatsiya muddati tugagan');
    }

    return response;
}

export default API_BASE_URL;
