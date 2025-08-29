import React, { useMemo } from 'react';
import { useMyBookings } from '../../hooks/useBookings';

const CustomerAnalyticsPage: React.FC = () => {
  const { data: bookings = [], isLoading } = useMyBookings();

  const stats = useMemo(() => {
    const total = bookings.length;
    const statusOf = (b: any) => (b?.status || '').toString().toLowerCase();
    const confirmed = bookings.filter((b: any) => statusOf(b) === 'created').length;
    const completed = bookings.filter((b: any) => statusOf(b) === 'paid').length;
    const cancelled = bookings.filter((b: any) => statusOf(b) === 'cancelled').length;
    const spent = bookings
      .filter((b: any) => b?.totalAmount != null)
      .reduce((sum: number, b: any) => sum + Number(b.totalAmount || 0), 0);

    // Last 7 days trend by createdAt
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - i)));
    const trend = days.map(d => {
      const dayStr = d.toISOString().slice(0, 10);
      const count = bookings.filter((b: any) => (b?.createdAt && new Date(b.createdAt).toISOString().slice(0, 10) === dayStr)).length;
      return { day: d, count };
    });

    // Favorite theater by schedule.theaterName (from backend summary)
    const theaterCount: Record<string, number> = {};
    bookings.forEach((b: any) => {
      const t = b?.schedule?.theaterName || 'Other';
      theaterCount[t] = (theaterCount[t] || 0) + 1;
    });
    const topTheater = Object.entries(theaterCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    return {
      total,
      confirmed,
      completed,
      cancelled,
      spent,
      trend,
      // Genre data not available from backend summary; placeholder only
      genreData: [] as Array<{ genre: string; count: number }>,
      topGenre: '—',
      topTheater,
    };
  }, [bookings]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Analytics</h1>
        <p className="text-gray-600">Track your movie watching and booking patterns</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <span className="text-2xl">🎬</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-green-600">${stats.spent.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <span className="text-2xl">🎭</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Favorite Genre</p>
              <p className="text-lg font-bold text-purple-600">{stats.topGenre}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 mr-4">
              <span className="text-2xl">📍</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Favorite Theater</p>
              <p className="text-lg font-bold text-orange-600">{stats.topTheater}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookings</h2>
        <div className="space-y-4">
          {bookings.slice(0, 3).map((booking: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🎬</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{booking?.schedule?.movieTitle || 'Movie'}</h3>
                  <p className="text-sm text-gray-600">{booking?.schedule?.theaterName || 'Theater'} • {booking?.createdAt ? new Date(booking.createdAt).toLocaleDateString() : '—'}</p>
                </div>
              </div>
              <span className="font-semibold text-green-600">${Number(booking?.totalAmount || 0).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Trends</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-2 block">📊</span>
              <p className="text-gray-500">Booking trends chart</p>
              <p className="text-sm text-gray-400">Chart integration coming soon</p>
              <div className="mt-4">
                {stats.trend.map((day, index) => (
                  <div key={index} className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{day.day.toLocaleDateString()}</span>
                    <span className="text-sm font-bold text-gray-900">{day.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Genre Preferences */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Genre Preferences</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-2 block">🥧</span>
              <p className="text-gray-500">Genre distribution chart</p>
              <p className="text-sm text-gray-400">Chart integration coming soon</p>
              <div className="mt-4">
                {stats.genreData.map((genre, index) => (
                  <div key={index} className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{genre.genre}</span>
                    <span className="text-sm font-bold text-gray-900">{genre.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Watch more comedies', description: 'Based on your preferences, try some comedy movies', icon: '😂' },
            { title: 'Try evening shows', description: 'You seem to prefer evening showtimes', icon: '🌙' },
            { title: 'Check out IMAX', description: 'Enhance your experience with IMAX screenings', icon: '🎥' },
          ].map((rec, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-2">{rec.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{rec.title}</h3>
              <p className="text-sm text-gray-600">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalyticsPage;