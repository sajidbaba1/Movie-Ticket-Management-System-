import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminStats } from '../../hooks/useAdmin';

const SuperAdminDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats();

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">Failed to load dashboard data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-600">Manage administrators and system settings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Admins</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalAdmins || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Admins</p>
              <p className="text-2xl font-bold text-green-600">{stats?.activeAdmins || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <span className="text-2xl">❌</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Admins</p>
              <p className="text-2xl font-bold text-red-600">{stats?.inactiveAdmins || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/super-admin/admins"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
          >
            <div className="p-2 rounded-lg bg-primary-100 mr-3">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Admins</h3>
              <p className="text-sm text-gray-600">Create, edit, and manage admin users</p>
            </div>
          </Link>

          <Link
            to="/admin"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
          >
            <div className="p-2 rounded-lg bg-green-100 mr-3">
              <span className="text-xl">🎬</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">System Overview</h3>
              <p className="text-sm text-gray-600">View overall system dashboard</p>
            </div>
          </Link>

          <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="p-2 rounded-lg bg-gray-100 mr-3">
              <span className="text-xl">⚙️</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-500">System Settings</h3>
              <p className="text-sm text-gray-400">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Admin Management</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Create and manage admin accounts</li>
              <li>• Monitor admin activity</li>
              <li>• Control admin permissions</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">System Oversight</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Monitor system performance</li>
              <li>• Oversee all operations</li>
              <li>• Manage system configurations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;