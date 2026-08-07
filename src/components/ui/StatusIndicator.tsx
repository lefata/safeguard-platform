/**
 * Status Indicator Component
 * Visual status indicator with risk level styling
 */

import { getRiskBadgeStyles } from '@/lib/theme-utilities';

interface StatusIndicatorProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIndicator({ level, label, size = 'md', className = '' }: StatusIndicatorProps) {
  const styles = getRiskBadgeStyles(level);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md font-semibold border ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
        borderColor: styles.border,
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: styles.border }}
      />
      {label || level.charAt(0).toUpperCase() + level.slice(1)}
    </div>
  );
}
