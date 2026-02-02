import type { EngineData, EngineId, GearPosition } from '@/types';

export interface TachometerProps {
  rpm: number;
  maxRpm: number;
  throttle: number;
  gear: GearPosition;
  label: string;
  size?: number;
}

export interface EngineCardProps {
  id: EngineId;
  data: EngineData;
  label: string;
}
