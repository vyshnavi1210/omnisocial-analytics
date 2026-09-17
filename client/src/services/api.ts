import axios from 'axios';
import {
  User,
  PlatformAccount,
  Post,
  OverviewKPIs,
  SentimentSummary,
  SentimentLog,
  AudienceDemographics
} from '../types/index.js';

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Attach JWT token from localStorage to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('omnisocial_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    return res.data;
  },
  demoLogin: async (role: 'admin' | 'manager' | 'viewer') => {
    const res = await api.post<{ token: string; user: User }>('/auth/demo-login', { role });
    return res.data;
  },
  register: async (name: string, email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/register', { name, email, password });
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get<{ user: User }>('/auth/me');
    return res.data.user;
  }
};

// Analytics API
export const analyticsApi = {
  getOverview: async () => {
    const res = await api.get<{
      kpis: OverviewKPIs;
      platforms: PlatformAccount[];
      topPosts: Post[];
    }>('/analytics/overview');
    return res.data;
  },
  getHistorical: async (days: number = 30, platform?: string) => {
    const res = await api.get<{
      days: number;
      series: any[];
      platformHistory: Record<string, any[]>;
    }>('/analytics/historical', {
      params: { days, platform }
    });
    return res.data;
  },
  getSentiment: async () => {
    const res = await api.get<{
      summary: SentimentSummary;
      logs: SentimentLog[];
    }>('/analytics/sentiment');
    return res.data;
  },
  getDemographics: async () => {
    const res = await api.get<AudienceDemographics>('/analytics/demographics');
    return res.data;
  },
  getPeakHours: async () => {
    const res = await api.get<{ heatmap: { day: string; dayIndex: number; hour: number; intensity: number }[] }>('/analytics/peak-hours');
    return res.data;
  },
  exportCsvUrl: () => '/api/analytics/export'
};

// Posts API
export const postsApi = {
  getPosts: async (status?: string, platform?: string) => {
    const res = await api.get<{ posts: Post[] }>('/posts', {
      params: { status, platform }
    });
    return res.data.posts;
  },
  createPost: async (postData: {
    platforms: string[];
    content: string;
    mediaUrl?: string;
    scheduledAt?: string;
    isDraft?: boolean;
  }) => {
    const res = await api.post<{ message: string; post: Post }>('/posts', postData);
    return res.data;
  },
  updatePost: async (id: string, updates: Partial<Post>) => {
    const res = await api.put<{ message: string; post: Post }>(`/posts/${id}`, updates);
    return res.data;
  },
  deletePost: async (id: string) => {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },
  publishNow: async (id: string) => {
    const res = await api.post<{ message: string; post: Post }>(`/posts/${id}/publish`);
    return res.data;
  }
};

// Platforms API
export const platformsApi = {
  getPlatforms: async () => {
    const res = await api.get<{ platforms: PlatformAccount[] }>('/platforms');
    return res.data.platforms;
  },
  updatePlatform: async (platform: string, config: Partial<PlatformAccount>) => {
    const res = await api.put<{ message: string; platform: PlatformAccount }>(`/platforms/${platform}`, config);
    return res.data;
  },
  testConnection: async (platform: string) => {
    const res = await api.post<{ platform: string; success: boolean; message: string }>(`/platforms/${platform}/test`);
    return res.data;
  },
  syncPlatform: async (platform: string) => {
    const res = await api.post<{ message: string; platform: PlatformAccount }>(`/platforms/${platform}/sync`);
    return res.data;
  }
};

// Team API (Admin only)
export const teamApi = {
  getTeam: async () => {
    const res = await api.get<{ users: User[]; auditLogs: any[] }>('/team');
    return res.data;
  },
  inviteMember: async (userData: { name: string; email: string; role: string; password?: string }) => {
    const res = await api.post<{ message: string; user: User }>('/team', userData);
    return res.data;
  },
  updateRole: async (userId: string, role: string) => {
    const res = await api.patch<{ message: string; user: User }>(`/team/${userId}/role`, { role });
    return res.data;
  },
  deleteMember: async (userId: string) => {
    const res = await api.delete(`/team/${userId}`);
    return res.data;
  }
};
