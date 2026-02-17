import type { CameraFeed, CameraId } from '@/types';

export interface CameraFeedProps {
  feed: CameraFeed;
  onClick?: () => void;
  selected?: boolean;
  screenMode?: 'S1' | 'S2' | 'S3';
}

export interface CameraGridProps {
  onCameraSelect?: (id: CameraId) => void;
}
