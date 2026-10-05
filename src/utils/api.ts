const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rriadueyhvxycymxchrw.supabase.co';
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyaWFkdWV5aHZ4eWN5bXhjaHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5OTkxMDEsImV4cCI6MjA4NDU3NTEwMX0.tPmUfwdddvRKNQdqfIWpuEZB6ZuJYdNuxPT2bzW6w4U';

const API_BASE = `${supabaseUrl}/functions/v1/make-server-9296dadf`;

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Set auth token to localStorage
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

// Clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

// API request helper
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '요청 처리 중 오류가 발생했습니다.');
  }

  return data;
}

// Auth API
export const authAPI = {
  signup: async (email: string, password: string, name: string) => {
    return apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },
};

// Profile API
export const profileAPI = {
  get: async () => {
    return apiRequest('/profile');
  },
  
  update: async (name: string, phone: string) => {
    return apiRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, phone }),
    });
  },
};

// Contacts API
export const contactsAPI = {
  get: async () => {
    return apiRequest('/contacts');
  },
  
  save: async (contacts: any[]) => {
    return apiRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify({ contacts }),
    });
  },
};

// Trips API
export const tripsAPI = {
  get: async () => {
    return apiRequest('/trips');
  },
  
  save: async (trips: any[]) => {
    return apiRequest('/trips', {
      method: 'POST',
      body: JSON.stringify({ trips }),
    });
  },
};

// Messages API
export const messagesAPI = {
  get: async () => {
    return apiRequest('/messages');
  },
  
  save: async (messages: any[]) => {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  },
};
