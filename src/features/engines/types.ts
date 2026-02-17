import type { EngineData, EngineId } from '@/types';

export interface TachometerProps {
  side: 'Left' | 'Right' | string;  // Allow string for "Engine N"
  rpm: number;
  maxRpm: number;
  throttle: number;
  motorHours: number;
  fuelLevel: number;
  tempText: string;
  hasFaults: boolean;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  temperature?: number;
  oilPressure?: number;
  size?: number;  // New: tachometer size (default 310)
  screenMode?: 'S1' | 'S2' | 'S3';  // New: screen mode for black background in S2
}

export interface EngineCardProps {
  id: EngineId;      // Now number instead of 'left' | 'right'
  data: EngineData;
  size?: number;     // New: optional tachometer size
  screenMode?: 'S1' | 'S2' | 'S3';  // New: screen mode for black background in S2
}
