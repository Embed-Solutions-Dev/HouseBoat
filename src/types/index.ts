// Engine types
export type GearPosition = 'N' | 'F' | 'R';
export type EngineId = 'left' | 'right';

export interface EngineError {
  code: string;
  message: string;
  severity: 'warning' | 'critical';
}

export interface EngineData {
  rpm: number;
  maxRpm: number;
  throttle: number;
  gear: GearPosition;
  temperature: number;
  oilPressure: number;
  hours: number;
  errors: EngineError[];
}

// Navigation types
export interface Position {
  lat: number;
  lng: number;
}

export interface NavigationData {
  speed: number;
  heading: number;
  rudderAngle: number;
  position: Position;
  destination: Position | null;
  routePoints: Position[];
}

// Camera types
export type CameraId = 'bow' | 'stern' | 'port' | 'starboard';

export interface CameraFeed {
  url: string;
  active: boolean;
  label: string;
}

// Systems types
export interface FuelTank {
  level: number;
  capacity: number;
}

export interface FuelData {
  tank1: FuelTank;
  tank2: FuelTank;
  tank3: FuelTank;
  consumption: number;
}

export interface ElectricalData {
  voltage: number;
  current: number;
  batteryPercent: number;
}

export interface WeatherData {
  waterTemp: number;
  airTemp: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
}

export interface AnchorData {
  deployed: boolean;
  depth: number;
  chainLength: number;
  position: number;
}

// Controls types
export interface LightsState {
  parking: boolean;
  running: boolean;
}

export interface ControlsData {
  power: boolean;
  lights: LightsState;
  bowThruster: boolean;
  generator: boolean;
}

// Connection types
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface ConnectionData {
  status: ConnectionStatus;
  lastUpdate: number | null;
  error: string | null;
}
