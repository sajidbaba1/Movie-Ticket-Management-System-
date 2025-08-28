import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUsers';
import { Button, Card } from '../../components/ui';
import { formatDateTime, getUserFullName } from '../../utils';
import type { UserRole } from '../../types';

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = id ? parseInt(id, 10) : 0;
  const { data: user, isLoading, error } = useUser(userId);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'THEATER_OWNER':
        return 'bg-blue-100 text-blue-800';
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return '👑';
      case 'THEATER_OWNER':
        return '🏢';
      case 'CUSTOMER':
        return '👤';
      default:
        return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">User Not Found</h2>
            <p className="text-red-600 mb-4">
              {error instanceof Error ? error.message : 'The user you are looking for does not exist or has been removed.'}
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/users')}
                variant="primary"
              >
                Back to Users
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/users')}
              variant="outline"
              size="sm"
            >
              ← Back to Users
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {getUserFullName(user)}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)} {user.role.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${user.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(`/users/${user.id}/edit`)}
              variant="outline"
            >
              Edit User
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Personal Details</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>First Name:</span>
                      <span className="font-medium text-gray-900">{user.firstName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Name:</span>
                      <span className="font-medium text-gray-900">{user.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Full Name:</span>
                      <span className="font-medium text-gray-900">{getUserFullName(user)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Contact Information</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="font-medium text-gray-900">{user.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Account Details</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Role:</span>
                      <span className="font-medium text-gray-900">{user.role.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-medium ${user.active ? 'text-green-600' : 'text-red-600'}`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Account Creation</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Joined:</span>
                      <span className="font-medium text-gray-900">{formatDateTime(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Role Description */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Role & Permissions</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getRoleIcon(user.role)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.role.replace('_', ' ')}</h3>
                    <p className="text-gray-600">
                      {user.role === 'ADMIN' && 'Full system access and user management capabilities'}
                      {user.role === 'THEATER_OWNER' && 'Can manage theaters and their associated movies'}
                      {user.role === 'CUSTOMER' && 'Can browse and book movie tickets'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Permissions Include:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {user.role === 'ADMIN' && (
                      <>
                        <li>• Manage all users, theaters, and movies</li>
                        <li>• Access to all system features</li>
                        <li>• User account management</li>
                        <li>• System configuration</li>
                      </>
                    )}
                    {user.role === 'THEATER_OWNER' && (
                      <>
                        <li>• Create and manage own theaters</li>
                        <li>• Add movies to owned theaters</li>
                        <li>• View booking analytics</li>
                        <li>• Manage theater settings</li>
                      </>
                    )}
                    {user.role === 'CUSTOMER' && (
                      <>
                        <li>• Browse available movies</li>
                        <li>• Book movie tickets</li>
                        <li>• View booking history</li>
                        <li>• Manage personal profile</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">User ID</span>
                  <span className="font-mono text-gray-900">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role</span>
                  <span className="font-medium text-gray-900">{user.role.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${user.active ? 'text-green-600' : 'text-red-600'}`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-900 text-sm break-all">{user.email}</span>
                </div>
              </div>
            </Card>

            {/* Account Actions */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate(`/users/${user.id}/edit`)}
                  variant="primary"
                  size="sm"
                  className="w-full"
                >
                  Edit User
                </Button>
                {user.role === 'THEATER_OWNER' && (
                  <Button
                    onClick={() => navigate(`/theaters?owner=${user.id}`)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    View Theaters
                  </Button>
                )}
              </div>
            </Card>

            {/* Metadata */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-4">Metadata</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">User ID</span>
                  <p className="font-mono text-gray-900">{user.id}</p>
                </div>
                <div>
                  <span className="text-gray-600">Created</span>
                  <p className="text-gray-900">{formatDateTime(user.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email Verified</span>
                  <p className="text-gray-900">Yes</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;