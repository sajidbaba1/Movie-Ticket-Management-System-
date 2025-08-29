import React, { useState } from 'react';
import { Button, Input, Modal } from '../../components/ui';
import AdminCard from '../../components/admin/AdminCard';
import AdminForm from '../../components/admin/AdminForm';
import {
  useAdmins,
  useCreateAdmin,
  useUpdateAdmin,
  useDeleteAdmin,
  useToggleAdminStatus,
} from '../../hooks/useAdmin';
import type { User, CreateUserRequest } from '../../types';

const SuperAdminAdminsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Hooks
  const { data: admins = [], isLoading, error } = useAdmins();
  const createAdminMutation = useCreateAdmin();
  const updateAdminMutation = useUpdateAdmin();
  const deleteAdminMutation = useDeleteAdmin();
  const toggleStatusMutation = useToggleAdminStatus();

  // Filter admins based on search term and status
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && admin.active) ||
      (statusFilter === 'inactive' && !admin.active);

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleCreateAdmin = (adminData: CreateUserRequest | Partial<User>) => {
    createAdminMutation.mutate(adminData as CreateUserRequest, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      },
    });
  };

  const handleEditAdmin = (admin: User) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  };

  const handleUpdateAdmin = (adminData: Partial<User>) => {
    if (!selectedAdmin) return;

    updateAdminMutation.mutate(
      { id: selectedAdmin.id, adminData },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSelectedAdmin(null);
        },
      }
    );
  };

  const handleDeleteAdmin = (id: number) => {
    deleteAdminMutation.mutate(id);
  };

  const handleToggleStatus = (id: number, active: boolean) => {
    toggleStatusMutation.mutate({ id, active });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Admins</h2>
          <p className="text-gray-600">Failed to load admin data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Management</h1>
          <p className="text-gray-600">Manage administrator accounts</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="mt-4 sm:mt-0"
        >
          <span className="mr-2">➕</span>
          Create Admin
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {filteredAdmins.length} of {admins.length} admin{admins.length !== 1 ? 's' : ''}
          </span>
          <div className="flex space-x-4 text-sm">
            <span className="text-green-600">
              Active: {admins.filter(admin => admin.active).length}
            </span>
            <span className="text-red-600">
              Inactive: {admins.filter(admin => !admin.active).length}
            </span>
          </div>
        </div>
      </div>

      {/* Admins Grid */}
      {filteredAdmins.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
          <span className="text-4xl mb-4 block">👥</span>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Admins Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'No admins match your current filters.'
              : 'No admin users have been created yet.'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              Create First Admin
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAdmins.map((admin) => (
            <AdminCard
              key={admin.id}
              admin={admin}
              onEdit={handleEditAdmin}
              onDelete={handleDeleteAdmin}
              onToggleStatus={handleToggleStatus}
              isLoading={
                createAdminMutation.isPending ||
                updateAdminMutation.isPending ||
                deleteAdminMutation.isPending ||
                toggleStatusMutation.isPending
              }
            />
          ))}
        </div>
      )}

      {/* Create Admin Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Admin"
      >
        <AdminForm
          onSubmit={handleCreateAdmin}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createAdminMutation.isPending}
        />
      </Modal>

      {/* Edit Admin Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAdmin(null);
        }}
        title="Edit Admin"
      >
        {selectedAdmin && (
          <AdminForm
            admin={selectedAdmin}
            onSubmit={handleUpdateAdmin}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedAdmin(null);
            }}
            isLoading={updateAdminMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
};

export default SuperAdminAdminsPage;