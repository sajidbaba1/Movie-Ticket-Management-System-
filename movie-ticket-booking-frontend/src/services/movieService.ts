import apiClient from './api';
import type { Movie, CreateMovieRequest } from '../types';
import { tmdb } from './tmdb';

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

  // Create a new movie (ensure active defaults to true so it shows up)
  createMovie: async (movieData: CreateMovieRequest): Promise<Movie> => {
    const payload = { ...movieData, active: true } as any;
    const response = await apiClient.post<Movie>('/movies', payload);
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
    const response = await apiClient.get<Movie[]>(`/movies/search`, { params: { q: query } });
    return response.data;
  },

  // Get active movies count
  countActive: async (): Promise<number> => {
    const response = await apiClient.get<number>(`/movies/count`);
    return response.data as unknown as number;
  },

  // Filter movies by genre
  getMoviesByGenre: async (genre: string): Promise<Movie[]> => {
    const allMovies = await movieService.getAllMovies();
    return allMovies.filter(movie =>
      movie.genre.toLowerCase() === genre.toLowerCase()
    );
  },

  // Fetch a batch of popular movies from TMDB (utility for selection UIs)
  getPopularFromTmdb: async (page = 1) => {
    return tmdb.popular(page);
  },

  // Import a single TMDB movie by ID and create it in backend
  importOneFromTmdb: async (tmdbId: number, theaterId?: number): Promise<Movie> => {
    const details = await tmdb.details(tmdbId);
    const posterUrl = tmdb.imageUrl(details.poster_path, 'w500');

    const payload: CreateMovieRequest = {
      title: details.title,
      description: details.overview || '',
      genre: (details.genres?.[0]?.name || 'Drama'),
      director: 'N/A',
      duration: details.runtime || 120,
      releaseDate: details.release_date || new Date().toISOString().slice(0, 10),
      posterUrl,
      theater: theaterId ? { id: theaterId } : undefined,
    };

    return movieService.createMovie(payload);
  },

  // Import multiple TMDB movies by their IDs
  importManyFromTmdb: async (tmdbIds: number[], theaterId?: number): Promise<Movie[]> => {
    const results: Movie[] = [];
    for (const id of tmdbIds) {
      try {
        const created = await movieService.importOneFromTmdb(id, theaterId);
        results.push(created);
      } catch (e) {
        // Continue on error; log to console
        console.warn('Failed importing TMDB id', id, e);
      }
    }
    return results;
  }
};