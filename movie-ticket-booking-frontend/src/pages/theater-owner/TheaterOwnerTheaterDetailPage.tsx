import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMyTheater, useDeleteTheater, useToggleTheaterStatus } from '../../hooks/useTheaterOwner';
import { Card, Alert, Loading, Button } from '../../components/ui';
import { formatDateTime } from '../../utils';
import { getErrorMessage } from '../../utils';

const TheaterOwnerTheaterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theaterId = id ? parseInt(id, 10) : 0;

  const { data: theater, isLoading, error } = useMyTheater(theaterId);
  const deleteTheaterMutation = useDeleteTheater();
  const toggleStatusMutation = useToggleTheaterStatus();

  const handleDelete = async () => {
    if (!theater) return;

    try {
      await deleteTheaterMutation.mutateAsync(theater.id);
      navigate('/theater-owner/theaters');
    } catch (error) {
      console.error('Failed to delete theater:', error);
    }
  };

  const handleToggleStatus = async () => {
    if (!theater) return;

    try {
      await toggleStatusMutation.mutateAsync({
        id: theater.id,
        active: !theater.active
      });
    } catch (error) {
      console.error('Failed to toggle theater status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Loading theater details..." />
      </div>
    );
  }

  if (error || !theater) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-responsive py-8">
          <Alert
            type="error"
            title="Theater Not Found"
            message={
              error ? getErrorMessage(error) : "The requested theater could not be found."
            }
          />
          <div className="mt-4">
            <Link to="/theater-owner/theaters">
              <Button variant="outline">← Back to My Theaters</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <Link
              to="/theater-owner/theaters"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 inline-block"
            >
              ← Back to My Theaters
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{theater.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${theater.active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                {theater.active ? 'Active' : 'Inactive'}
              </span>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${theater.approved
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
                }`}>
                {theater.approved ? 'Approved' : 'Pending Approval'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to={`/theater-owner/theaters/${theater.id}/edit`}>
              <Button variant="outline">Edit Theater</Button>
            </Link>
            <Button
              variant={theater.active ? "danger" : "success"}
              onClick={handleToggleStatus}
              loading={toggleStatusMutation.isPending}
            >
              {theater.active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteTheaterMutation.isPending}
            >
              Delete Theater
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {deleteTheaterMutation.error && (
          <Alert
            type="error"
            title="Delete Failed"
            message={getErrorMessage(deleteTheaterMutation.error)}
            className="mb-6"
          />
        )}

        {/* Theater Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Theater Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Theater Information</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {theater.address} <br />
                    {theater.city}, {theater.state} {theater.zipCode}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Screens</dt>
                  <dd className="text-sm text-gray-900 mt-1">{theater.totalScreens}</dd>
                </div>
                {theater.phoneNumber && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900 mt-1">{theater.phoneNumber}</dd>
                  </div>
                )}
                {theater.email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900 mt-1">{theater.email}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900 mt-1">{formatDateTime(theater.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Theater ID</dt>
                  <dd className="text-sm text-gray-900 mt-1 font-mono">{theater.id}</dd>
                </div>
              </dl>
            </Card>

            {/* Description */}
            {theater.description && (
              <Card padding="lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{theater.description}</p>
              </Card>
            )}

            {/* Owner Information */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Owner Information</h2>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">
                  {(theater.owner?.firstName || 'Unknown')} {(theater.owner?.lastName || '')}
                </p>
                {theater.owner?.email && (
                  <p className="text-sm text-gray-600">{theater.owner.email}</p>
                )}
                {theater.owner?.role && (
                  <p className="text-sm text-gray-600">Role: {theater.owner.role}</p>
                )}
                <p className="text-sm text-gray-600">Owner ID: {theater.owner?.id ?? '-'}</p>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to={`/theater-owner/theaters/${theater.id}/movies`} className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    🎬 Manage Movies
                  </Button>
                </Link>
                <Link to={`/theater-owner/theaters/${theater.id}/schedules`} className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    📅 Manage Schedules
                  </Button>
                </Link>
                <Link to={`/theater-owner/theaters/${theater.id}/analytics`} className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    📊 View Analytics
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Statistics */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Bookings</span>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Movies</span>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="text-sm font-medium text-gray-900">$0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <span className="text-sm font-medium text-gray-900">N/A</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheaterOwnerTheaterDetailPage;