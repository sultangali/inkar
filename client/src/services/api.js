import api from '../lib/axios';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  }
};

export const workspaceService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/workspaces', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/workspaces/${id}`);
    return response.data;
  },

  create: async (workspaceData) => {
    const response = await api.post('/workspaces', workspaceData);
    return response.data;
  },

  update: async (id, workspaceData) => {
    const response = await api.put(`/workspaces/${id}`, workspaceData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/workspaces/${id}`);
    return response.data;
  },

  getAvailability: async (id, date) => {
    const response = await api.get(`/workspaces/${id}/availability`, {
      params: { date }
    });
    return response.data;
  }
};

export const bookingService = {
  create: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getMy: async (filters = {}) => {
    const response = await api.get('/bookings', { params: filters });
    return response.data;
  },

  getAll: async (filters = {}) => {
    const response = await api.get('/bookings/all', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  cancel: async (id, reason) => {
    const response = await api.patch(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  confirm: async (id) => {
    const response = await api.patch(`/bookings/${id}/confirm`);
    return response.data;
  },

  complete: async (id) => {
    const response = await api.patch(`/bookings/${id}/complete`);
    return response.data;
  }
};

export const analyticsService = {
  getKPI: async () => {
    const response = await api.get('/analytics/kpi');
    return response.data;
  },

  getRevenue: async (params = {}) => {
    const response = await api.get('/analytics/revenue', { params });
    return response.data;
  },

  getWorkspacePopularity: async (params = {}) => {
    const response = await api.get('/analytics/workspace-popularity', { params });
    return response.data;
  },

  getRevenueByType: async (params = {}) => {
    const response = await api.get('/analytics/revenue-by-type', { params });
    return response.data;
  },

  getPaymentMethods: async () => {
    const response = await api.get('/analytics/payment-methods');
    return response.data;
  },

  getBookingTrends: async (days = 30) => {
    const response = await api.get('/analytics/booking-trends', {
      params: { days }
    });
    return response.data;
  },

  getUserStatistics: async () => {
    const response = await api.get('/analytics/users');
    return response.data;
  }
};

export const adminService = {
  getUsers: async (filters = {}) => {
    const response = await api.get('/admin/users', { params: filters });
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  }
};

export const contactService = {
  sendMessage: async (messageData) => {
    const response = await api.post('/contact', messageData);
    return response.data;
  },

  getMessages: async (filters = {}) => {
    const response = await api.get('/contact', { params: filters });
    return response.data;
  },

  getMessage: async (id) => {
    const response = await api.get(`/contact/${id}`);
    return response.data;
  },

  updateMessage: async (id, status) => {
    const response = await api.patch(`/contact/${id}`, { status });
    return response.data;
  },

  deleteMessage: async (id) => {
    const response = await api.delete(`/contact/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/contact/stats');
    return response.data;
  }
};

