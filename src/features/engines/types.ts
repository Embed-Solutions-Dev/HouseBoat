import type { EngineData, EngineId, GearPosition } from '@/types';

export interface TachometerProps {
  side: 'Left' | 'Right';
  rpm: number;
  maxRpm: number;
  throttle: number;
  gear: GearPosition;
  motorHours: number;
  fuelLevel: number;
  tempText: string;
  hasFaults: boolean;
  onToggleExpand?: () => void;
}

export interface EngineCardProps {
  id: EngineId;
  data: EngineData;
  label: string;
  onToggleExpand?: () => void;
}
