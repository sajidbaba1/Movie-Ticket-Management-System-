import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Card } from '../../components/ui';
import { useUIStore } from '../../stores/uiStore';

interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string[];
  duration: number;
  language: string;
  releaseDate: string;
  rating: 'U' | 'UA' | 'A' | 'S';
  posterUrl?: string;
  trailerUrl?: string;
  director: string;
  cast: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MovieFormData {
  title: string;
  description: string;
  genre: string;
  duration: number;
  language: string;
  releaseDate: string;
  rating: Movie['rating'];
  director: string;
  cast: string;
  posterUrl?: string;
  trailerUrl?: string;
}

const SuperAdminMoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('');
  const { showNotification, showModal } = useUIStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MovieFormData>();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockMovies: Movie[] = [
          {
            id: '1',
            title: 'Avengers: Endgame',
            description: 'The epic conclusion to the Infinity Saga',
            genre: ['Action', 'Adventure', 'Sci-Fi'],
            duration: 181,
            language: 'English',
            releaseDate: '2019-04-26',
            rating: 'UA',
            director: 'Anthony Russo, Joe Russo',
            cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo'],
            isActive: true,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            title: 'RRR',
            description: 'A fictional story about two legendary revolutionaries',
            genre: ['Action', 'Drama', 'History'],
            duration: 187,
            language: 'Telugu',
            releaseDate: '2022-03-25',
            rating: 'UA',
            director: 'S.S. Rajamouli',
            cast: ['N.T. Rama Rao Jr.', 'Ram Charan', 'Alia Bhatt'],
            isActive: true,
            createdAt: '2024-01-16T10:00:00Z',
            updatedAt: '2024-01-16T10:00:00Z'
          }
        ];
        
        setMovies(mockMovies);
      } catch (error) {
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load movies'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [showNotification]);

  const onSubmit = async (data: MovieFormData) => {
    try {
      const movieData = {
        ...data,
        genre: data.genre.split(',').map(g => g.trim()),
        cast: data.cast.split(',').map(c => c.trim()),
      };

      if (editingMovie) {
        const updatedMovie: Movie = {
          ...editingMovie,
          ...movieData,
          updatedAt: new Date().toISOString()
        };
        
        setMovies(prev => prev.map(movie => 
          movie.id === editingMovie.id ? updatedMovie : movie
        ));
        
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Movie updated successfully'
        });
      } else {
        const newMovie: Movie = {
          id: Date.now().toString(),
          ...movieData,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setMovies(prev => [newMovie, ...prev]);
        
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Movie created successfully'
        });
      }

      handleCloseForm();
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save movie'
      });
    }
  };

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setValue('title', movie.title);
    setValue('description', movie.description);
    setValue('genre', movie.genre.join(', '));
    setValue('duration', movie.duration);
    setValue('language', movie.language);
    setValue('releaseDate', movie.releaseDate);
    setValue('rating', movie.rating);
    setValue('director', movie.director);
    setValue('cast', movie.cast.join(', '));
    setValue('posterUrl', movie.posterUrl || '');
    setValue('trailerUrl', movie.trailerUrl || '');
    setShowForm(true);
  };

  const handleDelete = (movie: Movie) => {
    showModal({
      type: 'confirmation',
      title: 'Delete Movie',
      content: `Are you sure you want to delete "${movie.title}"? This action cannot be undone.`,
      onConfirm: () => {
        setMovies(prev => prev.filter(m => m.id !== movie.id));
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Movie deleted successfully'
        });
      }
    });
  };

  const handleToggleStatus = async (movie: Movie) => {
    try {
      const updatedMovie = {
        ...movie,
        isActive: !movie.isActive,
        updatedAt: new Date().toISOString()
      };
      
      setMovies(prev => prev.map(m => 
        m.id === movie.id ? updatedMovie : m
      ));
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: `Movie ${updatedMovie.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update movie status'
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMovie(null);
    reset();
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movie.director.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !genreFilter || movie.genre.includes(genreFilter);
    return matchesSearch && matchesGenre;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Movie Management</h1>
          <p className="text-gray-600">Manage all movies in the system</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <span>➕</span>
          Add Movie
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card padding="lg" className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{movies.length}</div>
          <div className="text-sm text-gray-600">Total Movies</div>
        </Card>
        <Card padding="lg" className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {movies.filter(m => m.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Movies</div>
        </Card>
        <Card padding="lg" className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {new Set(movies.flatMap(m => m.genre)).size}
          </div>
          <div className="text-sm text-gray-600">Genres</div>
        </Card>
        <Card padding="lg" className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {new Set(movies.map(m => m.language)).size}
          </div>
          <div className="text-sm text-gray-600">Languages</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card padding="md" className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search movies by title or director..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Genres</option>
              <option value="Action">Action</option>
              <option value="Drama">Drama</option>
              <option value="Comedy">Comedy</option>
              <option value="Thriller">Thriller</option>
              <option value="Romance">Romance</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMovies.map((movie) => (
          <Card key={movie.id} padding="lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{movie.title}</h3>
                <p className="text-sm text-gray-600">{movie.director}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                movie.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {movie.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600 line-clamp-2">{movie.description}</p>
              <div className="flex flex-wrap gap-1">
                {movie.genre.slice(0, 3).map((g, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {g}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Duration:</span> {movie.duration} min
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Language:</span> {movie.language}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Rating:</span> {movie.rating}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleEdit(movie)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                ✏️ Edit
              </Button>
              <Button
                onClick={() => handleToggleStatus(movie)}
                variant={movie.isActive ? "outline" : "primary"}
                size="sm"
                className="flex-1"
              >
                {movie.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
              </Button>
              <Button
                onClick={() => handleDelete(movie)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                🗑️
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Movie Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingMovie ? 'Edit Movie' : 'Add New Movie'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Movie Title *
                    </label>
                    <Input
                      {...register('title', { required: 'Movie title is required' })}
                      placeholder="Enter movie title"
                      error={errors.title?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Director *
                    </label>
                    <Input
                      {...register('director', { required: 'Director is required' })}
                      placeholder="Enter director name"
                      error={errors.director?.message}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    placeholder="Enter movie description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes) *
                    </label>
                    <Input
                      type="number"
                      {...register('duration', { 
                        required: 'Duration is required',
                        min: { value: 1, message: 'Duration must be positive' }
                      })}
                      placeholder="e.g., 120"
                      error={errors.duration?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language *
                    </label>
                    <select
                      {...register('language', { required: 'Language is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Language</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Kannada">Kannada</option>
                    </select>
                    {errors.language && (
                      <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating *
                    </label>
                    <select
                      {...register('rating', { required: 'Rating is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Rating</option>
                      <option value="U">U (Universal)</option>
                      <option value="UA">UA (Parental Guidance)</option>
                      <option value="A">A (Adults Only)</option>
                      <option value="S">S (Restricted)</option>
                    </select>
                    {errors.rating && (
                      <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genres (comma-separated) *
                    </label>
                    <Input
                      {...register('genre', { required: 'At least one genre is required' })}
                      placeholder="e.g., Action, Adventure, Sci-Fi"
                      error={errors.genre?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Release Date *
                    </label>
                    <Input
                      type="date"
                      {...register('releaseDate', { required: 'Release date is required' })}
                      error={errors.releaseDate?.message}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cast (comma-separated) *
                  </label>
                  <Input
                    {...register('cast', { required: 'Cast is required' })}
                    placeholder="e.g., Actor 1, Actor 2, Actor 3"
                    error={errors.cast?.message}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poster URL (Optional)
                    </label>
                    <Input
                      {...register('posterUrl')}
                      placeholder="https://example.com/poster.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trailer URL (Optional)
                    </label>
                    <Input
                      {...register('trailerUrl')}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingMovie ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      editingMovie ? 'Update Movie' : 'Create Movie'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseForm}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminMoviesPage;
