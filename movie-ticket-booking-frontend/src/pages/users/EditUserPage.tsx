import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useUpdateUser } from '../../hooks/useUsers';
import { UserForm } from '../../components/users';
import type { CreateUserRequest } from '../../types';
import { toast } from 'react-hot-toast';

const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = id ? parseInt(id, 10) : 0;
  const { data: user, isLoading: isLoadingUser, error } = useUser(userId);
  const updateUserMutation = useUpdateUser();

  const handleSubmit = async (data: CreateUserRequest) => {
    try {
      const updatedUser = await updateUserMutation.mutateAsync({
        id: userId,
        data
      });
      toast.success('User updated successfully!');
      navigate(`/users/${updatedUser.id}`);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user. Please try again.');
    }
  };

  if (isLoadingUser) {
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

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">User Not Found</h2>
            <p className="text-red-600 mb-4">
              {error instanceof Error ? error.message : 'The user you are trying to edit does not exist or has been removed.'}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/users')}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Back to Users
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
            onClick={() => navigate(`/users/${user.id}`)}
            className="mb-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to User Details
          </button>
        </div>

        <UserForm
          user={user}
          onSubmit={handleSubmit}
          isLoading={updateUserMutation.isPending}
          isEdit={true}
        />
      </div>
    </div>
  );
};

export default EditUserPage;