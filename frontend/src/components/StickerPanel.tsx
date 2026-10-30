import React, { useState } from 'react';
import { StickerItem, STICKER_LIBRARY } from '../types';
import { Type, Plus, Trash2 } from 'lucide-react';

interface StickerPanelProps {
  stickers: StickerItem[];
  selectedId: string | null;
  onAddSticker: (sticker: Omit<StickerItem, 'id'>) => void;
  onUpdateSticker: (id: string, updates: Partial<StickerItem>) => void;
  onRemoveSticker: (id: string) => void;
  onSelectSticker: (id: string | null) => void;
}

type StickerCategory = keyof typeof STICKER_LIBRARY;
const CATEGORIES: StickerCategory[] = Object.keys(STICKER_LIBRARY) as StickerCategory[];

const FONTS = ['DM Sans', 'Playfair Display', 'Inter', 'Georgia', 'Courier New', 'Comic Sans MS'];
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48];
const TEXT_COLORS = [
  '#51413B', '#D4A0B5', '#9b8ec4', '#7cc47c', '#e87c7c', '#e8c47c',
  '#FFFFFF', '#000000', '#F7DDE5', '#E9E1F5',
];

export function StickerPanel({
  stickers, selectedId, onAddSticker, onUpdateSticker, onRemoveSticker, onSelectSticker,
}: StickerPanelProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof STICKER_LIBRARY>('hearts');
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#51413B');
  const [textFont, setTextFont] = useState('DM Sans');
  const [textSize, setTextSize] = useState(24);

  const selected = stickers.find((s) => s.id === selectedId);

  const addEmoji = (emoji: string) => {
    onAddSticker({
      type: 'emoji',
      content: emoji,
      x: 50,
      y: 50,
      width: 40,
      height: 40,
      rotation: 0,
      scale: 1,
    });
  };

  const addText = () => {
    if (!textInput.trim()) return;
    onAddSticker({
      type: 'text',
      content: textInput,
      x: 50,
      y: 50,
      width: 120,
      height: 40,
      rotation: 0,
      fontSize: textSize,
      fontFamily: textFont,
      color: textColor,
    });
    setTextInput('');
    setShowTextEditor(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Text editor */}
      <div>
        <p className="section-label">Text</p>
        {showTextEditor ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Type your text…"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addText()}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <select
                className="input-field"
                value={textFont}
                onChange={(e) => setTextFont(e.target.value)}
              >
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <select
                className="input-field"
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
              >
                {FONT_SIZES.map((s) => <option key={s} value={s}>{s}px</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setTextColor(c)}
                  style={{
                    width: 22, height: 22, borderRadius: '50%', background: c,
                    border: textColor === c ? '2px solid var(--brown)' : '1.5px solid rgba(0,0,0,0.15)',
                    cursor: 'pointer', padding: 0,
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }} onClick={addText}>
                <Plus size={14} /> Add Text
              </button>
              <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }} onClick={() => setShowTextEditor(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn-secondary"
            style={{ width: '100%', fontSize: '0.875rem' }}
            onClick={() => setShowTextEditor(true)}
          >
            <Type size={15} /> Add Text
          </button>
        )}
      </div>

      {/* Sticker categories */}
      <div>
        <p className="section-label">Stickers & Emojis</p>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontSize: '0.65rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                background: activeCategory === cat ? 'var(--soft-pink)' : 'var(--cream)',
                color: activeCategory === cat ? 'var(--brown)' : 'var(--warm-gray)',
                fontWeight: activeCategory === cat ? 600 : 400,
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.35rem',
        }}>
          {STICKER_LIBRARY[activeCategory].map((emoji: string, i: number) => (
            <button
              key={`${activeCategory}-${i}`}
              onClick={() => addEmoji(emoji)}
              style={{
                fontSize: '1.4rem',
                padding: '0.4rem',
                background: 'var(--cream)',
                border: '1px solid rgba(247,221,229,0.5)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                lineHeight: 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Active stickers list */}
      {stickers.length > 0 && (
        <div>
          <p className="section-label">Added ({stickers.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {stickers.map((st) => (
              <div
                key={st.id}
                onClick={() => onSelectSticker(st.id === selectedId ? null : st.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '10px',
                  background: st.id === selectedId ? 'var(--soft-pink)' : 'var(--cream)',
                  cursor: 'pointer',
                  border: `1px solid ${st.id === selectedId ? 'var(--dusty-rose)' : 'transparent'}`,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{st.type === 'text' ? '📝' : st.content}</span>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--warm-gray)',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {st.type === 'text' ? st.content : st.type}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveSticker(st.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#e87c7c' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit selected sticker (Text or Emoji) */}
      {selected && (
        <div style={{
          background: 'var(--cream)',
          padding: '0.85rem',
          borderRadius: 14,
          border: '1.5px solid var(--soft-pink)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <p className="section-label" style={{ margin: 0 }}>
              Adjust Selected {selected.type === 'text' ? 'Text' : 'Sticker'}
            </p>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brown)' }}>
              {Math.round((selected.scale || 1) * 100)}%
            </span>
          </div>

          {/* Size / Scale Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--mauve)', fontWeight: 500 }}>Size</span>
            <input
              type="range"
              min={0.5}
              max={3.0}
              step={0.1}
              value={selected.scale || 1}
              onChange={(e) => onUpdateSticker(selected.id, { scale: parseFloat(e.target.value) })}
              style={{ flex: 1 }}
            />
          </div>

          {selected.type === 'text' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="text"
                className="input-field"
                value={selected.content}
                onChange={(e) => onUpdateSticker(selected.id, { content: e.target.value })}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <select
                  className="input-field"
                  value={selected.fontFamily}
                  onChange={(e) => onUpdateSticker(selected.id, { fontFamily: e.target.value })}
                >
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <select
                  className="input-field"
                  value={selected.fontSize}
                  onChange={(e) => onUpdateSticker(selected.id, { fontSize: Number(e.target.value) })}
                >
                  {FONT_SIZES.map((s) => <option key={s} value={s}>{s}px</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdateSticker(selected.id, { color: c })}
                    style={{
                      width: 22, height: 22, borderRadius: '50%', background: c,
                      border: selected.color === c ? '2px solid var(--brown)' : '1.5px solid rgba(0,0,0,0.15)',
                      cursor: 'pointer', padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => onUpdateSticker(selected.id, { scale: Math.max(0.5, ((selected.scale || 1) - 0.2)) })}
              >
                Smaller (-)
              </button>
              <button
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => onUpdateSticker(selected.id, { scale: Math.min(3.0, ((selected.scale || 1) + 0.2)) })}
              >
                Larger (+)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
