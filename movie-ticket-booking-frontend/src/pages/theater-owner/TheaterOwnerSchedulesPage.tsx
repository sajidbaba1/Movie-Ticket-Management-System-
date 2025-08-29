import React, { useState } from 'react';
import {
  useMySchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useToggleScheduleStatus
} from '../../hooks/useSchedules';
import { useMyTheaters } from '../../hooks/useTheaterOwner';
import { ScheduleCard } from '../../components/schedules';
import ScheduleForm from '../../components/schedules/ScheduleForm';
import { Button, Input, Select, Modal, Alert, Card } from '../../components/ui';
import type { Schedule, CreateScheduleRequest } from '../../types';

const TheaterOwnerSchedulesPage: React.FC = () => {
  // State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTheater, setFilterTheater] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'movie' | 'theater'>('date');

  // Hooks
  const { data: schedules = [], isLoading, error } = useMySchedules();
  // const { data: movies = [] } = useMovies();
  const { data: theaters = [] } = useMyTheaters();

  const createScheduleMutation = useCreateSchedule();
  const updateScheduleMutation = useUpdateSchedule();
  const deleteScheduleMutation = useDeleteSchedule();
  const toggleStatusMutation = useToggleScheduleStatus();

  // Filter and sort schedules
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch =
      schedule.movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.movie.genre.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === '' ||
      (filterStatus === 'active' && schedule.active) ||
      (filterStatus === 'inactive' && !schedule.active) ||
      (filterStatus === 'upcoming' && new Date(schedule.showTime) > new Date()) ||
      (filterStatus === 'past' && new Date(schedule.showTime) < new Date());

    const matchesTheater = filterTheater === '' || schedule.theater.id.toString() === filterTheater;

    return matchesSearch && matchesStatus && matchesTheater;
  });

  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    switch (sortBy) {
      case 'movie':
        return a.movie.title.localeCompare(b.movie.title);
      case 'theater':
        return a.theater.name.localeCompare(b.theater.name);
      case 'date':
      default:
        return new Date(a.showTime).getTime() - new Date(b.showTime).getTime();
    }
  });

  // Handlers
  const handleCreateSchedule = (scheduleData: CreateScheduleRequest) => {
    createScheduleMutation.mutate(scheduleData, {
      onSuccess: () => {
        setShowCreateForm(false);
      }
    });
  };

  const handleUpdateSchedule = (scheduleData: CreateScheduleRequest) => {
    if (!editingSchedule) return;

    updateScheduleMutation.mutate(
      { id: editingSchedule.id, scheduleData },
      {
        onSuccess: () => {
          setEditingSchedule(null);
        }
      }
    );
  };

  const handleDeleteSchedule = () => {
    if (!deletingSchedule) return;

    deleteScheduleMutation.mutate(deletingSchedule.id, {
      onSuccess: () => {
        setDeletingSchedule(null);
      }
    });
  };

  const handleToggleStatus = (schedule: Schedule) => {
    toggleStatusMutation.mutate({ id: schedule.id, active: !schedule.active });
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred';
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past' }
  ];

  const theaterOptions = [
    { value: '', label: 'All Theaters' },
    ...theaters.map(theater => ({
      value: theater.id.toString(),
      label: theater.name
    }))
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading your schedules...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Movie Schedules 📅</h1>
            <p className="text-gray-600">Manage your movie showtimes and schedules</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto"
          >
            + Add New Schedule
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert
            type="error"
            title="Error Loading Schedules"
            message={getErrorMessage(error)}
            className="mb-6"
          />
        )}

        {/* Filters */}
        <Card padding="lg" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Schedules
              </label>
              <Input
                type="text"
                placeholder="Search by movie, theater, or genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={statusOptions}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theater
              </label>
              <Select
                value={filterTheater}
                onChange={(e) => setFilterTheater(e.target.value)}
                options={theaterOptions}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'movie' | 'theater')}
                options={[
                  { value: 'date', label: 'Show Date' },
                  { value: 'movie', label: 'Movie Title' },
                  { value: 'theater', label: 'Theater Name' }
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Schedules Grid */}
        {sortedSchedules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedSchedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onEdit={setEditingSchedule}
                onDelete={setDeletingSchedule}
                onToggleStatus={handleToggleStatus}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus || filterTheater ? 'No schedules found' : 'No schedules yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus || filterTheater
                ? 'Try adjusting your search criteria or filters'
                : 'Create your first movie schedule to get started'
              }
            </p>
            {!(searchTerm || filterStatus || filterTheater) && (
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="primary"
              >
                Create Your First Schedule
              </Button>
            )}
          </div>
        )}

        {/* Create Schedule Modal */}
        <Modal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Create New Schedule"
        >
          <ScheduleForm
            onSubmit={handleCreateSchedule}
            onCancel={() => setShowCreateForm(false)}
            isLoading={createScheduleMutation.isPending}
          />
        </Modal>

        {/* Edit Schedule Modal */}
        <Modal
          isOpen={!!editingSchedule}
          onClose={() => setEditingSchedule(null)}
          title="Edit Schedule"
        >
          {editingSchedule && (
            <ScheduleForm
              schedule={editingSchedule}
              onSubmit={handleUpdateSchedule}
              onCancel={() => setEditingSchedule(null)}
              isLoading={updateScheduleMutation.isPending}
            />
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deletingSchedule}
          onClose={() => setDeletingSchedule(null)}
          title="Delete Schedule"
        >
          {deletingSchedule && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete the schedule for{' '}
                <strong>{deletingSchedule.movie.title}</strong> at{' '}
                <strong>{deletingSchedule.theater.name}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="danger"
                  onClick={handleDeleteSchedule}
                  loading={deleteScheduleMutation.isPending}
                  className="flex-1"
                >
                  Delete Schedule
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeletingSchedule(null)}
                  disabled={deleteScheduleMutation.isPending}
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

export default TheaterOwnerSchedulesPage;