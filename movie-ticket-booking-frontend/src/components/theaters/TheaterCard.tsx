import React from 'react';
import { Link } from 'react-router-dom';
import type { Theater } from '../../types';
import { Card, Button } from '../ui';
import { formatDateTime } from '../../utils';

interface TheaterCardProps {
  theater: Theater;
  onEdit?: (theater: Theater) => void;
  onDelete?: (theater: Theater) => void;
  onToggleStatus?: (theater: Theater) => void;
  showActions?: boolean;
}

const TheaterCard: React.FC<TheaterCardProps> = ({
  theater,
  onEdit,
  onDelete,
  onToggleStatus,
  showActions = true
}) => {
  return (
    <Card className="theater-card group" padding="lg">
      <div className="space-y-4">
        {/* Theater Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {theater.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${theater.active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                }`}>
                {theater.active ? 'Active' : 'Inactive'}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${theater.approved
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
                }`}>
                {theater.approved ? 'Approved' : 'Pending Approval'}
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>ID: {theater.id}</p>
          </div>
        </div>

        {/* Theater Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center text-gray-600">
              <span className="mr-2">📍</span>
              <div>
                <p className="font-medium text-gray-900">{theater.address}</p>
                <p>{theater.city}, {theater.state} {theater.zipCode}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <span className="mr-2">🎬</span>
              <div>
                <p className="font-medium text-gray-900">{theater.totalScreens} Screens</p>
                <p>Movie theater complex</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {(theater.phoneNumber || theater.email) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {theater.phoneNumber && (
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📞</span>
                  <span>{theater.phoneNumber}</span>
                </div>
              )}

              {theater.email && (
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">✉️</span>
                  <span className="truncate">{theater.email}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {theater.description && (
            <div className="text-sm">
              <p className="text-gray-700 line-clamp-2">{theater.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            <p>Created: {formatDateTime(theater.createdAt)}</p>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
            <Link
              to={`/theater-owner/theaters/${theater.id}`}
              className="flex-1 min-w-0"
            >
              <Button
                variant="primary"
                size="sm"
                className="w-full"
              >
                View Details
              </Button>
            </Link>

            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(theater)}
                className="flex-1 min-w-0"
              >
                Edit
              </Button>
            )}

            {onToggleStatus && (
              <Button
                variant={theater.active ? "danger" : "success"}
                size="sm"
                onClick={() => onToggleStatus(theater)}
                className="flex-1 min-w-0"
              >
                {theater.active ? 'Deactivate' : 'Activate'}
              </Button>
            )}

            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(theater)}
                className="flex-1 min-w-0"
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TheaterCard;