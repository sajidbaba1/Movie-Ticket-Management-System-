import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheater } from '../../hooks/useTheaters';
import { Button, Card } from '../../components/ui';
import { formatDateTime, getUserFullName } from '../../utils';

const TheaterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theaterId = id ? parseInt(id, 10) : 0;
  const { data: theater, isLoading, error } = useTheater(theaterId);

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

  if (error || !theater) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Theater Not Found</h2>
            <p className="text-red-600 mb-4">
              {error instanceof Error ? error.message : 'The theater you are looking for does not exist or has been removed.'}
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/theaters')}
                variant="primary"
              >
                Back to Theaters
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
              onClick={() => navigate('/theaters')}
              variant="outline"
              size="sm"
            >
              ← Back to Theaters
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{theater.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${theater.active && theater.approved
                    ? 'bg-green-100 text-green-800'
                    : theater.active
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                  {theater.active && theater.approved
                    ? 'Active'
                    : theater.active
                      ? 'Pending Approval'
                      : 'Inactive'}
                </span>
                <span className="text-sm text-gray-500">
                  {theater.totalScreens} screen{theater.totalScreens !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(`/theaters/${theater.id}/edit`)}
              variant="outline"
            >
              Edit Theater
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Theater Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Theater Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Location</h3>
                  <div className="space-y-1 text-gray-600">
                    <p className="font-medium">{theater.address}</p>
                    <p>{theater.city}, {theater.state} {theater.zipCode}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Contact Information</h3>
                  <div className="space-y-1 text-gray-600">
                    {theater.phoneNumber && (
                      <p>📞 {theater.phoneNumber}</p>
                    )}
                    {theater.email && (
                      <p>✉️ {theater.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Capacity</h3>
                  <div className="space-y-1 text-gray-600">
                    <p>Total Screens: {theater.totalScreens}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Owner</h3>
                  <div className="space-y-1 text-gray-600">
                    <p>{getUserFullName(theater.owner)}</p>
                    <p className="text-sm">ID: {theater.owner.id}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Description */}
            {theater.description && (
              <Card padding="lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{theater.description}</p>
              </Card>
            )}

            {/* Movies Section */}
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Movies</h2>
                <Link
                  to={`/movies?theater=${theater.id}`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All Movies →
                </Link>
              </div>
              <p className="text-gray-600">
                View all movies currently showing at this theater.
              </p>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${theater.active && theater.approved
                      ? 'text-green-600'
                      : theater.active
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                    {theater.active && theater.approved
                      ? 'Active'
                      : theater.active
                        ? 'Pending'
                        : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Screens</span>
                  <span className="font-medium text-gray-900">{theater.totalScreens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">City</span>
                  <span className="font-medium text-gray-900">{theater.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">State</span>
                  <span className="font-medium text-gray-900">{theater.state}</span>
                </div>
              </div>
            </Card>

            {/* Metadata */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-4">Metadata</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Theater ID</span>
                  <p className="font-mono text-gray-900">{theater.id}</p>
                </div>
                <div>
                  <span className="text-gray-600">Created</span>
                  <p className="text-gray-900">{formatDateTime(theater.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Owner ID</span>
                  <p className="font-mono text-gray-900">{theater.owner.id}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheaterDetailPage;