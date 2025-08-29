import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { theaterService } from '../services/theaterService';
import type { CreateTheaterRequest } from '../types';
import toast from 'react-hot-toast';

// Get theaters for current theater owner
export const useMyTheaters = (ownerId?: number) => {
  return useQuery({
    queryKey: ['my-theaters', ownerId],
    queryFn: () => theaterService.getMyTheaters(ownerId as number),
    enabled: typeof ownerId === 'number' && ownerId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get a specific theater
export const useMyTheater = (id: number) => {
  return useQuery({
    queryKey: ['my-theater', id],
    queryFn: () => theaterService.getTheaterById(id),
    enabled: !!id,
  });
};

// Create theater
export const useCreateTheater = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (theaterData: CreateTheaterRequest) =>
      theaterService.createTheater(theaterData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-theaters'] });
      queryClient.invalidateQueries({ queryKey: ['theaters'] });
      toast.success('Theater created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create theater');
    },
  });
};

// Update theater
export const useUpdateTheater = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, theaterData }: { id: number; theaterData: CreateTheaterRequest }) =>
      theaterService.updateTheater(id, theaterData),
    onSuccess: (updatedTheater) => {
      queryClient.invalidateQueries({ queryKey: ['my-theaters'] });
      queryClient.invalidateQueries({ queryKey: ['my-theater', updatedTheater.id] });
      queryClient.invalidateQueries({ queryKey: ['theaters'] });
      toast.success('Theater updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update theater');
    },
  });
};

// Delete theater
export const useDeleteTheater = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => theaterService.deleteTheater(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-theaters'] });
      queryClient.invalidateQueries({ queryKey: ['theaters'] });
      toast.success('Theater deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete theater');
    },
  });
};

// Toggle theater active status
export const useToggleTheaterStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      theaterService.toggleTheaterStatus(id, active),
    onSuccess: (updatedTheater) => {
      queryClient.invalidateQueries({ queryKey: ['my-theaters'] });
      queryClient.invalidateQueries({ queryKey: ['my-theater', updatedTheater.id] });
      queryClient.invalidateQueries({ queryKey: ['theaters'] });
      toast.success(`Theater ${updatedTheater.active ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update theater status');
    },
  });
};