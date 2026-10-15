import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Camera, X, RotateCw, Check, AlertCircle, Upload, VideoOff, CheckCircle2, Info } from 'lucide-react';

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
  const mountTimeRef = useRef<number>(0);

  const [status, setStatus] = useState<CameraStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [streamResolution, setStreamResolution] = useState<{ width: number; height: number } | null>(null);

  // Stop all active tracks and release camera hardware
  const stopCamera = useCallback(() => {
    console.log('[CameraModal] Stopping camera stream & releasing hardware...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('[CameraModal] Error stopping media track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamResolution(null);
  }, []);

  // Safely attach stream to video element without triggering double-load AbortError
  const attachStreamToVideo = useCallback((videoElement: HTMLVideoElement | null, stream: MediaStream | null) => {
    if (!videoElement || !stream) return;
    try {
      if (videoElement.srcObject !== stream) {
        console.log('[CameraModal] Attaching MediaStream to video element...');
        videoElement.srcObject = stream;
        videoElement.muted = true;
        videoElement.playsInline = true;
        videoElement.setAttribute('playsinline', 'true');
        videoElement.setAttribute('muted', 'true');
        
        videoElement.onloadedmetadata = () => {
          console.log('[CameraModal] Video metadata loaded:', videoElement.videoWidth, 'x', videoElement.videoHeight);
          setStreamResolution({
            width: videoElement.videoWidth,
            height: videoElement.videoHeight,
          });
          videoElement.play().catch((playErr) => {
            console.warn('[CameraModal] Autoplay deferral caught:', playErr);
          });
        };

        videoElement.play().catch((playErr) => {
          console.warn('[CameraModal] Initial video.play caught:', playErr);
        });
      }
    } catch (err) {
      console.warn('[CameraModal] Error assigning srcObject:', err);
    }
  }, []);

  // Ref callback to immediately attach stream when video mounts in DOM
  const handleVideoRef = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && streamRef.current && (status === 'streaming' || status === 'starting')) {
      attachStreamToVideo(element, streamRef.current);
    }
  }, [status, attachStreamToVideo]);

  // Start webcam stream
  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    console.log('[CameraModal] startCamera invoked with mode:', mode);
    
    // 1. Verify Secure Context (HTTPS or localhost required by modern browsers)
    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      console.warn('[CameraModal] Non-secure context detected (HTTPS required).');
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
      console.warn('[CameraModal] navigator.mediaDevices.getUserMedia is unavailable.');
      setStatus('error');
      setErrorMsg(
        'Camera access is not supported by your browser or platform. Please use the Upload Photo option below.'
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
      console.log('[CameraModal] Requesting mediaDevices.getUserMedia...');

      try {
        // Primary request: High-resolution portrait feed
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        });
        console.log('[CameraModal] Primary getUserMedia succeeded.');
      } catch (constraintErr) {
        console.warn('[CameraModal] Ideal constraints failed, trying facingMode fallback:', constraintErr);
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode },
            audio: false,
          });
          console.log('[CameraModal] facingMode fallback succeeded.');
        } catch (modeErr) {
          console.warn('[CameraModal] facingMode failed, trying basic video: true:', modeErr);
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          console.log('[CameraModal] basic video: true succeeded.');
        }
      }

      streamRef.current = stream;
      setStatus('streaming');

      // Attach to video element if already rendered
      if (videoRef.current) {
        attachStreamToVideo(videoRef.current, stream);
      }
    } catch (err: any) {
      console.error('[CameraModal] Camera getUserMedia error:', err);
      stopCamera();
      setStatus('error');

      let message = 'Unable to access your camera.';
      const errName = err?.name || '';

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        message =
          'Camera permission was denied. Please allow camera access in your browser address bar (click the lock or camera icon), or upload a photo directly.';
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
      mountTimeRef.current = Date.now();
      console.log('[CameraModal] Modal opened at timestamp:', mountTimeRef.current);
      // Auto-initiate camera stream
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
    console.log('[CameraModal] handleCapture triggered.');
    const video = videoRef.current;
    if (!video) {
      console.warn('[CameraModal] Cannot capture: video element is null.');
      return;
    }

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror horizontally for front-facing user camera (natural portrait mirror)
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    console.log('[CameraModal] Snapshot captured, image length:', dataUrl.length);
    setCapturedPhoto(dataUrl);
    setStatus('captured');

    // Turn off camera tracks while reviewing snapshot
    stopCamera();
  };

  // Retake photo: discard snapshot and restart camera
  const handleRetake = () => {
    console.log('[CameraModal] handleRetake triggered.');
    setCapturedPhoto(null);
    startCamera(facingMode);
  };

  // Confirm photo and send to parent workflow
  const handleConfirm = () => {
    console.log('[CameraModal] handleConfirm triggered.');
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      handleClose();
    }
  };

  // Safe close handler that stops tracks
  const handleClose = () => {
    console.log('[CameraModal] handleClose triggered.');
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
      console.log('[CameraModal] File selected via fallback upload:', file.name);
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

  // Use createPortal to mount directly into document.body, ensuring no parent overflow or stacking context traps the modal
  return createPortal(
    <div
      id="camera-modal-portal"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        // Guard: Prevent the click that opened the modal from immediately closing it
        if (Date.now() - mountTimeRef.current < 400) {
          return;
        }
        // Only close if user clicked directly on the dark backdrop, not on the modal card
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Hidden File Fallback Input */}
      <input
        type="file"
        ref={fileFallbackRef}
        accept="image/png,image/jpeg,image/webp,image/*"
        onChange={handleFileFallback}
        className="hidden"
      />

      {/* Modal Card */}
      <div
        className="relative bg-plum-dark border border-champagne/40 rounded-3xl max-w-xl w-full shadow-2xl p-5 sm:p-6 text-ivory z-10 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
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
              <h3 className="font-editorial text-lg sm:text-xl font-bold uppercase tracking-tight">{title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-ivory/70 hover:text-champagne transition-colors rounded-lg hover:bg-white/5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clear Full-Body Instructions Banner */}
        <div className="bg-plum/90 border border-champagne/30 rounded-xl px-3.5 py-2.5 flex items-start gap-2.5 text-xs shadow-md">
          <Info className="w-4 h-4 text-champagne flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-[11px] leading-snug text-ivory/90">
            <span className="text-champagne font-semibold font-brand uppercase tracking-wider block">
              Full-Body Fit Guidance:
            </span>
            <span>
              Stand <strong>6–8 feet back</strong> with your phone or camera upright so your <strong>head, shoulders, and feet</strong> are all completely visible before capturing.
            </span>
          </div>
        </div>

        {/* Viewport / Live Feed / Review / Error Screen - object-contain ensures ZERO cropping of head or feet */}
        <div className="relative w-full h-[52vh] min-h-[380px] max-h-[540px] rounded-2xl overflow-hidden bg-black border border-champagne/30 shadow-inner flex items-center justify-center">
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

          {/* STATE 2: Captured Snapshot Review - uncropped full image preview with object-contain */}
          {status === 'captured' && capturedPhoto && (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedPhoto}
                alt="Captured Portrait"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-plum-dark/90 px-3 py-1 rounded-full border border-champagne/30 text-[10px] font-brand uppercase tracking-wider text-champagne flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Full-Frame Uncropped Preview</span>
              </div>
              <div className="absolute bottom-3 inset-x-4 bg-plum-dark/90 backdrop-blur-sm border border-champagne/30 rounded-xl px-3 py-1.5 text-center text-[10px] text-ivory/90 font-light pointer-events-none">
                Verify your head and full body length are complete before confirming.
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
                  Click <strong>Start Camera</strong> to connect your live video feed and take a full-body portrait.
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

              {/* HTML5 Video Element with object-contain to PRESERVE full camera frame without cropping */}
              <video
                ref={handleVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-contain ${facingMode === 'user' ? '-scale-x-100' : ''}`}
              />

              {/* Live Badge */}
              <div className="absolute top-3 left-3 bg-plum-dark/85 backdrop-blur-sm px-2.5 py-1 rounded-full border border-champagne/30 text-[9px] font-brand uppercase tracking-wider text-champagne flex items-center gap-1.5 shadow-md pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Feed</span>
                {streamResolution && (
                  <span className="text-ivory/50 text-[8px] font-mono ml-1">
                    ({streamResolution.width}x{streamResolution.height})
                  </span>
                )}
              </div>

              {/* Full-Body Portrait Framing Guide (with generous clearance for head and feet) */}
              <div className="absolute inset-3 sm:inset-5 border-2 border-dashed border-champagne/40 rounded-2xl pointer-events-none flex flex-col justify-between items-center p-3 select-none">
                {/* Top: Headroom clearance & face guide */}
                <div className="w-full flex flex-col items-center gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-champagne font-brand bg-plum-dark/90 px-2.5 py-0.5 rounded-full border border-champagne/30 shadow-md">
                    ↑ Headroom • Keep top of head below line
                  </span>
                  <div className="w-20 h-24 rounded-full border border-dashed border-champagne/50 flex items-center justify-center bg-plum/20">
                    <span className="text-[8px] uppercase tracking-wider text-champagne-light/80 font-brand">Face Zone</span>
                  </div>
                </div>

                {/* Center: Torso & Garment Silhouette */}
                <div className="w-44 sm:w-52 py-1.5 border-y border-dashed border-champagne/30 flex items-center justify-center bg-plum/10 rounded">
                  <span className="text-[8px] uppercase tracking-wider text-champagne/80 font-brand text-center">
                    Torso & Garment Drape
                  </span>
                </div>

                {/* Bottom: Hemline & Feet clearance */}
                <div className="w-full flex flex-col items-center gap-1">
                  <div className="w-48 h-6 border-b-2 border-dashed border-champagne/60 flex items-center justify-center bg-plum/20">
                    <span className="text-[8px] uppercase tracking-wider text-champagne-light/80 font-brand">Full Skirt & Shoes</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-champagne font-brand bg-plum-dark/90 px-2.5 py-0.5 rounded-full border border-champagne/30 shadow-md">
                    ↓ Ground • Keep feet visible above line
                  </span>
                </div>
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
    </div>,
    document.body
  );
};
