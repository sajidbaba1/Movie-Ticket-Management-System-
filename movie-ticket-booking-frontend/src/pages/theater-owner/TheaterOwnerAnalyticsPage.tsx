import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMyTheaters } from '../../hooks/useTheaterOwner';
import { useMySchedules } from '../../hooks/useSchedules';
import { useMovies } from '../../hooks/useMovies';
import { Card, Button, Select, Loading } from '../../components/ui';
import { formatCurrency } from '../../utils';

const TheaterOwnerAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedTheater, setSelectedTheater] = useState('');

  const { user } = useAuth();
  const { data: theaters = [], isLoading: theatersLoading } = useMyTheaters(user?.id);

  const { data: schedules = [], isLoading: schedulesLoading } = useMySchedules();
  const { data: movies = [], isLoading: moviesLoading } = useMovies();

  const isLoading = theatersLoading || schedulesLoading || moviesLoading;

  // Calculate basic statistics
  const stats = {
    totalTheaters: theaters.length,
    activeTheaters: theaters.filter(t => t.active).length,
    totalSchedules: schedules.length,
    upcomingSchedules: schedules.filter(s => new Date(s.showTime) > new Date()).length,
    totalMovies: movies.filter(m => m.active).length,
    totalRevenue: schedules.reduce((sum, schedule) => {
      const bookedSeats = schedule.totalSeats - schedule.availableSeats;
      return sum + (bookedSeats * schedule.price);
    }, 0),
    totalBookings: schedules.reduce((sum, schedule) => {
      return sum + (schedule.totalSeats - schedule.availableSeats);
    }, 0),
    averageTicketPrice: schedules.length > 0
      ? schedules.reduce((sum, s) => sum + s.price, 0) / schedules.length
      : 0
  };

  const timeRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '365', label: 'Last year' }
  ];

  const theaterOptions = [
    { value: '', label: 'All theaters' },
    ...theaters.map(theater => ({
      value: theater.id.toString(),
      label: theater.name
    }))
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
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics 📊</h1>
          <p className="text-gray-600">Track your business performance and insights</p>
        </div>

        {/* Filters */}
        <Card padding="lg" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                options={timeRangeOptions}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theater
              </label>
              <Select
                value={selectedTheater}
                onChange={(e) => setSelectedTheater(e.target.value)}
                options={theaterOptions}
              />
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card padding="lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-2xl mr-4">
                🏢
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTheaters}</p>
                <p className="text-sm font-medium text-gray-600">Total Theaters</p>
                <p className="text-xs text-green-600">{stats.activeTheaters} active</p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-2xl mr-4">
                💰
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-xs text-green-600">+15% vs last month</p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-2xl mr-4">
                🎫
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-xs text-green-600">+8% vs last month</p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-2xl mr-4">
                📅
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingSchedules}</p>
                <p className="text-sm font-medium text-gray-600">Upcoming Shows</p>
                <p className="text-xs text-blue-600">{stats.totalSchedules} total</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart Placeholder */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-gray-600">Revenue chart coming soon</p>
                <p className="text-sm text-gray-500">Integration with chart library pending</p>
              </div>
            </div>
          </Card>

          {/* Bookings Chart Placeholder */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Analytics</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-600">Booking analytics coming soon</p>
                <p className="text-sm text-gray-500">Detailed insights and trends</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance by Theater */}
        <Card padding="lg" className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Theater Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Theater
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Screens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {theaters.map((theater) => {
                  const theaterSchedules = schedules.filter(s => s.theater.id === theater.id);
                  const theaterRevenue = theaterSchedules.reduce((sum, schedule) => {
                    const bookedSeats = schedule.totalSeats - schedule.availableSeats;
                    return sum + (bookedSeats * schedule.price);
                  }, 0);

                  return (
                    <tr key={theater.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {theater.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {theater.city}, {theater.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {theater.totalScreens}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${theater.active && theater.approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {theater.active && theater.approved ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(theaterRevenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="lg">
            <h4 className="font-semibold text-gray-900 mb-2">Average Ticket Price</h4>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(stats.averageTicketPrice)}
            </p>
          </Card>

          <Card padding="lg">
            <h4 className="font-semibold text-gray-900 mb-2">Utilization Rate</h4>
            <p className="text-2xl font-bold text-primary-600">
              {schedules.length > 0
                ? Math.round(((stats.totalBookings) / schedules.reduce((sum, s) => sum + s.totalSeats, 0)) * 100)
                : 0
              }%
            </p>
          </Card>

          <Card padding="lg">
            <h4 className="font-semibold text-gray-900 mb-2">Active Movies</h4>
            <p className="text-2xl font-bold text-primary-600">{stats.totalMovies}</p>
          </Card>
        </div>

        {/* Export Options */}
        <div className="mt-8 flex justify-end">
          <Button variant="outline" className="mr-2">
            📊 Export Report
          </Button>
          <Button variant="primary">
            📧 Email Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TheaterOwnerAnalyticsPage;