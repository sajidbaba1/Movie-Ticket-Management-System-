import React, { useMemo, useState } from 'react';
import { Button, Card, Input } from '../../components/ui';
import { useMyBookings, useCancelBooking } from '../../hooks/useBookings';

const CustomerBookingsPage: React.FC = () => {
  // const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: myBookings = [], isLoading } = useMyBookings();
  const cancelBooking = useCancelBooking();

  const normalized = useMemo(() => {
    return myBookings.map((b: any) => {
      const raw = (b.status || '').toString().toLowerCase(); // created | cancelled | paid
      const status = raw === 'created' ? 'confirmed' : raw === 'paid' ? 'completed' : raw; // map to UI set
      return {
        id: b.id,
        movieTitle: b?.schedule?.movieTitle || 'Movie',
        theaterName: b?.schedule?.theaterName || 'Theater',
        showtime: b?.schedule?.showTime,
        seats: [String(b.seatsCount)],
        totalAmount: b.totalAmount,
        bookingDate: b.createdAt,
        status: status as 'confirmed' | 'cancelled' | 'completed',
      };
    });
  }, [myBookings]);

  const filteredBookings = normalized.filter((booking) => {
    const title = (booking.movieTitle || '').toLowerCase();
    const theater = (booking.theaterName || '').toLowerCase();
    const q = (searchTerm || '').toLowerCase();
    const matchesSearch = title.includes(q) || theater.includes(q);
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✅';
      case 'completed':
        return '🎬';
      case 'cancelled':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings 🎫</h1>
          <p className="text-gray-600">View and manage your movie ticket bookings</p>
        </div>

        {/* Search and Filters */}
        <Card padding="lg" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Bookings
              </label>
              <Input
                type="text"
                placeholder="Search by movie or theater..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Bookings List */}
        {isLoading ? (
          <div className="text-center py-16">Loading your bookings...</div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} padding="lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">
                        {booking.movieTitle}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        <span className="mr-1">{getStatusIcon(booking.status)}</span>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium text-gray-900">Theater</p>
                        <p>{booking.theaterName}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Showtime</p>
                        <p>
                          {booking.showtime ? (
                            <>
                              {new Date(booking.showtime).toLocaleDateString()} at {new Date(booking.showtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </>
                          ) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Seats</p>
                        <p>{booking.seats.join(', ')}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Total</p>
                        <p className="text-lg font-semibold text-primary-600">${booking.totalAmount}</p>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Booking ID: {booking.id} • Booked on {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : '—'}
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-col sm:flex-row gap-2">
                    {booking.status === 'confirmed' && (
                      <>
                        <Button variant="outline" size="sm">
                          View Ticket
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => cancelBooking.mutate(booking.id as unknown as number)}
                          disabled={cancelBooking.isPending}
                        >
                          {cancelBooking.isPending ? 'Cancelling...' : 'Cancel'}
                        </Button>
                      </>
                    )}
                    {booking.status === 'completed' && (
                      <>
                        <Button variant="outline" size="sm">
                          View Receipt
                        </Button>
                        <Button variant="outline" size="sm">
                          Rate Movie
                        </Button>
                      </>
                    )}
                    {booking.status === 'cancelled' && (
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter
                ? 'Try adjusting your search criteria or filters'
                : "You haven't made any bookings yet"}
            </p>
            {(searchTerm || statusFilter) ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button variant="primary" onClick={() => window.location.href = '/customer/movies'}>
                Browse Movies
              </Button>
            )}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card padding="lg" className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-2xl font-bold text-gray-900">{normalized.length}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </Card>
            <Card padding="lg" className="text-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">
                {normalized.filter(b => b.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </Card>
            <Card padding="lg" className="text-center">
              <div className="text-2xl mb-2">🎬</div>
              <div className="text-2xl font-bold text-blue-600">
                {normalized.filter(b => b.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </Card>
            <Card padding="lg" className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-2xl font-bold text-purple-600">
                ${normalized.reduce((total, booking) => total + (Number(booking.totalAmount) || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingsPage;