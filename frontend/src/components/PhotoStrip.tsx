import React, { useRef } from 'react';
import { Trash2, RotateCcw, X } from 'lucide-react';
import { CapturedPhoto, FilterType, AdjustmentSettings, StickerItem } from '../types';
import { buildCSSFilter } from '../utils/canvas';

interface PhotoStripProps {
  photos: CapturedPhoto[];
  layout: string;
  background: string;
  borderWidth: number;
  borderColor: string;
  activeFilter?: FilterType;
  adjustments?: AdjustmentSettings;
  stickers?: StickerItem[];
  selectedStickerId?: string | null;
  onSelectSticker?: (id: string | null) => void;
  onUpdateSticker?: (id: string, updates: Partial<StickerItem>) => void;
  onRemoveSticker?: (id: string) => void;
  footerText?: string;
  onFooterTextChange?: (text: string) => void;
  onRemovePhoto?: (id: string) => void;
  onSelectPhoto?: (index: number) => void;
  onEmptySlotClick?: (index: number) => void;
  selectedIndex?: number | null;
  readonly?: boolean;
}

export function PhotoStrip({
  photos,
  layout,
  background,
  borderWidth,
  borderColor,
  activeFilter,
  adjustments,
  stickers = [],
  selectedStickerId = null,
  onSelectSticker,
  onUpdateSticker,
  onRemoveSticker,
  footerText = '',
  onFooterTextChange,
  onRemovePhoto,
  onSelectPhoto,
  onEmptySlotClick,
  selectedIndex,
  readonly = false,
}: PhotoStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ id: string; startY: number; origScale: number } | null>(null);

  const getGridStyle = () => {
    switch (layout) {
      case '2h': return { gridTemplateColumns: '1fr 1fr' };
      case '2v': return { gridTemplateColumns: '1fr' };
      case '3strip': return { gridTemplateColumns: '1fr' };
      case '4strip': return { gridTemplateColumns: '1fr' };
      case '4grid': return { gridTemplateColumns: '1fr 1fr' };
      case '6grid': return { gridTemplateColumns: '1fr 1fr' };
      default: return { gridTemplateColumns: '1fr' };
    }
  };

  const count = {
    single: 1, '2h': 2, '2v': 2, '3strip': 3, '4strip': 4, '4grid': 4, '6grid': 6, custom: 4,
  }[layout] || 1;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const isDarkBg = background.toLowerCase() === '#000000' || background.toLowerCase() === '#1a1a2e';

  // Photo slot height based on layout
  const getSlotHeight = () => {
    switch (layout) {
      case '4strip': return 98;
      case '3strip': return 120;
      case '2v': return 155;
      case '6grid': return 95;
      case '4grid': return 125;
      case 'single': return 260;
      default: return 115;
    }
  };

  const handlePointerDown = (e: React.PointerEvent, sticker: StickerItem) => {
    if (readonly) return;
    e.stopPropagation();
    onSelectSticker?.(sticker.id);
    dragRef.current = {
      id: sticker.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: sticker.x,
      origY: sticker.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizePointerDown = (e: React.PointerEvent, sticker: StickerItem) => {
    if (readonly) return;
    e.stopPropagation();
    resizeRef.current = {
      id: sticker.id,
      startY: e.clientY,
      origScale: sticker.scale || 1,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (resizeRef.current) {
      const deltaY = e.clientY - resizeRef.current.startY;
      const newScale = Math.max(0.4, Math.min(3.5, resizeRef.current.origScale + deltaY * 0.015));
      onUpdateSticker?.(resizeRef.current.id, { scale: Number(newScale.toFixed(2)) });
      return;
    }

    if (!dragRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
    const newX = Math.max(5, Math.min(95, dragRef.current.origX + dx));
    const newY = Math.max(5, Math.min(95, dragRef.current.origY + dy));
    onUpdateSticker?.(dragRef.current.id, { x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (resizeRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      resizeRef.current = null;
    }
    if (dragRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      dragRef.current = null;
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => onSelectSticker?.(null)}
      style={{
        background,
        border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
        borderRadius: 8,
        padding: '10px 10px 14px 10px',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: layout === '4strip' || layout === '3strip' || layout === '2v' ? 220 : 300,
        margin: '0 auto',
        boxShadow: 'var(--shadow-lg)',
        boxSizing: 'border-box',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Photos Grid Container */}
      <div
        style={{
          display: 'grid',
          gap: 6,
          ...getGridStyle(),
        }}
      >
        {Array.from({ length: count }).map((_, i) => {
          const photo = photos[i];
          const isSelected = selectedIndex === i;
          const currentFilter = activeFilter || photo?.filter || 'original';
          const currentAdj = adjustments || photo?.adjustments || {
            brightness: 100, saturation: 100, exposure: 0, contrast: 100, warmth: 0, blur: 0,
          };

          return (
            <div
              key={i}
              className="photo-slot"
              onClick={(e) => {
                if (readonly) return;
                if (!photo) {
                  e.stopPropagation();
                  onEmptySlotClick?.(i);
                } else {
                  onSelectPhoto?.(i);
                }
              }}
              style={{
                width: '100%',
                height: getSlotHeight(),
                cursor: readonly ? 'default' : (!photo && onEmptySlotClick ? 'pointer' : (photo ? 'pointer' : 'default')),
                outline: isSelected ? '2px solid var(--dusty-rose)' : 'none',
                outlineOffset: 2,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 4,
                boxSizing: 'border-box',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {photo ? (
                <>
                  <img
                    src={photo.dataUrl}
                    alt={`Photo ${i + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: buildCSSFilter(currentFilter, currentAdj),
                      display: 'block',
                      pointerEvents: 'none',
                    }}
                  />
                  {!readonly && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemovePhoto?.(photo.id); }}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        background: 'rgba(255,255,255,0.85)',
                        border: 'none',
                        borderRadius: 8,
                        padding: 4,
                        cursor: 'pointer',
                        display: 'flex',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        zIndex: 2,
                      }}
                      className="remove-btn"
                    >
                      <Trash2 size={12} color="#e87c7c" />
                    </button>
                  )}
                </>
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onEmptySlotClick?.(i);
                  }}
                  title="Click to capture this photo"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    gap: 6,
                    color: 'var(--mauve)',
                    fontSize: '0.75rem',
                    cursor: onEmptySlotClick ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(212,160,181,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    color: 'var(--brown)',
                    fontSize: '0.85rem',
                  }}>
                    {i + 1}
                  </div>
                  {onEmptySlotClick && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--dusty-rose)' }}>
                      + Take Photo
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Photostrip Bottom Space: User Text + Small Date on Bottom Right */}
      <div style={{
        paddingTop: 12,
        paddingBottom: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flexShrink: 0,
      }}>
        {/* Brand / editable text line */}
        {onFooterTextChange ? (
          <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
            {footerText.toLowerCase() === 'snapbooth' ? (
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '-0.02em',
                  color: isDarkBg ? '#FFFFFF' : 'var(--brown)',
                  textAlign: 'center',
                  padding: '4px 6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'text',
                }}
                onClick={(e) => {
                  const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                  input?.focus();
                }}
              >
                Snap<span style={{ color: 'var(--dusty-rose)' }}>booth</span>
              </div>
            ) : null}
            <input
              type="text"
              placeholder="Write something here..."
              value={footerText}
              onChange={(e) => onFooterTextChange(e.target.value)}
              maxLength={35}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px dashed rgba(212,160,181,0.5)',
                textAlign: 'center',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: isDarkBg ? '#FFFFFF' : 'var(--brown)',
                outline: 'none',
                padding: '4px 6px',
                display: footerText.toLowerCase() === 'snapbooth' ? 'none' : 'block',
              }}
            />
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '0.95rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: isDarkBg ? '#FFFFFF' : 'var(--brown)',
            minHeight: '1.2rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {footerText.toLowerCase() === 'snapbooth' ? (
              <span>Snap<span style={{ color: 'var(--dusty-rose)' }}>booth</span></span>
            ) : (
              footerText
            )}
          </div>
        )}

        {/* Small Date on bottom right */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          fontSize: '0.68rem',
          fontWeight: 600,
          color: isDarkBg ? '#B5ABA7' : 'var(--warm-gray)',
          fontFamily: "'Playfair Display', Georgia, serif",
          letterSpacing: '0.02em',
          paddingRight: 4,
          paddingTop: 2,
        }}>
          {dateStr}
        </div>
      </div>

      {/* Interactive Sticker Overlay Layer */}
      {stickers.map((sticker) => {
        const isSelected = selectedStickerId === sticker.id;
        return (
          <div
            key={sticker.id}
            onPointerDown={(e) => handlePointerDown(e, sticker)}
            style={{
              position: 'absolute',
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: `translate(-50%, -50%) rotate(${sticker.rotation || 0}deg) scale(${sticker.scale || 1})`,
              cursor: 'move',
              zIndex: isSelected ? 30 : 20,
              padding: '2px 4px',
              borderRadius: 4,
              border: isSelected ? '1.5px dashed var(--dusty-rose)' : '1px solid transparent',
              background: isSelected ? 'rgba(255,255,255,0.4)' : 'transparent',
              touchAction: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {sticker.type === 'text' ? (
              <span style={{
                fontFamily: sticker.fontFamily || 'DM Sans',
                fontSize: `${sticker.fontSize || 20}px`,
                color: sticker.color || '#51413B',
                fontWeight: 600,
                textShadow: '0 1px 3px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}>
                {sticker.content}
              </span>
            ) : (
              <span style={{
                fontSize: `${(sticker.width || 36) * 0.8}px`,
                lineHeight: 1,
                pointerEvents: 'none',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
              }}>
                {sticker.content}
              </span>
            )}

            {/* Quick delete button on selected sticker */}
            {isSelected && onRemoveSticker && !readonly && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSticker(sticker.id);
                }}
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  background: '#e87c7c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  zIndex: 35,
                }}
              >
                <X size={11} />
              </button>
            )}

            {/* Quick Resize Handle on bottom right of selected sticker */}
            {isSelected && !readonly && (
              <div
                onPointerDown={(e) => handleResizePointerDown(e, sticker)}
                title="Drag down/up to resize"
                style={{
                  position: 'absolute',
                  bottom: -8,
                  right: -8,
                  background: 'var(--dusty-rose)',
                  color: 'white',
                  border: '1.5px solid white',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'nwse-resize',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                  zIndex: 35,
                  touchAction: 'none',
                }}
              >
                <span style={{ fontSize: 9, lineHeight: 1, pointerEvents: 'none' }}>⤡</span>
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        .photo-slot:hover .remove-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
