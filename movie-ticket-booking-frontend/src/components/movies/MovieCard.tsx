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
  customerView?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onEdit,
  onDelete,
  showActions = true,
  customerView = false
}) => {
  return (
    <Card className="movie-card group" padding="none">
      <div className="relative">
        {/* Movie Poster */}
        <div className="aspect-w-2 aspect-h-3 bg-gray-200 relative overflow-hidden rounded-t-xl">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors duration-300">
              <span className="text-4xl text-gray-400">🎬</span>
            </div>
          )}
          {customerView && (
            <div className="absolute top-2 right-2">
              <span className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                {movie.genre}
              </span>
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
              {customerView ? (
                <>
                  <Link
                    to={`/customer/movies/${movie.id}`}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg text-center transition-colors duration-200"
                  >
                    Details
                  </Link>
                  <Link
                    to={`/customer/movies/${movie.id}/book`}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-3 rounded-lg text-center transition-colors duration-200"
                  >
                    Book Now
                  </Link>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MovieCard;