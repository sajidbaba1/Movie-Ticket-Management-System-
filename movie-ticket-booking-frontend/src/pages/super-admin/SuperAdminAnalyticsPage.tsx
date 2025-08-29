import React, { useMemo, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import type { AnalyticsResponse } from '../../services/analyticsService';
import { useQuery } from '@tanstack/react-query';
import { Card, Select, Loading } from '../../components/ui';
import { formatCurrency } from '../../utils';

const SuperAdminAnalyticsPage: React.FC = () => {
  const [range, setRange] = useState<'7' | '30' | '90' | '365'>('30');

  const { data, isLoading } = useQuery<AnalyticsResponse>({
    queryKey: ['super-admin-analytics', range],
    queryFn: () => {
      const to = new Date();
      const from = new Date();
      const days = Number(range);
      from.setDate(to.getDate() - (days - 1));
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      return analyticsService.superAdmin({ from: fmt(from), to: fmt(to) });
    }
  });

  const kpis = useMemo(() => ({
    revenue: data?.kpis?.revenue ?? 0,
    bookings: data?.kpis?.bookings ?? 0,
    completed: data?.kpis?.completed ?? 0,
    cancelled: data?.kpis?.cancelled ?? 0,
    utilization: data?.kpis?.utilization ?? 0,
    movies: data?.system?.movies ?? 0,
    theaters: data?.system?.theaters ?? 0,
    users: data?.system?.users ?? 0,
  }), [data]);

  const rangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '365', label: 'Last year' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Analytics 📊</h1>
            <p className="text-gray-600">Earnings, bookings, and platform overview</p>
          </div>
          <div className="w-full sm:w-56">
            <Select value={range} onChange={(e) => setRange(e.target.value as any)} options={rangeOptions} />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card padding="lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-2xl mr-4">💰</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(Number(kpis.revenue))}</p>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
              </div>
            </div>
          </Card>
          <Card padding="lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-2xl mr-4">🎫</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{kpis.bookings}</p>
                <p className="text-sm font-medium text-gray-600">Bookings</p>
              </div>
            </div>
          </Card>
          <Card padding="lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-2xl mr-4">📈</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{(kpis.utilization * 100).toFixed(0)}%</p>
                <p className="text-sm font-medium text-gray-600">Seat Utilization</p>
              </div>
            </div>
          </Card>
          <Card padding="lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-2xl mr-4">❌</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{kpis.cancelled}</p>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Platform Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Movies</h3>
            <p className="text-3xl font-bold text-primary-600">{kpis.movies}</p>
          </Card>
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Theaters</h3>
            <p className="text-3xl font-bold text-primary-600">{kpis.theaters}</p>
          </Card>
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Users</h3>
            <p className="text-3xl font-bold text-primary-600">{kpis.users}</p>
          </Card>
        </div>

        {/* Trends & Top Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings Trend</h3>
            <div className="space-y-2">
              {data?.trend?.map((d) => (
                <div key={d.date} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{d.date}</span>
                  <span className="font-semibold text-gray-900">{d.bookings}</span>
                </div>
              ))}
              {(!data || data.trend.length === 0) && (
                <div className="text-gray-500 text-sm">No data in selected range.</div>
              )}
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Theaters (Revenue)</h3>
            <div className="space-y-2">
              {data?.tops?.theaters?.map((t, idx) => (
                <div key={`${t.name}-${idx}`} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t.name}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(Number(t.revenue))}</span>
                </div>
              ))}
              {(!data || data.tops.theaters.length === 0) && (
                <div className="text-gray-500 text-sm">No data available.</div>
              )}
            </div>
          </Card>
        </div>

        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Movies (Revenue)</h3>
          <div className="space-y-2">
            {data?.tops?.movies?.map((m, idx) => (
              <div key={`${m.title}-${idx}`} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{m.title}</span>
                <span className="font-semibold text-gray-900">{formatCurrency(Number(m.revenue))}</span>
              </div>
            ))}
            {(!data || data.tops.movies.length === 0) && (
              <div className="text-gray-500 text-sm">No data available.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminAnalyticsPage;
