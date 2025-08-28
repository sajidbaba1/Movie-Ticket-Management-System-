import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheater, useUpdateTheater } from '../../hooks/useTheaters';
import { TheaterForm } from '../../components/theaters';
import type { CreateTheaterRequest } from '../../types';
import { toast } from 'react-hot-toast';

const EditTheaterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theaterId = id ? parseInt(id, 10) : 0;
  const { data: theater, isLoading: isLoadingTheater, error } = useTheater(theaterId);
  const updateTheaterMutation = useUpdateTheater();

  const handleSubmit = async (data: CreateTheaterRequest) => {
    try {
      const updatedTheater = await updateTheaterMutation.mutateAsync({
        id: theaterId,
        data
      });
      toast.success('Theater updated successfully!');
      navigate(`/theaters/${updatedTheater.id}`);
    } catch (error) {
      console.error('Error updating theater:', error);
      toast.error('Failed to update theater. Please try again.');
    }
  };

  if (isLoadingTheater) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !theater) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Theater Not Found</h2>
            <p className="text-red-600 mb-4">
              {error instanceof Error ? error.message : 'The theater you are trying to edit does not exist or has been removed.'}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/theaters')}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Back to Theaters
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/theaters/${theater.id}`)}
            className="mb-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Theater Details
          </button>
        </div>

        <TheaterForm
          theater={theater}
          onSubmit={handleSubmit}
          isLoading={updateTheaterMutation.isPending}
          isEdit={true}
        />
      </div>
    </div>
  );
};

export default EditTheaterPage;