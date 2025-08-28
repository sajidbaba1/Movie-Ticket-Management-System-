import React from 'react';
import { useForm } from 'react-hook-form';
import type { CreateTheaterRequest, Theater } from '../../types';
import { Button, Input, Card } from '../ui';

interface TheaterFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber?: string;
  email?: string;
  totalScreens: number;
  description?: string;
  ownerId: number;
}

interface TheaterFormProps {
  theater?: Theater;
  onSubmit: (data: CreateTheaterRequest) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const TheaterForm: React.FC<TheaterFormProps> = ({
  theater,
  onSubmit,
  isLoading = false,
  isEdit = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TheaterFormData>({
    defaultValues: theater ? {
      name: theater.name,
      address: theater.address,
      city: theater.city,
      state: theater.state,
      zipCode: theater.zipCode,
      phoneNumber: theater.phoneNumber || '',
      email: theater.email || '',
      description: theater.description || '',
      totalScreens: theater.totalScreens,
      ownerId: theater.owner.id
    } : {
      totalScreens: 1,
      ownerId: 1
    }
  });

  const onFormSubmit = (data: TheaterFormData) => {
    // Transform form data to API format
    const { ownerId, ...theaterData } = data;
    const createRequest: CreateTheaterRequest = {
      ...theaterData,
      owner: { id: ownerId }
    };
    onSubmit(createRequest);
  };

  return (
    <Card className="max-w-2xl mx-auto" padding="lg">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Theater' : 'Create New Theater'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update theater information' : 'Add a new theater to the system'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Theater Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Theater Name *
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter theater name"
              {...register('name', {
                required: 'Theater name is required',
                minLength: {
                  value: 2,
                  message: 'Theater name must be at least 2 characters'
                }
              })}
              error={errors.name?.message}
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <Input
              id="address"
              type="text"
              placeholder="Enter street address"
              {...register('address', {
                required: 'Address is required'
              })}
              error={errors.address?.message}
            />
          </div>

          {/* City, State, Zip Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <Input
                id="city"
                type="text"
                placeholder="Enter city"
                {...register('city', {
                  required: 'City is required'
                })}
                error={errors.city?.message}
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <Input
                id="state"
                type="text"
                placeholder="Enter state"
                {...register('state', {
                  required: 'State is required'
                })}
                error={errors.state?.message}
              />
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                Zip Code *
              </label>
              <Input
                id="zipCode"
                type="text"
                placeholder="Enter zip code"
                {...register('zipCode', {
                  required: 'Zip code is required',
                  pattern: {
                    value: /^\d{5}(-\d{4})?$/,
                    message: 'Please enter a valid zip code'
                  }
                })}
                error={errors.zipCode?.message}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter phone number"
                {...register('phoneNumber', {
                  pattern: {
                    value: /^[+]?[1-9][\d]{0,15}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
                error={errors.phoneNumber?.message}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                error={errors.email?.message}
              />
            </div>
          </div>

          {/* Total Screens */}
          <div>
            <label htmlFor="totalScreens" className="block text-sm font-medium text-gray-700 mb-1">
              Total Screens *
            </label>
            <Input
              id="totalScreens"
              type="number"
              min="1"
              placeholder="Enter number of screens"
              {...register('totalScreens', {
                required: 'Number of screens is required',
                min: {
                  value: 1,
                  message: 'Theater must have at least 1 screen'
                },
                max: {
                  value: 50,
                  message: 'Maximum 50 screens allowed'
                },
                valueAsNumber: true
              })}
              error={errors.totalScreens?.message}
            />
          </div>

          {/* Owner ID (for admin use) */}
          <div>
            <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700 mb-1">
              Owner ID *
            </label>
            <Input
              id="ownerId"
              type="number"
              placeholder="Enter owner user ID"
              {...register('ownerId', {
                required: 'Owner ID is required',
                min: {
                  value: 1,
                  message: 'Please enter a valid owner ID'
                },
                valueAsNumber: true
              })}
              error={errors.ownerId?.message}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
              placeholder="Enter theater description..."
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
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
              {isLoading ? 'Saving...' : isEdit ? 'Update Theater' : 'Create Theater'}
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

export default TheaterForm;