/** 
 * School Theme Configuration
 * Centralized theme management for the safeguarding platform
 */

export const schoolTheme = {
  colors: {
    primary: {
      50: '#f0f7ff',
      100: '#e0efff',
      200: '#c7e0ff',
      300: '#a3caff',
      400: '#7aafff',
      500: '#5490ff',
      600: '#3d77e6',
      700: '#2d5bc4',
      800: '#1e3f8a',
      900: '#152850',
      950: '#0f1a35',
    },
    
    accent: {
      gold: '#d4af37',
      'gold-light': '#e8c547',
      'gold-dark': '#b8941f',
      emerald: '#10b981',
      'emerald-light': '#d1fae5',
      'emerald-dark': '#047857',
    },
    
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    
    risk: {
      low: {
        bg: '#f0fdf4',
        light: '#d1fae5',
        main: '#10b981',
        text: '#166534',
      },
      medium: {
        bg: '#fffbeb',
        light: '#fef3c7',
        main: '#f59e0b',
        text: '#854d0e',
      },
      high: {
        bg: '#fff7ed',
        light: '#ffedd5',
        main: '#f97316',
        text: '#9a3412',
      },
      critical: {
        bg: '#fef2f2',
        light: '#fee2e2',
        main: '#ef4444',
        text: '#991b1b',
      },
    },
    
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      neutral: '#6b7280',
    },
  },
  
  shadow: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 2px 4px -1px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    'school-card': '0 0 0 1px rgba(30, 64, 175, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04), 0 8px 16px rgba(30, 64, 175, 0.06)',
    'school-hover': '0 0 0 1px rgba(30, 64, 175, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08), 0 16px 32px rgba(30, 64, 175, 0.1)',
    'school-elevated': '0 0 0 1px rgba(0, 0, 0, 0.06), 0 8px 16px rgba(0, 0, 0, 0.1), 0 24px 48px rgba(30, 64, 175, 0.12)',
  },
  
  radius: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '9999px',
  },
  
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

export type SchoolTheme = typeof schoolTheme;

/**
 * Get risk level styling
 */
export const getRiskLevelStyles = (level: 'low' | 'medium' | 'high' | 'critical') => {
  return schoolTheme.colors.risk[level];
};

/**
 * Get color by status
 */
export const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    'low': schoolTheme.colors.risk.low.main,
    'medium': schoolTheme.colors.risk.medium.main,
    'high': schoolTheme.colors.risk.high.main,
    'critical': schoolTheme.colors.risk.critical.main,
    'success': schoolTheme.colors.semantic.success,
    'warning': schoolTheme.colors.semantic.warning,
    'error': schoolTheme.colors.semantic.error,
    'info': schoolTheme.colors.semantic.info,
  };
  return statusMap[status] || schoolTheme.colors.primary[800];
};

/**
 * Utility function to apply theme to components
 */
export const applyThemeClass = (baseClass: string, theme?: 'primary' | 'accent' | 'risk'): string => {
  const classMap: Record<string, string> = {
    'primary': 'bg-school-primary text-white',
    'accent': 'bg-school-gold text-black',
    'risk-low': 'bg-school-emerald text-white',
    'risk-high': 'bg-orange-500 text-white',
  };
  return `${baseClass} ${classMap[theme || 'primary']}`;
};
