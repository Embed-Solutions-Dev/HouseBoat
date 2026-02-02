import { memo } from 'react';
import { useStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Power, Lightbulb, Generator, BowThruster } from '@/components/icons';
import { ControlButton } from './ControlButton';
import { AnchorControl } from './AnchorControl';

export const ControlsPanel = memo(function ControlsPanel() {
  const controls = useStore((s) => s.controls);
  const togglePower = useStore((s) => s.togglePower);
  const toggleLight = useStore((s) => s.toggleLight);
  const toggleBowThruster = useStore((s) => s.toggleBowThruster);
  const toggleGenerator = useStore((s) => s.toggleGenerator);

  return (
    <Card className="p-3">
      <h3 className="text-sm font-medium text-yacht-primary mb-3">Управление</h3>

      <div className="flex gap-2 flex-wrap">
        <ControlButton
          icon={<Power className="w-full h-full" />}
          label="Питание"
          active={controls.power}
          onClick={togglePower}
          variant="danger"
        />

        <ControlButton
          icon={<Lightbulb className="w-full h-full" />}
          label="Ходовые"
          active={controls.lights.running}
          onClick={() => toggleLight('running')}
        />

        <ControlButton
          icon={<Lightbulb className="w-full h-full" />}
          label="Стояночные"
          active={controls.lights.parking}
          onClick={() => toggleLight('parking')}
        />

        <ControlButton
          icon={<BowThruster className="w-full h-full" />}
          label="Подруль"
          active={controls.bowThruster}
          onClick={toggleBowThruster}
        />

        <ControlButton
          icon={<Generator className="w-full h-full" />}
          label="Генератор"
          active={controls.generator}
          onClick={toggleGenerator}
        />
      </div>

      <div className="mt-3 pt-3 border-t border-yacht-border">
        <AnchorControl />
      </div>
    </Card>
  );
});
