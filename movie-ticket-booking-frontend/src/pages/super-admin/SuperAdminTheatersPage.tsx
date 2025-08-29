import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Card } from '../../components/ui';
import { useUIStore } from '../../stores/uiStore';
import toast from 'react-hot-toast';

interface Theater {
  id: string;
  name: string;
  address: string;
  locationId: string;
  locationName: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  totalScreens: number;
  totalSeats: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  amenities: string[];
  description: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

interface TheaterFormData {
  name: string;
  address: string;
  locationId: string;
  phone: string;
  description: string;
  amenities: string;
}

const SuperAdminTheatersPage: React.FC = () => {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTheater, setEditingTheater] = useState<Theater | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
  const { showNotification, showModal } = useUIStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TheaterFormData>();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockTheaters: Theater[] = [
          {
            id: '1',
            name: 'PVR Cinemas - Phoenix Mall',
            address: 'Phoenix Mall, Lower Parel, Mumbai',
            locationId: '1',
            locationName: 'Mumbai Central',
            ownerName: 'Rajesh Kumar',
            ownerEmail: 'rajesh@pvrcinemas.com',
            phone: '+91-9876543210',
            totalScreens: 8,
            totalSeats: 1200,
            status: 'PENDING',
            amenities: ['IMAX', '4DX', 'Dolby Atmos', 'Recliner Seats', 'Food Court'],
            description: 'Premium multiplex with latest technology and comfortable seating',
            images: ['theater1.jpg', 'theater2.jpg'],
            createdAt: '2024-01-20T10:00:00Z',
            updatedAt: '2024-01-20T10:00:00Z'
          },
          {
            id: '2',
            name: 'INOX Leisure Limited',
            address: 'Select City Walk, Saket, New Delhi',
            locationId: '2',
            locationName: 'Delhi NCR',
            ownerName: 'Priya Sharma',
            ownerEmail: 'priya@inoxmovies.com',
            phone: '+91-9876543211',
            totalScreens: 6,
            totalSeats: 900,
            status: 'APPROVED',
            amenities: ['IMAX', 'Dolby Atmos', 'Premium Seats', 'Cafe'],
            description: 'Modern cinema with state-of-the-art facilities',
            images: ['theater3.jpg'],
            createdAt: '2024-01-18T10:00:00Z',
            updatedAt: '2024-01-19T10:00:00Z',
            approvedAt: '2024-01-19T10:00:00Z',
            approvedBy: 'Super Admin'
          },
          {
            id: '3',
            name: 'Cinepolis Fun Republic',
            address: 'Fun Republic Mall, Andheri West, Mumbai',
            locationId: '1',
            locationName: 'Mumbai Central',
            ownerName: 'Carlos Rodriguez',
            ownerEmail: 'carlos@cinepolis.com',
            phone: '+91-9876543212',
            totalScreens: 10,
            totalSeats: 1500,
            status: 'APPROVED',
            amenities: ['4DX', 'VIP Lounge', 'Gourmet Food', 'Recliner Seats'],
            description: 'Luxury cinema experience with premium amenities',
            images: ['theater4.jpg', 'theater5.jpg'],
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-16T10:00:00Z',
            approvedAt: '2024-01-16T10:00:00Z',
            approvedBy: 'Admin John'
          },
          {
            id: '4',
            name: 'Carnival Cinemas',
            address: 'Nexus Mall, Koramangala, Bangalore',
            locationId: '3',
            locationName: 'Bangalore IT Hub',
            ownerName: 'Amit Patel',
            ownerEmail: 'amit@carnivalcinemas.com',
            phone: '+91-9876543213',
            totalScreens: 4,
            totalSeats: 600,
            status: 'REJECTED',
            amenities: ['Standard Seats', 'Snack Bar'],
            description: 'Budget-friendly cinema with basic facilities',
            images: ['theater6.jpg'],
            createdAt: '2024-01-22T10:00:00Z',
            updatedAt: '2024-01-23T10:00:00Z',
            rejectionReason: 'Insufficient safety measures and outdated equipment'
          }
        ];
        
        setTheaters(mockTheaters);
      } catch (error) {
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load theaters'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheaters();
  }, [showNotification]);

  const handleApprove = (theater: Theater) => {
    showModal({
      type: 'confirmation',
      title: 'Approve Theater',
      content: `Are you sure you want to approve "${theater.name}"? This will allow them to add movies and shows.`,
      onConfirm: () => {
        const updatedTheater = {
          ...theater,
          status: 'APPROVED' as const,
          approvedAt: new Date().toISOString(),
          approvedBy: 'Super Admin',
          updatedAt: new Date().toISOString()
        };
        
        setTheaters(prev => prev.map(t => 
          t.id === theater.id ? updatedTheater : t
        ));
        
        showNotification({
          type: 'success',
          title: 'Success',
          message: `Theater "${theater.name}" has been approved`
        });
      }
    });
  };

  const handleReject = (theater: Theater) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      const updatedTheater = {
        ...theater,
        status: 'REJECTED' as const,
        rejectionReason: reason,
        updatedAt: new Date().toISOString()
      };
      
      setTheaters(prev => prev.map(t => 
        t.id === theater.id ? updatedTheater : t
      ));
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: `Theater "${theater.name}" has been rejected`
      });
    }
  };

  const handleSuspend = (theater: Theater) => {
    showModal({
      type: 'confirmation',
      title: 'Suspend Theater',
      content: `Are you sure you want to suspend "${theater.name}"? This will prevent them from adding new shows.`,
      onConfirm: () => {
        const updatedTheater = {
          ...theater,
          status: 'SUSPENDED' as const,
          updatedAt: new Date().toISOString()
        };
        
        setTheaters(prev => prev.map(t => 
          t.id === theater.id ? updatedTheater : t
        ));
        
        showNotification({
          type: 'success',
          title: 'Success',
          message: `Theater "${theater.name}" has been suspended`
        });
      }
    });
  };

  const handleDelete = (theater: Theater) => {
    showModal({
      type: 'confirmation',
      title: 'Delete Theater',
      content: `Are you sure you want to delete "${theater.name}"? This action cannot be undone.`,
      onConfirm: () => {
        setTheaters(prev => prev.filter(t => t.id !== theater.id));
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Theater deleted successfully'
        });
      }
    });
  };

  const getStatusColor = (status: Theater['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'SUSPENDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Theater['status']) => {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'APPROVED': return '✅';
      case 'REJECTED': return '❌';
      case 'SUSPENDED': return '⏸️';
      default: return '❓';
    }
  };

  const filteredTheaters = theaters.filter(theater => {
    const matchesSearch = theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         theater.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         theater.locationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || theater.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading theaters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Theater Management</h1>
          <p className="text-gray-600">Approve, manage, and monitor all theaters</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <span>➕</span>
            Add Theater
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card padding="lg" className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{theaters.length}</div>
          <div className="text-sm text-gray-600">Total Theaters</div>
        </Card>
        <Card padding="lg" className="text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {theaters.filter(t => t.status === 'PENDING').length}
          </div>
          <div className="text-sm text-gray-600">Pending Approval</div>
        </Card>
        <Card padding="lg" className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {theaters.filter(t => t.status === 'APPROVED').length}
          </div>
          <div className="text-sm text-gray-600">Approved</div>
        </Card>
        <Card padding="lg" className="text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {theaters.filter(t => t.status === 'REJECTED').length}
          </div>
          <div className="text-sm text-gray-600">Rejected</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card padding="md" className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search theaters by name, owner, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Theaters List */}
      <div className="space-y-6">
        {filteredTheaters.map((theater) => (
          <Card key={theater.id} padding="lg">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Theater Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{theater.name}</h3>
                    <p className="text-gray-600">{theater.address}</p>
                    <p className="text-sm text-gray-500">{theater.locationName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${getStatusColor(theater.status)}`}>
                      {getStatusIcon(theater.status)} {theater.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Owner:</span> {theater.ownerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {theater.ownerEmail}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {theater.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Screens:</span> {theater.totalScreens}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Total Seats:</span> {theater.totalSeats}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Created:</span> {new Date(theater.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Description:</p>
                  <p className="text-sm text-gray-600">{theater.description}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Amenities:</p>
                  <div className="flex flex-wrap gap-2">
                    {theater.amenities.map((amenity, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {theater.status === 'APPROVED' && theater.approvedAt && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-800">
                      ✅ Approved on {new Date(theater.approvedAt).toLocaleDateString()} by {theater.approvedBy}
                    </p>
                  </div>
                )}

                {theater.status === 'REJECTED' && theater.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-800">
                      ❌ <strong>Rejection Reason:</strong> {theater.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="lg:w-48 flex lg:flex-col gap-2">
                {theater.status === 'PENDING' && (
                  <>
                    <Button
                      onClick={() => handleApprove(theater)}
                      variant="primary"
                      size="sm"
                      className="flex-1 lg:w-full bg-green-600 hover:bg-green-700"
                    >
                      ✅ Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(theater)}
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:w-full text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      ❌ Reject
                    </Button>
                  </>
                )}

                {theater.status === 'APPROVED' && (
                  <Button
                    onClick={() => handleSuspend(theater)}
                    variant="outline"
                    size="sm"
                    className="flex-1 lg:w-full text-orange-600 hover:text-orange-700 hover:border-orange-300"
                  >
                    ⏸️ Suspend
                  </Button>
                )}

                {theater.status === 'SUSPENDED' && (
                  <Button
                    onClick={() => handleApprove(theater)}
                    variant="primary"
                    size="sm"
                    className="flex-1 lg:w-full bg-green-600 hover:bg-green-700"
                  >
                    ▶️ Reactivate
                  </Button>
                )}

                <Button
                  onClick={() => setSelectedTheater(theater)}
                  variant="outline"
                  size="sm"
                  className="flex-1 lg:w-full"
                >
                  👁️ View Details
                </Button>

                <Button
                  onClick={() => handleDelete(theater)}
                  variant="outline"
                  size="sm"
                  className="flex-1 lg:w-full text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  🗑️ Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTheaters.length === 0 && (
        <Card padding="lg" className="text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-lg font-medium mb-2">No theaters found</h3>
            <p className="text-sm">No theaters match your current search criteria.</p>
          </div>
        </Card>
      )}

      {/* Theater Details Modal */}
      {selectedTheater && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Theater Details</h2>
                <button
                  onClick={() => setSelectedTheater(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedTheater.name}</p>
                      <p><span className="font-medium">Address:</span> {selectedTheater.address}</p>
                      <p><span className="font-medium">Location:</span> {selectedTheater.locationName}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTheater.status)}`}>
                          {selectedTheater.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Owner Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Owner:</span> {selectedTheater.ownerName}</p>
                      <p><span className="font-medium">Email:</span> {selectedTheater.ownerEmail}</p>
                      <p><span className="font-medium">Phone:</span> {selectedTheater.phone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Theater Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedTheater.totalScreens}</div>
                      <div className="text-sm text-blue-800">Total Screens</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedTheater.totalSeats}</div>
                      <div className="text-sm text-green-800">Total Seats</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedTheater.amenities.length}</div>
                      <div className="text-sm text-purple-800">Amenities</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600">{selectedTheater.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTheater.amenities.map((amenity, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Created:</span> {new Date(selectedTheater.createdAt).toLocaleString()}</p>
                      <p><span className="font-medium">Updated:</span> {new Date(selectedTheater.updatedAt).toLocaleString()}</p>
                      {selectedTheater.approvedAt && (
                        <p><span className="font-medium">Approved:</span> {new Date(selectedTheater.approvedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {selectedTheater.images && selectedTheater.images.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Images</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedTheater.images.map((image, index) => (
                          <div key={index} className="bg-gray-200 rounded-lg h-24 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">📷 {image}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminTheatersPage;
