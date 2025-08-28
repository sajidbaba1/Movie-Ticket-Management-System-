import apiClient from './api';
import type { Movie, CreateMovieRequest } from '../types';

export const movieService = {
  // Get all active movies
  getAllMovies: async (): Promise<Movie[]> => {
    const response = await apiClient.get<Movie[]>('/movies');
    return response.data;
  },

  // Get movie by ID
  getMovieById: async (id: number): Promise<Movie> => {
    const response = await apiClient.get<Movie>(`/movies/${id}`);
    return response.data;
  },

  // Get movies by theater ID
  getMoviesByTheater: async (theaterId: number): Promise<Movie[]> => {
    const response = await apiClient.get<Movie[]>(`/movies/theater/${theaterId}`);
    return response.data;
  },

  // Create a new movie
  createMovie: async (movieData: CreateMovieRequest): Promise<Movie> => {
    const response = await apiClient.post<Movie>('/movies', movieData);
    return response.data;
  },

  // Update an existing movie
  updateMovie: async (id: number, movieData: Partial<CreateMovieRequest>): Promise<Movie> => {
    const response = await apiClient.put<Movie>(`/movies/${id}`, movieData);
    return response.data;
  },

  // Delete a movie
  deleteMovie: async (id: number): Promise<void> => {
    await apiClient.delete(`/movies/${id}`);
  },

  // Search movies by title or genre
  searchMovies: async (query: string): Promise<Movie[]> => {
    const allMovies = await movieService.getAllMovies();
    return allMovies.filter(movie =>
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      movie.genre.toLowerCase().includes(query.toLowerCase()) ||
      movie.director.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Filter movies by genre
  getMoviesByGenre: async (genre: string): Promise<Movie[]> => {
    const allMovies = await movieService.getAllMovies();
    return allMovies.filter(movie =>
      movie.genre.toLowerCase() === genre.toLowerCase()
    );
  }
};