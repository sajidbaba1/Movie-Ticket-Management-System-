import api from './api';
import type { User, CreateUserRequest } from '../types';
import { authService } from './authService';

const BASE_URL = '/admin';

export interface AdminStats {
  totalAdmins: number;
  activeAdmins: number;
  inactiveAdmins: number;
}

// ---- Mock Fallback Store ----
let mockAdmins: User[] | null = null;
let nextMockId = 1000;

function ensureMockAdmins(): User[] {
  if (!mockAdmins) {
    // Initialize from authService users if available (role === 'ADMIN')
    const seed = authService.getUsers?.() || [];
    mockAdmins = seed.filter((u: User) => u.role === 'ADMIN');
    // Guarantee at least one admin exists for demo
    if (mockAdmins.length === 0) {
      mockAdmins.push({
        id: nextMockId++,
        firstName: 'Default',
        lastName: 'Admin',
        email: 'admin@moviehub.com',
        phone: '+1-555-0123',
        role: 'ADMIN',
        active: true,
        createdAt: new Date().toISOString(),
      });
    }
  }
  return mockAdmins;
}

function computeStats(list: User[]): AdminStats {
  const totalAdmins = list.length;
  const activeAdmins = list.filter(a => a.active).length;
  return { totalAdmins, activeAdmins, inactiveAdmins: totalAdmins - activeAdmins };
}

export const adminService = {
  // Get all admin users
  getAllAdmins: async (): Promise<User[]> => {
    try {
      const response = await api.get(`${BASE_URL}/admins`);
      return response.data;
    } catch (err) {
      const list = ensureMockAdmins();
      return [...list];
    }
  },

  // Get admin by ID
  getAdminById: async (id: number): Promise<User> => {
    try {
      const response = await api.get(`${BASE_URL}/admins/${id}`);
      return response.data;
    } catch (err) {
      const list = ensureMockAdmins();
      const found = list.find(a => a.id === id);
      if (!found) throw new Error('Admin not found');
      return { ...found };
    }
  },

  // Create new admin user
  createAdmin: async (adminData: CreateUserRequest): Promise<User> => {
    try {
      const response = await api.post(`${BASE_URL}/admins`, adminData);
      return response.data;
    } catch (err) {
      const list = ensureMockAdmins();
      const newAdmin: User = {
        id: nextMockId++,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        email: adminData.email,
        phone: adminData.phone || '',
        role: 'ADMIN',
        active: true,
        createdAt: new Date().toISOString(),
      };
      list.push(newAdmin);
      return { ...newAdmin };
    }
  },

  // Update admin user
  updateAdmin: async (id: number, adminData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put(`${BASE_URL}/admins/${id}`, adminData);
      return response.data;
    } catch (err) {
      const list = ensureMockAdmins();
      const idx = list.findIndex(a => a.id === id);
      if (idx === -1) throw new Error('Admin not found');
      list[idx] = { ...list[idx], ...adminData } as User;
      return { ...list[idx] };
    }
  },

  // Toggle admin status
  toggleAdminStatus: async (id: number, active: boolean): Promise<User> => {
    try {
      const response = await api.patch(`${BASE_URL}/admins/${id}/status`, { active });
      return response.data;
    } catch (err) {
      const list = ensureMockAdmins();
      const idx = list.findIndex(a => a.id === id);
      if (idx === -1) throw new Error('Admin not found');
      list[idx] = { ...list[idx], active } as User;
      return { ...list[idx] };
    }
  },

  // Delete admin user
  deleteAdmin: async (id: number): Promise<void> => {
    try {
      await api.delete(`${BASE_URL}/admins/${id}`);
    } catch (err) {
      const list = ensureMockAdmins();
      const idx = list.findIndex(a => a.id === id);
      if (idx !== -1) list.splice(idx, 1);
    }
  },

  // Get admin statistics
  getAdminStats: async (): Promise<AdminStats> => {
    try {
      const response = await api.get(`${BASE_URL}/stats`);
      return response.data;
    } catch (err) {
      const list = ensureMockAdmins();
      return computeStats(list);
    }
  },
};