import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type { User, CreateUserRequest } from '../types';
import toast from 'react-hot-toast';

// Query keys
const QUERY_KEYS = {
  ADMINS: ['admins'],
  ADMIN: (id: number) => ['admin', id],
  ADMIN_STATS: ['admin-stats'],
};

// Get all admins hook
export const useAdmins = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ADMINS,
    queryFn: adminService.getAllAdmins,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get admin by ID hook
export const useAdmin = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN(id),
    queryFn: () => adminService.getAdminById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get admin stats hook
export const useAdminStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_STATS,
    queryFn: adminService.getAdminStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Create admin hook
export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adminData: CreateUserRequest) => adminService.createAdmin(adminData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMINS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_STATS });
      toast.success('Admin user created successfully!');
    },
    onError: (error: Error) => {
      const errorMessage = (error as any).response?.data?.message || 'Failed to create admin user';
      toast.error(errorMessage);
    },
  });
};

// Update admin hook
export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, adminData }: { id: number; adminData: Partial<User> }) =>
      adminService.updateAdmin(id, adminData),
    onSuccess: (updatedAdmin) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMINS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN(updatedAdmin.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_STATS });
      toast.success('Admin user updated successfully!');
    },
    onError: (error: Error) => {
      const errorMessage = (error as any).response?.data?.message || 'Failed to update admin user';
      toast.error(errorMessage);
    },
  });
};

// Toggle admin status hook
export const useToggleAdminStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      adminService.toggleAdminStatus(id, active),
    onSuccess: (updatedAdmin) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMINS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN(updatedAdmin.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_STATS });
      const statusText = updatedAdmin.active ? 'activated' : 'deactivated';
      toast.success(`Admin user ${statusText} successfully!`);
    },
    onError: (error: Error) => {
      const errorMessage = (error as any).response?.data?.message || 'Failed to update admin status';
      toast.error(errorMessage);
    },
  });
};

// Delete admin hook
export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMINS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_STATS });
      toast.success('Admin user deleted successfully!');
    },
    onError: (error: Error) => {
      const errorMessage = (error as any).response?.data?.message || 'Failed to delete admin user';
      toast.error(errorMessage);
    },
  });
};