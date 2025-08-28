import React from 'react';
import { Link } from 'react-router-dom';
import type { Theater } from '../../types';
import { formatDateTime, getUserFullName } from '../../utils';
import { Card } from '../ui';

interface TheaterCardProps {
  theater: Theater;
  onEdit?: (theater: Theater) => void;
  onDelete?: (theater: Theater) => void;
  showActions?: boolean;
}

const TheaterCard: React.FC<TheaterCardProps> = ({
  theater,
  onEdit,
  onDelete,
  showActions = true
}) => {
  return (
    <Card className="theater-card" padding="md">
      <div className="space-y-3">
        {/* Theater Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {theater.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${theater.active && theater.approved
                  ? 'bg-green-100 text-green-800'
                  : theater.active
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                {theater.active && theater.approved
                  ? 'Active'
                  : theater.active
                    ? 'Pending Approval'
                    : 'Inactive'}
              </span>
              <span className="text-xs text-gray-500">
                {theater.totalScreens} screen{theater.totalScreens !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="text-2xl">🏢</div>
        </div>

        {/* Location */}
        <div className="space-y-1 text-sm text-gray-600">
          <p className="font-medium text-gray-700">{theater.address}</p>
          <p>{theater.city}, {theater.state} {theater.zipCode}</p>
        </div>

        {/* Contact Info */}
        {(theater.phoneNumber || theater.email) && (
          <div className="space-y-1 text-sm text-gray-600">
            {theater.phoneNumber && (
              <p>📞 {theater.phoneNumber}</p>
            )}
            {theater.email && (
              <p>✉️ {theater.email}</p>
            )}
          </div>
        )}

        {/* Description */}
        {theater.description && (
          <p className="text-sm text-gray-700 line-clamp-2">
            {theater.description}
          </p>
        )}

        {/* Owner */}
        <div className="text-xs text-gray-500">
          Owner: {getUserFullName(theater.owner)}
        </div>

        {/* Creation Date */}
        <div className="text-xs text-gray-400">
          Created: {formatDateTime(theater.createdAt)}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Link
              to={`/theaters/${theater.id}`}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-3 rounded-lg text-center transition-colors duration-200"
            >
              View Details
            </Link>

            {onEdit && (
              <button
                onClick={() => onEdit(theater)}
                className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200"
              >
                Edit
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(theater)}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TheaterCard;