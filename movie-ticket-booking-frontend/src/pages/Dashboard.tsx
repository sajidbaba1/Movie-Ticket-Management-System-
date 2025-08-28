import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

const Dashboard: React.FC = () => {
  // Mock statistics - in real app these would come from API
  const stats = [
    {
      name: 'Total Movies',
      value: '124',
      change: '+12%',
      changeType: 'positive' as const,
      icon: '🎬',
      color: 'primary'
    },
    {
      name: 'Active Theaters',
      value: '32',
      change: '+3%',
      changeType: 'positive' as const,
      icon: '🏢',
      color: 'success'
    },
    {
      name: 'Total Users',
      value: '2,847',
      change: '+18%',
      changeType: 'positive' as const,
      icon: '👥',
      color: 'warning'
    },
    {
      name: 'Today\'s Bookings',
      value: '156',
      change: '-5%',
      changeType: 'negative' as const,
      icon: '🎫',
      color: 'error'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Movies',
      description: 'Add, edit, and organize your movie collection',
      icon: '🎬',
      href: ROUTES.MOVIES,
      color: 'from-blue-500 to-blue-600',
      actions: ['View All', 'Add New']
    },
    {
      title: 'Manage Theaters',
      description: 'Oversee theater locations and their details',
      icon: '🏢',
      href: ROUTES.THEATERS,
      color: 'from-green-500 to-green-600',
      actions: ['View All', 'Add New']
    },
    {
      title: 'Manage Users',
      description: 'Handle user accounts and permissions',
      icon: '👥',
      href: ROUTES.USERS,
      color: 'from-purple-500 to-purple-600',
      actions: ['View All', 'Add New']
    }
  ];

  const recentActivity = [
    {
      type: 'movie',
      action: 'New movie added',
      title: 'Avatar: The Way of Water',
      time: '2 hours ago',
      icon: '🎬'
    },
    {
      type: 'theater',
      action: 'Theater approved',
      title: 'Cineplex Downtown',
      time: '4 hours ago',
      icon: '✅'
    },
    {
      type: 'user',
      action: 'New user registered',
      title: 'John Smith',
      time: '6 hours ago',
      icon: '👤'
    },
    {
      type: 'booking',
      action: 'Booking confirmed',
      title: 'Ticket #12345',
      time: '8 hours ago',
      icon: '🎫'
    }
  ];

  return (
    <div className="section-padding bg-gray-50 min-h-screen">
      <div className="container-responsive space-y-8">
        {/* Welcome Header */}
        <div className="animate-fade-in">
          <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 lg:p-12 text-white shadow-soft-lg">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance">
                Welcome to MovieHub Admin
              </h1>
              <p className="text-lg sm:text-xl text-primary-100 mb-6 text-balance">
                Manage your movie booking system with ease. Monitor performance,
                manage content, and oversee operations from one central dashboard.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm">
                  📊 View Analytics
                </button>
                <button className="bg-white text-primary-700 hover:bg-primary-50 px-6 py-3 rounded-xl font-medium transition-all duration-200">
                  ⚡ Quick Setup
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="animate-slide-up">
          <h2 className="heading-2 mb-6">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.name}
                className="card card-hover p-6 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="text-3xl opacity-80">{stat.icon}</div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stat.changeType === 'positive'
                      ? 'bg-success-100 text-success-800'
                      : 'bg-error-100 text-error-800'
                    }`}>
                    {stat.changeType === 'positive' ? '↗' : '↘'} {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">from last month</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 animate-slide-up">
            <h2 className="heading-2 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link
                  key={action.title}
                  to={action.href}
                  className="group animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="card card-hover p-6 h-full">
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <span className="text-2xl">{action.icon}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {action.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {action.actions.map(actionName => (
                        <span key={actionName} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                          {actionName}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="animate-slide-up">
            <h2 className="heading-3 mb-6">Recent Activity</h2>
            <div className="card p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-shrink-0">
                      <span className="text-lg">{activity.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200">
                  View All Activity →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Health Cards */}
        <div className="animate-slide-up">
          <h2 className="heading-2 mb-6">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Server Status</h3>
                <span className="w-3 h-3 bg-success-500 rounded-full animate-pulse-soft"></span>
              </div>
              <p className="text-2xl font-bold text-success-600 mb-2">Operational</p>
              <p className="text-sm text-gray-600">99.9% uptime</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Database</h3>
                <span className="w-3 h-3 bg-success-500 rounded-full animate-pulse-soft"></span>
              </div>
              <p className="text-2xl font-bold text-success-600 mb-2">Healthy</p>
              <p className="text-sm text-gray-600">Fast response times</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">API Performance</h3>
                <span className="w-3 h-3 bg-warning-500 rounded-full animate-pulse-soft"></span>
              </div>
              <p className="text-2xl font-bold text-warning-600 mb-2">Good</p>
              <p className="text-sm text-gray-600">Average 150ms</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Storage</h3>
                <span className="w-3 h-3 bg-success-500 rounded-full animate-pulse-soft"></span>
              </div>
              <p className="text-2xl font-bold text-success-600 mb-2">75%</p>
              <p className="text-sm text-gray-600">Used of 1TB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;