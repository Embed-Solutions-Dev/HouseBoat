import type { CameraId, CameraFeed } from '@/types';

export interface CameraFeedProps {
  id: CameraId;
  feed: CameraFeed;
  onClick?: () => void;
  selected?: boolean;
}

export interface CameraGridProps {
  onCameraSelect?: (id: CameraId) => void;
}
