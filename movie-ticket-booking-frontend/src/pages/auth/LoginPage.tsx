import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Card } from '../../components/ui';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: 'superadmin@moviehub.com',
      password: 'superadmin123',
      rememberMe: false,
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    console.log('LoginPage useEffect: isAuthenticated =', isAuthenticated, 'user =', user);

    if (isAuthenticated && user) {
      // Get the intended destination from location state or use role-based default
      const from = location.state?.from?.pathname;

      let redirectTo = '/';
      if (from) {
        redirectTo = from;
      } else {
        // Default redirects based on user role
        switch (user.role) {
          case 'CUSTOMER':
            redirectTo = '/customer';
            break;
          case 'THEATER_OWNER':
            redirectTo = '/theater-owner';
            break;
          case 'ADMIN':
            redirectTo = '/admin';
            break;
          case 'SUPER_ADMIN':
            redirectTo = '/super-admin';
            break;
          default:
            redirectTo = '/';
        }
      }

      console.log('LoginPage: Redirecting to:', redirectTo);
      // Use hard redirect to force full app refresh after login
      window.location.replace(redirectTo);
    }
  }, [isAuthenticated, user, location]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');

      // The useEffect hook will handle redirection automatically
      // No manual redirection needed here as it's handled by the useEffect
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login error:', error);
    }
  };

  // Demo credentials for quick access
  const demoCredentials = [
    { email: 'superadmin@moviehub.com', password: 'superadmin123', role: 'Super Admin' },
    { email: 'admin@moviehub.com', password: 'admin123', role: 'Admin' },
    { email: 'john.smith@example.com', password: 'theater123', role: 'Theater Owner' },
    { email: 'sarah.wilson@example.com', password: 'password123', role: 'Customer' },
    { email: 'ss2728303@gmail.com', password: 'sajidsai', role: 'Customer' },
  ];

  const fillDemoCredentials = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
              <span className="text-white font-bold text-xl">🎬</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              MovieHub
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Demo Credentials */}
        <Card padding="md" className="bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">Demo Credentials</h3>
          <div className="space-y-2">
            {demoCredentials.map((cred, index) => (
              <button
                key={index}
                onClick={() => fillDemoCredentials(cred.email, cred.password)}
                className="w-full text-left p-2 rounded-lg bg-white hover:bg-blue-100 border border-blue-200 hover:border-blue-300 transition-colors duration-200"
              >
                <div className="text-sm font-medium text-blue-900">{cred.role}</div>
                <div className="text-xs text-blue-600">{cred.email}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Login Form */}
        <Card padding="lg">
          <form id="loginForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Login Failed</h3>
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
                error={errors.email?.message}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 MovieHub. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;