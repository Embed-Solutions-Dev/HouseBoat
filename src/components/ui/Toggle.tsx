import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 16 },
  md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 20 },
  lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 28 },
};

export function Toggle({ checked, onChange, disabled, size = 'md' }: ToggleProps) {
  const s = sizes[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex items-center rounded-full transition-colors',
        s.track,
        checked ? 'bg-yacht-green' : 'bg-yacht-muted',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <motion.span
        className={cn(
          'absolute left-0.5 rounded-full bg-white shadow',
          s.thumb
        )}
        animate={{ x: checked ? s.translate : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
