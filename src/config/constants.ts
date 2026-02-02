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
