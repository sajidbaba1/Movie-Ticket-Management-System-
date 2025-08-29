import React, { useState } from 'react';
import { useMovies, useTheaters, useUsers } from '../../hooks';
import { Card, Button, Select, Loading } from '../../components/ui';
import type { Theater } from '../../types';

const AdminAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30');

  const { data: movies = [], isLoading: moviesLoading } = useMovies();
  const { data: theaters = [], isLoading: theatersLoading } = useTheaters();
  const { data: users = [], isLoading: usersLoading } = useUsers();

  const isLoading = moviesLoading || theatersLoading || usersLoading;

  // Calculate system-wide statistics
  const stats = {
    totalMovies: movies.length,
    activeMovies: movies.filter(m => m.active).length,
    totalTheaters: theaters.length,
    approvedTheaters: (theaters as Theater[]).filter(t => t.approved).length,
    totalUsers: users.length,
    activeUsers: users.filter(u => u.active).length,
    adminUsers: users.filter(u => u.role === 'ADMIN').length,
    theaterOwners: users.filter(u => u.role === 'THEATER_OWNER').length,
    customers: users.filter(u => u.role === 'CUSTOMER').length,
  };

  const timeRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '365', label: 'Last year' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Loading system analytics..." />
      </div>
    );
  }

  return (
    <div className="section-padding bg-gray-50 min-h-screen">
      <div className="container-responsive space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Analytics 📊</h1>
            <p className="text-gray-600">Monitor system performance and user engagement</p>
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              options={timeRangeOptions}
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card padding="lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-2xl mr-4">
                🎬
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMovies}</p>
                <p className="text-sm font-medium text-gray-600">Total Movies</p>
                <p className="text-xs text-green-600">{stats.activeMovies} active</p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-2xl mr-4">
                🏢
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTheaters}</p>
                <p className="text-sm font-medium text-gray-600">Total Theaters</p>
                <p className="text-xs text-blue-600">{stats.approvedTheaters} approved</p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-2xl mr-4">
                👥
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-xs text-green-600">{stats.activeUsers} active</p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-2xl mr-4">
                📈
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">95%</p>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-xs text-green-600">+2% this month</p>
              </div>
            </div>
          </Card>
        </div>

        {/* User Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customers</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(stats.customers / stats.totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats.customers}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Theater Owners</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(stats.theaterOwners / stats.totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats.theaterOwners}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Admins</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(stats.adminUsers / stats.totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats.adminUsers}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Database Status</span>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Healthy
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API Response Time</span>
                <span className="text-sm font-medium text-gray-900">120ms</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="text-sm font-medium text-gray-900">1,247</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Error Rate</span>
                <span className="text-sm font-medium text-green-600">0.03%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Growth Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-gray-600">User growth chart</p>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">💰</div>
                <p className="text-gray-600">Revenue analytics</p>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm">🎬</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New movie "Avatar 3" added</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 text-sm">🏢</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Theater "Cineplex Downtown" approved</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 text-sm">👤</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">50 new user registrations today</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Export Options */}
        <div className="flex justify-end">
          <Button variant="outline" className="mr-2">
            📊 Export System Report
          </Button>
          <Button variant="primary">
            📧 Email Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;