import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMovies } from '../../hooks/useMovies';
import { useTheaters } from '../../hooks/useTheaters';
import { Button, Input, Card } from '../../components/ui';
import { MovieCard } from '../../components/movies';
import type { Theater } from '../../types';

const CustomerMoviesPage: React.FC = () => {
  const { data: movies = [] } = useMovies();
  const { data: theaters = [] } = useTheaters();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Filter movies based on search and filters
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || movie.genre === selectedGenre;

    return movie.active && matchesSearch && matchesGenre;
  });

  // Get unique genres and cities
  const genres = [...new Set(movies.map(movie => movie.genre))];
  const cities = [...new Set((theaters as Theater[]).map(theater => theater.city))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Movies 🎬</h1>
          <p className="text-gray-600">Discover amazing movies and book your tickets</p>
        </div>

        {/* Search and Filters */}
        <Card padding="lg" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Movies
              </label>
              <Input
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genre
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <div key={movie.id} className="space-y-4">
                <MovieCard
                  movie={movie}
                  showActions={true}
                  customerView={true}
                />
                <Link to={`/customer/movies/${movie.id}/book`}>
                  <Button variant="primary" size="md" fullWidth>
                    Book Tickets 🎫
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No movies found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedGenre
                ? 'Try adjusting your search criteria or filters'
                : 'No movies are currently available'}
            </p>
            {(searchTerm || selectedGenre) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGenre('');
                  setSelectedCity('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerMoviesPage;