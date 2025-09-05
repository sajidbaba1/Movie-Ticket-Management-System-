import React, { useEffect, useMemo, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import type { AnalyticsResponse } from '../../services/analyticsService';
import { useQuery } from '@tanstack/react-query';
import { Card, Select, Loading } from '../../components/ui';
import EChart from '../../components/charts/EChart';
import { formatCurrency } from '../../utils';
import * as echarts from 'echarts/core';

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

  const [events, setEvents] = useState<Array<{ id: string; type: string; payload?: any; at?: string }>>([]);
  const [displayData, setDisplayData] = useState<AnalyticsResponse | undefined>(undefined);

  useEffect(() => {
    const es = analyticsService.stream();
    const onMessage = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data);
        setEvents(prev => [{ id: String(Date.now()), type: data.type || 'EVENT', payload: data.payload, at: data.at }, ...prev].slice(0, 50));
        if (data?.payload) {
          // Use live payload to update displayed analytics (non-destructive merge)
          setDisplayData((prev) => ({ ...(prev || {} as any), ...(data.payload || {}) } as AnalyticsResponse));
        }
      } catch (_) {
        // ignore parse errors
      }
    };
    es.addEventListener('message', onMessage);
    es.onerror = () => {
      es.close();
    };
    return () => {
      es.removeEventListener('message', onMessage as any);
      es.close();
    };
  }, []);

  // When REST data changes (range filter), reset displayData baseline
  useEffect(() => {
    if (data) setDisplayData(data);
  }, [data]);

  const kpis = useMemo(() => ({
    revenue: displayData?.kpis?.revenue ?? 0,
    bookings: displayData?.kpis?.bookings ?? 0,
    completed: displayData?.kpis?.completed ?? 0,
    cancelled: displayData?.kpis?.cancelled ?? 0,
    utilization: displayData?.kpis?.utilization ?? 0,
    movies: displayData?.system?.movies ?? 0,
    theaters: displayData?.system?.theaters ?? 0,
    users: displayData?.system?.users ?? 0,
  }), [displayData]);

  // Charts: Neon theme options
  const bookingsTrendOption = useMemo(() => {
    const dates = (displayData?.trend || []).map(d => d.date);
    const values = (displayData?.trend || []).map(d => d.bookings);
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#6ee7b7' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#6ee7b7' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } },
      },
      series: [
        {
          name: 'Bookings',
          type: 'line',
          smooth: true,
          data: values,
          showSymbol: false,
          lineStyle: { width: 3, color: '#22d3ee', shadowColor: 'rgba(34,211,238,0.6)', shadowBlur: 10 },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(34,211,238,0.35)' },
                { offset: 1, color: 'rgba(34,211,238,0.02)' },
              ],
            },
          },
        },
      ],
    } as const;
  }, [displayData]);

  // Revenue trend line
  const revenueTrendOption = useMemo(() => {
    const items = (displayData?.revenueTrend || []);
    const dates = items.map(i => i.date);
    const values = items.map(i => Number(i.revenue || 0));
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', formatter: (params: any) => `${params[0].axisValue}<br/>Revenue: ${formatCurrency(Number(params[0].data))}` },
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: dates, boundaryGap: false, axisLine: { lineStyle: { color: '#a78bfa' } }, axisLabel: { color: '#94a3b8' } },
      yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } } },
      series: [{
        name: 'Revenue', type: 'line', smooth: true, data: values, showSymbol: false,
        lineStyle: { width: 3, color: '#a78bfa' },
        areaStyle: { color: 'rgba(167,139,250,0.15)' }
      }],
    } as const;
  }, [displayData]);

  // Status trend stacked area
  const statusTrendOption = useMemo(() => {
    const items = (displayData?.statusTrend || []);
    const dates = items.map(i => i.date);
    const compl = items.map(i => Number(i.completed || 0));
    const canc = items.map(i => Number(i.cancelled || 0));
    const pend = items.map(i => Number(i.pending || 0));
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, textStyle: { color: '#64748b' } },
      grid: { left: 40, right: 20, top: 30, bottom: 40 },
      xAxis: { type: 'category', data: dates, boundaryGap: false, axisLabel: { color: '#94a3b8' } },
      yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } } },
      series: [
        { name: 'Completed', type: 'line', stack: 'total', smooth: true, areaStyle: {}, data: compl, lineStyle: { color: '#22c55e' } },
        { name: 'Cancelled', type: 'line', stack: 'total', smooth: true, areaStyle: {}, data: canc, lineStyle: { color: '#ef4444' } },
        { name: 'Pending', type: 'line', stack: 'total', smooth: true, areaStyle: {}, data: pend, lineStyle: { color: '#f59e0b' } },
      ],
      color: ['#22c55e', '#ef4444', '#f59e0b']
    } as const;
  }, [displayData]);

  // Pie: Revenue share by top movies
  const revenueShareOption = useMemo(() => {
    const items = (displayData?.tops?.movies || []).slice(0, 8);
    const seriesData = items.map(m => ({ name: m.title, value: Number(m.revenue || 0) }));
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, textStyle: { color: '#64748b' } },
      series: [
        {
          name: 'Revenue',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
          labelLine: { show: false },
          data: seriesData,
        },
      ],
    } as const;
  }, [displayData]);

  // Pie: Booking status distribution
  const bookingStatusOption = useMemo(() => {
    const completed = Number(displayData?.kpis?.completed || 0);
    const cancelled = Number(displayData?.kpis?.cancelled || 0);
    const total = Number(displayData?.kpis?.bookings || 0);
    const pending = Math.max(0, total - completed - cancelled);
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, textStyle: { color: '#64748b' } },
      series: [
        {
          name: 'Bookings',
          type: 'pie',
          radius: ['40%', '70%'],
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          labelLine: { show: false },
          data: [
            { value: completed, name: 'Completed' },
            { value: cancelled, name: 'Cancelled' },
            { value: pending, name: 'Pending' },
          ],
        },
      ],
      color: ['#22c55e', '#ef4444', '#f59e0b'],
    } as const;
  }, [displayData]);

  const topMoviesOption = useMemo(() => {
    const items = (displayData?.tops?.movies || []).slice(0, 10);
    const names = items.map(m => m.title);
    const vals = items.map(m => Number(m.revenue || 0));
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: { left: 140, right: 20, top: 20, bottom: 20 },
      xAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } } },
      yAxis: { type: 'category', data: names, axisLabel: { color: '#94a3b8' } },
      series: [{
        type: 'bar',
        data: vals,
        itemStyle: {
          color: new (echarts as any).graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#a78bfa' },
            { offset: 1, color: '#22d3ee' },
          ]),
          shadowBlur: 8,
          shadowColor: 'rgba(34,211,238,0.35)'
        },
        barWidth: 14,
      }],
    } as const;
  }, [displayData]);

  const topTheatersOption = useMemo(() => {
    const items = (displayData?.tops?.theaters || []).slice(0, 10);
    const names = items.map(t => t.name);
    const vals = items.map(t => Number(t.revenue || 0));
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: { left: 140, right: 20, top: 20, bottom: 20 },
      xAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } } },
      yAxis: { type: 'category', data: names, axisLabel: { color: '#94a3b8' } },
      series: [{
        type: 'bar',
        data: vals,
        itemStyle: {
          color: new (echarts as any).graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#34d399' },
            { offset: 1, color: '#22d3ee' },
          ]),
          shadowBlur: 8,
          shadowColor: 'rgba(34,211,238,0.35)'
        },
        barWidth: 14,
      }],
    } as const;
  }, [displayData]);

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
          <div className="w-full sm:w-auto flex items-center gap-3">
            <div className="w-56">
              <Select value={range} onChange={(e) => setRange(e.target.value as any)} options={rangeOptions} />
            </div>
            <button
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
              onClick={async () => {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const blob = await analyticsService.downloadDailyPdf(`${yyyy}-${mm}-${dd}`);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `analytics-${yyyy}-${mm}-${dd}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
            >
              Download Daily PDF
            </button>
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

        {/* Charts: Trends & Top Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings Trend</h3>
            {displayData?.trend && displayData.trend.length > 0 ? (
              <EChart option={bookingsTrendOption as any} />
            ) : (
              <div className="text-gray-500 text-sm">No data in selected range.</div>
            )}
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Theaters (Revenue)</h3>
            {displayData?.tops?.theaters && displayData.tops.theaters.length > 0 ? (
              <EChart option={topTheatersOption as any} />
            ) : (
              <div className="text-gray-500 text-sm">No data available.</div>
            )}
          </Card>
        </div>

        {/* Revenue Trend & Status Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            {displayData?.revenueTrend && displayData.revenueTrend.length > 0 ? (
              <EChart option={revenueTrendOption as any} />
            ) : (
              <div className="text-gray-500 text-sm">No revenue data in selected range.</div>
            )}
          </Card>
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Trend</h3>
            {displayData?.statusTrend && displayData.statusTrend.length > 0 ? (
              <EChart option={statusTrendOption as any} />
            ) : (
              <div className="text-gray-500 text-sm">No status trend data.</div>
            )}
          </Card>
        </div>

        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Movies (Revenue)</h3>
          {displayData?.tops?.movies && displayData.tops.movies.length > 0 ? (
            <EChart option={topMoviesOption as any} />
          ) : (
            <div className="text-gray-500 text-sm">No data available.</div>
          )}
        </Card>

        {/* Pie Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Share by Top Movies</h3>
            {displayData?.tops?.movies && displayData.tops.movies.length > 0 ? (
              <EChart option={revenueShareOption as any} />
            ) : (
              <div className="text-gray-500 text-sm">No data available.</div>
            )}
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Distribution</h3>
            {(Number(kpis.bookings) > 0) ? (
              <EChart option={bookingStatusOption as any} />
            ) : (
              <div className="text-gray-500 text-sm">No bookings yet.</div>
            )}
          </Card>
        </div>

        {/* Live Events Timeline */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Events</h3>
          <div className="space-y-2 max-h-72 overflow-auto">
            {events.map((e) => (
              <div key={e.id} className="text-sm flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-gray-900">{e.type}</span>
                <span className="text-gray-500">{e.at ? new Date(e.at).toLocaleString() : ''}</span>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-gray-500 text-sm">Waiting for events...</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
;

export default SuperAdminAnalyticsPage;
