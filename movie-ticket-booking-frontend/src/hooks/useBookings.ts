import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService, movieService } from '../services';
import { notificationKeys } from './useNotifications';
import toast from 'react-hot-toast';

export const bookingKeys = {
  all: ['bookings'] as const,
  mine: () => [...bookingKeys.all, 'my'] as const,
};

export const useMyBookings = () => {
  return useQuery({
    queryKey: bookingKeys.mine(),
    queryFn: bookingService.getMyBookings,
    staleTime: 60_000,
  });
};

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.mine() });
      // Refresh notifications so the bell/count reflects the new booking notification
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      qc.invalidateQueries({ queryKey: notificationKeys.count });
      toast.success('Booking created 🎫');
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || 'Failed to create booking');
    },
  });
};

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookingService.cancelBooking,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.mine() });
      toast.success('Booking cancelled');
    },
    onError: () => {
      toast.error('Failed to cancel booking');
    },
  });
};

export const useActiveMoviesCount = () => {
  return useQuery({
    queryKey: ['movies', 'count'],
    queryFn: movieService.countActive,
    staleTime: 60_000,
  });
};
