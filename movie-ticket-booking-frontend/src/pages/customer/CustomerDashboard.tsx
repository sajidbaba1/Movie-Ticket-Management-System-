import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMovies } from '../../hooks/useMovies';
import { useTheaters } from '../../hooks/useTheaters';
import { Button, Input, Card } from '../../components/ui';
import { MovieCard } from '../../components/movies';
import type { Theater } from '../../types';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: movies = [] } = useMovies();
  const { data: theaters = [] } = useTheaters();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Get featured movies (first 6 active movies)
  const featuredMovies = movies
    .filter((movie) => movie.active)
    .slice(0, 6);

  // Filter movies based on search and filters
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || movie.genre === selectedGenre;

    return movie.active && matchesSearch && matchesGenre;
  });

  // Get unique genres and cities
  const genres = [...new Set(movies.map(movie => movie.genre))];
  const cities = [...new Set((theaters as Theater[]).map((theater: Theater) => theater.city))];

  const quickActions = [
    {
      title: 'Browse Movies',
      description: 'Discover the latest movies playing in theaters',
      icon: '🎬',
      link: '/customer/movies',
      color: 'bg-blue-500',
    },
    {
      title: 'Find Theaters',
      description: 'Locate theaters near you',
      icon: '🏢',
      link: '/customer/theaters',
      color: 'bg-green-500',
    },
    {
      title: 'My Bookings',
      description: 'View and manage your ticket bookings',
      icon: '🎫',
      link: '/customer/bookings',
      color: 'bg-purple-500',
    },
    {
      title: 'Profile',
      description: 'Manage your account settings',
      icon: '👤',
      link: '/customer/profile',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-responsive py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Ready to book your next movie experience?
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8 space-y-8">
        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <div className="p-6">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white text-2xl mb-4`}>
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Movie Search */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Find Movies</h2>
            <Link to="/customer/movies">
              <Button variant="outline" size="sm">
                View All Movies →
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <Card padding="lg" className="mb-6">
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

          {/* Movie Results */}
          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(searchTerm || selectedGenre ? filteredMovies : featuredMovies).map((movie) => (
                <div key={movie.id}>
                  <MovieCard
                    movie={movie}
                    showActions={true}
                    customerView={true}
                  />
                  <div className="mt-4">
                    <Link to={`/customer/movies/${movie.id}/book`}>
                      <Button variant="primary" size="md" fullWidth>
                        Book Tickets 🎫
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Movies Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGenre('');
                  setSelectedCity('');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </section>

        {/* Statistics */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Movie Hub Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card padding="lg">
              <div className="flex items-center">
                <div className="bg-blue-500 text-white p-3 rounded-lg">
                  <span className="text-2xl">🎬</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{movies.filter(m => m.active).length}</p>
                  <p className="text-gray-600">Movies Available</p>
                </div>
              </div>
            </Card>
            <Card padding="lg">
              <div className="flex items-center">
                <div className="bg-green-500 text-white p-3 rounded-lg">
                  <span className="text-2xl">🏢</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{theaters.filter(t => t.active).length}</p>
                  <p className="text-gray-600">Active Theaters</p>
                </div>
              </div>
            </Card>
            <Card padding="lg">
              <div className="flex items-center">
                <div className="bg-purple-500 text-white p-3 rounded-lg">
                  <span className="text-2xl">🌟</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{genres.length}</p>
                  <p className="text-gray-600">Movie Genres</p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerDashboard;