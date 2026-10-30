import { useState, useEffect, useRef, useCallback } from 'react';
import { CameraState } from '../types';

export function useCamera() {
  const [state, setState] = useState<CameraState>({
    stream: null,
    hasPermission: null,
    error: null,
    devices: [],
    selectedDeviceId: null,
    isMirrored: true,
    facing: 'user',
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === 'videoinput');
    } catch {
      return [];
    }
  }, []);

  const startCamera = useCallback(
    async (deviceId?: string | null, facing?: 'user' | 'environment') => {
      stopStream();
      setState((s) => ({ ...s, error: null }));

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : {
              facingMode: facing || 'user',
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
        audio: false,
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const devices = await getDevices();
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();

        setState((s) => ({
          ...s,
          stream,
          hasPermission: true,
          error: null,
          devices,
          selectedDeviceId: settings.deviceId || null,
          facing: facing || s.facing,
        }));
      } catch (err: unknown) {
        const error = err as Error;
        let message = 'Unable to access camera';
        if (error.name === 'NotAllowedError') message = 'Camera permission denied. Please allow camera access.';
        else if (error.name === 'NotFoundError') message = 'No camera found on this device.';
        else if (error.name === 'NotReadableError') message = 'Camera is in use by another application.';

        setState((s) => ({ ...s, hasPermission: false, error: message, stream: null }));
      }
    },
    [stopStream, getDevices]
  );

  const switchCamera = useCallback(async () => {
    const newFacing = state.facing === 'user' ? 'environment' : 'user';
    // Try facingMode first (mobile)
    await startCamera(null, newFacing);
  }, [state.facing, startCamera]);

  const selectDevice = useCallback(
    async (deviceId: string) => {
      await startCamera(deviceId);
    },
    [startCamera]
  );

  const toggleMirror = useCallback(() => {
    setState((s) => ({ ...s, isMirrored: !s.isMirrored }));
  }, []);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !state.stream) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d')!;

    if (state.isMirrored) {
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    return canvas.toDataURL('image/png', 1.0);
  }, [state.stream, state.isMirrored]);

  useEffect(() => {
    if (videoRef.current && state.stream) {
      videoRef.current.srcObject = state.stream;
    }
  }, [state.stream]);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  return {
    ...state,
    videoRef,
    startCamera,
    stopStream,
    switchCamera,
    selectDevice,
    toggleMirror,
    capturePhoto,
  };
}

export function useCountdown() {
  const [count, setCount] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const startCountdown = useCallback(
    (seconds: number, onComplete: () => void) => {
      clearTimeout(timerRef.current);
      setCount(seconds);

      let remaining = seconds;
      const tick = () => {
        remaining -= 1;
        if (remaining <= 0) {
          setCount(null);
          onComplete();
        } else {
          setCount(remaining);
          timerRef.current = setTimeout(tick, 1000);
        }
      };
      timerRef.current = setTimeout(tick, 1000);
    },
    []
  );

  const cancelCountdown = useCallback(() => {
    clearTimeout(timerRef.current);
    setCount(null);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return { count, startCountdown, cancelCountdown };
}
