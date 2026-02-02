import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className, noPadding }: CardProps) {
  return (
    <div
      className={cn(
        'glass-card',
        !noPadding && 'p-4',
        className
      )}
    >
      {/* Glass shine overlay */}
      <div className="glass-shine" />

      {/* Inner shadow for depth */}
      <div className="absolute inset-0 rounded-card shadow-card-inset pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
