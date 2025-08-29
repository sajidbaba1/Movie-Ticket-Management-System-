import apiClient from './api';
import type { Schedule, CreateScheduleRequest, Movie, Theater } from '../types';

// Backend DTO returned by schedules list endpoints
type ScheduleResponse = {
  id: number;
  movieId?: number;
  movieTitle?: string;
  theaterId?: number;
  theaterName?: string;
  showTime: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  active: boolean;
  createdAt: string;
  screenNumber?: string;
  additionalInfo?: string;
};

const mapDto = (dto: ScheduleResponse): Schedule => {
  const movie: Partial<Movie> | undefined = dto.movieId
    ? { id: dto.movieId, title: dto.movieTitle || '' } as Movie
    : undefined;
  const theater: Partial<Theater> | undefined = dto.theaterId
    ? { id: dto.theaterId, name: dto.theaterName || '' } as Theater
    : undefined;
  return {
    id: dto.id,
    movie: movie as any,
    theater: theater as any,
    showTime: dto.showTime,
    price: Number(dto.price),
    availableSeats: dto.availableSeats,
    totalSeats: dto.totalSeats,
    active: dto.active,
    createdAt: dto.createdAt,
    screenNumber: dto.screenNumber,
    additionalInfo: dto.additionalInfo,
  };
};

export const scheduleService = {
  // Get schedules for current user's theaters
  async getMySchedules(): Promise<Schedule[]> {
    const response = await apiClient.get<ScheduleResponse[]>('/schedules/my-schedules');
    return (response.data || []).map(mapDto);
  },

  // Get schedule by ID (backend may return full entity or DTO)
  async getScheduleById(id: number): Promise<Schedule> {
    const response = await apiClient.get<any>(`/schedules/${id}`);
    const data = response.data;
    if (data && typeof data === 'object') {
      // If it already matches the client Schedule shape (has movie/theater objects), return as-is
      if (data.movie && data.theater) {
        return data as Schedule;
      }
      // Else treat as DTO
      return mapDto(data as ScheduleResponse);
    }
    return data as Schedule;
  },

  // Get schedules by theater
  async getSchedulesByTheater(theaterId: number): Promise<Schedule[]> {
    const response = await apiClient.get<ScheduleResponse[]>(`/schedules/theater/${theaterId}`);
    return (response.data || []).map(mapDto);
  },

  // Get schedules by movie
  async getSchedulesByMovie(movieId: number): Promise<Schedule[]> {
    const response = await apiClient.get<ScheduleResponse[]>(`/schedules/movie/${movieId}`);
    return (response.data || []).map(mapDto);
  },

  // Get schedules by date range
  async getSchedulesByDateRange(startTime: string, endTime: string): Promise<Schedule[]> {
    const response = await apiClient.get<ScheduleResponse[]>('/schedules/date-range', {
      params: { startTime, endTime }
    });
    return (response.data || []).map(mapDto);
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