import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { useMyTheaters } from '../../hooks/useTheaterOwner';
import { useMovies } from '../../hooks/useMovies';
import type { Schedule, CreateScheduleRequest } from '../../types';
import { Button, Input, Select } from '../ui';

interface ScheduleFormProps {
  schedule?: Schedule;
  onSubmit: (data: CreateScheduleRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  schedule,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { user } = useAuth();
  const { data: theaters = [] } = useMyTheaters(user?.id);
  const { data: movies = [] } = useMovies();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<CreateScheduleRequest>({
    defaultValues: schedule ? {
      movie: { id: schedule.movie.id },
      theater: { id: schedule.theater.id },
      showTime: schedule.showTime.slice(0, 16), // Format for datetime-local input
      price: schedule.price,
      totalSeats: schedule.totalSeats,
      availableSeats: schedule.availableSeats,
      screenNumber: schedule.screenNumber || '',
      additionalInfo: schedule.additionalInfo || '',
    } : {
      totalSeats: 100,
      availableSeats: 100,
      price: 10.00
    }
  });

  const totalSeats = watch('totalSeats');

  const theaterOptions = [
    { value: '', label: 'Select a theater' },
    ...theaters.map(theater => ({
      value: theater.id.toString(),
      label: theater.name
    }))
  ];

  const movieOptions = [
    { value: '', label: 'Select a movie' },
    ...movies.filter(movie => movie.active).map(movie => ({
      value: movie.id.toString(),
      label: movie.title
    }))
  ];

  const screenOptions = [
    { value: '', label: 'No specific screen' },
    { value: '1', label: 'Screen 1' },
    { value: '2', label: 'Screen 2' },
    { value: '3', label: 'Screen 3' },
    { value: '4', label: 'Screen 4' },
    { value: '5', label: 'Screen 5' },
  ];

  const handleFormSubmit = (data: CreateScheduleRequest) => {
    const formData = {
      ...data,
      movie: { id: Number(data.movie.id) },
      theater: { id: Number(data.theater.id) },
      price: Number(data.price),
      totalSeats: Number(data.totalSeats),
      availableSeats: Number(data.availableSeats),
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Theater"
          {...register('theater.id', { required: 'Theater is required' })}
          options={theaterOptions}
          error={errors.theater?.id?.message}
          required
        />

        <Select
          label="Movie"
          {...register('movie.id', { required: 'Movie is required' })}
          options={movieOptions}
          error={errors.movie?.id?.message}
          required
        />

        <Input
          label="Show Time"
          type="datetime-local"
          {...register('showTime', {
            required: 'Show time is required',
            validate: (value) => {
              const showTime = new Date(value);
              const now = new Date();
              return showTime > now || 'Show time must be in the future';
            }
          })}
          error={errors.showTime?.message}
          required
        />

        <Input
          label="Ticket Price ($)"
          type="number"
          step="0.01"
          min="0"
          {...register('price', {
            required: 'Price is required',
            min: {
              value: 0,
              message: 'Price must be greater than 0'
            },
            max: {
              value: 1000,
              message: 'Price must be less than $1000'
            }
          })}
          error={errors.price?.message}
          required
        />

        <Input
          label="Total Seats"
          type="number"
          min="1"
          max="1000"
          {...register('totalSeats', {
            required: 'Total seats is required',
            min: {
              value: 1,
              message: 'Must have at least 1 seat'
            },
            max: {
              value: 1000,
              message: 'Cannot exceed 1000 seats'
            }
          })}
          error={errors.totalSeats?.message}
          required
        />

        <Input
          label="Available Seats"
          type="number"
          min="0"
          max={totalSeats || 1000}
          {...register('availableSeats', {
            required: 'Available seats is required',
            min: {
              value: 0,
              message: 'Cannot be negative'
            },
            max: {
              value: totalSeats || 1000,
              message: 'Cannot exceed total seats'
            }
          })}
          error={errors.availableSeats?.message}
          required
        />

        <Select
          label="Screen Number (Optional)"
          {...register('screenNumber')}
          options={screenOptions}
          error={errors.screenNumber?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Information (Optional)
        </label>
        <textarea
          {...register('additionalInfo', {
            maxLength: {
              value: 500,
              message: 'Cannot exceed 500 characters'
            }
          })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Any special notes about this schedule..."
        />
        {errors.additionalInfo && (
          <p className="mt-1 text-sm text-red-600">{errors.additionalInfo.message}</p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
          className="flex-1"
        >
          {schedule ? 'Update Schedule' : 'Create Schedule'}
        </Button>
      </div>
    </form>
  );
};

export default ScheduleForm;