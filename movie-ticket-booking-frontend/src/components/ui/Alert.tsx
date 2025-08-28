import React from 'react';
import { classNames } from '../../utils';
import Button from './Button';

interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  dismissible = false,
  onDismiss,
  action,
  className
}) => {
  const baseClasses = 'rounded-xl border p-4 animate-fade-in';

  const typeClasses = {
    success: 'bg-success-50 border-success-200 text-success-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    error: 'bg-error-50 border-error-200 text-error-800',
    info: 'bg-primary-50 border-primary-200 text-primary-800',
  };

  const iconClasses = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
  };

  const titleColorClasses = {
    success: 'text-success-900',
    warning: 'text-warning-900',
    error: 'text-error-900',
    info: 'text-primary-900',
  };

  return (
    <div className={classNames(baseClasses, typeClasses[type], className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-xl" role="img" aria-label={type}>
            {iconClasses[type]}
          </span>
        </div>

        <div className="ml-3 flex-1">
          {title && (
            <h3 className={classNames('text-sm font-medium', titleColorClasses[type])}>
              {title}
            </h3>
          )}
          <div className={classNames('text-sm', title ? 'mt-1' : '')}>
            {message}
          </div>

          {action && (
            <div className="mt-3">
              <Button
                onClick={action.onClick}
                size="sm"
                variant={type === 'error' ? 'danger' : 'primary'}
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className={classNames(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
                type === 'success' && 'text-success-500 hover:bg-success-100 focus:ring-success-600',
                type === 'warning' && 'text-warning-500 hover:bg-warning-100 focus:ring-warning-600',
                type === 'error' && 'text-error-500 hover:bg-error-100 focus:ring-error-600',
                type === 'info' && 'text-primary-500 hover:bg-primary-100 focus:ring-primary-600'
              )}
              onClick={onDismiss}
            >
              <span className="sr-only">Dismiss</span>
              <span className="text-lg">×</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;