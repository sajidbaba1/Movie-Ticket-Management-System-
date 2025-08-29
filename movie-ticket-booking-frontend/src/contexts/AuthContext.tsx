/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

type AuthAction =
  | { type: 'INIT_START' }
  | { type: 'INIT_COMPLETE' }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'SIGNUP_START' }
  | { type: 'SIGNUP_SUCCESS'; payload: User }
  | { type: 'SIGNUP_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESTORE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  console.log('AuthReducer: Action type:', action.type, 'Current state:', { isAuthenticated: state.isAuthenticated, user: state.user?.email });

  switch (action.type) {
    case 'INIT_START':
      return {
        ...state,
        isInitializing: true,
      };
    case 'INIT_COMPLETE':
      return {
        ...state,
        isInitializing: false,
      };
    case 'LOGIN_START':
    case 'SIGNUP_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'SIGNUP_SUCCESS': {
      console.log('AuthReducer: Setting user as authenticated:', action.payload);
      const newState = {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
      console.log('AuthReducer: New state after LOGIN_SUCCESS:', { isAuthenticated: newState.isAuthenticated, user: newState.user?.email });
      return newState;
    }
    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'RESTORE_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isInitializing: false,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore user session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthContext: Starting initialization...');
      dispatch({ type: 'INIT_START' });

      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
          try {
            const user = JSON.parse(storedUser);
            console.log('AuthContext: Restoring user session:', user.email, 'Role:', user.role);
            dispatch({ type: 'RESTORE_USER', payload: user });
          } catch (error) {
            console.error('Failed to restore user session:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            dispatch({ type: 'INIT_COMPLETE' });
          }
        } else {
          console.log('AuthContext: No stored session found');
          dispatch({ type: 'INIT_COMPLETE' });
        }
      } catch (error) {
        console.error('AuthContext: Initialization error:', error);
        dispatch({ type: 'INIT_COMPLETE' });
      }
    };

    // Add a timeout to ensure initialization doesn't hang
    const initTimeout = setTimeout(() => {
      console.warn('AuthContext: Initialization timeout, forcing completion');
      dispatch({ type: 'INIT_COMPLETE' });
    }, 5000); // 5 second timeout

    initializeAuth().finally(() => {
      clearTimeout(initTimeout);
    });

    return () => {
      clearTimeout(initTimeout);
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    console.log('AuthContext: Starting login for', email);
    dispatch({ type: 'LOGIN_START' });

    try {
      const { user, token } = await authService.login(email, password);
      console.log('AuthContext: Login successful, user role:', user.role);

      // Store user and token in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('AuthContext: Login failed:', errorMessage);
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const signup = async (userData: SignupData): Promise<void> => {
    dispatch({ type: 'SIGNUP_START' });

    try {
      const { user, token } = await authService.signup(userData);

      // Store user and token in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      dispatch({ type: 'SIGNUP_SUCCESS', payload: user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      dispatch({ type: 'SIGNUP_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;