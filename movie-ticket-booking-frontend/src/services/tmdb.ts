import axios from 'axios';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Expect the key in Vite env: import.meta.env.VITE_TMDB_API_KEY
const getApiKey = (): string => {
  const key = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
  if (!key) {
    console.warn('VITE_TMDB_API_KEY is not set. TMDB requests will fail.');
    return '';
  }
  return key;
};

const tmdbClient = axios.create({
  baseURL: TMDB_API_BASE,
  timeout: 15000,
});

export interface TmdbMovieSummary {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  genre_ids?: number[];
}

export interface TmdbGenre { id: number; name: string; }

export interface TmdbMovieDetails extends TmdbMovieSummary {
  runtime: number | null;
  genres: TmdbGenre[];
  adult?: boolean;
  original_language?: string;
  backdrop_path?: string | null;
}

export const tmdb = {
  // Build full image URL
  imageUrl: (path: string | null | undefined, size: 'w200'|'w300'|'w500'|'w780'|'original' = 'w500'): string | undefined => {
    if (!path) return undefined;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  },

  // Popular movies
  popular: async (page = 1): Promise<TmdbMovieSummary[]> => {
    const api_key = getApiKey();
    const { data } = await tmdbClient.get(`/movie/popular`, {
      params: { api_key, page },
    });
    return data.results as TmdbMovieSummary[];
  },

  // Search movies
  search: async (query: string, page = 1): Promise<TmdbMovieSummary[]> => {
    const api_key = getApiKey();
    const { data } = await tmdbClient.get(`/search/movie`, {
      params: { api_key, query, page, include_adult: false },
    });
    return data.results as TmdbMovieSummary[];
  },

  // Movie details
  details: async (id: number): Promise<TmdbMovieDetails> => {
    const api_key = getApiKey();
    const { data } = await tmdbClient.get(`/movie/${id}`, {
      params: { api_key },
    });
    return data as TmdbMovieDetails;
  },
};
