import apiClient from './api';
import type { Theater, CreateTheaterRequest } from '../types';

export const theaterService = {
  // Get all approved and active theaters
  getAllTheaters: async (): Promise<Theater[]> => {
    const response = await apiClient.get<Theater[]>('/theaters');
    return response.data;
  },

  // Get theater by ID
  getTheaterById: async (id: number): Promise<Theater> => {
    const response = await apiClient.get<Theater>(`/theaters/${id}`);
    return response.data;
  },

  // Get theaters by city
  getTheatersByCity: async (city: string): Promise<Theater[]> => {
    const response = await apiClient.get<Theater[]>(`/theaters/city/${city}`);
    return response.data;
  },

  // Get theaters by owner ID
  getTheatersByOwner: async (ownerId: number): Promise<Theater[]> => {
    const response = await apiClient.get<Theater[]>(`/theaters/owner/${ownerId}`);
    return response.data;
  },

  // Create a new theater
  createTheater: async (theaterData: CreateTheaterRequest): Promise<Theater> => {
    const response = await apiClient.post<Theater>('/theaters', theaterData);
    return response.data;
  },

  // Update an existing theater
  updateTheater: async (id: number, theaterData: Partial<CreateTheaterRequest>): Promise<Theater> => {
    const response = await apiClient.put<Theater>(`/theaters/${id}`, theaterData);
    return response.data;
  },

  // Delete a theater
  deleteTheater: async (id: number): Promise<void> => {
    await apiClient.delete(`/theaters/${id}`);
  },

  // Search theaters by name or city
  searchTheaters: async (query: string): Promise<Theater[]> => {
    const allTheaters = await theaterService.getAllTheaters();
    return allTheaters.filter(theater =>
      theater.name.toLowerCase().includes(query.toLowerCase()) ||
      theater.city.toLowerCase().includes(query.toLowerCase()) ||
      theater.address.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Get unique cities from all theaters
  getCities: async (): Promise<string[]> => {
    const allTheaters = await theaterService.getAllTheaters();
    const cities = [...new Set(allTheaters.map(theater => theater.city))];
    return cities.sort();
  }
};