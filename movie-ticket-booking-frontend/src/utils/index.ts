import type { Movie, Theater, User } from '../types';

// Format date utilities
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Duration formatting
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

// Movie utilities
export const getMovieGenres = (movies: Movie[]): string[] => {
  const genres = [...new Set(movies.map(movie => movie.genre))];
  return genres.sort();
};

export const getMovieDirectors = (movies: Movie[]): string[] => {
  const directors = [...new Set(movies.map(movie => movie.director))];
  return directors.sort();
};

// Theater utilities
export const getTheaterCities = (theaters: Theater[]): string[] => {
  const cities = [...new Set(theaters.map(theater => theater.city))];
  return cities.sort();
};

export const getTheaterStates = (theaters: Theater[]): string[] => {
  const states = [...new Set(theaters.map(theater => theater.state))];
  return states.sort();
};

// User utilities
export const getUserFullName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`;
};

export const formatUserRole = (role: string): string => {
  return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

// Search utilities
export const filterByQuery = <T>(
  items: T[],
  query: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!query.trim()) return items;

  const lowercaseQuery = query.toLowerCase();
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowercaseQuery);
      }
      return false;
    })
  );
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateZipCode = (zipCode: string): boolean => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
};

// Error handling utilities
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// CSS class utilities
export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};