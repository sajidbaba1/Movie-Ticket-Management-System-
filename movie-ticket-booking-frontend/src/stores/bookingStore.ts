import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'REGULAR' | 'PREMIUM' | 'VIP';
  price: number;
  isAvailable: boolean;
  isSelected: boolean;
}

export interface BookingState {
  selectedMovie: any | null;
  selectedTheater: any | null;
  selectedShow: any | null;
  selectedSeats: Seat[];
  totalAmount: number;
  bookingStep: 'movie' | 'theater' | 'show' | 'seats' | 'payment' | 'confirmation';
  paymentMethod: 'wallet' | 'razorpay' | null;
  bookingId: string | null;
}

interface BookingActions {
  setSelectedMovie: (movie: any) => void;
  setSelectedTheater: (theater: any) => void;
  setSelectedShow: (show: any) => void;
  toggleSeatSelection: (seat: Seat) => void;
  clearSelectedSeats: () => void;
  setBookingStep: (step: BookingState['bookingStep']) => void;
  setPaymentMethod: (method: BookingState['paymentMethod']) => void;
  setBookingId: (id: string) => void;
  calculateTotal: () => void;
  resetBooking: () => void;
}

const initialState: BookingState = {
  selectedMovie: null,
  selectedTheater: null,
  selectedShow: null,
  selectedSeats: [],
  totalAmount: 0,
  bookingStep: 'movie',
  paymentMethod: null,
  bookingId: null,
};

export const useBookingStore = create<BookingState & BookingActions>()(
  devtools(
    persist(
      (set, _get) => ({
        ...initialState,

        setSelectedMovie: (movie) =>
          set({ selectedMovie: movie, bookingStep: 'theater' }, false, 'setSelectedMovie'),

        setSelectedTheater: (theater) =>
          set({ selectedTheater: theater, bookingStep: 'show' }, false, 'setSelectedTheater'),

        setSelectedShow: (show) =>
          set({ selectedShow: show, bookingStep: 'seats' }, false, 'setSelectedShow'),

        toggleSeatSelection: (seat) =>
          set((state) => {
            const isSelected = state.selectedSeats.some(s => s.id === seat.id);
            let newSelectedSeats;
            
            if (isSelected) {
              newSelectedSeats = state.selectedSeats.filter(s => s.id !== seat.id);
            } else {
              newSelectedSeats = [...state.selectedSeats, { ...seat, isSelected: true }];
            }

            const totalAmount = newSelectedSeats.reduce((sum, s) => sum + s.price, 0);
            
            return {
              selectedSeats: newSelectedSeats,
              totalAmount,
            };
          }, false, 'toggleSeatSelection'),

        clearSelectedSeats: () =>
          set({ selectedSeats: [], totalAmount: 0 }, false, 'clearSelectedSeats'),

        setBookingStep: (step) =>
          set({ bookingStep: step }, false, 'setBookingStep'),

        setPaymentMethod: (method) =>
          set({ paymentMethod: method }, false, 'setPaymentMethod'),

        setBookingId: (id) =>
          set({ bookingId: id }, false, 'setBookingId'),

        calculateTotal: () =>
          set((state) => ({
            totalAmount: state.selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
          }), false, 'calculateTotal'),

        resetBooking: () =>
          set(initialState, false, 'resetBooking'),
      }),
      {
        name: 'booking-store',
        partialize: (state) => ({
          selectedMovie: state.selectedMovie,
          selectedTheater: state.selectedTheater,
          selectedShow: state.selectedShow,
          selectedSeats: state.selectedSeats,
          totalAmount: state.totalAmount,
          bookingStep: state.bookingStep,
        }),
      }
    ),
    { name: 'BookingStore' }
  )
);
