import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ChatWidget from './components/chat/ChatWidget';
import { Layout, CustomerHeader, TheaterOwnerHeader, SuperAdminHeader } from './components/layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ROUTES } from './constants';
import ErrorBoundary from './components/ErrorBoundary';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Admin Pages
import Dashboard from './pages/Dashboard';
import MoviesPage from './pages/movies/MoviesPage';
import MovieDetailPage from './pages/movies/MovieDetailPage';
import CreateMoviePage from './pages/movies/CreateMoviePage';
import EditMoviePage from './pages/movies/EditMoviePage';
import TheatersPage from './pages/theaters/TheatersPage';
import TheaterDetailPage from './pages/theaters/TheaterDetailPage';
import CreateTheaterPage from './pages/theaters/CreateTheaterPage';
import EditTheaterPage from './pages/theaters/EditTheaterPage';
import UsersPage from './pages/users/UsersPage';
import UserDetailPage from './pages/users/UserDetailPage';
import CreateUserPage from './pages/users/CreateUserPage';
import EditUserPage from './pages/users/EditUserPage';

// Theater Owner Pages
import TheaterOwnerDashboard from './pages/theater-owner/TheaterOwnerDashboard';
import TheaterOwnerTheatersPage from './pages/theater-owner/TheaterOwnerTheatersPage';
import TheaterOwnerTheaterDetailPage from './pages/theater-owner/TheaterOwnerTheaterDetailPage';
import TheaterOwnerEditTheaterPage from './pages/theater-owner/TheaterOwnerEditTheaterPage';
import TheaterOwnerSchedulesPage from './pages/theater-owner/TheaterOwnerSchedulesPage';
import TheaterOwnerAnalyticsPage from './pages/theater-owner/TheaterOwnerAnalyticsPage';
import TheaterOwnerProfilePage from './pages/theater-owner/TheaterOwnerProfilePage';
import TheaterOwnerMoviesPage from './pages/theater-owner/TheaterOwnerMoviesPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerMoviesPage from './pages/customer/CustomerMoviesPage';
import CustomerTheatersPage from './pages/customer/CustomerTheatersPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';
import CustomerBookingsPage from './pages/customer/CustomerBookingsPage';
import CustomerSettingsPage from './pages/customer/CustomerSettingsPage';
import CustomerAnalyticsPage from './pages/customer/CustomerAnalyticsPage';
import CustomerMovieDetailPage from './pages/customer/CustomerMovieDetailPage';
import CustomerBookMoviePage from './pages/customer/CustomerBookMoviePage';

// Super Admin Pages
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import SuperAdminAdminsPage from './pages/super-admin/SuperAdminAdminsPage';
import SuperAdminLocationsPage from './pages/super-admin/SuperAdminLocationsPage';
import SuperAdminTheatersPage from './pages/super-admin/SuperAdminTheatersPage';
import SuperAdminUsersPage from './pages/super-admin/SuperAdminUsersPage';
import SuperAdminMoviesPage from './pages/super-admin/SuperAdminMoviesPage';
import SuperAdminAnalyticsPage from './pages/super-admin/SuperAdminAnalyticsPage';
import SuperAdminRagChatPage from './pages/super-admin/SuperAdminRagChatPage';
// Approvals UI removed to simplify flow

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Root redirect component
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user?.role) {
    case 'CUSTOMER':
      return <Navigate to="/customer" replace />;
    case 'THEATER_OWNER':
      return <Navigate to="/theater-owner" replace />;
    case 'ADMIN':
      return <Navigate to="/admin" replace />;
    case 'SUPER_ADMIN':
      return <Navigate to="/super-admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// App Routes component
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Customer Routes */}
      <Route path="/customer" element={
        <ProtectedRoute requiredRoles={['CUSTOMER']}>
          <div className="min-h-screen bg-gray-50">
            <CustomerHeader />
            <CustomerDashboard />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/customer/movies" element={
        <ProtectedRoute requiredRoles={['CUSTOMER']}>
          <div className="min-h-screen bg-gray-50">
            <CustomerHeader />
            <CustomerMoviesPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/customer/movies/:id" element={
        <ProtectedRoute requiredRoles={['CUSTOMER']}>
          <div className="min-h-screen bg-gray-50">
            <CustomerHeader />
            <CustomerMovieDetailPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/customer/movies/:id/book" element={
        <ProtectedRoute requiredRoles={['CUSTOMER']}>
          <div className="min-h-screen bg-gray-50">
            <CustomerHeader />
            <CustomerBookMoviePage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/customer/theaters" element={
        <ProtectedRoute requiredRoles={['CUSTOMER']}>
          <div className="min-h-screen bg-gray-50">
            <CustomerHeader />
            <CustomerTheatersPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/customer/profile" element={
        <ProtectedRoute requiredRoles={['CUSTOMER']}>
          <div className="min-h-screen bg-gray-50">
            <CustomerHeader />
            <CustomerProfilePage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/customer/bookings" element={
        <ProtectedRoute requiredRoles={['CUSTOMER']}>
          <div className="min-h-screen bg-gray-50">
            <CustomerHeader />
            <CustomerBookingsPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/customer/settings" element={
        <ProtectedRoute requiredRoles={['CUSTOMER']}>
          <div className="min-h-screen bg-gray-50">
            <CustomerHeader />
            <CustomerSettingsPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/customer/analytics" element={
        <ProtectedRoute requiredRoles={['CUSTOMER']}>
          <div className="min-h-screen bg-gray-50">
            <CustomerHeader />
            <CustomerAnalyticsPage />
          </div>
        </ProtectedRoute>
      } />

      {/* Theater Owner Routes */}
      <Route path="/theater-owner" element={
        <ProtectedRoute requiredRoles={['THEATER_OWNER']}>
          <div className="min-h-screen bg-gray-50">
            <TheaterOwnerHeader />
            <TheaterOwnerDashboard />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/theater-owner/movies/create" element={
        <ProtectedRoute requiredRoles={['THEATER_OWNER']}>
          <div className="min-h-screen bg-gray-50">
            <TheaterOwnerHeader />
            <CreateMoviePage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/theater-owner/movies" element={
        <ProtectedRoute requiredRoles={['THEATER_OWNER']}>
          <div className="min-h-screen bg-gray-50">
            <TheaterOwnerHeader />
            <TheaterOwnerMoviesPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/theater-owner/theaters" element={
        <ProtectedRoute requiredRoles={['THEATER_OWNER']}>
          <div className="min-h-screen bg-gray-50">
            <TheaterOwnerHeader />
            <TheaterOwnerTheatersPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/theater-owner/theaters/:id" element={
        <ProtectedRoute requiredRoles={['THEATER_OWNER']}>
          <div className="min-h-screen bg-gray-50">
            <TheaterOwnerHeader />
            <TheaterOwnerTheaterDetailPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/theater-owner/theaters/:id/edit" element={
        <ProtectedRoute requiredRoles={['THEATER_OWNER']}>
          <div className="min-h-screen bg-gray-50">
            <TheaterOwnerHeader />
            <TheaterOwnerEditTheaterPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/theater-owner/schedules" element={
        <ProtectedRoute requiredRoles={['THEATER_OWNER']}>
          <div className="min-h-screen bg-gray-50">
            <TheaterOwnerHeader />
            <TheaterOwnerSchedulesPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/theater-owner/analytics" element={
        <ProtectedRoute requiredRoles={['THEATER_OWNER']}>
          <div className="min-h-screen bg-gray-50">
            <TheaterOwnerHeader />
            <TheaterOwnerAnalyticsPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/theater-owner/profile" element={
        <ProtectedRoute requiredRoles={['THEATER_OWNER']}>
          <div className="min-h-screen bg-gray-50">
            <TheaterOwnerHeader />
            <TheaterOwnerProfilePage />
          </div>
        </ProtectedRoute>
      } />

      {/* Super Admin Routes */}
      <Route path="/super-admin" element={
        <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
          <div className="min-h-screen bg-gray-50">
            <SuperAdminHeader />
            <SuperAdminDashboard />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/admins" element={
        <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
          <div className="min-h-screen bg-gray-50">
            <SuperAdminHeader />
            <SuperAdminAdminsPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/locations" element={
        <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
          <div className="min-h-screen bg-gray-50">
            <SuperAdminHeader />
            <SuperAdminLocationsPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/theaters" element={
        <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
          <div className="min-h-screen bg-gray-50">
            <SuperAdminHeader />
            <SuperAdminTheatersPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/users" element={
        <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
          <div className="min-h-screen bg-gray-50">
            <SuperAdminHeader />
            <SuperAdminUsersPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/movies" element={
        <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
          <div className="min-h-screen bg-gray-50">
            <SuperAdminHeader />
            <SuperAdminMoviesPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/analytics" element={
        <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
          <div className="min-h-screen bg-gray-50">
            <SuperAdminHeader />
            <SuperAdminAnalyticsPage />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/rag-chat" element={
        <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
          <div className="min-h-screen bg-gray-50">
            <SuperAdminHeader />
            <SuperAdminRagChatPage />
          </div>
        </ProtectedRoute>
      } />

      {/* Admin Routes - Protected by Layout */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Movie Routes - Admin Only */}
      <Route path={ROUTES.MOVIES} element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <Layout><MoviesPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path={ROUTES.MOVIE_DETAIL} element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <Layout><MovieDetailPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path={ROUTES.MOVIE_CREATE} element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <Layout><CreateMoviePage /></Layout>
        </ProtectedRoute>
      } />
      <Route path={ROUTES.MOVIE_EDIT} element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <Layout><EditMoviePage /></Layout>
        </ProtectedRoute>
      } />

      {/* Theater Routes - Admin Only */}
      <Route path={ROUTES.THEATERS} element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <Layout><TheatersPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path={ROUTES.THEATER_DETAIL} element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <Layout><TheaterDetailPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path={ROUTES.THEATER_CREATE} element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <Layout><CreateTheaterPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path={ROUTES.THEATER_EDIT} element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <Layout><EditTheaterPage /></Layout>
        </ProtectedRoute>
      } />

      {/* User Routes - Admin Only */}
      <Route path={ROUTES.USERS} element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <Layout><UsersPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path={ROUTES.USER_DETAIL} element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <Layout><UserDetailPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path={ROUTES.USER_CREATE} element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <Layout><CreateUserPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path={ROUTES.USER_EDIT} element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <Layout><EditUserPage /></Layout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Renders the floating ChatWidget only when a user is authenticated
const AuthChat: React.FC = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return <ChatWidget />;
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <AppRoutes />
            {/* Global Chat Widget - only when authenticated */}
            <AuthChat />
            {import.meta.env.DEV && (
              <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
            )}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;