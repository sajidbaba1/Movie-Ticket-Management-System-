import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateMovie } from '../../hooks';
import { MovieForm } from '../../components/movies';
import { Card, Alert } from '../../components/ui';
import type { CreateMovieRequest } from '../../types';
import { ROUTES } from '../../constants';
import { getErrorMessage } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';

const CreateMoviePage: React.FC = () => {
  const navigate = useNavigate();
  const createMovieMutation = useCreateMovie();
  const { user } = useAuth();

  const handleSubmit = async (data: CreateMovieRequest) => {
    try {
      const newMovie = await createMovieMutation.mutateAsync(data);
      if (user?.role === 'THEATER_OWNER') {
        // After creating a movie, take owner to schedules to add showtimes
        navigate('/theater-owner/schedules');
      } else {
        navigate(`/movies/${newMovie.id}`);
      }
    } catch (error) {
      console.error('Failed to create movie:', error);
    }
  };

  const handleCancel = () => {
    if (user?.role === 'THEATER_OWNER') {
      navigate('/theater-owner');
    } else {
      navigate(ROUTES.MOVIES);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        {user?.role === 'THEATER_OWNER' ? (
          <Link
            to="/theater-owner"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
        ) : (
          <Link
            to={ROUTES.MOVIES}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 inline-block"
          >
            ← Back to Movies
          </Link>
        )}
        <h1 className="text-3xl font-bold text-gray-900">Create New Movie</h1>
        <p className="text-gray-600 mt-1">
          Add a new movie to your collection
        </p>
      </div>

      {/* Error Display */}
      {createMovieMutation.error && (
        <Alert
          type="error"
          title="Failed to Create Movie"
          message={getErrorMessage(createMovieMutation.error)}
        />
      )}

      {/* Form */}
      <Card>
        <MovieForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMovieMutation.isPending}
        />
      </Card>
    </div>
  );
};

export default CreateMoviePage;