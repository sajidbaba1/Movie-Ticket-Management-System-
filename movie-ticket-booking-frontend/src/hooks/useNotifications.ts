import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import type { NotificationDTO } from '../services/notificationService';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (unreadOnly: boolean) => [...notificationKeys.all, { unreadOnly }] as const,
  count: ['notifications', 'count'] as const,
};

export const useNotifications = (unreadOnly: boolean = false, refetchInterval = 30000) => {
  return useQuery<NotificationDTO[]>({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: () => notificationService.getMyNotifications(unreadOnly),
    refetchInterval,
  });
};

export const useUnreadCount = (refetchInterval = 30000) => {
  return useQuery<number>({
    queryKey: notificationKeys.count,
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval,
  });
};

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      qc.invalidateQueries({ queryKey: notificationKeys.count });
    }
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      qc.invalidateQueries({ queryKey: notificationKeys.count });
    }
  });
};
