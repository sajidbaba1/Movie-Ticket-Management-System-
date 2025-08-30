import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMovies } from '../../hooks/useMovies';
import { Button, Card } from '../../components/ui';

const TheaterOwnerMoviesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: movies = [], isLoading, isError } = useMovies();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-responsive py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Movies</h1>
            <p className="text-gray-600 mt-1">View and manage the movies you have added.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate('/theater-owner/movies/create')}>
              + Add New Movie
            </Button>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8">
        {isLoading && (
          <Card padding="lg"><div>Loading movies...</div></Card>
        )}
        {isError && (
          <Card padding="lg"><div className="text-red-600">Error loading movies</div></Card>
        )}
        {!isLoading && !isError && (
          movies.length === 0 ? (
            <Card padding="lg">
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No movies yet</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first movie.</p>
                <Button onClick={() => navigate('/theater-owner/movies/create')}>Add Movie</Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {movies.map((movie: any) => (
                <Card key={movie.id} className="h-full">
                  <div className="p-4">
                    <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-gray-100 mb-4 flex items-center justify-center">
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">🎞️</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{movie.title}</h3>
                    <p className="text-sm text-gray-600">{movie.genre} • {movie.duration} min</p>
                    <p className="text-xs mt-1">
                      <span className={movie.active ? 'text-green-600' : 'text-gray-500'}>
                        {movie.active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <Link to={`/theater-owner/schedules`} className="text-primary-600 text-sm hover:underline">Manage Schedules</Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TheaterOwnerMoviesPage;
