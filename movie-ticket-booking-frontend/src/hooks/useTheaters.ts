import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { theaterService } from '../services/theaterService';
import type { CreateTheaterRequest } from '../types';
import { useErrorHandler } from '../utils/errorHandler';
import toast from 'react-hot-toast';

// Query keys
export const theaterKeys = {
  all: ['theaters'] as const,
  lists: () => [...theaterKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...theaterKeys.lists(), { filters }] as const,
  details: () => [...theaterKeys.all, 'detail'] as const,
  detail: (id: number) => [...theaterKeys.details(), id] as const,
  cities: () => [...theaterKeys.all, 'cities'] as const,
  byOwner: (ownerId: number) => [...theaterKeys.all, 'byOwner', ownerId] as const,
  byCity: (city: string) => [...theaterKeys.all, 'byCity', city] as const,
};

// Hook to get all theaters
export const useTheaters = () => {
  return useQuery({
    queryKey: theaterKeys.lists(),
    queryFn: theaterService.getAllTheaters,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get theater by ID
export const useTheater = (id: number) => {
  return useQuery({
    queryKey: theaterKeys.detail(id),
    queryFn: () => theaterService.getTheaterById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get theaters by city
export const useTheatersByCity = (city: string) => {
  return useQuery({
    queryKey: theaterKeys.byCity(city),
    queryFn: async () => {
      // TODO: Implement getTheatersByCity in theaterService
      return [];
    },
    enabled: !!city,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get theaters by owner
export const useTheatersByOwner = (ownerId: number) => {
  return useQuery({
    queryKey: theaterKeys.byOwner(ownerId),
    queryFn: async () => {
      // TODO: Implement getTheatersByOwner in theaterService
      return [];
    },
    enabled: !!ownerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get unique cities
export const useTheaterCities = () => {
  return useQuery({
    queryKey: theaterKeys.cities(),
    queryFn: async () => {
      // TODO: Implement getCities in theaterService
      return [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to search theaters
export const useTheaterSearch = (query: string) => {
  return useQuery({
    queryKey: [...theaterKeys.all, 'search', query],
    queryFn: async () => {
      // TODO: Implement searchTheaters in theaterService
      return [];
    },
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to create theater
export const useCreateTheater = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (theaterData: CreateTheaterRequest) =>
      theaterService.createTheater(theaterData),
    onSuccess: (newTheater) => {
      // Invalidate and refetch theaters list
      queryClient.invalidateQueries({ queryKey: theaterKeys.lists() });
      queryClient.invalidateQueries({ queryKey: theaterKeys.cities() });

      // Add the new theater to the cache
      queryClient.setQueryData(theaterKeys.detail(newTheater.id), newTheater);
      toast.success('Theater created successfully!');
    },
    onError: (error) => {
      handleError(error, 'Creating theater');
    },
  });
};

// Hook to update theater
export const useUpdateTheater = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateTheaterRequest> }) =>
      theaterService.updateTheater(id, data as CreateTheaterRequest),
    onSuccess: (updatedTheater) => {
      // Update the theater in the cache
      queryClient.setQueryData(theaterKeys.detail(updatedTheater.id), updatedTheater);

      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: theaterKeys.lists() });
      queryClient.invalidateQueries({ queryKey: theaterKeys.byOwner(updatedTheater.owner.id) });
      queryClient.invalidateQueries({ queryKey: theaterKeys.byCity(updatedTheater.city) });
      toast.success('Theater updated successfully!');
    },
    onError: (error) => {
      handleError(error, 'Updating theater');
    },
  });
};

// Hook to delete theater
export const useDeleteTheater = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (id: number) => theaterService.deleteTheater(id),
    onSuccess: (_, deletedId) => {
      // Remove the theater from the cache
      queryClient.removeQueries({ queryKey: theaterKeys.detail(deletedId) });

      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: theaterKeys.lists() });
      queryClient.invalidateQueries({ queryKey: theaterKeys.cities() });
      toast.success('Theater deleted successfully!');
    },
    onError: (error) => {
      handleError(error, 'Deleting theater');
    },
  });
};