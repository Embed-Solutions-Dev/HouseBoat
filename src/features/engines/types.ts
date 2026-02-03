import type { EngineData, EngineId } from '@/types';

export interface TachometerProps {
  side: 'Left' | 'Right';
  rpm: number;
  maxRpm: number;
  throttle: number;
  motorHours: number;
  fuelLevel: number;
  tempText: string;
  hasFaults: boolean;
  onToggleExpand?: () => void;
}

export interface EngineCardProps {
  id: EngineId;
  data: EngineData;
  onToggleExpand?: () => void;
}
