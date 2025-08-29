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
  stream(): EventSource {
    const token = localStorage.getItem('token');
    // Note: EventSource does not allow setting headers; if auth is required, use a token query param or fallback to no auth
    const url = new URL(apiClient.defaults.baseURL + '/analytics/stream');
    if (token) url.searchParams.set('token', token);
    return new EventSource(url.toString());
  },
  downloadDailyPdf(date?: string) {
    return apiClient.post('/analytics/report/daily', null, {
      params: date ? { date } : {},
      responseType: 'blob',
    }).then(res => res.data as Blob);
  }
};
