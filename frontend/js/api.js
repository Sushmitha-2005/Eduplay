// API Configuration and Helper Functions
const API_BASE_URL = 'https://eduplay-4.onrender.com/api';

// Get auth token from localStorage
function getToken() {
    return localStorage.getItem('eduplay_token');
}

// API Request Helper
async function apiRequest(endpoint, method = 'GET', data = null) {
    const config = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const token = getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
const AuthAPI = {
    login: (email, password) => apiRequest('/auth/login', 'POST', { email, password }),
    register: (username, email, password) => apiRequest('/auth/register', 'POST', { username, email, password }),
    getCurrentUser: () => apiRequest('/auth/me')
};

// Games API
const GamesAPI = {
    getConfig: (gameType) => apiRequest(`/games/config/${gameType}`),
    submitScore: (data) => apiRequest('/games/score', 'POST', data),
    getHistory: (gameType, limit = 10) => apiRequest(`/games/history/${gameType}?limit=${limit}`)
};

// Performance API
const PerformanceAPI = {
    getDashboard: () => apiRequest('/performance/dashboard'),
    getRecommendations: () => apiRequest('/performance/recommendations'),
    getChartData: (days = 30) => apiRequest(`/performance/chart-data?days=${days}`)
};
