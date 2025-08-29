import React from 'react';
import { Link } from 'react-router-dom';
import type { User, UserRole } from '../../types';
import { formatDateTime, getUserFullName, getRoleIcon, getRoleLabel, normalizeRole } from '../../utils';
import { Card } from '../ui';

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  showActions?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const getRoleColor = (roleInput: UserRole | string) => {
    const role = normalizeRole(roleInput as string);
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'THEATER_OWNER':
        return 'bg-blue-100 text-blue-800';
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="user-card" padding="md">
      <div className="space-y-3">
        {/* User Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-lg">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {getUserFullName(user)}
              </h3>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>
          </div>
          <div className="text-2xl">
            {getRoleIcon(user.role)}
          </div>
        </div>

        {/* Role and Status */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
            {getRoleLabel(user.role)}
          </span>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
            }`}>
            {user.active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* User Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>User ID:</span>
            <span className="font-mono text-gray-900">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Role:</span>
            <span className="font-medium text-gray-900">
              {user.role.replace('_', ' ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={`font-medium ${user.active ? 'text-green-600' : 'text-red-600'
              }`}>
              {user.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Creation Date */}
        <div className="text-xs text-gray-400">
          Joined: {formatDateTime(user.createdAt)}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Link
              to={`/users/${user.id}`}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-3 rounded-lg text-center transition-colors duration-200"
            >
              View Details
            </Link>

            {onEdit && (
              <button
                onClick={() => onEdit(user)}
                className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200"
              >
                Edit
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(user)}
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

export default UserCard;