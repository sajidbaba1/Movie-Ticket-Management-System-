import React from 'react';

const CustomerAnalyticsPage: React.FC = () => {
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
              <p className="text-2xl font-bold text-gray-900">12</p>
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
              <p className="text-2xl font-bold text-green-600">$180.00</p>
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
              <p className="text-lg font-bold text-purple-600">Action</p>
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
              <p className="text-lg font-bold text-orange-600">AMC Downtown</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookings</h2>
        <div className="space-y-4">
          {[
            { movie: 'Avatar: The Way of Water', theater: 'AMC Downtown', date: '2024-01-15', amount: '$15.00' },
            { movie: 'Top Gun: Maverick', theater: 'Cinemark Plaza', date: '2024-01-10', amount: '$12.50' },
            { movie: 'Black Panther: Wakanda Forever', theater: 'AMC Downtown', date: '2024-01-05', amount: '$15.00' },
          ].map((booking, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🎬</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{booking.movie}</h3>
                  <p className="text-sm text-gray-600">{booking.theater} • {booking.date}</p>
                </div>
              </div>
              <span className="font-semibold text-green-600">{booking.amount}</span>
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