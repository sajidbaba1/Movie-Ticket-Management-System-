import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheaters, useDeleteTheater } from '../../hooks/useTheaters';
import { TheaterList } from '../../components/theaters';
import type { Theater } from '../../types';
import { toast } from 'react-hot-toast';

const TheatersPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: theaters = [], isLoading, error } = useTheaters();
  const deleteTheaterMutation = useDeleteTheater();
  const [deleteConfirm, setDeleteConfirm] = useState<Theater | null>(null);

  const handleCreateNew = () => {
    navigate('/theaters/create');
  };

  const handleEdit = (theater: Theater) => {
    navigate(`/theaters/${theater.id}/edit`);
  };

  const handleDelete = (theater: Theater) => {
    setDeleteConfirm(theater);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteTheaterMutation.mutateAsync(deleteConfirm.id);
      toast.success('Theater deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting theater:', error);
      toast.error('Failed to delete theater');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Theaters</h2>
          <p className="text-red-600">
            {error instanceof Error ? error.message : 'Failed to load theaters'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <TheaterList
        theaters={theaters as Theater[]}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
        isLoading={isLoading}
        showActions={true}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Theater
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmDelete}
                disabled={deleteTheaterMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {deleteTheaterMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={cancelDelete}
                disabled={deleteTheaterMutation.isPending}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheatersPage;