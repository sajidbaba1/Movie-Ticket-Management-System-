import { toast } from 'react-hot-toast';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export class ErrorHandler {
  static handle(error: unknown, context?: string): void {
    const errorInfo = this.parseError(error);

    // Log error for debugging
    console.error(`Error in ${context || 'Unknown'}:`, error);

    // Show user-friendly notification
    this.showToast(errorInfo);

    // Report to error tracking service (if available)
    this.reportError(errorInfo, context);
  }

  static parseError(error: unknown): ApiError {
    // Network/Axios errors
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as Record<string, unknown>;
      const response = axiosError.response as Record<string, unknown> | undefined;
      return {
        message: (response?.data as Record<string, unknown>)?.message as string ||
          axiosError.message as string ||
          'Network error occurred',
        status: response?.status as number,
        code: (response?.data as Record<string, unknown>)?.code as string ||
          axiosError.code as string,
        details: response?.data
      };
    }

    // Standard Error objects
    if (error instanceof Error) {
      return {
        message: error.message,
        details: error
      };
    }

    // String errors
    if (typeof error === 'string') {
      return {
        message: error
      };
    }

    // Unknown error types
    return {
      message: 'An unexpected error occurred',
      details: error
    };
  }

  static showToast(errorInfo: ApiError): void {
    const message = this.getUserFriendlyMessage(errorInfo);

    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#FEF2F2',
        color: '#991B1B',
        border: '1px solid #FECACA',
      },
    });
  }

  static getUserFriendlyMessage(errorInfo: ApiError): string {
    // Map common error codes/statuses to user-friendly messages
    const statusMessages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Please log in to continue.',
      403: 'You don\'t have permission to perform this action.',
      404: 'The requested resource was not found.',
      409: 'This action conflicts with existing data.',
      422: 'Please check your input and try again.',
      429: 'Too many requests. Please wait a moment.',
      500: 'Server error. Please try again later.',
      502: 'Service temporarily unavailable.',
      503: 'Service temporarily unavailable.',
    };

    if (errorInfo.status && statusMessages[errorInfo.status]) {
      return statusMessages[errorInfo.status];
    }

    // Custom error codes
    const codeMessages: Record<string, string> = {
      'NETWORK_ERROR': 'Network connection error. Please check your internet.',
      'TIMEOUT': 'Request timed out. Please try again.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'DUPLICATE_ERROR': 'This item already exists.',
      'NOT_FOUND': 'Item not found.',
      'PERMISSION_DENIED': 'You don\'t have permission for this action.',
    };

    if (errorInfo.code && codeMessages[errorInfo.code]) {
      return codeMessages[errorInfo.code];
    }

    // Return original message with fallback
    return errorInfo.message || 'Something went wrong. Please try again.';
  }

  static reportError(errorInfo: ApiError, context?: string): void {
    // Here you would typically send to an error tracking service
    // like Sentry, LogRocket, Bugsnag, etc.

    // For now, just log to console in development
    // Only report in development
    if (import.meta.env.DEV) {
      console.group('🐛 Error Report');
      console.log('Context:', context);
      console.log('Error Info:', errorInfo);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    }

    // Example integration with error tracking service:
    /*
    if (window.Sentry) {
      window.Sentry.captureException(errorInfo.details || new Error(errorInfo.message), {
        tags: {
          context: context || 'unknown',
          status: errorInfo.status,
          code: errorInfo.code
        }
      });
    }
    */
  }

  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          break;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError;
  }

  static isNetworkError(error: unknown): boolean {
    if (typeof error === 'object' && error !== null) {
      const err = error as Record<string, unknown>;
      return (
        'code' in err && (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') ||
        'message' in err && typeof err.message === 'string' &&
        err.message.includes('Network Error') ||
        !navigator.onLine
      );
    }
    return false;
  }

  static isRetryableError(error: unknown): boolean {
    const errorInfo = this.parseError(error);

    // Retry on network errors and 5xx server errors
    return (
      this.isNetworkError(error) ||
      (errorInfo.status !== undefined && errorInfo.status >= 500) ||
      errorInfo.code === 'TIMEOUT'
    );
  }
}

// Hook for using error handler in components
export const useErrorHandler = () => {
  return {
    handleError: (error: unknown, context?: string) => {
      ErrorHandler.handle(error, context);
    },

    handleAsync: async <T>(
      operation: () => Promise<T>,
      context?: string,
      showSuccessToast: boolean = false,
      successMessage?: string
    ): Promise<T | null> => {
      try {
        const result = await operation();

        if (showSuccessToast) {
          toast.success(successMessage || 'Operation completed successfully!');
        }

        return result;
      } catch (error) {
        ErrorHandler.handle(error, context);
        return null;
      }
    },

    retry: ErrorHandler.retry
  };
};