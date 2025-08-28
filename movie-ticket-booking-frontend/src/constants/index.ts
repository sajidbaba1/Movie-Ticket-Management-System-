import { UserRole } from '../types';

// API Configuration
export const API_BASE_URL = 'http://localhost:8080/api';
export const API_TIMEOUT = 10000;

// Application Routes
export const ROUTES = {
  HOME: '/',
  MOVIES: '/movies',
  MOVIE_DETAIL: '/movies/:id',
  MOVIE_CREATE: '/movies/create',
  MOVIE_EDIT: '/movies/:id/edit',
  THEATERS: '/theaters',
  THEATER_DETAIL: '/theaters/:id',
  THEATER_CREATE: '/theaters/create',
  THEATER_EDIT: '/theaters/:id/edit',
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  USER_CREATE: '/users/create',
  USER_EDIT: '/users/:id/edit',
  DASHBOARD: '/dashboard',
} as const;

// Movie Genres
export const MOVIE_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sport',
  'Thriller',
  'War',
  'Western'
] as const;

// User Roles
export const USER_ROLES = [
  { value: UserRole.ADMIN, label: 'Administrator' },
  { value: UserRole.THEATER_OWNER, label: 'Theater Owner' },
  { value: UserRole.CUSTOMER, label: 'Customer' }
] as const;

// US States
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
] as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [6, 12, 24, 48],
} as const;

// Form Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_MOVIE_TITLE_LENGTH: 100,
  MAX_MOVIE_DESCRIPTION_LENGTH: 1000,
  MAX_THEATER_NAME_LENGTH: 100,
  MAX_USER_NAME_LENGTH: 50,
  MIN_MOVIE_DURATION: 1,
  MAX_MOVIE_DURATION: 600, // 10 hours
  MIN_THEATER_SCREENS: 1,
  MAX_THEATER_SCREENS: 50,
} as const;

// Loading States
export const LOADING_MESSAGES = {
  LOADING_MOVIES: 'Loading movies...',
  LOADING_THEATERS: 'Loading theaters...',
  LOADING_USERS: 'Loading users...',
  CREATING: 'Creating...',
  UPDATING: 'Updating...',
  DELETING: 'Deleting...',
  SAVING: 'Saving...',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  MOVIE_CREATED: 'Movie created successfully!',
  MOVIE_UPDATED: 'Movie updated successfully!',
  MOVIE_DELETED: 'Movie deleted successfully!',
  THEATER_CREATED: 'Theater created successfully!',
  THEATER_UPDATED: 'Theater updated successfully!',
  THEATER_DELETED: 'Theater deleted successfully!',
  USER_CREATED: 'User created successfully!',
  USER_UPDATED: 'User updated successfully!',
  USER_DELETED: 'User deleted successfully!',
} as const;