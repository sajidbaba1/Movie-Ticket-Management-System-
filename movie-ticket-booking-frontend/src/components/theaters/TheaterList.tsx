import React, { useState } from 'react';
import type { Theater } from '../../types';
import { Input, Button } from '../ui';
import TheaterCard from './TheaterCard';

interface TheaterListProps {
  theaters: Theater[];
  onEdit?: (theater: Theater) => void;
  onDelete?: (theater: Theater) => void;
  onCreateNew?: () => void;
  isLoading?: boolean;
  showActions?: boolean;
  // Optional approve action (for admin use)
  onApprove?: (theater: Theater) => void;
  // Optional override for the View Details link
  getViewLink?: (theater: Theater) => string;
}

const TheaterList: React.FC<TheaterListProps> = ({
  theaters,
  onEdit,
  onDelete,
  onCreateNew,
  isLoading = false,
  showActions = true,
  onApprove,
  getViewLink
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [cityFilter, setCityFilter] = useState('');

  // Get unique cities for filter dropdown
  const uniqueCities = [...new Set(theaters.map(theater => theater.city))].sort();

  // Filter theaters based on search term, status, and city
  const filteredTheaters = theaters.filter(theater => {
    const matchesSearch = theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theater.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theater.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && theater.active && theater.approved) ||
      (statusFilter === 'pending' && theater.active && !theater.approved) ||
      (statusFilter === 'inactive' && !theater.active);

    const matchesCity = !cityFilter || theater.city === cityFilter;

    return matchesSearch && matchesStatus && matchesCity;
  });

  const getStatusCounts = () => {
    const active = theaters.filter(t => t.active && t.approved).length;
    const pending = theaters.filter(t => t.active && !t.approved).length;
    const inactive = theaters.filter(t => !t.active).length;
    return { active, pending, inactive, total: theaters.length };
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Theaters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Theaters</h2>
          <p className="text-gray-600 mt-1">
            {filteredTheaters.length} of {theaters.length} theaters
          </p>
        </div>
        {showActions && onCreateNew && (
          <Button
            onClick={onCreateNew}
            variant="primary"
            size="md"
          >
            Add New Theater
          </Button>
        )}
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
          <p className="text-sm text-gray-600">Total Theaters</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">{statusCounts.active}</p>
          <p className="text-sm text-gray-600">Active</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
          <p className="text-sm text-gray-600">Pending Approval</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-2xl font-bold text-red-600">{statusCounts.inactive}</p>
          <p className="text-sm text-gray-600">Inactive</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search theaters
            </label>
            <Input
              id="search"
              type="text"
              placeholder="Search by name, address, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'pending' | 'inactive')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending Approval</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <select
              id="city"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || statusFilter !== 'all' || cityFilter) && (
          <div className="mt-4">
            <Button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCityFilter('');
              }}
              variant="outline"
              size="sm"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Theater Grid */}
      {filteredTheaters.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {theaters.length === 0 ? 'No theaters yet' : 'No theaters match your filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {theaters.length === 0
              ? 'Get started by adding your first theater.'
              : 'Try adjusting your search criteria.'}
          </p>
          {theaters.length === 0 && showActions && onCreateNew && (
            <Button
              onClick={onCreateNew}
              variant="primary"
              size="md"
            >
              Add Your First Theater
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTheaters.map(theater => (
            <TheaterCard
              key={theater.id}
              theater={theater}
              onEdit={onEdit}
              onDelete={onDelete}
              onApprove={onApprove}
              getViewLink={getViewLink}
              showActions={showActions}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TheaterList;