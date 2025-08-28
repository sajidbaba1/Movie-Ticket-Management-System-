import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { CreateUserRequest } from '../types';
import { UserRole } from '../types';
import { useErrorHandler } from '../utils/errorHandler';
import toast from 'react-hot-toast';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  byRole: (role: UserRole) => [...userKeys.all, 'byRole', role] as const,
};

// Hook to get all users
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: userService.getAllUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get user by ID
export const useUser = (id: number) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get users by role
export const useUsersByRole = (role: UserRole) => {
  return useQuery({
    queryKey: userKeys.byRole(role),
    queryFn: () => userService.getUsersByRole(role),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get theater owners
export const useTheaterOwners = () => {
  return useQuery({
    queryKey: userKeys.byRole(UserRole.THEATER_OWNER),
    queryFn: userService.getTheaterOwners,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get customers
export const useCustomers = () => {
  return useQuery({
    queryKey: userKeys.byRole(UserRole.CUSTOMER),
    queryFn: userService.getCustomers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get admins
export const useAdmins = () => {
  return useQuery({
    queryKey: userKeys.byRole(UserRole.ADMIN),
    queryFn: userService.getAdmins,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to search users
export const useUserSearch = (query: string) => {
  return useQuery({
    queryKey: [...userKeys.all, 'search', query],
    queryFn: () => userService.searchUsers(query),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) =>
      userService.createUser(userData),
    onSuccess: (newUser) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.byRole(newUser.role) });

      // Add the new user to the cache
      queryClient.setQueryData(userKeys.detail(newUser.id), newUser);
      toast.success('User created successfully!');
    },
    onError: (error) => {
      handleError(error, 'Creating user');
    },
  });
};

// Hook to update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateUserRequest> }) =>
      userService.updateUser(id, data),
    onSuccess: (updatedUser) => {
      // Update the user in the cache
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);

      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.byRole(updatedUser.role) });
      toast.success('User updated successfully!');
    },
    onError: (error) => {
      handleError(error, 'Updating user');
    },
  });
};

// Hook to delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: (_, deletedId) => {
      // Remove the user from the cache
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) });

      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate all role-based queries since we don't know the user's role
      queryClient.invalidateQueries({ queryKey: [...userKeys.all, 'byRole'] });
      toast.success('User deleted successfully!');
    },
    onError: (error) => {
      handleError(error, 'Deleting user');
    },
  });
};