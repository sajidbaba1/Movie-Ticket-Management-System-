import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTheater } from '../../hooks/useTheaters';
import { TheaterForm } from '../../components/theaters';
import type { CreateTheaterRequest } from '../../types';
import toast from 'react-hot-toast';
// Note: do not inject owner automatically; backend owner is optional

const CreateTheaterPage: React.FC = () => {
  const navigate = useNavigate();
  const createTheaterMutation = useCreateTheater();
  

  const handleSubmit = async (data: CreateTheaterRequest) => {
    try {
      const newTheater = await createTheaterMutation.mutateAsync(data);
      toast.success('Theater created successfully!');
      navigate(`/theaters/${newTheater.id}`);
    } catch (error) {
      console.error('Error creating theater:', error);
      toast.error('Failed to create theater. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/theaters')}
            className="mb-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Theaters
          </button>
        </div>

        <TheaterForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/theaters')}
          isLoading={createTheaterMutation.isPending}
        />
      </div>
    </div>
  );
};

export default CreateTheaterPage;