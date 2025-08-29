import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input } from '../ui';
import type { User, CreateUserRequest } from '../../types';

interface AdminFormProps {
  admin?: User;
  onSubmit: (data: CreateUserRequest | Partial<User>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface AdminFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  active: boolean;
}

const AdminForm: React.FC<AdminFormProps> = ({
  admin,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditing = !!admin;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminFormData>({
    defaultValues: {
      firstName: admin?.firstName || '',
      lastName: admin?.lastName || '',
      email: admin?.email || '',
      password: '',
      active: admin?.active ?? true,
    },
  });

  const handleFormSubmit = (data: AdminFormData) => {
    const formData = {
      ...data,
      role: 'ADMIN' as const,
    };

    // Remove password if it's empty during edit
    if (isEditing && (!data.password || data.password.trim() === '')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...dataWithoutPassword } = formData;
      onSubmit(dataWithoutPassword);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <Input
            id="firstName"
            type="text"
            placeholder="Enter first name"
            {...register('firstName', {
              required: 'First name is required',
              minLength: {
                value: 2,
                message: 'First name must be at least 2 characters',
              },
              maxLength: {
                value: 50,
                message: 'First name must not exceed 50 characters',
              },
            })}
            error={errors.firstName?.message}
          />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <Input
            id="lastName"
            type="text"
            placeholder="Enter last name"
            {...register('lastName', {
              required: 'Last name is required',
              minLength: {
                value: 2,
                message: 'Last name must be at least 2 characters',
              },
              maxLength: {
                value: 50,
                message: 'Last name must not exceed 50 characters',
              },
            })}
            error={errors.lastName?.message}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email address"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Please enter a valid email address',
            },
          })}
          error={errors.email?.message}
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password {!isEditing && '*'}
        </label>
        <Input
          id="password"
          type="password"
          placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
          {...register('password', {
            required: isEditing ? false : 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
          error={errors.password?.message}
        />
        {isEditing && (
          <p className="mt-1 text-sm text-gray-500">
            Leave blank to keep the current password
          </p>
        )}
      </div>

      {/* Active Status */}
      {isEditing && (
        <div className="flex items-center space-x-2">
          <input
            id="active"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            {...register('active')}
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700">
            Active User
          </label>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          loading={isLoading}
        >
          {isEditing ? 'Update Admin' : 'Create Admin'}
        </Button>
      </div>
    </form>
  );
};

export default AdminForm;