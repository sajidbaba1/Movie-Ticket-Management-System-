import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateUser } from '../../hooks/useUsers';
import { UserForm } from '../../components/users';
import type { CreateUserRequest } from '../../types';
import { toast } from 'react-hot-toast';

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const createUserMutation = useCreateUser();

  const handleSubmit = async (data: CreateUserRequest) => {
    try {
      const newUser = await createUserMutation.mutateAsync(data);
      toast.success('User created successfully!');
      navigate(`/users/${newUser.id}`);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/users')}
            className="mb-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Users
          </button>
        </div>

        <UserForm
          onSubmit={handleSubmit}
          isLoading={createUserMutation.isPending}
          isEdit={false}
        />
      </div>
    </div>
  );
};

export default CreateUserPage;