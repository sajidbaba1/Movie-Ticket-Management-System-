import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Card } from '../../components/ui';
import { useUIStore } from '../../stores/uiStore';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LocationFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

const SuperAdminLocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification, showModal } = useUIStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormData>();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockLocations: Location[] = [
          {
            id: '1',
            name: 'Mumbai Central',
            address: 'Central Mumbai, Maharashtra',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            latitude: 19.0760,
            longitude: 72.8777,
            isActive: true,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            name: 'Delhi NCR',
            address: 'New Delhi, Delhi',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001',
            latitude: 28.6139,
            longitude: 77.2090,
            isActive: true,
            createdAt: '2024-01-16T10:00:00Z',
            updatedAt: '2024-01-16T10:00:00Z'
          },
          {
            id: '3',
            name: 'Bangalore IT Hub',
            address: 'Electronic City, Bangalore',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560100',
            latitude: 12.9716,
            longitude: 77.5946,
            isActive: true,
            createdAt: '2024-01-17T10:00:00Z',
            updatedAt: '2024-01-17T10:00:00Z'
          },
          {
            id: '4',
            name: 'Chennai Marina',
            address: 'Marina Beach Area, Chennai',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600001',
            latitude: 13.0827,
            longitude: 80.2707,
            isActive: false,
            createdAt: '2024-01-18T10:00:00Z',
            updatedAt: '2024-01-18T10:00:00Z'
          }
        ];
        
        setLocations(mockLocations);
      } catch (error) {
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load locations'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [showNotification]);

  const onSubmit = async (data: LocationFormData) => {
    try {
      // Simulate geocoding if coordinates not provided
      if (!data.latitude || !data.longitude) {
        // In a real app, you would use Google Geocoding API here
        data.latitude = Math.random() * 180 - 90;
        data.longitude = Math.random() * 360 - 180;
      }

      if (editingLocation) {
        // Update existing location
        const updatedLocation: Location = {
          ...editingLocation,
          ...data,
          latitude: data.latitude!,
          longitude: data.longitude!,
          updatedAt: new Date().toISOString()
        };
        
        setLocations(prev => prev.map(loc => 
          loc.id === editingLocation.id ? updatedLocation : loc
        ));
        
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Location updated successfully'
        });
      } else {
        // Create new location
        const newLocation: Location = {
          id: Date.now().toString(),
          ...data,
          latitude: data.latitude!,
          longitude: data.longitude!,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setLocations(prev => [newLocation, ...prev]);
        
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Location created successfully'
        });
      }

      handleCloseForm();
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save location'
      });
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setValue('name', location.name);
    setValue('address', location.address);
    setValue('city', location.city);
    setValue('state', location.state);
    setValue('pincode', location.pincode);
    setValue('latitude', location.latitude);
    setValue('longitude', location.longitude);
    setShowForm(true);
  };

  const handleDelete = (location: Location) => {
    showModal({
      type: 'confirmation',
      title: 'Delete Location',
      content: `Are you sure you want to delete "${location.name}"? This action cannot be undone.`,
      onConfirm: () => {
        setLocations(prev => prev.filter(loc => loc.id !== location.id));
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Location deleted successfully'
        });
      }
    });
  };

  const handleToggleStatus = async (location: Location) => {
    try {
      const updatedLocation = {
        ...location,
        isActive: !location.isActive,
        updatedAt: new Date().toISOString()
      };
      
      setLocations(prev => prev.map(loc => 
        loc.id === location.id ? updatedLocation : loc
      ));
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: `Location ${updatedLocation.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update location status'
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLocation(null);
    reset();
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Location Management</h1>
          <p className="text-gray-600">Manage all locations with Google Maps integration</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <span>➕</span>
          Add Location
        </Button>
      </div>

      {/* Search and Filters */}
      <Card padding="md" className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search locations by name, city, or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="">All States</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredLocations.map((location) => (
          <Card key={location.id} padding="lg" className="relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                <p className="text-sm text-gray-600">{location.city}, {location.state}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  location.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {location.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Address:</span> {location.address}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Pincode:</span> {location.pincode}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Coordinates:</span> {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </p>
            </div>

            {/* Google Maps Preview */}
            <div className="mb-4">
              <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">🗺️ Map Preview</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleEdit(location)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                ✏️ Edit
              </Button>
              <Button
                onClick={() => handleToggleStatus(location)}
                variant={location.isActive ? "outline" : "primary"}
                size="sm"
                className="flex-1"
              >
                {location.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
              </Button>
              <Button
                onClick={() => handleDelete(location)}
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

      {/* Location Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingLocation ? 'Edit Location' : 'Add New Location'}
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
                      Location Name *
                    </label>
                    <Input
                      {...register('name', { required: 'Location name is required' })}
                      placeholder="e.g., Mumbai Central"
                      error={errors.name?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <Input
                      {...register('city', { required: 'City is required' })}
                      placeholder="e.g., Mumbai"
                      error={errors.city?.message}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    {...register('address', { required: 'Address is required' })}
                    placeholder="Enter full address"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <select
                      {...register('state', { required: 'State is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select State</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="West Bengal">West Bengal</option>
                    </select>
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <Input
                      {...register('pincode', { 
                        required: 'Pincode is required',
                        pattern: {
                          value: /^\d{6}$/,
                          message: 'Pincode must be 6 digits'
                        }
                      })}
                      placeholder="e.g., 400001"
                      error={errors.pincode?.message}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude (Optional)
                    </label>
                    <Input
                      type="number"
                      step="any"
                      {...register('latitude', { valueAsNumber: true })}
                      placeholder="e.g., 19.0760"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude (Optional)
                    </label>
                    <Input
                      type="number"
                      step="any"
                      {...register('longitude', { valueAsNumber: true })}
                      placeholder="e.g., 72.8777"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> If you don't provide coordinates, they will be automatically geocoded from the address using Google Maps API.
                  </p>
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
                        {editingLocation ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      editingLocation ? 'Update Location' : 'Create Location'
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

      {/* Stats */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{locations.length}</div>
            <div className="text-sm text-gray-600">Total Locations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {locations.filter(l => l.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Active Locations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {locations.filter(l => !l.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Inactive Locations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(locations.map(l => l.state)).size}
            </div>
            <div className="text-sm text-gray-600">States Covered</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminLocationsPage;
