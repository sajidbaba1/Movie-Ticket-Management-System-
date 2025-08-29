import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Modal {
  id: string;
  type: 'confirmation' | 'form' | 'info' | 'error';
  title: string;
  content?: string;
  data?: any;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

interface UIState {
  isLoading: boolean;
  loadingMessage: string;
  modals: Modal[];
  notifications: Notification[];
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  currentPage: string;
}

interface UIActions {
  setLoading: (loading: boolean, message?: string) => void;
  showModal: (modal: Omit<Modal, 'id'>) => string;
  hideModal: (id: string) => void;
  hideAllModals: () => void;
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  hideNotification: (id: string) => void;
  clearNotifications: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentPage: (page: string) => void;
}

const initialState: UIState = {
  isLoading: false,
  loadingMessage: '',
  modals: [],
  notifications: [],
  sidebarOpen: false,
  theme: 'light',
  currentPage: '',
};

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setLoading: (loading, message = '') =>
        set({ isLoading: loading, loadingMessage: message }, false, 'setLoading'),

      showModal: (modal) => {
        const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newModal = { ...modal, id };
        set((state) => ({
          modals: [...state.modals, newModal],
        }), false, 'showModal');
        return id;
      },

      hideModal: (id) =>
        set((state) => ({
          modals: state.modals.filter(modal => modal.id !== id),
        }), false, 'hideModal'),

      hideAllModals: () =>
        set({ modals: [] }, false, 'hideAllModals'),

      showNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification = {
          ...notification,
          id,
          timestamp: Date.now(),
          duration: notification.duration || 5000,
        };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }), false, 'showNotification');

        // Auto-hide notification after duration
        if (newNotification.duration > 0) {
          setTimeout(() => {
            get().hideNotification(id);
          }, newNotification.duration);
        }

        return id;
      },

      hideNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter(notification => notification.id !== id),
        }), false, 'hideNotification'),

      clearNotifications: () =>
        set({ notifications: [] }, false, 'clearNotifications'),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),

      setSidebarOpen: (open) =>
        set({ sidebarOpen: open }, false, 'setSidebarOpen'),

      setTheme: (theme) =>
        set({ theme }, false, 'setTheme'),

      setCurrentPage: (page) =>
        set({ currentPage: page }, false, 'setCurrentPage'),
    }),
    { name: 'UIStore' }
  )
);
