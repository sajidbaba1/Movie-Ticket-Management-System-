import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movieService } from '../services';
import type { Movie, CreateMovieRequest } from '../types';
import { getErrorMessage } from '../utils';
import { useErrorHandler } from '../utils/errorHandler';
import toast from 'react-hot-toast';

// Query keys
export const MOVIE_QUERY_KEYS = {
  all: ['movies'] as const,
  lists: () => [...MOVIE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...MOVIE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...MOVIE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...MOVIE_QUERY_KEYS.details(), id] as const,
  byTheater: (theaterId: number) => [...MOVIE_QUERY_KEYS.all, 'theater', theaterId] as const,
};

// Fetch all movies
export const useMovies = () => {
  return useQuery({
    queryKey: MOVIE_QUERY_KEYS.lists(),
    queryFn: movieService.getAllMovies,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch movie by ID
export const useMovie = (id: number) => {
  return useQuery({
    queryKey: MOVIE_QUERY_KEYS.detail(id),
    queryFn: () => movieService.getMovieById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch movies by theater
export const useMoviesByTheater = (theaterId: number) => {
  return useQuery({
    queryKey: MOVIE_QUERY_KEYS.byTheater(theaterId),
    queryFn: () => movieService.getMoviesByTheater(theaterId),
    enabled: !!theaterId,
    staleTime: 5 * 60 * 1000,
  });
};

// Create movie mutation
export const useCreateMovie = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (movieData: CreateMovieRequest) => movieService.createMovie(movieData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOVIE_QUERY_KEYS.all });
      toast.success('Movie created successfully!');
    },
    onError: (error) => {
      handleError(error, 'Creating movie');
    },
  });
};

// Update movie mutation
export const useUpdateMovie = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ id, movieData }: { id: number; movieData: Partial<CreateMovieRequest> }) =>
      movieService.updateMovie(id, movieData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: MOVIE_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: MOVIE_QUERY_KEYS.lists() });
      toast.success('Movie updated successfully!');
    },
    onError: (error) => {
      handleError(error, 'Updating movie');
    },
  });
};

// Delete movie mutation
export const useDeleteMovie = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (id: number) => movieService.deleteMovie(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOVIE_QUERY_KEYS.all });
      toast.success('Movie deleted successfully!');
    },
    onError: (error) => {
      handleError(error, 'Deleting movie');
    },
  });
};

// Search movies hook
export const useMovieSearch = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchMovies = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await movieService.searchMovies(searchQuery);
      setSearchResults(results);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setSearchError(errorMessage);
      setSearchResults([]);
      // Don't show toast for search errors as they're displayed inline
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchMovies(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  return {
    query,
    setQuery,
    searchResults,
    isSearching,
    searchError,
    clearSearch: () => {
      setQuery('');
      setSearchResults([]);
      setSearchError(null);
    }
  };
};