import React, { useState } from 'react';
import { PrintSettings, PRINT_PRESETS, Unit, DPI, Orientation } from '../types';
import { getPrintPixels } from '../utils/canvas';
import { Ruler, Printer, Download } from 'lucide-react';

interface PrintPanelProps {
  settings: PrintSettings;
  onSettingsChange: (settings: Partial<PrintSettings>) => void;
  onExport: (format: 'png' | 'jpeg', quality: number) => void;
  onPrint: () => void;
  isExporting?: boolean;
}

const UNITS: { value: Unit; label: string }[] = [
  { value: 'in', label: 'inches' },
  { value: 'cm', label: 'cm' },
  { value: 'mm', label: 'mm' },
];

const DPI_OPTIONS: DPI[] = [150, 200, 300];
const BG_COLORS = [
  '#FFFFFF', '#FFF9F2', '#F7DDE5', '#E9E1F5', '#000000',
  '#F0E6D3', '#D4E8D4', '#D4D8E8', '#F5D4D4', '#E8F5D4',
];

export function PrintPanel({ settings, onSettingsChange, onExport, onPrint, isExporting }: PrintPanelProps) {
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');
  const [exportQuality, setExportQuality] = useState(0.95);

  const pixels = getPrintPixels(settings);

  const applyPreset = (preset: typeof PRINT_PRESETS[0]) => {
    onSettingsChange({ width: preset.width, height: preset.height, unit: preset.unit });
  };

  const handleOrientationChange = (orientation: Orientation) => {
    if (orientation !== settings.orientation) {
      onSettingsChange({
        orientation,
        width: settings.height,
        height: settings.width,
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Preset sizes */}
      <div>
        <p className="section-label">Print Size</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
          {PRINT_PRESETS.map((preset) => {
            const isActive = settings.width === preset.width && settings.height === preset.height && settings.unit === preset.unit;
            return (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                style={{
                  padding: '0.4rem 0.2rem',
                  borderRadius: '10px',
                  border: `1.5px solid ${isActive ? 'var(--dusty-rose)' : 'rgba(247,221,229,0.7)'}`,
                  background: isActive ? 'var(--soft-pink)' : 'var(--cream)',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--brown)' : 'var(--warm-gray)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {preset.label}
              </button>
            );
          })}
          <button
            onClick={() => {}}
            style={{
              padding: '0.4rem 0.2rem',
              borderRadius: '10px',
              border: '1.5px dashed rgba(247,221,229,0.7)',
              background: 'transparent',
              fontSize: '0.72rem',
              color: 'var(--mauve)',
              cursor: 'pointer',
            }}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Custom dimensions */}
      <div>
        <p className="section-label">Dimensions</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--mauve)', display: 'block', marginBottom: 2 }}>Width</label>
            <input
              type="number"
              className="input-field"
              value={settings.width}
              min={0.5}
              step={0.5}
              onChange={(e) => onSettingsChange({ width: parseFloat(e.target.value) || 1 })}
              style={{ textAlign: 'center' }}
            />
          </div>
          <span style={{ color: 'var(--mauve)', fontWeight: 600, fontSize: '1.1rem', paddingTop: 16 }}>×</span>
          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--mauve)', display: 'block', marginBottom: 2 }}>Height</label>
            <input
              type="number"
              className="input-field"
              value={settings.height}
              min={0.5}
              step={0.5}
              onChange={(e) => onSettingsChange({ height: parseFloat(e.target.value) || 1 })}
              style={{ textAlign: 'center' }}
            />
          </div>
        </div>

        {/* Unit */}
        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
          {UNITS.map((u) => (
            <button
              key={u.value}
              onClick={() => onSettingsChange({ unit: u.value })}
              style={{
                flex: 1,
                padding: '0.3rem',
                borderRadius: '8px',
                border: `1.5px solid ${settings.unit === u.value ? 'var(--dusty-rose)' : 'rgba(247,221,229,0.7)'}`,
                background: settings.unit === u.value ? 'var(--soft-pink)' : 'transparent',
                fontSize: '0.7rem',
                fontWeight: settings.unit === u.value ? 700 : 400,
                cursor: 'pointer',
                color: settings.unit === u.value ? 'var(--brown)' : 'var(--warm-gray)',
              }}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* DPI */}
      <div>
        <p className="section-label">Resolution (DPI)</p>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {DPI_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => onSettingsChange({ dpi: d })}
              style={{
                flex: 1,
                padding: '0.4rem',
                borderRadius: '8px',
                border: `1.5px solid ${settings.dpi === d ? 'var(--dusty-rose)' : 'rgba(247,221,229,0.7)'}`,
                background: settings.dpi === d ? 'var(--soft-pink)' : 'transparent',
                fontSize: '0.75rem',
                fontWeight: settings.dpi === d ? 700 : 400,
                cursor: 'pointer',
                color: settings.dpi === d ? 'var(--brown)' : 'var(--warm-gray)',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Orientation */}
      <div>
        <p className="section-label">Orientation</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['portrait', 'landscape'] as Orientation[]).map((o) => (
            <button
              key={o}
              onClick={() => handleOrientationChange(o)}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '10px',
                border: `1.5px solid ${settings.orientation === o ? 'var(--dusty-rose)' : 'rgba(247,221,229,0.7)'}`,
                background: settings.orientation === o ? 'var(--soft-pink)' : 'transparent',
                fontSize: '0.75rem',
                fontWeight: settings.orientation === o ? 700 : 400,
                cursor: 'pointer',
                color: settings.orientation === o ? 'var(--brown)' : 'var(--warm-gray)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
              }}
            >
              <span>{o === 'portrait' ? '📄' : '🖼️'}</span>
              <span style={{ textTransform: 'capitalize' }}>{o}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview dimensions */}
      <div style={{
        background: 'var(--cream)',
        borderRadius: '12px',
        padding: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <Ruler size={14} style={{ color: 'var(--mauve)' }} />
        <div style={{ fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--warm-gray)' }}>Output: </span>
          <strong style={{ color: 'var(--brown)' }}>
            {pixels.width.toLocaleString()} × {pixels.height.toLocaleString()} px
          </strong>
          <span style={{ color: 'var(--mauve)', marginLeft: 4 }}>
            @ {settings.dpi} DPI
          </span>
        </div>
      </div>

      {/* Background colors */}
      <div>
        <p className="section-label">Background Color</p>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          {BG_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {}}
              style={{
                width: 26, height: 26, borderRadius: '6px', background: c,
                border: '1.5px solid rgba(0,0,0,0.12)',
                cursor: 'pointer', padding: 0,
              }}
            />
          ))}
        </div>
        <input type="color" className="input-field" style={{ height: 36, padding: '2px 4px' }} />
      </div>

      {/* Export format */}
      <div>
        <p className="section-label">Export Format</p>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {(['png', 'jpeg'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setExportFormat(fmt)}
              style={{
                flex: 1,
                padding: '0.4rem',
                borderRadius: '8px',
                border: `1.5px solid ${exportFormat === fmt ? 'var(--dusty-rose)' : 'rgba(247,221,229,0.7)'}`,
                background: exportFormat === fmt ? 'var(--soft-pink)' : 'transparent',
                fontSize: '0.8rem',
                fontWeight: exportFormat === fmt ? 700 : 400,
                cursor: 'pointer',
                textTransform: 'uppercase',
                color: exportFormat === fmt ? 'var(--brown)' : 'var(--warm-gray)',
              }}
            >
              {fmt}
            </button>
          ))}
        </div>
        {exportFormat === 'jpeg' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.75rem', color: 'var(--warm-gray)' }}>
              <span>Quality</span>
              <span style={{ fontWeight: 600, color: 'var(--brown)' }}>{Math.round(exportQuality * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1}
              step={0.05}
              value={exportQuality}
              onChange={(e) => setExportQuality(parseFloat(e.target.value))}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          className="btn-primary"
          onClick={() => onExport(exportFormat, exportQuality)}
          disabled={isExporting}
          style={{ width: '100%', justifyContent: 'center', opacity: isExporting ? 0.7 : 1 }}
        >
          <Download size={16} />
          {isExporting ? 'Exporting…' : `Download ${exportFormat.toUpperCase()}`}
        </button>
        <button
          className="btn-secondary"
          onClick={onPrint}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Printer size={16} />
          Print
        </button>
      </div>
    </div>
  );
}
