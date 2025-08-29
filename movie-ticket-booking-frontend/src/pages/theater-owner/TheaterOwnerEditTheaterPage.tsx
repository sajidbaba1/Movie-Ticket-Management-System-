import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMyTheater, useUpdateTheater } from '../../hooks/useTheaterOwner';
import { useAuth } from '../../contexts/AuthContext';
import { TheaterForm } from '../../components/theaters';
import { Card, Alert, Loading, Button } from '../../components/ui';
import type { CreateTheaterRequest } from '../../types';
import { getErrorMessage } from '../../utils';

const TheaterOwnerEditTheaterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theaterId = id ? parseInt(id, 10) : 0;

  const { data: theater, isLoading, error } = useMyTheater(theaterId);
  const updateTheaterMutation = useUpdateTheater();

  const handleSubmit = async (data: CreateTheaterRequest) => {
    if (!theater || !user) return;

    const theaterWithOwner = {
      ...data,
      owner: { id: user.id }
    };

    try {
      await updateTheaterMutation.mutateAsync({
        id: theater.id,
        theaterData: theaterWithOwner
      });
      navigate(`/theater-owner/theaters/${theater.id}`);
    } catch (error) {
      console.error('Failed to update theater:', error);
    }
  };

  const handleCancel = () => {
    if (theater) {
      navigate(`/theater-owner/theaters/${theater.id}`);
    } else {
      navigate('/theater-owner/theaters');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Loading theater..." />
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
        <div className="mb-8">
          <Link
            to={`/theater-owner/theaters/${theater.id}`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 inline-block"
          >
            ← Back to Theater Details
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Theater</h1>
          <p className="text-gray-600 mt-1">
            Update information for "{theater.name}"
          </p>
        </div>

        {/* Error Display */}
        {updateTheaterMutation.error && (
          <Alert
            type="error"
            title="Failed to Update Theater"
            message={getErrorMessage(updateTheaterMutation.error)}
            className="mb-6"
          />
        )}

        {/* Form */}
        <div className="max-w-4xl">
          <Card padding="lg">
            <TheaterForm
              theater={theater}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={updateTheaterMutation.isPending}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TheaterOwnerEditTheaterPage;