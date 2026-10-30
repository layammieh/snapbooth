import React from 'react';
import { FilterType, AdjustmentSettings } from '../types';
import { buildCSSFilter } from '../utils/canvas';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'original', label: 'Original' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'bw', label: 'B&W' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
  { id: 'softglow', label: 'Soft Glow' },
  { id: 'retro', label: 'Retro' },
  { id: 'film', label: 'Film' },
  { id: 'dreamy', label: 'Dreamy' },
  { id: 'bright', label: 'Bright' },
  { id: 'contrast', label: 'Contrast' },
];

const DEFAULT_ADJ: AdjustmentSettings = {
  brightness: 100, saturation: 100, exposure: 0, contrast: 100, warmth: 0, blur: 0,
};

interface FilterPanelProps {
  sampleImage?: string;
  activeFilter: FilterType;
  adjustments: AdjustmentSettings;
  onFilterChange: (filter: FilterType) => void;
  onAdjustmentChange: (key: keyof AdjustmentSettings, value: number) => void;
}

interface AdjustmentRow {
  key: keyof AdjustmentSettings;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}

const ADJUSTMENTS: AdjustmentRow[] = [
  { key: 'brightness', label: 'Brightness', min: 50, max: 200, step: 1, format: (v) => `${v}%` },
  { key: 'saturation', label: 'Saturation', min: 0, max: 300, step: 1, format: (v) => `${v}%` },
  { key: 'exposure', label: 'Exposure', min: -50, max: 50, step: 1, format: (v) => (v >= 0 ? `+${v}` : `${v}`) },
  { key: 'contrast', label: 'Contrast', min: 50, max: 200, step: 1, format: (v) => `${v}%` },
  { key: 'warmth', label: 'Warmth', min: -50, max: 50, step: 1, format: (v) => (v >= 0 ? `+${v}` : `${v}`) },
  { key: 'blur', label: 'Blur', min: 0, max: 10, step: 0.1, format: (v) => `${v.toFixed(1)}px` },
];

export function FilterPanel({ sampleImage, activeFilter, adjustments, onFilterChange, onAdjustmentChange }: FilterPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Filter grid */}
      <div>
        <p className="section-label">Filters</p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
        }}>
          {FILTERS.map((f) => (
            <div
              key={f.id}
              className={`filter-thumb${activeFilter === f.id ? ' active' : ''}`}
              onClick={() => onFilterChange(f.id)}
            >
              {sampleImage ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={sampleImage}
                    alt={f.label}
                    style={{
                      width: '100%',
                      height: 56,
                      objectFit: 'cover',
                      display: 'block',
                      filter: buildCSSFilter(f.id, DEFAULT_ADJ),
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                    padding: '4px 4px 2px',
                    fontSize: '0.6rem',
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: 600,
                  }}>
                    {f.label}
                  </div>
                </div>
              ) : (
                <div style={{
                  height: 48,
                  background: `linear-gradient(135deg, var(--soft-pink), var(--lavender))`,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  padding: '4px',
                }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--brown)', fontWeight: 600 }}>{f.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Adjustments */}
      <div>
        <p className="section-label">Adjustments</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {ADJUSTMENTS.map((adj) => (
            <div key={String(adj.key)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--brown)', fontWeight: 500 }}>{adj.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--mauve)', fontWeight: 600 }}>
                  {adj.format(adjustments[adj.key])}
                </span>
              </div>
              <input
                type="range"
                min={adj.min}
                max={adj.max}
                step={adj.step}
                value={adjustments[adj.key]}
                onChange={(e) => onAdjustmentChange(adj.key, parseFloat(e.target.value))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
