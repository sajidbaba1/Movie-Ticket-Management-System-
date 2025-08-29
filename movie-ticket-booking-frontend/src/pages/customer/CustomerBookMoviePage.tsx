import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMovie } from '../../hooks/useMovies';
import { useSchedulesByMovie } from '../../hooks/useSchedules';
import { useCreateBooking } from '../../hooks/useBookings';
import { Card, Button, Input } from '../../components/ui';

const CustomerBookMoviePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const movieId = Number(id);
  const { data: movie, isLoading, error } = useMovie(movieId);
  const { data: schedules = [], isLoading: loadingSchedules } = useSchedulesByMovie(movieId);
  const createBooking = useCreateBooking();

  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [seats, setSeats] = useState<number>(1);

  const selectedSchedule = useMemo(() => schedules.find((s: any) => s.id === selectedScheduleId) || null, [schedules, selectedScheduleId]);
  const maxSeats = Math.min(10, selectedSchedule?.availableSeats ?? 10);

  const onBook = async () => {
    if (!selectedScheduleId) return;
    await createBooking.mutateAsync({ scheduleId: selectedScheduleId, seatsCount: seats });
    navigate('/customer/bookings');
  };

  if (!movieId) return <div className="container-responsive py-8">Invalid movie id.</div>;
  if (isLoading) return <div className="container-responsive py-8">Loading movie...</div>;
  if (error) return <div className="container-responsive py-8 text-red-600">Failed to load movie.</div>;
  if (!movie) return <div className="container-responsive py-8">Movie not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Book: {movie.title}</h1>

        <Card padding="lg" className="space-y-5">
          {/* Schedule selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Schedule</label>
            {loadingSchedules ? (
              <div>Loading schedules...</div>
            ) : schedules.length === 0 ? (
              <div className="text-sm text-gray-600">No schedules available for this movie.</div>
            ) : (
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedScheduleId ?? ''}
                onChange={(e) => setSelectedScheduleId(Number(e.target.value))}
              >
                <option value="" disabled>
                  Select a showtime
                </option>
                {schedules.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.showTime).toLocaleDateString()} {new Date(s.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {` • ${s.theater?.name || 'Theater'} • Rs.${s.price} • Avl: ${s.availableSeats}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Seats and summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
              <Input
                type="number"
                min={1}
                max={maxSeats}
                value={seats}
                onChange={(e) => setSeats(Math.min(maxSeats, Math.max(1, Number(e.target.value))))}
                disabled={!selectedSchedule}
              />
              {selectedSchedule && (
                <div className="mt-1 text-xs text-gray-500">Available: {selectedSchedule.availableSeats}</div>
              )}
            </div>
            <div>
              <Button
                variant="primary"
                size="md"
                fullWidth
                disabled={!selectedScheduleId || seats < 1 || createBooking.isPending}
                onClick={onBook}
              >
                {createBooking.isPending ? 'Booking...' : 'Book Now'}
              </Button>
            </div>
          </div>

          {/* Price */}
          {selectedSchedule && (
            <div className="text-sm text-gray-700">
              Price per seat: <span className="font-medium">Rs.{selectedSchedule.price}</span> • Total: {' '}
              <span className="font-semibold text-primary-600">Rs.{Number(selectedSchedule.price) * seats}</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CustomerBookMoviePage;
