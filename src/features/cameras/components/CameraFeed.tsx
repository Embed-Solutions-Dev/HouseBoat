import { memo } from 'react';
import { Camera } from '@/components/icons';
import { cn } from '@/utils/cn';
import type { CameraFeedProps } from '../types';

export const CameraFeed = memo(function CameraFeed({
  feed,
  onClick,
  selected,
}: CameraFeedProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full aspect-video rounded-lg overflow-hidden',
        'bg-yacht-card border border-yacht-border',
        'transition-all duration-200',
        selected && 'ring-2 ring-yacht-green',
        !feed.active && 'opacity-50'
      )}
    >
      {/* Placeholder background */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yacht-card to-yacht-bg">
        <Camera className="w-8 h-8 text-yacht-muted" />
      </div>

      {/* Scan lines effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
        }}
      />

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <span className="text-xs font-medium text-yacht-primary">{feed.label}</span>
      </div>

      {/* Status indicator */}
      <div className="absolute top-2 right-2">
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            feed.active ? 'bg-yacht-green' : 'bg-yacht-red'
          )}
        />
      </div>
    </button>
  );
});
