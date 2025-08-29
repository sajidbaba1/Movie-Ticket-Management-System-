import apiClient from './api';

export interface NotificationDTO {
  id: number;
  title: string;
  message: string;
  type: 'BOOKING' | 'THEATER' | 'MOVIE' | 'SCHEDULE' | 'USER' | 'SYSTEM';
  createdAt: string;
  readFlag: boolean;
  dataJson?: string;
}

export const notificationService = {
  async getMyNotifications(unreadOnly?: boolean): Promise<NotificationDTO[]> {
    const res = await apiClient.get(`/notifications/my`, {
      params: { unreadOnly: !!unreadOnly },
    });
    return res.data as NotificationDTO[];
  },
  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get(`/notifications/my/count`);
    return (res.data?.count as number) || 0;
  },
  async markRead(id: number): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },
  async markAllRead(): Promise<void> {
    await apiClient.patch(`/notifications/read-all`);
  },
};
