/**
 * Risk Badge Component
 * Displays risk level with appropriate styling
 */

import { getRiskBadgeStyles } from '@/lib/theme-utilities';

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  label?: string;
}

export function RiskBadge({ level, label }: RiskBadgeProps) {
  const styles = getRiskBadgeStyles(level);
  const labelText = label || level.charAt(0).toUpperCase() + level.slice(1) + ' Risk';

  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
        borderColor: styles.border,
        borderWidth: '1px',
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: styles.border }}
      />
      {labelText}
    </span>
  );
}
