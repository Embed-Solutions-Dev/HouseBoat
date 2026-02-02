import { memo } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ControlButtonProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

export const ControlButton = memo(function ControlButton({
  icon,
  label,
  active,
  onClick,
  variant = 'default',
}: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
        'border border-yacht-border',
        active
          ? variant === 'danger'
            ? 'bg-yacht-red/20 text-yacht-red shadow-glow-red'
            : 'bg-yacht-green/20 text-yacht-green shadow-glow-green'
          : 'bg-yacht-card text-yacht-secondary hover:bg-yacht-card-light'
      )}
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
});
