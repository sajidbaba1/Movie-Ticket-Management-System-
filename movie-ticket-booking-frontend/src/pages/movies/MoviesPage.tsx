import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMovies, useDeleteMovie, useMovieSearch } from '../../hooks';
import { MovieList } from '../../components/movies';
import { Button, Input, Select, Alert } from '../../components/ui';
import { ROUTES, MOVIE_GENRES } from '../../constants';
import type { Movie } from '../../types';
import { getErrorMessage } from '../../utils';

const MoviesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const navigate = useNavigate();

  // Hooks for data fetching and mutations
  const { data: allMovies = [], isLoading, error } = useMovies();
  const deleteMovieMutation = useDeleteMovie();
  const { searchResults, isSearching } = useMovieSearch();

  // Filter movies based on search and filters
  const filteredMovies = React.useMemo(() => {
    let movies = searchQuery ? searchResults : allMovies;

    if (selectedGenre) {
      movies = movies.filter(movie => movie.genre === selectedGenre);
    }

    if (showActiveOnly) {
      movies = movies.filter(movie => movie.active);
    }

    return movies;
  }, [allMovies, searchResults, searchQuery, selectedGenre, showActiveOnly]);

  const handleEdit = (movie: Movie) => {
    // Navigate to edit page using React Router
    navigate(`/movies/${movie.id}/edit`);
  };

  const handleDelete = async (movie: Movie) => {
    try {
      await deleteMovieMutation.mutateAsync(movie.id);
    } catch (error) {
      console.error('Failed to delete movie:', error);
    }
  };

  const genreOptions = [
    { value: '', label: 'All Genres' },
    ...MOVIE_GENRES.map(genre => ({ value: genre, label: genre }))
  ];

  const isLoadingAny = isLoading || isSearching || deleteMovieMutation.isPending;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movies</h1>
          <p className="text-gray-600 mt-1">
            Manage your movie collection and listings
          </p>
        </div>

        <Link to={ROUTES.MOVIE_CREATE}>
          <Button className="w-full sm:w-auto">
            + Add New Movie
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search movies by title, director, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<span>🔍</span>}
          />

          <Select
            options={genreOptions}
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            placeholder="Filter by genre"
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="activeOnly"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="activeOnly" className="text-sm font-medium text-gray-700">
              Show active only
            </label>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{allMovies.length}</div>
          <div className="text-sm text-gray-600">Total Movies</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{allMovies.filter(m => m.active).length}</div>
          <div className="text-sm text-gray-600">Active Movies</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{filteredMovies.length}</div>
          <div className="text-sm text-gray-600">Filtered Results</div>
        </div>
      </div>

      {/* Error Display */}
      {(error || deleteMovieMutation.error) && (
        <Alert
          type="error"
          title="Error"
          message={getErrorMessage(error || deleteMovieMutation.error)}
        />
      )}

      {/* Success Messages */}
      {deleteMovieMutation.isSuccess && (
        <Alert
          type="success"
          title="Success"
          message="Movie deleted successfully!"
        />
      )}

      {/* Movie List */}
      <MovieList
        movies={filteredMovies}
        isLoading={isLoadingAny}
        error={error ? getErrorMessage(error) : null}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showActions={true}
      />
    </div>
  );
};

export default MoviesPage;