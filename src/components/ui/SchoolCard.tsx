/**
 * School-Themed Card Component
 * Enhanced card with school theme styling
 */

import React from 'react';

interface SchoolCardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  hover?: boolean;
}

export function SchoolCard({
  children,
  className = '',
  elevated = false,
  hover = true,
}: SchoolCardProps) {
  const baseClasses = [
    'bg-school-surface',
    'border border-school-border-light',
    'rounded-lg',
    'shadow-school-card',
    'p-6',
    'transition-all',
    hover && 'hover:shadow-school-hover hover:border-school-primary-lighter hover:translate-y-[-4px]',
    elevated && 'shadow-school-elevated',
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={`${baseClasses} ${className}`}>{children}</div>;
}
