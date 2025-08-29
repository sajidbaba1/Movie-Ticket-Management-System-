import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '../services/scheduleService';
import type { Schedule, CreateScheduleRequest } from '../types';
import toast from 'react-hot-toast';

// Get schedules for current theater owner
export const useMySchedules = () => {
  return useQuery({
    queryKey: ['my-schedules'],
    queryFn: scheduleService.getMySchedules,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Get schedules by theater
export const useSchedulesByTheater = (theaterId: number) => {
  return useQuery({
    queryKey: ['schedules', 'theater', theaterId],
    queryFn: () => scheduleService.getSchedulesByTheater(theaterId),
    enabled: !!theaterId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Get schedules by movie
export const useSchedulesByMovie = (movieId: number) => {
  return useQuery({
    queryKey: ['schedules', 'movie', movieId],
    queryFn: () => scheduleService.getSchedulesByMovie(movieId),
    enabled: !!movieId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Get schedules by date range
export const useSchedulesByDateRange = (startTime: string, endTime: string) => {
  return useQuery({
    queryKey: ['schedules', 'date-range', startTime, endTime],
    queryFn: () => scheduleService.getSchedulesByDateRange(startTime, endTime),
    enabled: !!startTime && !!endTime,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Get a specific schedule
export const useSchedule = (id: number) => {
  return useQuery({
    queryKey: ['schedule', id],
    queryFn: () => scheduleService.getScheduleById(id),
    enabled: !!id,
  });
};

// Create schedule
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleData: CreateScheduleRequest) =>
      scheduleService.createSchedule(scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create schedule');
    },
  });
};

// Update schedule
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, scheduleData }: { id: number; scheduleData: CreateScheduleRequest }) =>
      scheduleService.updateSchedule(id, scheduleData),
    onSuccess: (updatedSchedule) => {
      queryClient.invalidateQueries({ queryKey: ['my-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedule', updatedSchedule.id] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update schedule');
    },
  });
};

// Delete schedule
export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => scheduleService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete schedule');
    },
  });
};

// Toggle schedule status
export const useToggleScheduleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      scheduleService.toggleScheduleStatus(id, active),
    onSuccess: (updatedSchedule) => {
      queryClient.invalidateQueries({ queryKey: ['my-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedule', updatedSchedule.id] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success(`Schedule ${updatedSchedule.active ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update schedule status');
    },
  });
};