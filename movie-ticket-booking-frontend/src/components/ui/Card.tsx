import React from 'react';
import { classNames } from '../../utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'elevated' | 'outlined' | 'soft' | 'gradient';
  hover?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  animate?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  variant = 'default',
  hover = false,
  rounded = 'xl',
  shadow = 'md',
  onClick,
  animate = true,
}) => {
  const baseClasses = 'transition-all duration-300 overflow-hidden';

  const variantClasses = {
    default: 'bg-white border border-gray-200/60',
    elevated: 'bg-white',
    outlined: 'bg-white border-2 border-gray-200',
    soft: 'bg-gray-50/50 backdrop-blur-sm border border-gray-200/40',
    gradient: 'bg-gradient-to-br from-white to-gray-50/80 border border-gray-200/60',
  };

  const paddingClasses = {
    none: '',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-soft',
    lg: 'shadow-soft-lg',
    xl: 'shadow-2xl',
  };

  const hoverClasses = hover
    ? 'hover:shadow-soft-lg hover:-translate-y-1 hover:border-gray-300/80 cursor-pointer'
    : '';

  const clickableClasses = onClick ? 'cursor-pointer select-none' : '';
  const animateClasses = animate ? 'animate-fade-in' : '';

  return (
    <div
      className={classNames(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        roundedClasses[rounded],
        shadowClasses[shadow],
        hoverClasses,
        clickableClasses,
        animateClasses,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;