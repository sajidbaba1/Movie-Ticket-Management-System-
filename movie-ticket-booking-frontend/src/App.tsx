import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout';
import { ROUTES } from './constants';
import ErrorBoundary from './components/ErrorBoundary';

// Pages (will be created next)
import Dashboard from './pages/Dashboard.tsx';
import MoviesPage from './pages/movies/MoviesPage.tsx';
import MovieDetailPage from './pages/movies/MovieDetailPage.tsx';
import CreateMoviePage from './pages/movies/CreateMoviePage.tsx';
import EditMoviePage from './pages/movies/EditMoviePage.tsx';
import TheatersPage from './pages/theaters/TheatersPage.tsx';
import TheaterDetailPage from './pages/theaters/TheaterDetailPage.tsx';
import CreateTheaterPage from './pages/theaters/CreateTheaterPage.tsx';
import EditTheaterPage from './pages/theaters/EditTheaterPage.tsx';
import UsersPage from './pages/users/UsersPage.tsx';
import UserDetailPage from './pages/users/UserDetailPage.tsx';
import CreateUserPage from './pages/users/CreateUserPage.tsx';
import EditUserPage from './pages/users/EditUserPage.tsx';

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

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Routes>
              <Route path={ROUTES.HOME} element={<Dashboard />} />

              {/* Movie Routes */}
              <Route path={ROUTES.MOVIES} element={<MoviesPage />} />
              <Route path={ROUTES.MOVIE_DETAIL} element={<MovieDetailPage />} />
              <Route path={ROUTES.MOVIE_CREATE} element={<CreateMoviePage />} />
              <Route path={ROUTES.MOVIE_EDIT} element={<EditMoviePage />} />

              {/* Theater Routes */}
              <Route path={ROUTES.THEATERS} element={<TheatersPage />} />
              <Route path={ROUTES.THEATER_DETAIL} element={<TheaterDetailPage />} />
              <Route path={ROUTES.THEATER_CREATE} element={<CreateTheaterPage />} />
              <Route path={ROUTES.THEATER_EDIT} element={<EditTheaterPage />} />

              {/* User Routes */}
              <Route path={ROUTES.USERS} element={<UsersPage />} />
              <Route path={ROUTES.USER_DETAIL} element={<UserDetailPage />} />
              <Route path={ROUTES.USER_CREATE} element={<CreateUserPage />} />
              <Route path={ROUTES.USER_EDIT} element={<EditUserPage />} />
            </Routes>
          </Layout>
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
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
