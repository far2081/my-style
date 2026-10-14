import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, RotateCw, Check, AlertCircle, Upload, ShieldAlert, VideoOff } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
  title?: string;
}

type CameraStatus = 'idle' | 'starting' | 'streaming' | 'captured' | 'error';

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Capture Your Portrait',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileFallbackRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<CameraStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Stop all active tracks and release camera hardware
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping media track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Safely attach stream to video element
  const attachStreamToVideo = useCallback((videoElement: HTMLVideoElement | null, stream: MediaStream | null) => {
    if (!videoElement || !stream) return;
    try {
      videoElement.srcObject = stream;
      videoElement.muted = true;
      videoElement.playsInline = true;
      videoElement.setAttribute('playsinline', 'true');
      videoElement.setAttribute('muted', 'true');
      videoElement.play().catch((playErr) => {
        // Some browsers defer playback until interaction; this is safe to catch
        console.warn('Live camera play deferral:', playErr);
      });
    } catch (err) {
      console.warn('Error setting video srcObject:', err);
    }
  }, []);

  // Ref callback to immediately attach stream when video mounts
  const handleVideoRef = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && streamRef.current && status === 'streaming') {
      attachStreamToVideo(element, streamRef.current);
    }
  }, [status, attachStreamToVideo]);

  // Start webcam stream
  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    // 1. Verify Secure Context (HTTPS or localhost required by modern browsers)
    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setStatus('error');
      setErrorMsg(
        'Webcam access requires a secure connection (HTTPS). Please access the site via HTTPS, or upload a photo directly from your device.'
      );
      return;
    }

    // 2. Check navigator.mediaDevices support
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setStatus('error');
      setErrorMsg(
        'Camera access is not supported by your browser. Please use the Upload Photo option below.'
      );
      return;
    }

    setStatus('starting');
    setErrorMsg(null);
    setCapturedPhoto(null);

    // Stop existing stream before starting a new one
    stopCamera();

    try {
      let stream: MediaStream;

      try {
        // Try high-resolution square/portrait mode first
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        });
      } catch (constraintErr) {
        // Fallback: simple facingMode
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode },
            audio: false,
          });
        } catch (modeErr) {
          // Last resort: basic video without constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      streamRef.current = stream;
      setStatus('streaming');

      // Attach stream to video element if already rendered
      if (videoRef.current) {
        attachStreamToVideo(videoRef.current, stream);
      }
    } catch (err: any) {
      console.warn('Camera stream request failed:', err);
      stopCamera();
      setStatus('error');

      let message = 'Unable to access your camera.';
      const errName = err?.name || '';

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        message =
          'Camera permission was denied. Please allow camera permissions in your browser address bar (click the lock or camera icon), or upload a photo directly.';
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        message = 'No camera device found on this system. You can upload a photo from your device below.';
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        message =
          'Camera is currently in use by another application (e.g., Zoom, Teams, or another browser tab). Please close other camera apps and try again.';
      } else if (errName === 'OverconstrainedError') {
        message = 'The requested camera resolution is not supported by your camera hardware.';
      } else if (errName === 'SecurityError') {
        message = 'Camera access blocked due to security policies. HTTPS is required for webcam access.';
      } else if (err?.message) {
        message = err.message;
      }

      setErrorMsg(message);
    }
  };

  // Lifecycle when modal is opened / closed
  useEffect(() => {
    if (isOpen) {
      // Auto-initiate camera when modal opens
      startCamera(facingMode);
    } else {
      stopCamera();
      setStatus('idle');
      setCapturedPhoto(null);
      setErrorMsg(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Flip between front and rear cameras
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (status === 'streaming' || status === 'starting') {
      startCamera(nextMode);
    }
  };

  // Capture snapshot from live video
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror image horizontally if front-facing user camera for natural portrait mirror
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    setCapturedPhoto(dataUrl);
    setStatus('captured');

    // Turn off camera tracks to save battery and release hardware while confirming
    stopCamera();
  };

  // Retake photo: discard snapshot and restart camera
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera(facingMode);
  };

  // Confirm photo and send to parent workflow
  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      handleClose();
    }
  };

  // Safe close handler that stops tracks
  const handleClose = () => {
    stopCamera();
    setStatus('idle');
    setCapturedPhoto(null);
    setErrorMsg(null);
    onClose();
  };

  // File fallback upload
  const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onCapture(reader.result);
          handleClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/90 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Hidden File Fallback Input */}
      <input
        type="file"
        ref={fileFallbackRef}
        accept="image/png,image/jpeg,image/webp,image/*"
        onChange={handleFileFallback}
        className="hidden"
      />

      {/* Modal Card */}
      <div className="relative bg-plum-dark border border-champagne/40 rounded-3xl max-w-lg w-full shadow-2xl p-6 text-ivory z-10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-champagne/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-champagne/10 border border-champagne/30 flex items-center justify-center">
              <Camera className="w-4 h-4 text-champagne" />
            </div>
            <div>
              <span className="text-[10px] font-brand uppercase tracking-wider text-champagne block font-semibold">
                Atelier AI Live Camera
              </span>
              <h3 className="font-editorial text-xl font-bold uppercase tracking-tight">{title}</h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-ivory/70 hover:text-champagne transition-colors rounded-lg hover:bg-white/5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Live Feed / Review / Error Screen */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-charcoal border border-champagne/30 shadow-inner flex items-center justify-center">
          {/* STATE 1: Error Screen */}
          {status === 'error' && (
            <div className="p-6 text-center space-y-4 max-w-sm">
              <div className="w-14 h-14 rounded-full bg-burgundy/80 border border-champagne/40 text-champagne mx-auto flex items-center justify-center shadow-lg">
                <AlertCircle className="w-7 h-7 text-champagne" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-editorial uppercase font-bold text-ivory">Camera Unavailable</h4>
                <p className="text-xs text-rose/90 font-medium leading-relaxed">{errorMsg}</p>
              </div>

              <div className="flex flex-col gap-2.5 w-full pt-2">
                <button
                  type="button"
                  onClick={() => fileFallbackRef.current?.click()}
                  className="w-full bg-champagne text-plum font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-gold-subtle flex items-center justify-center gap-2 hover:bg-champagne-light transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo from Device</span>
                </button>
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="w-full bg-plum-dark/90 text-champagne border border-champagne/30 font-semibold text-xs uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-burgundy transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Start Camera / Retry Permission</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: Captured Snapshot Review */}
          {status === 'captured' && capturedPhoto && (
            <div className="relative w-full h-full">
              <img
                src={capturedPhoto}
                alt="Captured Portrait"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-plum-dark/90 px-3 py-1 rounded-full border border-champagne/30 text-[10px] font-brand uppercase tracking-wider text-champagne flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Snapshot Captured</span>
              </div>
            </div>
          )}

          {/* STATE 3: Idle / Ready to Start Screen */}
          {status === 'idle' && (
            <div className="p-6 text-center space-y-4 max-w-xs">
              <div className="w-14 h-14 rounded-full bg-plum border border-champagne/30 text-champagne mx-auto flex items-center justify-center shadow-md">
                <Camera className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-editorial uppercase font-bold text-ivory">Webcam Ready</h4>
                <p className="text-xs text-ivory/70 leading-relaxed">
                  Click <strong>Start Camera</strong> to connect your live video feed and take a portrait.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2 w-full">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="w-full bg-champagne text-plum font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-gold-subtle flex items-center justify-center gap-2 hover:bg-champagne-light transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileFallbackRef.current?.click()}
                  className="w-full bg-plum-dark/90 text-champagne border border-champagne/30 font-semibold text-xs uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-burgundy transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo Instead</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE 4: Starting or Streaming Video Feed */}
          {(status === 'starting' || status === 'streaming') && (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {/* Spinner while requesting permission / initializing sensor */}
              {status === 'starting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-charcoal/90 z-20 gap-3">
                  <RotateCw className="w-7 h-7 text-champagne animate-spin" />
                  <div className="text-center px-4">
                    <span className="text-[11px] font-brand uppercase tracking-wider text-champagne block font-semibold">
                      Requesting Camera Access...
                    </span>
                    <span className="text-[10px] text-ivory/60 mt-1 block">
                      Please click <strong>Allow</strong> in your browser prompt
                    </span>
                  </div>
                </div>
              )}

              {/* HTML5 Video Element */}
              <video
                ref={handleVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
              />

              {/* Live Badge */}
              <div className="absolute top-3 left-3 bg-plum-dark/85 backdrop-blur-sm px-2.5 py-1 rounded-full border border-champagne/30 text-[9px] font-brand uppercase tracking-wider text-champagne flex items-center gap-1.5 shadow-md pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Feed</span>
              </div>

              {/* Portrait Framing Guide Oval */}
              <div className="absolute inset-x-10 inset-y-12 border-2 border-dashed border-champagne/50 rounded-full pointer-events-none flex items-center justify-center">
                <span className="text-[9px] uppercase tracking-widest text-champagne font-brand bg-plum-dark/90 px-2.5 py-0.5 rounded-full -mt-28 border border-champagne/30 shadow-md">
                  Center Face & Shoulders Here
                </span>
              </div>

              {/* Camera Flip button */}
              <button
                type="button"
                onClick={toggleFacingMode}
                className="absolute top-3 right-3 p-2.5 rounded-full bg-plum-dark/85 hover:bg-burgundy text-champagne border border-champagne/30 transition-all shadow-lg hover:scale-105 active:scale-95"
                title="Switch Camera (Front / Back)"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Action Controls / Bottom Strip */}
        <div className="pt-2">
          {/* Controls when photo is captured */}
          {status === 'captured' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="bg-plum hover:bg-burgundy text-champagne border border-champagne/30 font-semibold text-xs uppercase tracking-wider py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retake Photo</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="bg-champagne hover:bg-champagne-light text-plum font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-gold-subtle flex items-center justify-center gap-2 transition-all hover:scale-102"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Photo</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => fileFallbackRef.current?.click()}
                className="w-full text-center text-ivory/60 hover:text-champagne text-[11px] py-1 transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3 h-3" />
                <span>Or upload a different photo from device</span>
              </button>
            </div>
          )}

          {/* Controls when camera is streaming */}
          {status === 'streaming' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleCapture}
                  className="bg-champagne hover:bg-champagne-light text-plum font-bold text-xs uppercase tracking-wider py-3.5 px-8 rounded-2xl shadow-gold-glow flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 border-2 border-champagne-light"
                  aria-label="Capture Photo"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-plum flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-plum" />
                  </div>
                  <span>Capture Photo</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-ivory/60 px-1 pt-1">
                <button
                  type="button"
                  onClick={() => fileFallbackRef.current?.click()}
                  className="hover:text-champagne flex items-center gap-1 transition-colors"
                >
                  <Upload className="w-3 h-3 text-champagne" />
                  <span>Upload Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setStatus('idle');
                  }}
                  className="hover:text-rose flex items-center gap-1 transition-colors"
                >
                  <VideoOff className="w-3 h-3" />
                  <span>Stop Camera</span>
                </button>
              </div>
            </div>
          )}

          {/* Controls when camera is starting */}
          {status === 'starting' && (
            <div className="flex items-center justify-between text-xs text-ivory/70 px-2">
              <span className="flex items-center gap-2 text-champagne">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Connecting webcam...</span>
              </span>
              <button
                type="button"
                onClick={() => fileFallbackRef.current?.click()}
                className="text-champagne hover:underline flex items-center gap-1 text-[11px]"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Instead</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
