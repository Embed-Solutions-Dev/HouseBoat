export function formatNumber(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatVoltage(value: number): string {
  return `${value.toFixed(1)}V`;
}

export function formatTemperature(value: number): string {
  return `${Math.round(value)}°C`;
}

export function formatSpeed(knots: number): string {
  return `${knots.toFixed(1)} уз`;
}

export function formatCoordinate(value: number, isLat: boolean): string {
  const dir = isLat ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const min = ((abs - deg) * 60).toFixed(3);
  return `${deg}°${min}'${dir}`;
}
