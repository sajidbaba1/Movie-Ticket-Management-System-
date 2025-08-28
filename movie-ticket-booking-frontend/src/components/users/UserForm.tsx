import React from 'react';
import { useForm } from 'react-hook-form';
import type { CreateUserRequest, User, UserRole } from '../../types';
import { Button, Input, Card } from '../ui';

interface UserFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserRequest) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  isLoading = false,
  isEdit = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<UserFormData>({
    defaultValues: user ? {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      password: '' // Always empty for edits
    } : {
      role: 'CUSTOMER' as UserRole
    }
  });

  const onFormSubmit = (data: UserFormData) => {
    // For edits, don't include password if it's empty
    const formData: CreateUserRequest = isEdit && !data.password
      ? {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        password: '' // Will be handled by backend
      }
      : data;

    onSubmit(formData);
  };

  return (
    <Card className="max-w-2xl mx-auto" padding="lg">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit User' : 'Create New User'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update user information' : 'Add a new user to the system'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    message: 'First name must be at least 2 characters'
                  }
                })}
                error={errors.firstName?.message}
              />
            </div>

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
                    message: 'Last name must be at least 2 characters'
                  }
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
                  message: 'Please enter a valid email address'
                }
              })}
              error={errors.email?.message}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password {isEdit ? '(leave blank to keep current)' : '*'}
            </label>
            <Input
              id="password"
              type="password"
              placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
              {...register('password', {
                required: isEdit ? false : 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              error={errors.password?.message}
            />
            {!isEdit && (
              <p className="mt-1 text-sm text-gray-500">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              User Role *
            </label>
            <select
              id="role"
              {...register('role', {
                required: 'Please select a role'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a role</option>
              <option value="CUSTOMER">Customer</option>
              <option value="THEATER_OWNER">Theater Owner</option>
              <option value="ADMIN">Administrator</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {/* Role Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Role Descriptions:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><strong>Customer:</strong> Can browse and book movie tickets</li>
              <li><strong>Theater Owner:</strong> Can manage theaters and their movies</li>
              <li><strong>Administrator:</strong> Full system access and user management</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default UserForm;