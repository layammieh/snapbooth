// Core types for Snapbooth

export type FilterType =
  | 'original' | 'vintage' | 'bw' | 'sepia' | 'warm' | 'cool'
  | 'softglow' | 'retro' | 'film' | 'dreamy' | 'bright' | 'contrast';

export type LayoutType =
  | 'single' | '2h' | '2v' | '3strip' | '4strip' | '4grid' | '6grid' | 'custom';

export type Unit = 'in' | 'cm' | 'mm';
export type DPI = 150 | 200 | 300;
export type Orientation = 'portrait' | 'landscape';
export type ExportFormat = 'png' | 'jpeg';
export type ExportQuality = 'low' | 'medium' | 'high';

export interface PrintDimension {
  label: string;
  width: number;
  height: number;
  unit: Unit;
}

export interface PrintSettings {
  width: number;
  height: number;
  unit: Unit;
  dpi: DPI;
  orientation: Orientation;
  preset?: string;
}

export interface AdjustmentSettings {
  brightness: number;
  saturation: number;
  exposure: number;
  contrast: number;
  warmth: number;
  blur: number;
}

export interface StickerItem {
  id: string;
  type: 'sticker' | 'emoji' | 'text';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  scale?: number;
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  capturedAt: Date;
  filter: FilterType;
  adjustments: AdjustmentSettings;
}

export interface PhotoSession {
  id: string;
  photos: CapturedPhoto[];
  layout: LayoutType;
  createdAt: Date;
  stickers: StickerItem[];
  background: string;
  borderWidth: number;
  borderColor: string;
}

export interface CloudinaryUpload {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  uploadedAt: Date;
  layout: LayoutType;
  sessionId: string;
}

export interface Creation {
  id: string;
  sessionId: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  format: string;
  layout: LayoutType;
  uploadedAt: Date;
  title?: string;
}

export interface UploadProgress {
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface CameraState {
  stream: MediaStream | null;
  hasPermission: boolean | null;
  error: string | null;
  devices: MediaDeviceInfo[];
  selectedDeviceId: string | null;
  isMirrored: boolean;
  facing: 'user' | 'environment';
}

export interface EditorState {
  photos: CapturedPhoto[];
  selectedPhotoIndex: number | null;
  layout: LayoutType;
  filter: FilterType;
  adjustments: AdjustmentSettings;
  stickers: StickerItem[];
  selectedStickerId: string | null;
  background: string;
  borderWidth: number;
  borderColor: string;
  printSettings: PrintSettings;
  history: EditorHistoryEntry[];
  historyIndex: number;
}

export interface EditorHistoryEntry {
  filter: FilterType;
  adjustments: AdjustmentSettings;
  stickers: StickerItem[];
  background: string;
  borderWidth: number;
  borderColor: string;
}

export const DEFAULT_ADJUSTMENTS: AdjustmentSettings = {
  brightness: 100,
  saturation: 100,
  exposure: 0,
  contrast: 100,
  warmth: 0,
  blur: 0,
};

export const PRINT_PRESETS: PrintDimension[] = [
  { label: '2×2"', width: 2, height: 2, unit: 'in' },
  { label: '2×3"', width: 2, height: 3, unit: 'in' },
  { label: '3×4"', width: 3, height: 4, unit: 'in' },
  { label: '4×6"', width: 4, height: 6, unit: 'in' },
  { label: '5×7"', width: 5, height: 7, unit: 'in' },
  { label: '6×8"', width: 6, height: 8, unit: 'in' },
];

export const LAYOUT_INFO: Record<LayoutType, { label: string; photoCount: number; grid: [number, number] }> = {
  single:   { label: 'Single',       photoCount: 1, grid: [1,1] },
  '2h':     { label: '2 Horizontal', photoCount: 2, grid: [2,1] },
  '2v':     { label: '2 Vertical',   photoCount: 2, grid: [1,2] },
  '3strip': { label: '3 Strip',      photoCount: 3, grid: [1,3] },
  '4strip': { label: '4 Strip',      photoCount: 4, grid: [1,4] },
  '4grid':  { label: '4 Grid',       photoCount: 4, grid: [2,2] },
  '6grid':  { label: '6 Grid',       photoCount: 6, grid: [2,3] },
  custom:   { label: 'Custom',       photoCount: 4, grid: [2,2] },
};

export function getPhotoCountForLayout(layout: LayoutType): number {
  return LAYOUT_INFO[layout]?.photoCount ?? 4;
}


export const STICKER_LIBRARY = {
  hearts: ['❤️','🩷','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💗','💓','💞','💕','💝'],
  stars: ['⭐','🌟','✨','💫','🌠','⚡','🔆','🌙','🌛','🌜'],
  bows: ['🎀','🎁','🎊','🎉','🎈','🎋','🎍','🎎','🎏','🎐'],
  flowers: ['🌸','🌺','🌹','🌻','🌼','💐','🌷','🌱','🌿','🍀'],
  sparkles: ['✨','💥','🌈','🦄','🍭','🫧','🫶','🤩','😍','🥹'],
  animals: ['🐱','🐶','🐰','🐻','🐼','🦊','🐨','🐸','🐧','🦋'],
  food: ['🍓','🍒','🍑','🍰','🧁','🍩','🍪','🍭','🍬','🧋'],
  aesthetic: ['🌙','⭐','🌸','🎀','💎','👑','🪄','🪩','🎭','🫀'],
  emojis: ['😊','😍','🥰','😘','🤗','😎','🤩','😋','🥳','🫶'],
};
