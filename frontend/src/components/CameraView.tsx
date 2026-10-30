import React, { useRef, useEffect, forwardRef } from 'react';
import { Camera, CameraOff, RefreshCcw, FlipHorizontal2, Loader } from 'lucide-react';
import { useCamera, useCountdown } from '../hooks/useCamera';
import { buildCSSFilter } from '../utils/canvas';

interface CameraViewProps {
  onCapture: (dataUrl: string) => void;
  countdownSeconds: number;
  isCapturing: boolean;
  onCaptureStart: () => void;
  onCaptureEnd: () => void;
  maxPhotos: number;
  currentPhotoCount: number;
  activeFilter?: import('../types').FilterType;
  adjustments?: import('../types').AdjustmentSettings;
}

export const CameraView = forwardRef<
  { captureNow: () => string | null },
  CameraViewProps
>(function CameraView(
  { onCapture, countdownSeconds, isCapturing, onCaptureStart, onCaptureEnd, maxPhotos, currentPhotoCount, activeFilter, adjustments },
  ref
) {
  const camera = useCamera();
  const { count, startCountdown, cancelCountdown } = useCountdown();

  useEffect(() => {
    camera.startCamera(null, 'user');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (isCapturing || currentPhotoCount >= maxPhotos) return;
    onCaptureStart();

    if (countdownSeconds > 0) {
      startCountdown(countdownSeconds, () => {
        const dataUrl = camera.capturePhoto();
        if (dataUrl) onCapture(dataUrl);
        onCaptureEnd();
      });
    } else {
      const dataUrl = camera.capturePhoto();
      if (dataUrl) onCapture(dataUrl);
      onCaptureEnd();
    }
  };

  const handleCancel = () => {
    cancelCountdown();
    onCaptureEnd();
  };

  React.useImperativeHandle(ref, () => ({
    captureNow: () => camera.capturePhoto(),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
      {/* Camera preview */}
      <div
        className="camera-preview"
        style={{ flex: 1, minHeight: 200, position: 'relative' }}
      >
        {camera.hasPermission === false ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', gap: '1rem', padding: '2rem', textAlign: 'center',
          }}>
            <CameraOff size={48} style={{ color: 'var(--mauve)' }} />
            <p style={{ color: 'var(--warm-gray)', fontSize: '0.9rem', margin: 0 }}>
              {camera.error || 'Camera not available'}
            </p>
            <button className="btn-primary" onClick={() => camera.startCamera(null, 'user')}>
              <RefreshCcw size={16} /> Try Again
            </button>
          </div>
        ) : camera.hasPermission === null ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', flexDirection: 'column', gap: '1rem',
          }}>
            <Loader size={32} className="animate-spin" style={{ color: 'var(--dusty-rose)' }} />
            <p style={{ color: 'var(--warm-gray)', fontSize: '0.875rem' }}>Starting camera…</p>
          </div>
        ) : (
          <div
            className={`camera-wrapper${camera.isMirrored ? ' mirrored' : ''}`}
            style={{ width: '100%', height: '100%' }}
          >
            <video
              ref={camera.videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                filter: activeFilter ? buildCSSFilter(activeFilter, adjustments || {
                  brightness: 100, saturation: 100, exposure: 0, contrast: 100, warmth: 0, blur: 0,
                }) : 'none',
              }}
            />
          </div>
        )}

        {/* Countdown overlay */}
        {count !== null && (
          <div className="countdown-overlay">
            <div key={count} className="countdown-number animate-countdown">
              {count}
            </div>
          </div>
        )}

        {/* Camera controls overlay */}
        {camera.hasPermission && (
          <div style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            display: 'flex', gap: '0.5rem',
          }}>
            <button
              className="btn-icon"
              onClick={camera.toggleMirror}
              data-tooltip="Mirror"
              style={{ background: 'rgba(255,255,255,0.85)' }}
            >
              <FlipHorizontal2 size={16} />
            </button>
            {camera.devices.length > 1 && (
              <button
                className="btn-icon"
                onClick={camera.switchCamera}
                data-tooltip="Switch Camera"
                style={{ background: 'rgba(255,255,255,0.85)' }}
              >
                <RefreshCcw size={16} />
              </button>
            )}
          </div>
        )}

        {/* Photo count badge */}
        <div style={{
          position: 'absolute', top: '0.75rem', left: '0.75rem',
          background: 'rgba(255,255,255,0.85)', borderRadius: '20px',
          padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 600,
          color: 'var(--brown)',
        }}>
          {currentPhotoCount}/{maxPhotos}
        </div>
      </div>

      {/* Capture button area */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', paddingBottom: '0.25rem' }}>
        {count !== null ? (
          <button className="btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        ) : (
          <button
            className="btn-primary animate-pulse-glow"
            onClick={handleCapture}
            disabled={!camera.hasPermission || currentPhotoCount >= maxPhotos}
            style={{
              padding: '0.9rem 2.5rem',
              fontSize: '1rem',
              opacity: (!camera.hasPermission || currentPhotoCount >= maxPhotos) ? 0.5 : 1,
            }}
          >
            <Camera size={20} />
            {currentPhotoCount >= maxPhotos ? 'All slots filled' : 'Capture Photo'}
          </button>
        )}
      </div>
    </div>
  );
});
