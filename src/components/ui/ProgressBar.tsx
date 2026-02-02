import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'green' | 'amber' | 'red' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const colorClasses = {
  green: 'bg-yacht-green',
  amber: 'bg-yacht-amber',
  red: 'bg-yacht-red',
  primary: 'bg-yacht-primary',
};

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  value,
  max = 100,
  color = 'green',
  size = 'md',
  showLabel,
  className,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full rounded-full bg-yacht-muted/30 overflow-hidden',
          sizeClasses[size]
        )}
      >
        <motion.div
          className={cn('h-full rounded-full', colorClasses[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-yacht-secondary mt-1">
          {Math.round(percent)}%
        </span>
      )}
    </div>
  );
}
