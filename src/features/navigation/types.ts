export interface CompassProps {
  heading: number;
  size?: number;
}

export interface RudderGaugeProps {
  angle: number;
  compact?: boolean;
}

export interface SpeedDisplayProps {
  speed: number;
  unit?: string;
}

export interface HeadingDisplayProps {
  heading: number;
}
