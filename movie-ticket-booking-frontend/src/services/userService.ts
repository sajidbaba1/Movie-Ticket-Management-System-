import apiClient from './api';
import type { User, CreateUserRequest } from '../types';
import { UserRole } from '../types';

export const userService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  // Create a new user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<User>('/users', userData);
    return response.data;
  },

  // Update an existing user
  updateUser: async (id: number, userData: Partial<CreateUserRequest>): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, userData);
    return response.data;
  },

  // Delete a user
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Search users by name or email
  searchUsers: async (query: string): Promise<User[]> => {
    const allUsers = await userService.getAllUsers();
    return allUsers.filter(user =>
      user.firstName.toLowerCase().includes(query.toLowerCase()) ||
      user.lastName.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Get users by role
  getUsersByRole: async (role: UserRole): Promise<User[]> => {
    const allUsers = await userService.getAllUsers();
    return allUsers.filter(user => user.role === role);
  },

  // Get theater owners
  getTheaterOwners: async (): Promise<User[]> => {
    return userService.getUsersByRole(UserRole.THEATER_OWNER);
  },

  // Get customers
  getCustomers: async (): Promise<User[]> => {
    return userService.getUsersByRole(UserRole.CUSTOMER);
  },

  // Get admins
  getAdmins: async (): Promise<User[]> => {
    return userService.getUsersByRole(UserRole.ADMIN);
  }
};