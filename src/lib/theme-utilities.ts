/**
 * Theme Utility Functions
 * Helper functions for theme-related operations
 */

/**
 * Get contrast ratio for accessibility
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if text color is readable on background
 */
export const isTextReadable = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= 4.5;
};

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Convert RGB to hex color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Get complementary color
 */
export const getComplementaryColor = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
};

/**
 * Generate color variations
 */
export const generateColorVariations = (baseColor: string, count: number = 5) => {
  const variations = [baseColor];
  const rgb = hexToRgb(baseColor);
  
  if (!rgb) return variations;

  for (let i = 1; i < count; i++) {
    const factor = i / count;
    const r = Math.round(rgb.r + (255 - rgb.r) * factor);
    const g = Math.round(rgb.g + (255 - rgb.g) * factor);
    const b = Math.round(rgb.b + (255 - rgb.b) * factor);
    variations.push(rgbToHex(r, g, b));
  }

  return variations;
};

/**
 * Get text color based on background brightness
 */
export const getTextColorForBackground = (bgColor: string): 'light' | 'dark' => {
  const rgb = hexToRgb(bgColor);
  if (!rgb) return 'dark';
  
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? 'dark' : 'light';
};

/**
 * Apply opacity to color
 */
export const applyOpacity = (hex: string, opacity: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

/**
 * Get risk level badge styling
 */
export const getRiskBadgeStyles = (level: 'low' | 'medium' | 'high' | 'critical') => {
  const styles = {
    low: { bg: '#f0fdf4', text: '#166534', border: '#10b981' },
    medium: { bg: '#fffbeb', text: '#854d0e', border: '#f59e0b' },
    high: { bg: '#fff7ed', text: '#9a3412', border: '#f97316' },
    critical: { bg: '#fef2f2', text: '#991b1b', border: '#ef4444' },
  };
  return styles[level];
};
