import React from 'react';
import { useForm } from 'react-hook-form';
import type { Theater, CreateTheaterRequest } from '../../types';
import { Button, Input, Select, Textarea } from '../ui';

interface TheaterFormProps {
  theater?: Theater;
  onSubmit: (data: CreateTheaterRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TheaterForm: React.FC<TheaterFormProps> = ({
  theater,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateTheaterRequest>({
    defaultValues: theater ? {
      name: theater.name,
      address: theater.address,
      city: theater.city,
      state: theater.state,
      zipCode: theater.zipCode,
      phoneNumber: theater.phoneNumber || '',
      email: theater.email || '',
      totalScreens: theater.totalScreens,
      description: theater.description || '',
    } : {
      totalScreens: 1
    }
  });

  const stateOptions = [
    { value: '', label: 'Select State' },
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Theater Name"
          {...register('name', {
            required: 'Theater name is required',
            maxLength: {
              value: 100,
              message: 'Theater name must be less than 100 characters'
            }
          })}
          error={errors.name?.message}
          placeholder="Enter theater name"
          required
        />

        <Input
          label="Total Screens"
          type="number"
          {...register('totalScreens', {
            required: 'Number of screens is required',
            min: {
              value: 1,
              message: 'Theater must have at least 1 screen'
            },
            max: {
              value: 50,
              message: 'Theater cannot have more than 50 screens'
            }
          })}
          error={errors.totalScreens?.message}
          placeholder="1"
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          {...register('phoneNumber', {
            pattern: {
              value: /^[\+]?[1-9][\d]{0,15}$/,
              message: 'Please enter a valid phone number'
            }
          })}
          error={errors.phoneNumber?.message}
          placeholder="+1 (555) 123-4567"
        />

        <Input
          label="Email"
          type="email"
          {...register('email', {
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Please enter a valid email address'
            }
          })}
          error={errors.email?.message}
          placeholder="theater@example.com"
        />
      </div>

      <Input
        label="Address"
        {...register('address', {
          required: 'Address is required',
          maxLength: {
            value: 200,
            message: 'Address must be less than 200 characters'
          }
        })}
        error={errors.address?.message}
        placeholder="Enter theater address"
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="City"
          {...register('city', {
            required: 'City is required',
            maxLength: {
              value: 50,
              message: 'City name must be less than 50 characters'
            }
          })}
          error={errors.city?.message}
          placeholder="Enter city"
          required
        />

        <Select
          label="State"
          {...register('state', { required: 'State is required' })}
          options={stateOptions}
          error={errors.state?.message}
          placeholder="Select state"
          required
        />

        <Input
          label="ZIP Code"
          {...register('zipCode', {
            required: 'ZIP code is required',
            pattern: {
              value: /^\d{5}(-\d{4})?$/,
              message: 'Please enter a valid ZIP code (12345 or 12345-6789)'
            }
          })}
          error={errors.zipCode?.message}
          placeholder="12345"
          required
        />
      </div>

      <Textarea
        label="Description (Optional)"
        {...register('description', {
          maxLength: {
            value: 500,
            message: 'Description must be less than 500 characters'
          }
        })}
        error={errors.description?.message}
        placeholder="Describe your theater, amenities, and special features..."
        rows={4}
      />

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          loading={isLoading}
          className="flex-1"
        >
          {theater ? 'Update Theater' : 'Create Theater'}
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

export default TheaterForm;