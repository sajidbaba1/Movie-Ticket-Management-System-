import React from 'react';
import { useForm } from 'react-hook-form';
import type { Movie, CreateMovieRequest } from '../../types';
import { Button, Input, Select, Textarea } from '../ui';
import { MOVIE_GENRES, VALIDATION } from '../../constants';
import { useTheaters } from '../../hooks';

interface MovieFormProps {
  movie?: Movie;
  onSubmit: (data: CreateMovieRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const MovieForm: React.FC<MovieFormProps> = ({
  movie,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { data: theaters = [] } = useTheaters();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateMovieRequest>({
    defaultValues: movie ? {
      title: movie.title,
      description: movie.description,
      genre: movie.genre,
      director: movie.director,
      duration: movie.duration,
      releaseDate: movie.releaseDate,
      posterUrl: movie.posterUrl || '',
      theater: movie.theater ? { id: movie.theater.id } : undefined
    } : {}
  });

  const genreOptions = MOVIE_GENRES.map(genre => ({
    value: genre,
    label: genre
  }));

  const theaterOptions = [
    { value: '', label: 'Select a theater (optional)' },
    ...theaters.map(theater => ({
      value: theater.id.toString(),
      label: theater.name
    }))
  ];

  const handleFormSubmit = (data: CreateMovieRequest) => {
    const formData = {
      ...data,
      theater: data.theater?.id ? { id: Number(data.theater.id) } : undefined
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Movie Title"
          {...register('title', {
            required: 'Movie title is required',
            maxLength: {
              value: VALIDATION.MAX_MOVIE_TITLE_LENGTH,
              message: `Title must be less than ${VALIDATION.MAX_MOVIE_TITLE_LENGTH} characters`
            }
          })}
          error={errors.title?.message}
          placeholder="Enter movie title"
          required
        />

        <Select
          label="Genre"
          {...register('genre', { required: 'Genre is required' })}
          options={genreOptions}
          error={errors.genre?.message}
          placeholder="Select genre"
          required
        />

        <Input
          label="Director"
          {...register('director', { required: 'Director is required' })}
          error={errors.director?.message}
          placeholder="Enter director name"
          required
        />

        <Input
          label="Duration (minutes)"
          type="number"
          {...register('duration', {
            required: 'Duration is required',
            min: {
              value: VALIDATION.MIN_MOVIE_DURATION,
              message: `Duration must be at least ${VALIDATION.MIN_MOVIE_DURATION} minutes`
            },
            max: {
              value: VALIDATION.MAX_MOVIE_DURATION,
              message: `Duration must be less than ${VALIDATION.MAX_MOVIE_DURATION} minutes`
            }
          })}
          error={errors.duration?.message}
          placeholder="120"
          required
        />

        <Input
          label="Release Date"
          type="date"
          {...register('releaseDate', { required: 'Release date is required' })}
          error={errors.releaseDate?.message}
          required
        />

        <Input
          label="Poster URL"
          {...register('posterUrl')}
          error={errors.posterUrl?.message}
          placeholder="https://example.com/poster.jpg"
        />
      </div>

      <Textarea
        label="Description"
        {...register('description', {
          maxLength: {
            value: VALIDATION.MAX_MOVIE_DESCRIPTION_LENGTH,
            message: `Description must be less than ${VALIDATION.MAX_MOVIE_DESCRIPTION_LENGTH} characters`
          }
        })}
        error={errors.description?.message}
        placeholder="Enter movie description..."
        rows={4}
      />

      <Select
        label="Theater"
        {...register('theater.id')}
        options={theaterOptions}
        error={errors.theater?.id?.message}
        helperText="Optional: Select a theater where this movie is playing"
      />

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          loading={isLoading}
          className="flex-1"
        >
          {movie ? 'Update Movie' : 'Create Movie'}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default MovieForm;