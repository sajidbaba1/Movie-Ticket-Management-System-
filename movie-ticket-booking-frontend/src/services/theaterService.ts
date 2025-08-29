import apiClient from './api';
import type { Theater, CreateTheaterRequest } from '../types';

export const theaterService = {
  // Get theaters owned by current user
  async getMyTheaters(ownerId: number): Promise<Theater[]> {
    const response = await apiClient.get('/theaters', { params: { ownerId } });
    return response.data;
  },

  // Get all theaters (admin or public list)
  async getAllTheaters(): Promise<Theater[]> {
    const response = await apiClient.get('/theaters');
    return response.data;
  },

  // Get theaters by city (approved & active enforced by backend when city provided)
  async getTheatersByCity(city: string): Promise<Theater[]> {
    const response = await apiClient.get('/theaters', { params: { city } });
    return response.data;
  },

  // Get theater by ID (for theater owners)
  async getTheaterById(id: number): Promise<Theater> {
    const response = await apiClient.get(`/theaters/${id}`);
    return response.data;
  },

  // Create a new theater
  async createTheater(theaterData: CreateTheaterRequest): Promise<Theater> {
    const payload = { ...theaterData, active: true } as any;
    const response = await apiClient.post('/theaters', payload);
    return response.data;
  },

  // Update theater
  async updateTheater(id: number, theaterData: CreateTheaterRequest): Promise<Theater> {
    const response = await apiClient.put(`/theaters/${id}`, theaterData);
    return response.data;
  },

  // Delete theater
  async deleteTheater(id: number): Promise<void> {
    await apiClient.delete(`/theaters/${id}`);
  },

  // Toggle theater active status
  async toggleTheaterStatus(id: number, active: boolean): Promise<Theater> {
    const response = await apiClient.patch(`/theaters/${id}/status`, { active });
    return response.data;
  },

  // Get theater statistics
  async getTheaterStats(id: number): Promise<{
    totalBookings: number;
    totalRevenue: number;
    activeMovies: number;
    averageRating: number;
  }> {
    const response = await apiClient.get(`/theaters/${id}/stats`);
    return response.data;
  },
};