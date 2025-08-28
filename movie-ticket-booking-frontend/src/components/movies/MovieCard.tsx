import React from 'react';
import { Link } from 'react-router-dom';
import type { Movie } from '../../types';
import { formatDate, formatDuration } from '../../utils';
import { Card } from '../ui';

interface MovieCardProps {
  movie: Movie;
  onEdit?: (movie: Movie) => void;
  onDelete?: (movie: Movie) => void;
  showActions?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onEdit,
  onDelete,
  showActions = true
}) => {
  return (
    <Card className="movie-card group" padding="none">
      <div className="relative">
        {/* Movie Poster */}
        <div className="aspect-w-2 aspect-h-3 bg-gray-200">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-4xl text-gray-400">🎬</span>
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
            {movie.title}
          </h3>

          <div className="space-y-1 text-sm text-gray-600 mb-3">
            <p><span className="font-medium">Genre:</span> {movie.genre}</p>
            <p><span className="font-medium">Director:</span> {movie.director}</p>
            <p><span className="font-medium">Duration:</span> {formatDuration(movie.duration)}</p>
            <p><span className="font-medium">Release:</span> {formatDate(movie.releaseDate)}</p>
          </div>

          {movie.description && (
            <p className="text-sm text-gray-700 line-clamp-2 mb-3">
              {movie.description}
            </p>
          )}

          {movie.theater && (
            <p className="text-xs text-gray-500 mb-3">
              Playing at: {movie.theater.name}
            </p>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              <Link
                to={`/movies/${movie.id}`}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-3 rounded-lg text-center transition-colors duration-200"
              >
                View Details
              </Link>

              {onEdit && (
                <button
                  onClick={() => onEdit(movie)}
                  className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                >
                  Edit
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(movie)}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MovieCard;