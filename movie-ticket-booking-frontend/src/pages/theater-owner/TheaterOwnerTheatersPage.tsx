import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  useMyTheaters,
  useCreateTheater,
  useUpdateTheater,
  useDeleteTheater,
  useToggleTheaterStatus
} from '../../hooks/useTheaterOwner';
import { TheaterForm, TheaterCard } from '../../components/theaters';
import { Button, Input, Card, Modal, Alert, Loading } from '../../components/ui';
import type { Theater, CreateTheaterRequest } from '../../types';
import { getErrorMessage } from '../../utils';

const TheaterOwnerTheatersPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTheater, setEditingTheater] = useState<Theater | null>(null);
  const [deletingTheater, setDeletingTheater] = useState<Theater | null>(null);

  const { data: theaters = [], isLoading, error } = useMyTheaters();
  const createTheaterMutation = useCreateTheater();
  const updateTheaterMutation = useUpdateTheater();
  const deleteTheaterMutation = useDeleteTheater();
  const toggleStatusMutation = useToggleTheaterStatus();

  // Filter theaters based on search
  const filteredTheaters = theaters.filter((theater) =>
    theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    theater.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    theater.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTheater = async (theaterData: CreateTheaterRequest) => {
    if (!user) return;

    const theaterWithOwner = {
      ...theaterData,
      owner: { id: user.id }
    };

    try {
      await createTheaterMutation.mutateAsync(theaterWithOwner);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create theater:', error);
    }
  };

  const handleUpdateTheater = async (theaterData: CreateTheaterRequest) => {
    if (!editingTheater || !user) return;

    const theaterWithOwner = {
      ...theaterData,
      owner: { id: user.id }
    };

    try {
      await updateTheaterMutation.mutateAsync({
        id: editingTheater.id,
        theaterData: theaterWithOwner
      });
      setEditingTheater(null);
    } catch (error) {
      console.error('Failed to update theater:', error);
    }
  };

  const handleDeleteTheater = async () => {
    if (!deletingTheater) return;

    try {
      await deleteTheaterMutation.mutateAsync(deletingTheater.id);
      setDeletingTheater(null);
    } catch (error) {
      console.error('Failed to delete theater:', error);
    }
  };

  const handleToggleStatus = async (theater: Theater) => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: theater.id,
        active: !theater.active
      });
    } catch (error) {
      console.error('Failed to toggle theater status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Loading your theaters..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Theaters 🏢</h1>
            <p className="text-gray-600">Manage your theater locations and settings</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto"
          >
            + Add New Theater
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert
            type="error"
            title="Error Loading Theaters"
            message={getErrorMessage(error)}
            className="mb-6"
          />
        )}

        {/* Search and Filters */}
        <Card padding="lg" className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search theaters by name, city, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Theaters Grid */}
        {filteredTheaters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTheaters.map((theater) => (
              <TheaterCard
                key={theater.id}
                theater={theater}
                onEdit={setEditingTheater}
                onDelete={setDeletingTheater}
                onToggleStatus={handleToggleStatus}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No theaters found' : 'No theaters yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Create your first theater to get started'
              }
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="primary"
              >
                Create Your First Theater
              </Button>
            )}
          </div>
        )}

        {/* Create Theater Modal */}
        <Modal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Create New Theater"
        >
          <TheaterForm
            onSubmit={handleCreateTheater}
            onCancel={() => setShowCreateForm(false)}
            isLoading={createTheaterMutation.isPending}
          />
        </Modal>

        {/* Edit Theater Modal */}
        <Modal
          isOpen={!!editingTheater}
          onClose={() => setEditingTheater(null)}
          title="Edit Theater"
        >
          {editingTheater && (
            <TheaterForm
              theater={editingTheater}
              onSubmit={handleUpdateTheater}
              onCancel={() => setEditingTheater(null)}
              isLoading={updateTheaterMutation.isPending}
            />
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deletingTheater}
          onClose={() => setDeletingTheater(null)}
          title="Delete Theater"
        >
          {deletingTheater && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{deletingTheater.name}</strong>?
                This action cannot be undone and will remove all associated data.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="danger"
                  onClick={handleDeleteTheater}
                  loading={deleteTheaterMutation.isPending}
                  className="flex-1"
                >
                  Delete Theater
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeletingTheater(null)}
                  disabled={deleteTheaterMutation.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default TheaterOwnerTheatersPage;