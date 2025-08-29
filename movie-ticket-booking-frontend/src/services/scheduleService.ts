import apiClient from './api';
import type { Schedule, CreateScheduleRequest } from '../types';

export const scheduleService = {
  // Get schedules for current user's theaters
  async getMySchedules(): Promise<Schedule[]> {
    const response = await apiClient.get('/schedules/my-schedules');
    return response.data;
  },

  // Get schedule by ID
  async getScheduleById(id: number): Promise<Schedule> {
    const response = await apiClient.get(`/schedules/${id}`);
    return response.data;
  },

  // Get schedules by theater
  async getSchedulesByTheater(theaterId: number): Promise<Schedule[]> {
    const response = await apiClient.get(`/schedules/theater/${theaterId}`);
    return response.data;
  },

  // Get schedules by movie
  async getSchedulesByMovie(movieId: number): Promise<Schedule[]> {
    const response = await apiClient.get(`/schedules/movie/${movieId}`);
    return response.data;
  },

  // Get schedules by date range
  async getSchedulesByDateRange(startTime: string, endTime: string): Promise<Schedule[]> {
    const response = await apiClient.get('/schedules/date-range', {
      params: { startTime, endTime }
    });
    return response.data;
  },

  // Create a new schedule
  async createSchedule(scheduleData: CreateScheduleRequest): Promise<Schedule> {
    const response = await apiClient.post('/schedules', scheduleData);
    return response.data;
  },

  // Update schedule
  async updateSchedule(id: number, scheduleData: CreateScheduleRequest): Promise<Schedule> {
    const response = await apiClient.put(`/schedules/${id}`, scheduleData);
    return response.data;
  },

  // Delete schedule
  async deleteSchedule(id: number): Promise<void> {
    await apiClient.delete(`/schedules/${id}`);
  },

  // Toggle schedule active status
  async toggleScheduleStatus(id: number, active: boolean): Promise<Schedule> {
    const response = await apiClient.patch(`/schedules/${id}/status`, { active });
    return response.data;
  },
};