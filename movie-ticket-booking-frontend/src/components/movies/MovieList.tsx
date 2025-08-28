import React, { useState } from 'react';
import type { Movie } from '../../types';
import { Button, Loading, Alert, Modal } from '../ui';
import MovieCard from './MovieCard';

interface MovieListProps {
  movies: Movie[];
  isLoading?: boolean;
  error?: string | null;
  onEdit?: (movie: Movie) => void;
  onDelete?: (movie: Movie) => void;
  showActions?: boolean;
}

const MovieList: React.FC<MovieListProps> = ({
  movies,
  isLoading = false,
  error = null,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const [deleteMovie, setDeleteMovie] = useState<Movie | null>(null);

  const handleDeleteConfirm = () => {
    if (deleteMovie && onDelete) {
      onDelete(deleteMovie);
      setDeleteMovie(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loading size="lg" text="Loading movies..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Error Loading Movies"
        message={error}
      />
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No movies found</h3>
        <p className="text-gray-500 mb-6">Get started by creating your first movie.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onEdit={onEdit}
            onDelete={showActions ? (movie) => setDeleteMovie(movie) : undefined}
            showActions={showActions}
          />
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteMovie !== null}
        onClose={() => setDeleteMovie(null)}
        title="Delete Movie"
        footer={
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteMovie(null)}
            >
              Cancel
            </Button>
          </div>
        }
      >
        {deleteMovie && (
          <div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete "{deleteMovie.title}"? This action cannot be undone.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> This will permanently remove the movie from the system.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default MovieList;