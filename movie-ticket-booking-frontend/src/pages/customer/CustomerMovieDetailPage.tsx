import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMovie } from '../../hooks/useMovies';
import { Card, Button } from '../../components/ui';

const CustomerMovieDetailPage: React.FC = () => {
  const { id } = useParams();
  const movieId = Number(id);
  const { data: movie, isLoading, error } = useMovie(movieId);

  if (!movieId) {
    return <div className="container-responsive py-8">Invalid movie id.</div>;
  }

  if (isLoading) {
    return <div className="container-responsive py-8">Loading movie...</div>;
  }

  if (error) {
    return <div className="container-responsive py-8 text-red-600">Failed to load movie.</div>;
  }

  if (!movie) {
    return <div className="container-responsive py-8">Movie not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{movie.title}</h1>
          <Link to={`/customer/movies/${movie.id}/book`}>
            <Button variant="primary">Book Tickets</Button>
          </Link>
        </div>

        <Card padding="lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <p className="text-gray-700">{movie.description || 'No description available.'}</p>
              <div className="text-sm text-gray-600 space-y-1">
                <div><span className="font-semibold">Genre:</span> {movie.genre || 'N/A'}</div>
                <div><span className="font-semibold">Duration:</span> {movie.duration ? `${movie.duration} min` : 'N/A'}</div>
                <div><span className="font-semibold">Active:</span> {movie.active ? 'Yes' : 'No'}</div>
              </div>
            </div>
            <div>
              <div className="w-full h-56 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                Poster
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CustomerMovieDetailPage;
