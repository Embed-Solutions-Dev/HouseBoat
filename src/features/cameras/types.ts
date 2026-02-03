import type { CameraFeed, CameraId } from '@/types';

export interface CameraFeedProps {
  feed: CameraFeed;
  onClick?: () => void;
  selected?: boolean;
}

export interface CameraGridProps {
  onCameraSelect?: (id: CameraId) => void;
}
