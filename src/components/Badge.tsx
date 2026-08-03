import { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export function Badge({
  variant = 'neutral',
  children,
  dot = false,
  pulse = false,
  className = '',
  iconOnly = false
}: BadgeProps) {
  if (iconOnly) {
    const getIconStyles = () => {
      switch (variant) {
        case 'success': return 'bg-success-500/10 text-success-400';
        case 'warning': return 'bg-warning-500/10 text-warning-400';
        case 'danger': return 'bg-danger-500/10 text-danger-400';
        case 'neutral': return 'bg-primary-500/10 text-primary-400';
        default: return 'bg-primary-500/10 text-primary-400';
      }
    };
    return (
      <div className={`p-2 rounded-lg flex items-center justify-center ${getIconStyles()} ${className}`}>
        {children}
      </div>
    );
  }

  const baseClass = `badge-${variant}`;

  const getDotColor = () => {
    switch (variant) {
      case 'success': return 'bg-success-400';
      case 'warning': return 'bg-warning-400';
      case 'danger': return 'bg-danger-400';
      case 'neutral': return 'bg-primary-400';
      default: return 'bg-primary-400';
    }
  };

  return (
    <span className={`${baseClass} ${className}`}>
      {dot && (
        <span className={`w-2 h-2 rounded-full ${getDotColor()} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {children}
    </span>
  );
}
