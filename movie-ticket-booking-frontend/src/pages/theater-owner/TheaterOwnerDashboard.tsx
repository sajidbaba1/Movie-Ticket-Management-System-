import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMovies } from '../../hooks/useMovies';
import { useTheaters } from '../../hooks/useTheaters';
import { Button, Card } from '../../components/ui';

const TheaterOwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: movies = [] } = useMovies();
  const { data: theaters = [] } = useTheaters();

  // Mock data for theater owner statistics
  const stats = [
    {
      title: 'My Theaters',
      value: theaters.length.toString(),
      icon: '🏢',
      change: '+2 this month',
      color: 'bg-blue-500',
    },
    {
      title: 'Active Movies',
      value: movies.filter(m => m.active).length.toString(),
      icon: '🎬',
      change: '+5 this week',
      color: 'bg-green-500',
    },
    {
      title: 'Total Bookings',
      value: '234',
      icon: '🎫',
      change: '+12% vs last month',
      color: 'bg-purple-500',
    },
    {
      title: 'Revenue',
      value: '$12,450',
      icon: '💰',
      change: '+8% vs last month',
      color: 'bg-orange-500',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Theaters',
      description: 'Add, edit, or manage your theater locations',
      icon: '🏢',
      link: '/theater-owner/theaters',
      color: 'bg-blue-500',
    },
    {
      title: 'Movie Schedules',
      description: 'Set up movie showtimes and schedules',
      icon: '📅',
      link: '/theater-owner/schedules',
      color: 'bg-green-500',
    },
    {
      title: 'Bookings',
      description: 'View and manage customer bookings',
      icon: '🎫',
      link: '/theater-owner/bookings',
      color: 'bg-purple-500',
    },
    {
      title: 'Analytics',
      description: 'View performance and revenue analytics',
      icon: '📊',
      link: '/theater-owner/analytics',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-responsive py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Theater Owner Dashboard 🎭
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.firstName}! Manage your theaters and bookings.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8 space-y-8">
        {/* Statistics */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} padding="lg">
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-2xl mr-4`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-xs text-green-600">{stat.change}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <div className="p-6">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white text-2xl mb-4`}>
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <Card padding="lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600">🎫</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New booking for "Avengers: Endgame"</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                </div>
                <span className="text-sm text-green-600 font-medium">+$45</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600">🎬</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Movie "Spider-Man" schedule updated</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600">🏢</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Theater "Downtown Cinema" capacity updated</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <Button variant="outline" size="sm">
                View All Activity
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default TheaterOwnerDashboard;