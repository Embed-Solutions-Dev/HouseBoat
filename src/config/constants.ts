export const ENGINE_MAX_RPM = 4000;
export const ENGINE_RED_ZONE_PCT = 0.8;

export const RUDDER_MAX_ANGLE = 35;

export const COMPASS_UPDATE_INTERVAL = 100;

export const SPLASH_LOGO_DURATION = 2800;
export const SPLASH_TRANSITION_DURATION = 600;

export const WS_RECONNECT_DELAY = 1000;
export const WS_MAX_RECONNECT_ATTEMPTS = 5;

export const CAMERA_LABELS: Record<string, string> = {
  bow: 'Нос',
  stern: 'Корма',
  port: 'Левый борт',
  starboard: 'Правый борт',
};

export const GEAR_LABELS: Record<string, string> = {
  N: 'Нейтраль',
  F: 'Вперёд',
  R: 'Назад',
};

export const ENGINE_CONFIG = {
  count: Number(import.meta.env.VITE_ENGINE_COUNT) || 4,
  maxEngines: 6,
  minEngines: 2,
};

// Dynamic engine labels based on engine count
const generateEngineLabels = (count: number): Record<number, string> => {
  if (count === 2) {
    return { 0: 'Левый', 1: 'Правый' };
  }
  if (count === 3) {
    return { 0: 'Левый', 1: 'Центральный', 2: 'Правый' };
  }
  if (count === 4) {
    return { 0: 'Левый 1', 1: 'Левый 2', 2: 'Правый 1', 3: 'Правый 2' };
  }
  if (count === 5) {
    return { 0: 'Левый 1', 1: 'Левый 2', 2: 'Центральный', 3: 'Правый 1', 4: 'Правый 2' };
  }
  // 6 engines
  return { 0: 'Левый 1', 1: 'Левый 2', 2: 'Левый 3', 3: 'Правый 1', 4: 'Правый 2', 5: 'Правый 3' };
};

export const ENGINE_LABELS = generateEngineLabels(ENGINE_CONFIG.count);
