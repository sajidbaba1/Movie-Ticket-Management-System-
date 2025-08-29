import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheaters } from '../../hooks/useTheaters';
import { Button, Input, Card } from '../../components/ui';
import type { Theater } from '../../types';

const CustomerTheatersPage: React.FC = () => {
  const { data: theaters = [] } = useTheaters();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Filter theaters based on search and filters
  const filteredTheaters = (theaters as Theater[]).filter((theater: Theater) => {
    const name = (theater.name || '').toLowerCase();
    const address = (theater.address || '').toLowerCase();
    const city = (theater.city || '').toLowerCase();
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch = name.includes(term) || address.includes(term) || city.includes(term);
    const matchesCity = !selectedCity || (theater.city || '') === selectedCity;

    return !!theater.active && matchesSearch && matchesCity;
  });

  // Get unique cities
  const cities = [...new Set((theaters as Theater[]).map((theater: Theater) => theater.city))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Theaters 🏢</h1>
          <p className="text-gray-600">Find the perfect theater for your movie experience</p>
        </div>

        {/* Search and Filters */}
        <Card padding="lg" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Theaters
              </label>
              <Input
                type="text"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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

        {/* Theaters Grid */}
        {filteredTheaters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTheaters.map((theater) => (
              <Card key={theater.id} padding="lg" className="hover:shadow-lg transition-all duration-200">
                <div className="space-y-4">
                  {/* Theater Info */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{theater.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="mr-2">📍</span>
                        <span>{theater.address}, {theater.city}, {theater.state}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">🏙️</span>
                        <span>{theater.city}, {theater.state}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">💺</span>
                        <span>{theater.totalScreens} screens</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🎬 Digital
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        🍿 Snacks
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        🅿️ Parking
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        ❄️ AC
                      </span>
                    </div>
                  </div>

                  {/* Currently Showing */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Currently Showing</h4>
                    <div className="text-sm text-gray-600">
                      <p>• Avengers: Endgame</p>
                      <p>• Spider-Man: No Way Home</p>
                      <p>• The Batman</p>
                      <Link
                        to={`/customer/theaters/${theater.id}/movies`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View all showtimes →
                      </Link>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => navigate(`/customer/theaters/${theater.id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => navigate(`/customer/theaters/${theater.id}/movies`)}
                      >
                        Browse Movies
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No theaters found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCity
                ? 'Try adjusting your search criteria or filters'
                : 'No theaters are currently available'}
            </p>
            {(searchTerm || selectedCity) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCity('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Why Choose Our Partner Theaters?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card padding="lg" className="text-center">
              <div className="text-3xl mb-4">🎭</div>
              <h3 className="font-semibold text-gray-900 mb-2">Premium Experience</h3>
              <p className="text-sm text-gray-600">
                State-of-the-art sound systems and comfortable seating for the ultimate movie experience.
              </p>
            </Card>
            <Card padding="lg" className="text-center">
              <div className="text-3xl mb-4">🎫</div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Booking</h3>
              <p className="text-sm text-gray-600">
                Book your tickets in advance with our simple and secure online booking system.
              </p>
            </Card>
            <Card padding="lg" className="text-center">
              <div className="text-3xl mb-4">🍿</div>
              <h3 className="font-semibold text-gray-900 mb-2">Great Amenities</h3>
              <p className="text-sm text-gray-600">
                Enjoy delicious snacks, beverages, and other amenities during your movie.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTheatersPage;