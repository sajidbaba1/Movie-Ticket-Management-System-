import React from 'react';
import { Button } from '../ui';
import type { User } from '../../types';

interface AdminCardProps {
  admin: User;
  onEdit: (admin: User) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, active: boolean) => void;
  isLoading?: boolean;
}

const AdminCard: React.FC<AdminCardProps> = ({
  admin,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
}) => {
  const handleEdit = () => {
    onEdit(admin);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete admin "${admin.firstName} ${admin.lastName}"?`)) {
      onDelete(admin.id);
    }
  };

  const handleToggleStatus = () => {
    const action = admin.active ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} admin "${admin.firstName} ${admin.lastName}"?`)) {
      onToggleStatus(admin.id, !admin.active);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {admin.firstName} {admin.lastName}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                }`}>
                {admin.active ? 'Active' : 'Inactive'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Admin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 text-sm">📧</span>
          <span className="text-gray-700 text-sm">{admin.email}</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-500 text-sm">📅</span>
          <span className="text-gray-700 text-sm">
            Created: {new Date(admin.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleEdit}
          disabled={isLoading}
        >
          <span className="mr-1">✏️</span>
          Edit
        </Button>

        <Button
          variant={admin.active ? "secondary" : "primary"}
          size="sm"
          onClick={handleToggleStatus}
          disabled={isLoading}
        >
          <span className="mr-1">{admin.active ? '🔒' : '🔓'}</span>
          {admin.active ? 'Deactivate' : 'Activate'}
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          disabled={isLoading}
        >
          <span className="mr-1">🗑️</span>
          Delete
        </Button>
      </div>
    </div>
  );
};

export default AdminCard;