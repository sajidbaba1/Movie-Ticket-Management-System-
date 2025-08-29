import apiClient from './api';

export interface CreateBookingRequest {
  scheduleId: number;
  seatsCount: number;
}

export interface BookingDTO {
  id: number;
  user: { id: number } | null;
  schedule: any;
  seatsCount: number;
  totalAmount: number;
  status: 'CREATED' | 'CANCELLED' | 'PAID';
  createdAt: string;
}

export const bookingService = {
  async createBooking(data: CreateBookingRequest): Promise<BookingDTO> {
    const res = await apiClient.post('/bookings', data);
    return res.data;
  },

  async getMyBookings(): Promise<BookingDTO[]> {
    const res = await apiClient.get('/bookings/my');
    return res.data;
  },

  async cancelBooking(id: number): Promise<BookingDTO> {
    const res = await apiClient.patch(`/bookings/${id}/cancel`, {});
    return res.data;
  },
};
