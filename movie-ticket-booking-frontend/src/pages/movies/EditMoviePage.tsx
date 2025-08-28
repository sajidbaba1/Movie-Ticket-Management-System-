import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMovie, useUpdateMovie } from '../../hooks';
import { MovieForm } from '../../components/movies';
import { Card, Alert, Loading } from '../../components/ui';
import type { CreateMovieRequest } from '../../types';
import { ROUTES } from '../../constants';
import { getErrorMessage } from '../../utils';

const EditMoviePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const movieId = id ? parseInt(id, 10) : 0;

  const { data: movie, isLoading, error } = useMovie(movieId);
  const updateMovieMutation = useUpdateMovie();

  const handleSubmit = async (data: CreateMovieRequest) => {
    if (!movie) return;

    try {
      await updateMovieMutation.mutateAsync({
        id: movie.id,
        movieData: data
      });
      navigate(`/movies/${movie.id}`);
    } catch (error) {
      console.error('Failed to update movie:', error);
    }
  };

  const handleCancel = () => {
    if (movie) {
      navigate(`/movies/${movie.id}`);
    } else {
      navigate(ROUTES.MOVIES);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <Loading size="lg" text="Loading movie..." />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="p-6">
        <Alert
          type="error"
          title="Movie Not Found"
          message={error ? getErrorMessage(error) : "The requested movie could not be found."}
        />
        <div className="mt-4">
          <Link to={ROUTES.MOVIES}>
            <button className="btn-outline">← Back to Movies</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to={`/movies/${movie.id}`}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 inline-block"
        >
          ← Back to Movie Details
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Movie</h1>
        <p className="text-gray-600 mt-1">
          Update information for "{movie.title}"
        </p>
      </div>

      {/* Error Display */}
      {updateMovieMutation.error && (
        <Alert
          type="error"
          title="Failed to Update Movie"
          message={getErrorMessage(updateMovieMutation.error)}
        />
      )}

      {/* Form */}
      <Card>
        <MovieForm
          movie={movie}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMovieMutation.isPending}
        />
      </Card>
    </div>
  );
};

export default EditMoviePage;