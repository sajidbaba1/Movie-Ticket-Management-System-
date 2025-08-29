import apiClient from './api';

export type GroupBy = 'day' | 'week' | 'month';

export interface AnalyticsResponse {
  kpis: {
    revenue: number;
    bookings: number;
    completed: number;
    cancelled: number;
    utilization?: number;
  };
  trend: Array<{ date: string; bookings: number }>;
  tops: {
    movies: Array<{ title: string; revenue: number }>;
    theaters: Array<{ name: string; revenue: number }>;
  };
  system?: {
    movies: number;
    theaters: number;
    users: number;
  };
}

export const analyticsService = {
  superAdmin(params: { from?: string; to?: string }) {
    return apiClient.get<AnalyticsResponse>('/analytics/super-admin', { params }).then((r: { data: AnalyticsResponse }) => r.data);
  },
  owner(params: { theaterId?: number; from?: string; to?: string }) {
    return apiClient.get<AnalyticsResponse>('/analytics/owner', { params }).then((r: { data: AnalyticsResponse }) => r.data);
  },
  customer(params: { userId: number; from?: string; to?: string }) {
    return apiClient.get<AnalyticsResponse>('/analytics/customer', { params }).then((r: { data: AnalyticsResponse }) => r.data);
  },
};
