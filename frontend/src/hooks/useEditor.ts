import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  EditorState, CapturedPhoto, StickerItem, FilterType, AdjustmentSettings,
  LayoutType, PrintSettings, DEFAULT_ADJUSTMENTS, EditorHistoryEntry
} from '../types';

const DEFAULT_PRINT: PrintSettings = {
  width: 4, height: 6, unit: 'in', dpi: 300, orientation: 'portrait',
};

const INITIAL_STATE: EditorState = {
  photos: [],
  selectedPhotoIndex: null,
  layout: '4strip',
  filter: 'original',
  adjustments: { ...DEFAULT_ADJUSTMENTS },
  stickers: [],
  selectedStickerId: null,
  background: '#FFFFFF',
  borderWidth: 16,
  borderColor: '#FFFFFF',
  printSettings: DEFAULT_PRINT,
  history: [],
  historyIndex: -1,
};

export function useEditor() {
  const [state, setState] = useState<EditorState>(INITIAL_STATE);
  const historyRef = useRef<EditorHistoryEntry[]>([]);
  const historyIndexRef = useRef(-1);

  const pushHistory = useCallback((newState: Partial<EditorState>) => {
    const entry: EditorHistoryEntry = {
      filter: newState.filter ?? state.filter,
      adjustments: newState.adjustments ?? state.adjustments,
      stickers: newState.stickers ?? state.stickers,
      background: newState.background ?? state.background,
      borderWidth: newState.borderWidth ?? state.borderWidth,
      borderColor: newState.borderColor ?? state.borderColor,
    };
    // Truncate future history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(entry);
    historyIndexRef.current = historyRef.current.length - 1;
  }, [state]);

  const addPhoto = useCallback((dataUrl: string) => {
    const photo: CapturedPhoto = {
      id: uuidv4(),
      dataUrl,
      capturedAt: new Date(),
      filter: 'original',
      adjustments: { ...DEFAULT_ADJUSTMENTS },
    };
    setState((s) => ({ ...s, photos: [...s.photos, photo] }));
    return photo;
  }, []);

  const removePhoto = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      photos: s.photos.filter((p) => p.id !== id),
      selectedPhotoIndex: null,
    }));
  }, []);

  const setLayout = useCallback((layout: LayoutType) => {
    setState((s) => ({ ...s, layout }));
  }, []);

  const setFilter = useCallback((filter: FilterType) => {
    pushHistory({ filter });
    setState((s) => ({ ...s, filter }));
  }, [pushHistory]);

  const setAdjustments = useCallback((adjustments: AdjustmentSettings) => {
    setState((s) => ({ ...s, adjustments }));
  }, []);

  const updateAdjustment = useCallback(<K extends keyof AdjustmentSettings>(
    key: K, value: AdjustmentSettings[K]
  ) => {
    setState((s) => ({ ...s, adjustments: { ...s.adjustments, [key]: value } }));
  }, []);

  const addSticker = useCallback((sticker: Omit<StickerItem, 'id'>) => {
    const newSticker: StickerItem = { ...sticker, id: uuidv4() };
    pushHistory({ stickers: [...state.stickers, newSticker] });
    setState((s) => ({
      ...s,
      stickers: [...s.stickers, newSticker],
      selectedStickerId: newSticker.id,
    }));
    return newSticker.id;
  }, [state.stickers, pushHistory]);

  const updateSticker = useCallback((id: string, updates: Partial<StickerItem>) => {
    setState((s) => ({
      ...s,
      stickers: s.stickers.map((st) => st.id === id ? { ...st, ...updates } : st),
    }));
  }, []);

  const removeSticker = useCallback((id: string) => {
    pushHistory({ stickers: state.stickers.filter((s) => s.id !== id) });
    setState((s) => ({
      ...s,
      stickers: s.stickers.filter((st) => st.id !== id),
      selectedStickerId: null,
    }));
  }, [state.stickers, pushHistory]);

  const selectSticker = useCallback((id: string | null) => {
    setState((s) => ({ ...s, selectedStickerId: id }));
  }, []);

  const setBackground = useCallback((color: string) => {
    pushHistory({ background: color });
    setState((s) => ({ ...s, background: color }));
  }, [pushHistory]);

  const setBorder = useCallback((width: number, color: string) => {
    pushHistory({ borderWidth: width, borderColor: color });
    setState((s) => ({ ...s, borderWidth: width, borderColor: color }));
  }, [pushHistory]);

  const setPrintSettings = useCallback((settings: Partial<PrintSettings>) => {
    setState((s) => ({ ...s, printSettings: { ...s.printSettings, ...settings } }));
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const entry = historyRef.current[historyIndexRef.current];
    setState((s) => ({ ...s, ...entry }));
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const entry = historyRef.current[historyIndexRef.current];
    setState((s) => ({ ...s, ...entry }));
  }, []);

  const resetEditing = useCallback(() => {
    historyRef.current = [];
    historyIndexRef.current = -1;
    setState((s) => ({
      ...s,
      filter: 'original',
      adjustments: { ...DEFAULT_ADJUSTMENTS },
      stickers: [],
      selectedStickerId: null,
      background: '#FFFFFF',
      borderWidth: 0,
      borderColor: '#D4A0B5',
    }));
  }, []);

  const clearPhotos = useCallback(() => {
    setState(INITIAL_STATE);
    historyRef.current = [];
    historyIndexRef.current = -1;
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  return {
    ...state,
    canUndo,
    canRedo,
    addPhoto,
    removePhoto,
    setLayout,
    setFilter,
    setAdjustments,
    updateAdjustment,
    addSticker,
    updateSticker,
    removeSticker,
    selectSticker,
    setBackground,
    setBorder,
    setPrintSettings,
    undo,
    redo,
    resetEditing,
    clearPhotos,
  };
}
