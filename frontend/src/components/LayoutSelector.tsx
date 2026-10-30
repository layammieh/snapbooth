import React from 'react';
import { LayoutType, LAYOUT_INFO } from '../types';

interface LayoutSelectorProps {
  active: LayoutType;
  onChange: (layout: LayoutType) => void;
}

const LAYOUT_VISUALS: Record<LayoutType, React.ReactNode> = {
  single: (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '6px', justifyContent: 'center' }}>
      <div style={{ background: 'var(--soft-pink)', borderRadius: 4, width: '100%', height: 90 }} />
    </div>
  ),
  '2v': (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%', padding: '6px' }}>
      {[0, 1].map(i => (
        <div key={i} style={{ background: 'var(--soft-pink)', borderRadius: 3, flex: 1 }} />
      ))}
    </div>
  ),
  '3strip': (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%', padding: '6px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ background: 'var(--soft-pink)', borderRadius: 3, flex: 1 }} />
      ))}
    </div>
  ),
  '4strip': (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%', padding: '6px' }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ background: 'var(--soft-pink)', borderRadius: 3, flex: 1 }} />
      ))}
    </div>
  ),
  '4grid': (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 3, height: '100%', padding: '6px' }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ background: 'var(--soft-pink)', borderRadius: 3 }} />
      ))}
    </div>
  ),
  '6grid': (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: 3, height: '100%', padding: '6px' }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ background: 'var(--soft-pink)', borderRadius: 3 }} />
      ))}
    </div>
  ),
  '2h': (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, height: '100%', padding: '6px' }}>
      {[0, 1].map(i => (
        <div key={i} style={{ background: 'var(--soft-pink)', borderRadius: 3, height: '100%' }} />
      ))}
    </div>
  ),
  custom: (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, height: '100%', padding: '6px' }}>
      <div style={{ background: 'var(--soft-pink)', borderRadius: 3, gridColumn: 'span 2', height: 42 }} />
      {[0, 1].map(i => (
        <div key={i} style={{ background: 'var(--soft-pink)', borderRadius: 3, height: 42 }} />
      ))}
    </div>
  ),
};

export function LayoutSelector({ active, onChange }: LayoutSelectorProps) {
  // Required sequence: single, 2 vertical, 3 strip, 4 strip, 4 grid, 6 grid
  const portraitLayouts: LayoutType[] = ['single', '2v', '3strip', '4strip', '4grid', '6grid'];

  return (
    <div>
      <p className="section-label" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        Choose a Portrait Strip Format
      </p>
      <div
        className="layout-selector-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '0.75rem',
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        {portraitLayouts.map((type) => {
          const info = LAYOUT_INFO[type];
          const isStrip = type === '4strip' || type === '3strip' || type === '2v';
          return (
            <div
              key={type}
              className={`layout-option${active === type ? ' active' : ''}`}
              onClick={() => onChange(type)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 14,
                background: '#FFFFFF',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                border: active === type ? '2.5px solid var(--dusty-rose)' : '1.5px solid rgba(247,221,229,0.7)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* Tall portrait representation */}
              <div style={{
                height: 130,
                width: isStrip ? 56 : 74,
                margin: '10px auto 4px',
                background: 'var(--cream)',
                borderRadius: 8,
                border: '1px solid rgba(212,160,181,0.3)',
                boxShadow: '0 2px 6px rgba(81,65,59,0.06)',
                overflow: 'hidden',
              }}>
                {LAYOUT_VISUALS[type]}
              </div>

              <div style={{
                padding: '6px 4px 8px',
                textAlign: 'center',
                background: active === type ? 'var(--soft-pink)' : 'transparent',
                borderTop: '1px solid rgba(247,221,229,0.4)',
                marginTop: 'auto',
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: active === type ? 700 : 600,
                  color: 'var(--brown)',
                  whiteSpace: 'nowrap',
                }}>
                  {info.label}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--mauve)', fontWeight: 500, marginTop: 1 }}>
                  {info.photoCount} {info.photoCount === 1 ? 'photo' : 'photos'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
