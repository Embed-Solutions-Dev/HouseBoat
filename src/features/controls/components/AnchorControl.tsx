import { memo } from 'react';
import { useStore } from '@/stores';
import { Anchor, ChevronUp, ChevronDown } from '@/components/icons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/utils/cn';

export const AnchorControl = memo(function AnchorControl() {
  const anchor = useStore((s) => s.systems.anchor);
  const setAnchorPosition = useStore((s) => s.setAnchorPosition);

  const handleUp = () => {
    const newPos = Math.max(0, anchor.position - 10);
    setAnchorPosition(newPos);
  };

  const handleDown = () => {
    const newPos = Math.min(100, anchor.position + 10);
    setAnchorPosition(newPos);
  };

  return (
    <div className="flex flex-col items-center gap-2 p-2 rounded-lg border border-yacht-border bg-yacht-card">
      <div className="flex items-center gap-2">
        <Anchor
          className={cn(
            'w-5 h-5',
            anchor.deployed ? 'text-yacht-amber' : 'text-yacht-secondary'
          )}
        />
        <span className="text-xs font-medium text-yacht-primary">Якорь</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleUp}
          disabled={anchor.position <= 0}
          className="p-1 rounded bg-yacht-card-light hover:bg-yacht-muted/30 disabled:opacity-30"
        >
          <ChevronUp className="w-4 h-4 text-yacht-primary" />
        </button>

        <div className="w-16 text-center">
          <div className="text-sm font-semibold text-yacht-primary">
            {anchor.position}%
          </div>
          <div className="text-[10px] text-yacht-secondary">
            {anchor.deployed ? 'Опущен' : 'Поднят'}
          </div>
        </div>

        <button
          onClick={handleDown}
          disabled={anchor.position >= 100}
          className="p-1 rounded bg-yacht-card-light hover:bg-yacht-muted/30 disabled:opacity-30"
        >
          <ChevronDown className="w-4 h-4 text-yacht-primary" />
        </button>
      </div>

      <ProgressBar value={anchor.position} color="amber" size="sm" className="w-full" />

      <div className="text-[10px] text-yacht-secondary">
        Глубина: {anchor.depth} м
      </div>
    </div>
  );
});
