import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCw, Check, AlertCircle, Upload } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
  title?: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Capture Your Portrait',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileFallbackRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Start webcam stream
  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    setIsLoading(true);
    setErrorMsg(null);
    setCapturedPhoto(null);

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser. Please use the upload option.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
          audio: false,
        });
      } catch (constraintErr) {
        // Fallback for mobile and desktop hardware that does not support ideal square constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode },
          audio: false,
        }).catch(() => {
          return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsLoading(false);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setIsLoading(false);
      let message = 'Unable to access your camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera permissions in your browser, or upload a photo directly.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera found on this device. You can upload a photo from your device below.';
      } else if (err.message) {
        message = err.message;
      }
      setErrorMsg(message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      // Cleanup on modal close
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCapturedPhoto(null);
      setErrorMsg(null);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, facingMode]);

  // Flip between front and rear cameras
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
  };

  // Capture snapshot from video canvas
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

    // If facing user, mirror image horizontally so it looks natural
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedPhoto(dataUrl);

    // Stop video tracks while reviewing
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera(facingMode);
  };

  // Confirm photo and send to parent
  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  // File fallback upload
  const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onCapture(reader.result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-plum-dark border border-champagne/40 rounded-3xl max-w-lg w-full shadow-2xl p-6 text-ivory z-10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-champagne/20">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-champagne animate-pulse" />
            <div>
              <span className="text-[10px] font-brand uppercase tracking-wider text-champagne block">
                Atelier AI Live Camera
              </span>
              <h3 className="font-editorial text-xl font-bold uppercase">{title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ivory/70 hover:text-champagne transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Preview */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-charcoal border border-champagne/30 shadow-inner flex items-center justify-center">
          {errorMsg ? (
            <div className="p-6 text-center space-y-4 max-w-xs">
              <div className="w-12 h-12 rounded-full bg-burgundy/80 border border-champagne/40 text-champagne mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-rose font-medium leading-relaxed">{errorMsg}</p>
              <input
                type="file"
                ref={fileFallbackRef}
                accept="image/*"
                onChange={handleFileFallback}
                className="hidden"
              />
              <div className="flex flex-col gap-2 w-full">
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
                  <span>Retry Camera Permission</span>
                </button>
              </div>
            </div>
          ) : capturedPhoto ? (
            <div className="relative w-full h-full">
              <img
                src={capturedPhoto}
                alt="Captured Portrait"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-plum-dark/90 px-3 py-1 rounded-full border border-champagne/30 text-[10px] font-brand uppercase tracking-wider text-champagne">
                Snapshot Preview
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-charcoal/80 z-10 gap-2">
                  <RotateCw className="w-6 h-6 text-champagne animate-spin" />
                  <span className="text-[10px] font-brand uppercase tracking-wider text-champagne">
                    Initializing Camera Sensor...
                  </span>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
              />

              {/* Portrait Framing Guide Oval */}
              <div className="absolute inset-x-10 inset-y-12 border-2 border-dashed border-champagne/40 rounded-full pointer-events-none flex items-center justify-center opacity-60">
                <span className="text-[9px] uppercase tracking-widest text-champagne font-brand bg-plum-dark/80 px-2 py-0.5 rounded-full -mt-24">
                  Center Face Here
                </span>
              </div>

              {/* Camera Flip button */}
              <button
                onClick={toggleFacingMode}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-plum-dark/80 hover:bg-burgundy text-champagne border border-champagne/30 transition-colors shadow-lg"
                title="Switch Camera (Front/Back)"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="pt-2">
          {capturedPhoto ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRetake}
                className="bg-plum hover:bg-burgundy text-champagne border border-champagne/30 font-semibold text-xs uppercase tracking-wider py-3 rounded-xl transition-all"
              >
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className="bg-champagne hover:bg-champagne-light text-plum font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-gold-subtle flex items-center justify-center gap-2 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Use This Portrait</span>
              </button>
            </div>
          ) : (
            !errorMsg && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleCapture}
                  disabled={isLoading}
                  className="w-16 h-16 rounded-full bg-champagne hover:bg-champagne-light text-plum border-4 border-plum-dark p-3 flex items-center justify-center shadow-gold-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  aria-label="Capture Photo"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-plum flex items-center justify-center">
                    <Camera className="w-5 h-5 text-plum" />
                  </div>
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
