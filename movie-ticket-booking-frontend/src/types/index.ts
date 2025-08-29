export interface Movie {
  id: number;
  title: string;
  description: string;
  genre: string;
  director: string;
  duration: number; // in minutes
  releaseDate: string; // ISO date string
  posterUrl?: string;
  active: boolean;
  createdAt: string; // ISO date string
  theater?: Theater;
}

export interface Theater {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber?: string;
  email?: string;
  totalScreens: number;
  description?: string;
  active: boolean;
  approved: boolean;
  createdAt: string; // ISO date string
  owner: User;
}

export interface User {
  id: number;
  email: string;
  password?: string; // Optional for display purposes
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  active: boolean;
  createdAt: string; // ISO date string
}

export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  THEATER_OWNER: 'THEATER_OWNER',
  CUSTOMER: 'CUSTOMER'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface Schedule {
  id: number;
  movie: Movie;
  theater: Theater;
  showTime: string; // ISO date string
  price: number;
  availableSeats: number;
  totalSeats: number;
  active: boolean;
  createdAt: string; // ISO date string
  screenNumber?: string;
  additionalInfo?: string;
}

export interface CreateScheduleRequest {
  movie: {
    id: number;
  };
  theater: {
    id: number;
  };
  showTime: string; // ISO date string
  price: number;
  availableSeats: number;
  totalSeats: number;
  screenNumber?: string;
  additionalInfo?: string;
}

export interface CreateMovieRequest {
  title: string;
  description: string;
  genre: string;
  director: string;
  duration: number;
  releaseDate: string;
  posterUrl?: string;
  theater?: {
    id: number;
  };
}

export interface CreateTheaterRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber?: string;
  email?: string;
  totalScreens: number;
  description?: string;
  owner: {
    id: number;
  };
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}