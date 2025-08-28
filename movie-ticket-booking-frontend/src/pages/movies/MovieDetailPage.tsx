import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMovie, useDeleteMovie } from '../../hooks';
import { Button, Loading, Alert, Card } from '../../components/ui';
import { ROUTES } from '../../constants';
import { formatDate, formatDateTime, formatDuration, getErrorMessage } from '../../utils';

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const movieId = id ? parseInt(id, 10) : 0;

  const { data: movie, isLoading, error } = useMovie(movieId);
  const deleteMovieMutation = useDeleteMovie();

  const handleDelete = async () => {
    if (movie && window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await deleteMovieMutation.mutateAsync(movie.id);
        navigate(ROUTES.MOVIES);
      } catch (error) {
        console.error('Failed to delete movie:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <Loading size="lg" text="Loading movie details..." />
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
            <Button variant="outline">← Back to Movies</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <Link to={ROUTES.MOVIES} className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 inline-block">
            ← Back to Movies
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{movie.title}</h1>
          <p className="text-gray-600 mt-1">{movie.genre} • {formatDuration(movie.duration)}</p>
        </div>

        <div className="flex gap-2">
          <Link to={`/movies/${movie.id}/edit`}>
            <Button variant="outline">Edit Movie</Button>
          </Link>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deleteMovieMutation.isPending}
          >
            Delete Movie
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {deleteMovieMutation.error && (
        <Alert
          type="error"
          title="Delete Failed"
          message={getErrorMessage(deleteMovieMutation.error)}
        />
      )}

      {/* Movie Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Poster */}
        <div className="lg:col-span-1">
          <Card padding="none" className="overflow-hidden">
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-auto"
              />
            ) : (
              <div className="aspect-w-2 aspect-h-3 bg-gray-200 flex items-center justify-center">
                <span className="text-6xl text-gray-400">🎬</span>
              </div>
            )}
          </Card>
        </div>

        {/* Movie Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Movie Information</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Director</dt>
                <dd className="text-sm text-gray-900">{movie.director}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Genre</dt>
                <dd className="text-sm text-gray-900">{movie.genre}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                <dd className="text-sm text-gray-900">{formatDuration(movie.duration)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Release Date</dt>
                <dd className="text-sm text-gray-900">{formatDate(movie.releaseDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${movie.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {movie.active ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">{formatDateTime(movie.createdAt)}</dd>
              </div>
            </dl>
          </Card>

          {/* Description */}
          {movie.description && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{movie.description}</p>
            </Card>
          )}

          {/* Theater Information */}
          {movie.theater && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Theater Information</h2>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{movie.theater.name}</p>
                <p className="text-sm text-gray-600">
                  {movie.theater.address}<br />
                  {movie.theater.city}, {movie.theater.state} {movie.theater.zipCode}
                </p>
                {movie.theater.phoneNumber && (
                  <p className="text-sm text-gray-600">
                    Phone: {movie.theater.phoneNumber}
                  </p>
                )}
                <div className="mt-3">
                  <Link
                    to={`/theaters/${movie.theater.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View Theater Details →
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;