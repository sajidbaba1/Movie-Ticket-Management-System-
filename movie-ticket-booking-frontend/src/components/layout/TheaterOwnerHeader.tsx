import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { classNames } from '../../utils';
import toast from 'react-hot-toast';
import NotificationBell from '../notifications/NotificationBell';

const TheaterOwnerHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/theater-owner',
      current: location.pathname === '/theater-owner',
      icon: '🏠'
    },
    {
      name: 'My Theaters',
      href: '/theater-owner/theaters',
      current: location.pathname.startsWith('/theater-owner/theaters'),
      icon: '🏢'
    },
    {
      name: 'Movies',
      href: '/theater-owner/movies',
      current: location.pathname.startsWith('/theater-owner/movies'),
      icon: '🎞️'
    },
    {
      name: 'Schedules',
      href: '/theater-owner/schedules',
      current: location.pathname.startsWith('/theater-owner/schedules'),
      icon: '📅'
    },
    {
      name: 'Bookings',
      href: '/theater-owner/bookings',
      current: location.pathname.startsWith('/theater-owner/bookings'),
      icon: '🎫'
    },
    {
      name: 'Analytics',
      href: '/theater-owner/analytics',
      current: location.pathname.startsWith('/theater-owner/analytics'),
      icon: '📊'
    },
  ];

  return (
    <>
      <header className={classNames(
        'sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b transition-all duration-300',
        isScrolled ? 'shadow-soft border-gray-200' : 'border-gray-100'
      )}>
        <div className="container-responsive">
          <div className="flex justify-between items-center h-16 lg:h-18">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/theater-owner" className="flex items-center group">
                <div className="h-9 w-9 lg:h-10 lg:w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
                  <span className="text-white font-bold text-lg lg:text-xl">🎭</span>
                </div>
                <div className="ml-3">
                  <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    MovieHub
                  </span>
                  <div className="text-xs text-gray-500 font-medium hidden sm:block">
                    Theater Owner
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    'nav-link flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    item.current
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  )}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Notifications */}
              <NotificationBell />

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{user?.role}</div>
                  </div>
                  <div className="h-9 w-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-sm font-semibold text-white">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/theater-owner/profile');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="mr-2">👤</span>
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/theater-owner/settings');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="mr-2">⚙️</span>
                      Settings
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="mr-2">🚪</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              >
                <span className="sr-only">Open main menu</span>
                <div className="w-5 h-5 flex flex-col justify-center items-center">
                  <span className={classNames(
                    'block h-0.5 w-5 bg-current transition-all duration-300 origin-center',
                    isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'
                  )}></span>
                  <span className={classNames(
                    'block h-0.5 w-5 bg-current transition-all duration-300',
                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  )}></span>
                  <span className={classNames(
                    'block h-0.5 w-5 bg-current transition-all duration-300 origin-center',
                    isMobileMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'
                  )}></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-white shadow-2xl transform transition-transform duration-300 animate-slide-up">
            <div className="flex flex-col h-full">
              {/* Mobile menu header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🎭</span>
                  </div>
                  <span className="ml-2 text-lg font-bold text-gray-900">MovieHub</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>

              {/* Mobile navigation */}
              <nav className="flex-1 px-6 py-6 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      'flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200',
                      item.current
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>

              {/* Mobile user info */}
              <div className="px-6 py-6 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/theater-owner/profile');
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span>👤</span>
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/theater-owner/settings');
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span>⚙️</span>
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TheaterOwnerHeader;