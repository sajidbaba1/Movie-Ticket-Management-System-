import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Card } from '../../components/ui';
import { useUIStore } from '../../stores/uiStore';
import toast from 'react-hot-toast';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'THEATER_OWNER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  totalBookings?: number;
  totalSpent?: number;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: User['role'];
  isActive: boolean;
}

const SuperAdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { showNotification, showModal } = useUIStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUsers: User[] = [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+91-9876543210',
            role: 'CUSTOMER',
            isActive: true,
            isEmailVerified: true,
            lastLogin: '2024-01-25T10:30:00Z',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-25T10:30:00Z',
            totalBookings: 15,
            totalSpent: 4500
          },
          {
            id: '2',
            firstName: 'Sarah',
            lastName: 'Wilson',
            email: 'sarah.wilson@example.com',
            phone: '+91-9876543211',
            role: 'THEATER_OWNER',
            isActive: true,
            isEmailVerified: true,
            lastLogin: '2024-01-24T15:20:00Z',
            createdAt: '2024-01-10T10:00:00Z',
            updatedAt: '2024-01-24T15:20:00Z',
            totalBookings: 0,
            totalSpent: 0
          },
          {
            id: '3',
            firstName: 'Mike',
            lastName: 'Johnson',
            email: 'mike.johnson@moviehub.com',
            phone: '+91-9876543212',
            role: 'ADMIN',
            isActive: true,
            isEmailVerified: true,
            lastLogin: '2024-01-25T09:15:00Z',
            createdAt: '2024-01-05T10:00:00Z',
            updatedAt: '2024-01-25T09:15:00Z'
          },
          {
            id: '4',
            firstName: 'Emily',
            lastName: 'Davis',
            email: 'emily.davis@example.com',
            phone: '+91-9876543213',
            role: 'CUSTOMER',
            isActive: false,
            isEmailVerified: false,
            createdAt: '2024-01-20T10:00:00Z',
            updatedAt: '2024-01-22T10:00:00Z',
            totalBookings: 2,
            totalSpent: 600
          },
          {
            id: '5',
            firstName: 'David',
            lastName: 'Brown',
            email: 'david.brown@example.com',
            phone: '+91-9876543214',
            role: 'THEATER_OWNER',
            isActive: true,
            isEmailVerified: true,
            lastLogin: '2024-01-23T14:45:00Z',
            createdAt: '2024-01-12T10:00:00Z',
            updatedAt: '2024-01-23T14:45:00Z'
          }
        ];
        
        setUsers(mockUsers);
      } catch (error) {
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load users'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [showNotification]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editingUser) {
        // Update existing user
        const updatedUser: User = {
          ...editingUser,
          ...data,
          updatedAt: new Date().toISOString()
        };
        
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id ? updatedUser : user
        ));
        
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'User updated successfully'
        });
      } else {
        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          ...data,
          isEmailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalBookings: 0,
          totalSpent: 0
        };
        
        setUsers(prev => [newUser, ...prev]);
        
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'User created successfully'
        });
      }

      handleCloseForm();
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save user'
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setValue('firstName', user.firstName);
    setValue('lastName', user.lastName);
    setValue('email', user.email);
    setValue('phone', user.phone || '');
    setValue('role', user.role);
    setValue('isActive', user.isActive);
    setShowForm(true);
  };

  const handleDelete = (user: User) => {
    showModal({
      type: 'confirmation',
      title: 'Delete User',
      content: `Are you sure you want to delete "${user.firstName} ${user.lastName}"? This action cannot be undone.`,
      onConfirm: () => {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'User deleted successfully'
        });
      }
    });
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const updatedUser = {
        ...user,
        isActive: !user.isActive,
        updatedAt: new Date().toISOString()
      };
      
      setUsers(prev => prev.map(u => 
        u.id === user.id ? updatedUser : u
      ));
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user status'
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
    reset();
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800';
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      case 'THEATER_OWNER': return 'bg-green-100 text-green-800';
      case 'CUSTOMER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'SUPER_ADMIN': return '👑';
      case 'ADMIN': return '🛡️';
      case 'THEATER_OWNER': return '🏢';
      case 'CUSTOMER': return '👤';
      default: return '❓';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage all system users and their roles</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <span>➕</span>
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card padding="lg" className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{users.length}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </Card>
        <Card padding="lg" className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {users.filter(u => u.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Users</div>
        </Card>
        <Card padding="lg" className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {users.filter(u => u.role === 'CUSTOMER').length}
          </div>
          <div className="text-sm text-gray-600">Customers</div>
        </Card>
        <Card padding="lg" className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {users.filter(u => u.role === 'THEATER_OWNER').length}
          </div>
          <div className="text-sm text-gray-600">Theater Owners</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card padding="md" className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="THEATER_OWNER">Theater Owner</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.phone && (
                          <div className="text-xs text-gray-400">{user.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)} {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? '✅ Active' : '❌ Inactive'}
                      </span>
                      {!user.isEmailVerified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                          ⚠️ Unverified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? (
                      <div>
                        <div>{new Date(user.lastLogin).toLocaleDateString()}</div>
                        <div className="text-xs">{new Date(user.lastLogin).toLocaleTimeString()}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Never</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role === 'CUSTOMER' && (
                      <div>
                        <div>Bookings: {user.totalBookings || 0}</div>
                        <div className="text-xs">Spent: ₹{user.totalSpent || 0}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => setSelectedUser(user)}
                        variant="outline"
                        size="sm"
                      >
                        👁️
                      </Button>
                      <Button
                        onClick={() => handleEdit(user)}
                        variant="outline"
                        size="sm"
                      >
                        ✏️
                      </Button>
                      <Button
                        onClick={() => handleToggleStatus(user)}
                        variant="outline"
                        size="sm"
                        className={user.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {user.isActive ? '⏸️' : '▶️'}
                      </Button>
                      <Button
                        onClick={() => handleDelete(user)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredUsers.length === 0 && (
        <Card padding="lg" className="text-center mt-6">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-sm">No users match your current search criteria.</p>
          </div>
        </Card>
      )}

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingUser ? 'Edit User' : 'Add New User'}
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
                      First Name *
                    </label>
                    <Input
                      {...register('firstName', { required: 'First name is required' })}
                      placeholder="Enter first name"
                      error={errors.firstName?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <Input
                      {...register('lastName', { required: 'Last name is required' })}
                      placeholder="Enter last name"
                      error={errors.lastName?.message}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    placeholder="Enter email address"
                    error={errors.email?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    {...register('phone')}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    {...register('role', { required: 'Role is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Role</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="THEATER_OWNER">Theater Owner</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Active User
                  </label>
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
                        {editingUser ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      editingUser ? 'Update User' : 'Create User'
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xl font-medium text-gray-600">
                      {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                      {getRoleIcon(selectedUser.role)} {selectedUser.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedUser.phone || 'Not provided'}</p>
                      <p><span className="font-medium">Email Verified:</span> 
                        <span className={`ml-2 ${selectedUser.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedUser.isEmailVerified ? '✅ Yes' : '❌ No'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Account Status</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedUser.isActive ? '✅ Active' : '❌ Inactive'}
                        </span>
                      </p>
                      <p><span className="font-medium">Last Login:</span> {
                        selectedUser.lastLogin 
                          ? new Date(selectedUser.lastLogin).toLocaleString()
                          : 'Never'
                      }</p>
                      <p><span className="font-medium">Member Since:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {selectedUser.role === 'CUSTOMER' && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Customer Statistics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedUser.totalBookings || 0}</div>
                        <div className="text-sm text-blue-800">Total Bookings</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">₹{selectedUser.totalSpent || 0}</div>
                        <div className="text-sm text-green-800">Total Spent</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminUsersPage;
