import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Camera,
  Sparkles,
  Check,
  RotateCw,
  Image as ImageIcon,
  Clock,
  User,
  Type,
  FastForward,
  Wand2,
  RefreshCw,
  Upload,
  UploadCloud,
  AlertCircle,
  Sliders,
  ZoomIn,
  ZoomOut,
  Palette,
  Film,
  CheckCircle2,
} from 'lucide-react';
import {
  CURATED_POLAROID_PRESETS,
  WASHI_TAPE_OPTIONS,
  VINTAGE_FILTERS,
  CuratedPolaroidPreset,
  WashiTapeOption,
  VintageFilterPreset,
  getWashiTapeOption,
  getFilterPreset,
  FILM_GRAIN_SVG_DATA,
} from '../data/curatedPolaroids';
import { CorkboardNote } from '../types';
import {
  playCameraShutterSound,
  playPinTackSound,
  playPaperRustleSound,
  playMechanicalClick,
  playWinFanfare,
  playHoverSound,
} from '../utils/audio';

type PhotoSourceMode = 'presets' | 'camera' | 'upload';

interface AddPolaroidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPolaroid: (note: Omit<CorkboardNote, 'id' | 'createdAt' | 'reactions'>) => void;
  defaultCoordinates?: { x: number; y: number } | null;
}

export const AddPolaroidModal: React.FC<AddPolaroidModalProps> = ({
  isOpen,
  onClose,
  onAddPolaroid,
  defaultCoordinates,
}) => {
  // Source Mode: Presets, Live Camera, or File Upload
  const [sourceMode, setSourceMode] = useState<PhotoSourceMode>('presets');

  // Curated Preset Selection
  const [selectedPreset, setSelectedPreset] = useState<CuratedPolaroidPreset>(
    CURATED_POLAROID_PRESETS[0]
  );
  const [selectedFilterId, setSelectedFilterId] = useState<string>('warm-amber');
  const [selectedWashi, setSelectedWashi] = useState<string>(
    CURATED_POLAROID_PRESETS[0].defaultWashi
  );
  const [customTitle, setCustomTitle] = useState<string>(CURATED_POLAROID_PRESETS[0].title);
  const [customCaption, setCustomCaption] = useState<string>(CURATED_POLAROID_PRESETS[0].desc);
  const [customDate, setCustomDate] = useState<string>(CURATED_POLAROID_PRESETS[0].date);
  const [photographer, setPhotographer] = useState<string>('Cozy Wanderer');
  const [rotationAngle, setRotationAngle] = useState<number>(-1.5);

  // Live Camera states
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [isCameraStarting, setIsCameraStarting] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [showShutterFlash, setShowShutterFlash] = useState<boolean>(false);
  const [viewfinderFlash, setViewfinderFlash] = useState<boolean>(false);

  // Uploaded Image states
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [photoZoom, setPhotoZoom] = useState<number>(1);
  const [photoPan, setPhotoPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [isPanningImage, setIsPanningImage] = useState<boolean>(false);
  const panStartRef = useRef<{ startX: number; startY: number; origX: number; origY: number }>({
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  // Instant-film realistic developing state
  const [isDeveloping, setIsDeveloping] = useState<boolean>(false);
  const [developProgress, setDevelopProgress] = useState<number>(0); // 0 to 100

  // Mobile keyboard occlusion & view management
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const developTimerRef = useRef<number | null>(null);
  const devProgressAnimRef = useRef<number | null>(null);

  const activeFilter: VintageFilterPreset = getFilterPreset(selectedFilterId);
  const currentWashiOption: WashiTapeOption = getWashiTapeOption(selectedWashi);

  // Stop camera tracks cleanly
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start camera stream
  const startCameraStream = useCallback(
    async (facing: 'user' | 'environment') => {
      stopCameraStream();
      setCameraError(null);
      setIsCameraStarting(true);

      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          'Camera access is not supported by this browser or connection. You can upload an image or choose a Curated Scene.'
        );
        setIsCameraStarting(false);
        return;
      }

      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: facing,
              width: { ideal: 1080 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
        } catch {
          // Fallback to basic video constraint if exact facingMode constraint is unsupported
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setIsCameraStarting(false);
      } catch (err: unknown) {
        setIsCameraStarting(false);
        const error = err as Error;
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setCameraError(
            'Camera permission was denied. Please allow camera permissions in your browser, or upload an image.'
          );
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setCameraError('No camera found on this device. You can upload a photo instead.');
        } else {
          setCameraError('Unable to open camera stream. Please upload an image or select a curated scene.');
        }
      }
    },
    [stopCameraStream]
  );

  // Reset or initialize when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsDeveloping(false);
      setDevelopProgress(0);
      setShowShutterFlash(false);
      setViewfinderFlash(false);
      setIsInputFocused(false);
      setCameraError(null);

      // If opening in camera mode, start stream
      if (sourceMode === 'camera' && !capturedPhotoUrl) {
        startCameraStream(cameraFacingMode);
      }
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
      if (developTimerRef.current) clearTimeout(developTimerRef.current);
      if (devProgressAnimRef.current) cancelAnimationFrame(devProgressAnimRef.current);
    };
  }, [isOpen, sourceMode, cameraFacingMode, capturedPhotoUrl, startCameraStream, stopCameraStream]);

  // Handle switching tabs
  const handleTabChange = (mode: PhotoSourceMode) => {
    if (isDeveloping) return;
    playMechanicalClick('toggle', 0.08);
    setSourceMode(mode);

    if (mode === 'camera') {
      if (!capturedPhotoUrl) {
        startCameraStream(cameraFacingMode);
      }
    } else {
      stopCameraStream();
    }
  };

  // Flip Camera between front & rear
  const handleFlipCamera = () => {
    if (isDeveloping) return;
    playMechanicalClick('toggle', 0.08);
    const newFacing = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(newFacing);
    setCapturedPhotoUrl(null);
    startCameraStream(newFacing);
  };

  // Snap photo from live camera
  const handleSnapPhoto = () => {
    if (isDeveloping || !videoRef.current) return;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    // Viewfinder Flash & Audio Feedback
    setViewfinderFlash(true);
    playCameraShutterSound(0.14);

    setTimeout(() => {
      setViewfinderFlash(false);
    }, 280);

    // Capture square frame to canvas
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = 720;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const sx = (video.videoWidth - size) / 2;
      const sy = (video.videoHeight - size) / 2;
      // Mirror if user front camera
      if (cameraFacingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, sx, sy, size, size, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedPhotoUrl(dataUrl);
      stopCameraStream();

      // If user hasn't typed a title yet, set a friendly snapshot title
      if (!customTitle || customTitle === selectedPreset.title) {
        setCustomTitle('Candid Snapshot');
      }
    }
  };

  // Retake photo
  const handleRetakePhoto = () => {
    if (isDeveloping) return;
    playMechanicalClick('subtle', 0.08);
    setCapturedPhotoUrl(null);
    startCameraStream(cameraFacingMode);
  };

  // File Upload Handling
  const processUploadedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setUploadedImageUrl(result);
        setPhotoZoom(1);
        setPhotoPan({ x: 0, y: 0 });
        playPaperRustleSound('drop', 0.08);
        if (!customTitle || customTitle === selectedPreset.title) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').slice(0, 24);
          setCustomTitle(cleanName || 'Cozy Memory');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Panning inside uploaded image square
  const handlePanStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!uploadedImageUrl) return;
    setIsPanningImage(true);
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: photoPan.x,
      origY: photoPan.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePanMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanningImage) return;
    const dx = e.clientX - panStartRef.current.startX;
    const dy = e.clientY - panStartRef.current.startY;
    const maxOffset = 140 * (photoZoom - 0.7);
    setPhotoPan({
      x: Math.max(-maxOffset, Math.min(maxOffset, panStartRef.current.origX + dx)),
      y: Math.max(-maxOffset, Math.min(maxOffset, panStartRef.current.origY + dy)),
    });
  };

  const handlePanEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanningImage) {
      setIsPanningImage(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Presets & Customization
  const handleSelectPreset = (preset: CuratedPolaroidPreset) => {
    if (isDeveloping) return;
    setSelectedPreset(preset);
    setCustomTitle(preset.title);
    setCustomCaption(preset.desc);
    setCustomDate(preset.date);
    setSelectedWashi(preset.defaultWashi);
    playPaperRustleSound('lift', 0.08);
  };

  const handleSelectFilter = (filter: VintageFilterPreset) => {
    if (isDeveloping) return;
    setSelectedFilterId(filter.id);
    playMechanicalClick('toggle', 0.06);
  };

  const handleSelectWashi = (washi: WashiTapeOption) => {
    if (isDeveloping) return;
    setSelectedWashi(washi.color);
    playPaperRustleSound('drop', 0.06);
  };

  const cycleRotation = () => {
    if (isDeveloping) return;
    playMechanicalClick('toggle', 0.08);
    const rotations = [-2, -1, 0, 1, 2];
    const currentIndex = rotations.indexOf(rotationAngle);
    const nextIndex = (currentIndex + 1) % rotations.length;
    setRotationAngle(rotations[nextIndex]);
  };

  // Mobile virtual keyboard scrolling
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsInputFocused(true);
    const target = e.currentTarget;
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  // Bake final photo onto canvas with filter, crop, zoom, and grain
  const generateFinalPhotoData = async (): Promise<string | null> => {
    let sourceDataUrl: string | null = null;
    let zoom = 1;
    let panX = 0;
    let panY = 0;

    if (sourceMode === 'camera' && capturedPhotoUrl) {
      sourceDataUrl = capturedPhotoUrl;
    } else if (sourceMode === 'upload' && uploadedImageUrl) {
      sourceDataUrl = uploadedImageUrl;
      zoom = photoZoom;
      panX = photoPan.x;
      panY = photoPan.y;
    } else {
      return null;
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const outputSize = 640;
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(sourceDataUrl);
          return;
        }

        // Fill background
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, outputSize, outputSize);

        // Center square crop
        const sw = img.naturalWidth;
        const sh = img.naturalHeight;
        const minDim = Math.min(sw, sh);
        const sx = (sw - minDim) / 2;
        const sy = (sh - minDim) / 2;

        ctx.save();
        // Apply filter preset
        if (activeFilter.canvasFilter && activeFilter.canvasFilter !== 'none') {
          ctx.filter = activeFilter.canvasFilter;
        }

        // Apply zoom and pan
        ctx.translate(outputSize / 2, outputSize / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-outputSize / 2 + panX * (outputSize / 240), -outputSize / 2 + panY * (outputSize / 240));

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, outputSize, outputSize);
        ctx.restore();

        // If soft bloom filter, apply dreamy bloom pass
        if (activeFilter.hasBloom) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          ctx.globalAlpha = 0.35;
          ctx.filter = 'blur(12px) brightness(115%)';
          ctx.drawImage(canvas, 0, 0);
          ctx.restore();
        }

        // If cozy grain filter, draw fine analog noise
        if (activeFilter.hasGrain) {
          try {
            const imgData = ctx.getImageData(0, 0, outputSize, outputSize);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
              const noise = (Math.random() - 0.5) * 26;
              data[i] = Math.min(255, Math.max(0, data[i] + noise));
              data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
              data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
            }
            ctx.putImageData(imgData, 0, 0);
          } catch {}
        }

        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => resolve(sourceDataUrl);
      img.src = sourceDataUrl!;
    });
  };

  // Finalize Submission
  const finalizeSubmission = async () => {
    playPinTackSound(0.12);
    playWinFanfare();

    let finalImageUrl: string | undefined = undefined;
    const hasCustomPhoto =
      (sourceMode === 'camera' && Boolean(capturedPhotoUrl)) ||
      (sourceMode === 'upload' && Boolean(uploadedImageUrl));

    if (hasCustomPhoto) {
      const baked = await generateFinalPhotoData();
      if (baked) finalImageUrl = baked;
    }

    onAddPolaroid({
      name: photographer.trim() || 'Cozy Wanderer',
      message: customCaption.trim() || selectedPreset.desc,
      color: '#fdfbf7', // Classic warm polaroid photo paper
      fontClass: 'font-hand',
      emoji: hasCustomPhoto ? '📸' : selectedPreset.icon,
      isPolaroid: true,
      polaroidTitle: customTitle.trim() || (hasCustomPhoto ? 'Cozy Snapshot' : selectedPreset.title),
      polaroidPhoto: hasCustomPhoto ? '📸' : selectedPreset.icon,
      polaroidGradient: selectedPreset.gradient,
      polaroidDate: customDate.trim() || 'TODAY',
      washiTapeColor: selectedWashi,
      polaroidImageUrl: finalImageUrl,
      polaroidFilter: selectedFilterId,
      category: 'polaroid',
      rotation: rotationAngle,
      x: defaultCoordinates?.x,
      y: defaultCoordinates?.y,
    });

    stopCameraStream();
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCaption.trim() || !customTitle.trim() || isDeveloping) return;

    // Trigger instant camera shutter and flash
    setShowShutterFlash(true);
    playCameraShutterSound(0.14);

    setTimeout(() => {
      setShowShutterFlash(false);
    }, 320);

    // Start 2.5-second realistic instant film developing animation
    setIsDeveloping(true);
    setDevelopProgress(0);

    const startTime = performance.now();
    const durationMs = 2500;

    const updateDeveloping = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      setDevelopProgress(Math.round(progress * 100));

      if (progress < 1) {
        devProgressAnimRef.current = requestAnimationFrame(updateDeveloping);
      } else {
        finalizeSubmission();
      }
    };

    devProgressAnimRef.current = requestAnimationFrame(updateDeveloping);
  };

  const handleSkipDeveloping = () => {
    if (devProgressAnimRef.current) cancelAnimationFrame(devProgressAnimRef.current);
    finalizeSubmission();
  };

  // Film developing visual filters
  const filmBlur = Math.max(0, 6 * (1 - developProgress / 100));
  const filmBrightness = 0.25 + 0.75 * (developProgress / 100);
  const filmContrast = 0.5 + 0.5 * (developProgress / 100);
  const filmSaturate = 0.3 + 0.7 * (developProgress / 100);
  const chemicalMilkyOpacity = Math.max(0, 0.95 - (developProgress / 100) * 0.95);

  // Active custom photo for preview
  const currentPhotoPreviewUrl =
    sourceMode === 'camera' ? capturedPhotoUrl : sourceMode === 'upload' ? uploadedImageUrl : null;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="polaroid-studio-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 animate-fade-in"
    >
      {/* Full-screen Shutter Flash Burst Effect */}
      {showShutterFlash && (
        <div className="fixed inset-0 bg-white z-[999] pointer-events-none transition-opacity duration-300 opacity-90" />
      )}

      {/* Main Studio Modal Container */}
      <div className="bg-slate-900 border-t-2 md:border-2 border-amber-400/70 rounded-t-3xl md:rounded-3xl w-full md:max-w-4xl max-h-[96vh] md:max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative">
        {/* Header Bar */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center text-xl shadow-inner shrink-0">
              📸
            </div>
            <div>
              <h2
                id="polaroid-studio-title"
                className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2"
              >
                <span>Curated Polaroid Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 hidden sm:inline-block">
                  Camera & Filters Edition
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                Take a photo, upload an image, apply vintage analog filters, and pin a tactile memory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Tilt Rotation Toggle */}
            <button
              type="button"
              onClick={cycleRotation}
              disabled={isDeveloping}
              title={`Polaroid Tilt: ${rotationAngle}° (click to cycle)`}
              className="min-h-[48px] min-w-[48px] px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 text-xs font-mono flex items-center gap-1.5 active:scale-[0.96] transition-transform cursor-pointer"
            >
              <RotateCw className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold">
                {rotationAngle > 0 ? `+${rotationAngle}°` : `${rotationAngle}°`}
              </span>
            </button>

            {/* Close Button with generous touch hitbox */}
            <button
              type="button"
              onClick={() => {
                playMechanicalClick('toggle', 0.08);
                stopCameraStream();
                onClose();
              }}
              disabled={isDeveloping}
              aria-label="Close Polaroid Studio"
              className="min-h-[48px] min-w-[48px] text-slate-400 hover:text-white p-2.5 rounded-xl hover:bg-slate-800 transition active:scale-[0.96] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-hidden flex flex-col md:grid md:grid-cols-12 bg-[#0c0e17]">
          {/* ========================================================================= */}
          {/* MOBILE STICKY PREVIEW BAR (Shown on screens < md)                         */}
          {/* ========================================================================= */}
          <div
            ref={previewRef}
            className={`md:hidden sticky top-0 z-20 cork-texture p-3 border-b-2 border-amber-950/70 shadow-xl flex flex-col items-center justify-center transition-all duration-300 ${
              isInputFocused ? 'max-h-[145px] py-1.5' : 'max-h-[225px]'
            }`}
          >
            {/* Live tactile mini card header */}
            <div className="w-full max-w-[280px] flex items-center justify-between mb-1 z-10 px-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-100 bg-amber-950/90 px-2 py-0.5 rounded border border-amber-800/60 shadow-sm flex items-center gap-1">
                <span>Tactile Preview</span>
                {isDeveloping && (
                  <span className="text-amber-400 animate-pulse font-bold">
                    • Developing {developProgress}%
                  </span>
                )}
              </span>
              <span className="text-[9px] font-mono text-amber-200/90 font-medium flex items-center gap-1">
                <span>{activeFilter.name}</span>
                <span>•</span>
                <span>{currentWashiOption.name}</span>
              </span>
            </div>

            {/* Mobile Polaroid Card View */}
            <div
              style={{
                transform: `rotate(${rotationAngle}deg) scale(${isInputFocused ? 0.72 : 0.86})`,
                transformOrigin: 'top center',
              }}
              className="bg-[#fdfbf7] p-2.5 pb-3 rounded-sm shadow-[0_12px_28px_rgba(0,0,0,0.65)] text-slate-900 relative transition-transform duration-200 border border-black/10 select-none w-[240px]"
            >
              {/* Textured Washi Tape Strip */}
              <div
                style={{
                  backgroundColor: currentWashiOption.color,
                  backgroundImage: currentWashiOption.patternCss,
                  backgroundSize: currentWashiOption.backgroundSize,
                }}
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-5 washi-tape -rotate-2 z-20 pointer-events-none rounded-[1px] shadow-sm"
              />

              {/* Pushpin at Top Left */}
              <div className="absolute -top-2 left-2 z-30 pointer-events-none">
                <div className="pushpin-head bg-red-600 shadow-md" />
              </div>

              {/* Photo Area */}
              <div className="w-full h-24 rounded-sm bg-slate-950 relative overflow-hidden shadow-inner border border-black/10">
                {/* Developing Overlays */}
                {isDeveloping && (
                  <>
                    <div
                      style={{ opacity: chemicalMilkyOpacity }}
                      className="absolute inset-0 bg-slate-950/90 pointer-events-none z-20 backdrop-blur-[2px] transition-opacity duration-150"
                    />
                    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                      <div className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-amber-300/40 text-[9px] font-mono text-amber-300 flex items-center gap-1 animate-pulse">
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        <span>Developing...</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Photo Content */}
                <div
                  style={{
                    filter: isDeveloping
                      ? `blur(${filmBlur}px) brightness(${filmBrightness}) contrast(${filmContrast}) saturate(${filmSaturate})`
                      : 'none',
                  }}
                  className="w-full h-full relative"
                >
                  {currentPhotoPreviewUrl ? (
                    <div className="w-full h-full relative overflow-hidden">
                      <img
                        src={currentPhotoPreviewUrl}
                        alt="Polaroid preview"
                        style={{
                          filter: activeFilter.cssFilter,
                          transform:
                            sourceMode === 'upload'
                              ? `scale(${photoZoom}) translate(${photoPan.x}px, ${photoPan.y}px)`
                              : undefined,
                        }}
                        className="w-full h-full object-cover transition-transform duration-75"
                      />
                      {activeFilter.hasGrain && (
                        <div
                          style={{ backgroundImage: `url("${FILM_GRAIN_SVG_DATA}")` }}
                          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-35"
                        />
                      )}
                      {activeFilter.hasBloom && (
                        <div className="absolute inset-0 pointer-events-none bg-amber-100/20 mix-blend-screen" />
                      )}
                      <div className="absolute bottom-1 left-1 z-10 text-[8px] font-mono font-bold text-amber-200 bg-black/60 px-1 py-0.5 rounded backdrop-blur-xs">
                        {customDate || 'OCT 2026'}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        filter: activeFilter.cssFilter !== 'none' ? activeFilter.cssFilter : undefined,
                      }}
                      className={`w-full h-full bg-gradient-to-br ${selectedPreset.gradient} p-2 flex flex-col justify-between text-white relative`}
                    >
                      {activeFilter.hasGrain && (
                        <div
                          style={{ backgroundImage: `url("${FILM_GRAIN_SVG_DATA}")` }}
                          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-35"
                        />
                      )}
                      <div className="text-2xl filter drop-shadow">{selectedPreset.icon}</div>
                      <div className="relative z-10 leading-none">
                        <div className="text-[8px] font-mono uppercase tracking-wider text-amber-200 font-bold">
                          {customDate || 'OCT 2026'}
                        </div>
                        <div className="text-xs font-display font-bold leading-tight drop-shadow truncate">
                          {customTitle || selectedPreset.title}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Handwritten Caption preview */}
              <div className="mt-1 px-0.5 min-h-[30px] flex flex-col justify-between leading-tight">
                <p className="font-hand text-sm text-slate-900 truncate">
                  "{customCaption || selectedPreset.desc}"
                </p>
                <div className="text-right text-[8px] font-mono text-slate-500">
                  — {photographer || 'Cozy Desk'}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CONTROLS SCROLLABLE CONTAINER (Mobile Bottom Sheet / Desktop Left 7 cols)  */}
          {/* ========================================================================= */}
          <div
            ref={scrollContainerRef}
            className="md:col-span-7 flex-1 overflow-y-auto p-4 sm:p-6 pb-28 md:pb-6 flex flex-col gap-6"
          >
            {/* 1. Photo Source Selector (Tabbed / Segmented Control) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>1. Photo Source</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  Choose or capture your image
                </span>
              </div>

              {/* Segmented Tab Bar (Min 48px height touch target per tab) */}
              <div
                role="tablist"
                className="grid grid-cols-3 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1.5 shadow-inner"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={sourceMode === 'presets'}
                  disabled={isDeveloping}
                  onClick={() => handleTabChange('presets')}
                  className={`min-h-[48px] px-2 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.97] ${
                    sourceMode === 'presets'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Palette className="w-4 h-4 shrink-0" />
                  <span className="truncate">Curated Scenes</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={sourceMode === 'camera'}
                  disabled={isDeveloping}
                  onClick={() => handleTabChange('camera')}
                  className={`min-h-[48px] px-2 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.97] ${
                    sourceMode === 'camera'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Camera className="w-4 h-4 shrink-0" />
                  <span className="truncate">Take Photo</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={sourceMode === 'upload'}
                  disabled={isDeveloping}
                  onClick={() => handleTabChange('upload')}
                  className={`min-h-[48px] px-2 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.97] ${
                    sourceMode === 'upload'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <UploadCloud className="w-4 h-4 shrink-0" />
                  <span className="truncate">Upload Image</span>
                </button>
              </div>

              {/* TAB CONTENT: CURATED SCENES */}
              {sourceMode === 'presets' && (
                <div className="mt-3">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {CURATED_POLAROID_PRESETS.map((p) => {
                      const isSelected = selectedPreset.id === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          disabled={isDeveloping}
                          onClick={() => handleSelectPreset(p)}
                          onMouseEnter={() => playHoverSound(0.01, 580)}
                          className={`min-h-[76px] p-2.5 rounded-2xl text-center border flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-[0.96] transition-all duration-150 ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400 shadow-md ring-2 ring-amber-400/40 scale-[1.02]'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 text-slate-300'
                          }`}
                        >
                          <div className="text-2xl">{p.icon}</div>
                          <span className="text-[11px] font-display font-bold text-white leading-tight break-words text-center line-clamp-2 w-full">
                            {p.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: TAKE PHOTO (REAL-TIME CAMERA VIEWFINDER) */}
              {sourceMode === 'camera' && (
                <div className="mt-3 flex flex-col gap-3">
                  {/* Square Viewfinder Box */}
                  <div className="relative w-full aspect-square max-w-[320px] mx-auto bg-black rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl flex items-center justify-center">
                    {/* Viewfinder Flash Effect */}
                    {viewfinderFlash && (
                      <div className="absolute inset-0 bg-white z-40 pointer-events-none animate-fade-out" />
                    )}

                    {/* Camera Framing Reticle / Brackets */}
                    <div className="absolute inset-3 pointer-events-none z-10 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-amber-400/70 font-mono text-sm leading-none">
                        <span>┌</span>
                        <span className="text-[9px] tracking-widest uppercase bg-black/60 px-1.5 py-0.5 rounded text-amber-300 backdrop-blur-xs">
                          {capturedPhotoUrl ? 'CAPTURED' : cameraFacingMode === 'user' ? 'FRONT' : 'REAR'}
                        </span>
                        <span>┐</span>
                      </div>
                      <div className="self-center text-amber-400/40 font-mono text-lg select-none">
                        +
                      </div>
                      <div className="flex justify-between items-center text-amber-400/70 font-mono text-sm leading-none">
                        <span>└</span>
                        <span className="text-[9px] font-mono text-slate-400">1:1 SQUARE</span>
                        <span>┘</span>
                      </div>
                    </div>

                    {/* Viewfinder State 1: Captured Still Photo */}
                    {capturedPhotoUrl ? (
                      <div className="w-full h-full relative">
                        <img
                          src={capturedPhotoUrl}
                          alt="Captured preview"
                          style={{ filter: activeFilter.cssFilter }}
                          className="w-full h-full object-cover select-none"
                        />
                        {activeFilter.hasGrain && (
                          <div
                            style={{ backgroundImage: `url("${FILM_GRAIN_SVG_DATA}")` }}
                            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-35"
                          />
                        )}
                        {activeFilter.hasBloom && (
                          <div className="absolute inset-0 pointer-events-none bg-amber-100/20 mix-blend-screen" />
                        )}
                      </div>
                    ) : cameraError ? (
                      /* Viewfinder State 2: Camera Error / Denied */
                      <div className="p-4 text-center flex flex-col items-center justify-center gap-2.5 z-20">
                        <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-red-300 font-mono leading-relaxed max-w-[260px]">
                          {cameraError}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center mt-1">
                          <button
                            type="button"
                            onClick={() => startCameraStream(cameraFacingMode)}
                            className="min-h-[48px] px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono rounded-xl border border-slate-700 active:scale-95 transition"
                          >
                            Retry Camera
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTabChange('upload')}
                            className="min-h-[48px] px-3 py-1.5 bg-amber-400 text-slate-950 text-xs font-mono font-bold rounded-xl active:scale-95 transition"
                          >
                            Upload Instead
                          </button>
                        </div>
                      </div>
                    ) : isCameraStarting ? (
                      /* Viewfinder State 3: Camera Loading */
                      <div className="flex flex-col items-center justify-center gap-2 text-amber-300 font-mono text-xs z-20">
                        <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                        <span>Starting camera lens...</span>
                      </div>
                    ) : (
                      /* Viewfinder State 4: Live Video Stream */
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover select-none ${
                          cameraFacingMode === 'user' ? 'scale-x-[-1]' : ''
                        }`}
                      />
                    )}
                  </div>

                  {/* Camera Controls Bar (Shutter, Flip, Retake) - all min 48px touch hitbox */}
                  <div className="flex items-center justify-center gap-4 py-1">
                    {capturedPhotoUrl ? (
                      /* If already captured, show Retake and Confirm */
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleRetakePhoto}
                          className="min-h-[48px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-2 active:scale-95 transition cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4 text-amber-400" />
                          <span>Retake Photo</span>
                        </button>
                        <div className="px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Snapshot Ready!</span>
                        </div>
                      </div>
                    ) : (
                      /* Live Camera Controls: Flip Camera + Tactile Shutter */
                      <>
                        {/* Flip Camera Button */}
                        <button
                          type="button"
                          onClick={handleFlipCamera}
                          disabled={Boolean(cameraError) || isCameraStarting}
                          title={`Switch to ${cameraFacingMode === 'user' ? 'rear' : 'front'} camera`}
                          className="min-h-[48px] min-w-[48px] rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 flex items-center justify-center active:scale-90 transition cursor-pointer shadow-md"
                        >
                          <RefreshCw className="w-5 h-5 text-amber-400" />
                        </button>

                        {/* Tactile Big Shutter Button */}
                        <button
                          type="button"
                          onClick={handleSnapPhoto}
                          disabled={Boolean(cameraError) || isCameraStarting}
                          aria-label="Snap Photo"
                          className="min-h-[64px] min-w-[64px] rounded-full bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600 p-1.5 shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-90 transition cursor-pointer flex items-center justify-center border-2 border-white/80 group"
                        >
                          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-amber-400 group-hover:scale-95 transition-transform">
                            <Camera className="w-6 h-6 fill-amber-400" />
                          </div>
                        </button>

                        {/* Direct File Fallback for Mobile */}
                        <button
                          type="button"
                          onClick={() => nativeCameraInputRef.current?.click()}
                          title="Open native camera / file gallery"
                          className="min-h-[48px] min-w-[48px] rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 flex items-center justify-center active:scale-90 transition cursor-pointer shadow-md"
                        >
                          <Upload className="w-5 h-5 text-amber-400" />
                        </button>
                        {/* Native camera file picker input */}
                        <input
                          ref={nativeCameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: UPLOAD IMAGE (DRAG-AND-DROP & PAN/ZOOM) */}
              {sourceMode === 'upload' && (
                <div className="mt-3 flex flex-col gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {uploadedImageUrl ? (
                    /* Uploaded Image Framer / Cropper */
                    <div className="flex flex-col items-center gap-3">
                      {/* Interactive Square Preview Container */}
                      <div
                        onPointerDown={handlePanStart}
                        onPointerMove={handlePanMove}
                        onPointerUp={handlePanEnd}
                        onPointerCancel={handlePanEnd}
                        className="relative w-full aspect-square max-w-[280px] mx-auto bg-black rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl cursor-grab active:cursor-grabbing select-none"
                      >
                        <img
                          src={uploadedImageUrl}
                          alt="Uploaded crop preview"
                          style={{
                            filter: activeFilter.cssFilter,
                            transform: `scale(${photoZoom}) translate(${photoPan.x}px, ${photoPan.y}px)`,
                          }}
                          className="w-full h-full object-cover pointer-events-none transition-transform duration-75"
                        />
                        {activeFilter.hasGrain && (
                          <div
                            style={{ backgroundImage: `url("${FILM_GRAIN_SVG_DATA}")` }}
                            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-35"
                          />
                        )}
                        {activeFilter.hasBloom && (
                          <div className="absolute inset-0 pointer-events-none bg-amber-100/20 mix-blend-screen" />
                        )}

                        {/* Framing Guideline Overlay */}
                        <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-2xl flex items-center justify-center">
                          <span className="text-[10px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                            Drag to pan photo
                          </span>
                        </div>
                      </div>

                      {/* Pan / Zoom Controls Bar */}
                      <div className="w-full max-w-[320px] bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                            <span>Framing Zoom</span>
                          </span>
                          <span className="text-amber-300 font-bold">{photoZoom.toFixed(1)}x</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPhotoZoom((z) => Math.max(1, +(z - 0.2).toFixed(1)))}
                            className="min-h-[48px] min-w-[48px] rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 cursor-pointer"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </button>

                          <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.05"
                            value={photoZoom}
                            onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                            className="flex-1 accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                          />

                          <button
                            type="button"
                            onClick={() => setPhotoZoom((z) => Math.min(3, +(z + 0.2).toFixed(1)))}
                            className="min-h-[48px] min-w-[48px] rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 cursor-pointer"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoZoom(1);
                              setPhotoPan({ x: 0, y: 0 });
                              playMechanicalClick('subtle', 0.06);
                            }}
                            className="min-h-[48px] px-3 text-xs font-mono text-slate-400 hover:text-amber-300 active:scale-95 transition cursor-pointer flex items-center gap-1"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Reset Framing</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="min-h-[48px] px-3 text-xs font-mono text-amber-400 hover:underline active:scale-95 transition cursor-pointer flex items-center gap-1"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Change Photo</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Drag & Drop Upload Zone */
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={() => setIsDraggingFile(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`min-h-[170px] rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition-all ${
                        isDraggingFile
                          ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                          : 'border-slate-800 hover:border-amber-400/60 bg-slate-950/70 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center text-xl shadow-inner">
                        <UploadCloud className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-sm font-mono font-bold text-white">
                          Click to Browse or Drag Image Here
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">
                          Supports JPG, PNG, WEBP • Auto-crops to 1:1 Polaroid Square
                        </div>
                      </div>
                      <div className="mt-1">
                        <button
                          type="button"
                          className="min-h-[48px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono text-xs font-bold rounded-xl border border-slate-700 shadow-sm pointer-events-none"
                        >
                          Select Photo from Device
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Cozy & Vintage Filter Presets (Horizontal Carousel) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>2. Cozy & Vintage Filter</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {VINTAGE_FILTERS.length} analog presets
                </span>
              </div>

              {/* Horizontal Scrollable Filter Carousel with minimum 48px touch targets */}
              <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-800">
                {VINTAGE_FILTERS.map((f) => {
                  const isSelected = selectedFilterId === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      disabled={isDeveloping}
                      onClick={() => handleSelectFilter(f)}
                      className={`min-w-[130px] sm:min-w-[145px] p-2.5 rounded-2xl border flex flex-col justify-between text-left cursor-pointer active:scale-[0.96] transition-all duration-150 shrink-0 ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {/* Filter Thumbnail Preview */}
                      <div className="w-full h-16 rounded-xl bg-slate-900 relative overflow-hidden mb-2 border border-slate-800 flex items-center justify-center">
                        {currentPhotoPreviewUrl ? (
                          <img
                            src={currentPhotoPreviewUrl}
                            alt={f.name}
                            style={{ filter: f.cssFilter }}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            style={{ filter: f.cssFilter }}
                            className={`w-full h-full bg-gradient-to-br ${selectedPreset.gradient} flex items-center justify-center text-xl`}
                          >
                            <span>{selectedPreset.icon}</span>
                          </div>
                        )}

                        {f.hasGrain && (
                          <div
                            style={{ backgroundImage: `url("${FILM_GRAIN_SVG_DATA}")` }}
                            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
                          />
                        )}
                        {f.hasBloom && (
                          <div className="absolute inset-0 pointer-events-none bg-amber-100/20 mix-blend-screen" />
                        )}

                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-mono font-bold text-white truncate">
                            {f.name}
                          </span>
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold shrink-0">
                            {f.badge}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 leading-tight mt-1 line-clamp-2">
                          {f.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Select Washi Tape Accent (Textured / Patterned Tape Swatches) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>3. Select Textured Washi Tape</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">Tactile patterned strip</span>
              </div>

              {/* Swatches Grid with real patterns, 48px touch target and active scaling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {WASHI_TAPE_OPTIONS.map((w) => {
                  const isSelected = selectedWashi === w.color;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      disabled={isDeveloping}
                      onClick={() => handleSelectWashi(w)}
                      onMouseEnter={() => playHoverSound(0.01, 620)}
                      className={`min-h-[50px] px-3 py-2 rounded-xl border flex items-center gap-3 cursor-pointer active:scale-[0.96] transition-all duration-150 text-left ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                          : 'bg-slate-950/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {/* Real Textured / Patterned Tape Swatch */}
                      <div className="relative shrink-0">
                        <div
                          style={{
                            backgroundColor: w.color,
                            backgroundImage: w.patternCss,
                            backgroundSize: w.backgroundSize,
                          }}
                          className="w-8 h-6 rounded-sm washi-tape border border-black/30 shadow-sm"
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="truncate">
                        <div className="text-xs font-mono font-bold text-slate-200 truncate">
                          {w.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          {w.patternLabel}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Text & Details Form (Auto-scrolls on focus to prevent mobile keyboard occlusion) */}
            <form
              onSubmit={handleFormSubmit}
              id="polaroid-customizer-form"
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-amber-400" />
                  <span>4. Inscribe Memory & Stamp</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">Custom inscription</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Scene Title Input */}
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 mb-1 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-slate-400" />
                    <span>Memory Title</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={32}
                    disabled={isDeveloping}
                    value={customTitle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Rainy Window at Dusk"
                    className="min-h-[48px] w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-display font-bold transition"
                  />
                </div>

                {/* Date / Season Stamp Input */}
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Date / Season Stamp</span>
                  </label>
                  <input
                    type="text"
                    maxLength={18}
                    disabled={isDeveloping}
                    value={customDate}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onChange={(e) => setCustomDate(e.target.value)}
                    placeholder="e.g. OCT 2026 or MIDNIGHT"
                    className="min-h-[48px] w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-amber-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono transition"
                  />
                </div>
              </div>

              {/* Handwritten Caption Input */}
              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 mb-1 flex items-center gap-1">
                  <Wand2 className="w-3 h-3 text-slate-400" />
                  <span>Handwritten Caption / Cozy Thought</span>
                </label>
                <textarea
                  required
                  maxLength={140}
                  rows={2}
                  disabled={isDeveloping}
                  value={customCaption}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  placeholder="A quiet thought or sweet memory from your cozy desk..."
                  className="min-h-[70px] w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-lg text-amber-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-hand leading-relaxed transition"
                />
              </div>

              {/* Photographer / Signature */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Photographer Signature</span>
                  </label>
                  <input
                    type="text"
                    maxLength={28}
                    disabled={isDeveloping}
                    value={photographer}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onChange={(e) => setPhotographer(e.target.value)}
                    placeholder="e.g. Cozy Wanderer"
                    className="min-h-[48px] w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono transition"
                  />
                </div>

                {/* Tilt Rotation Selector */}
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 mb-1 flex items-center gap-1">
                    <RotateCw className="w-3 h-3 text-slate-400" />
                    <span>Tactile Tilt Rotation</span>
                  </label>
                  <div className="flex items-center gap-1.5 h-[48px]">
                    {[-2, -1, 0, 1, 2].map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        disabled={isDeveloping}
                        onClick={() => {
                          setRotationAngle(deg);
                          playMechanicalClick('toggle', 0.06);
                        }}
                        className={`flex-1 h-full rounded-xl text-xs font-mono font-bold border transition cursor-pointer active:scale-[0.96] ${
                          rotationAngle === deg
                            ? 'bg-amber-400/25 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        {deg > 0 ? `+${deg}°` : `${deg}°`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* ========================================================================= */}
          {/* DESKTOP RIGHT COLUMN: Live Tactile Corkboard Preview (5 cols, md:flex)     */}
          {/* ========================================================================= */}
          <div className="hidden md:flex md:col-span-5 flex-col items-center justify-between cork-texture p-6 rounded-2xl border-l-2 border-amber-950/70 shadow-2xl relative overflow-hidden select-none">
            {/* Header info */}
            <div className="w-full flex items-center justify-between z-10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-100 bg-amber-950/90 px-2.5 py-1 rounded-md border border-amber-800/60 shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Tactile Polaroid Preview</span>
              </span>
              <span className="text-[10px] font-mono text-amber-200/90 font-medium">
                {activeFilter.name} • {currentWashiOption.name}
              </span>
            </div>

            {/* The Polaroid Card on Desktop */}
            <div
              style={{
                transform: `rotate(${rotationAngle}deg)`,
              }}
              className="w-full max-w-[270px] bg-[#fdfbf7] p-3.5 pb-4 rounded-sm shadow-[0_20px_45px_rgba(0,0,0,0.7)] text-slate-900 relative transition-transform hover:rotate-0 hover:scale-105 duration-200 border border-black/10 select-none my-auto"
            >
              {/* Textured Washi Tape Strip at top */}
              <div
                style={{
                  backgroundColor: currentWashiOption.color,
                  backgroundImage: currentWashiOption.patternCss,
                  backgroundSize: currentWashiOption.backgroundSize,
                }}
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 washi-tape -rotate-2 z-20 pointer-events-none rounded-[1px] shadow-sm"
              />

              {/* Pushpin at top left */}
              <div className="absolute -top-2 left-3 z-30 pointer-events-none">
                <div className="pushpin-head bg-red-600 shadow-md" />
              </div>

              {/* Photo Area with Square Cutout and Applied Filter */}
              <div className="w-full h-44 rounded-sm bg-slate-950 relative overflow-hidden shadow-inner border border-black/10">
                {/* Instant-Film Developing Overlay */}
                {isDeveloping && (
                  <>
                    <div
                      style={{ opacity: chemicalMilkyOpacity }}
                      className="absolute inset-0 bg-slate-950/95 pointer-events-none z-20 backdrop-blur-[3px] transition-opacity duration-150"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 p-2 text-center pointer-events-none">
                      <div className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-300/40 text-[10px] font-mono text-amber-300 flex items-center gap-1.5 shadow-lg animate-pulse">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Developing Film... {developProgress}%</span>
                      </div>
                      <div className="w-32 h-1.5 bg-black/60 rounded-full mt-2 overflow-hidden border border-white/10">
                        <div
                          style={{ width: `${developProgress}%` }}
                          className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-100"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Film Image with Filter Preset & Developing Effects */}
                <div
                  style={{
                    filter: isDeveloping
                      ? `blur(${filmBlur}px) brightness(${filmBrightness}) contrast(${filmContrast}) saturate(${filmSaturate})`
                      : 'none',
                  }}
                  className="w-full h-full relative"
                >
                  {currentPhotoPreviewUrl ? (
                    <div className="w-full h-full relative overflow-hidden">
                      <img
                        src={currentPhotoPreviewUrl}
                        alt="Custom Polaroid"
                        style={{
                          filter: activeFilter.cssFilter,
                          transform:
                            sourceMode === 'upload'
                              ? `scale(${photoZoom}) translate(${photoPan.x}px, ${photoPan.y}px)`
                              : undefined,
                        }}
                        className="w-full h-full object-cover select-none transition-transform duration-75"
                      />
                      {activeFilter.hasGrain && (
                        <div
                          style={{ backgroundImage: `url("${FILM_GRAIN_SVG_DATA}")` }}
                          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-35"
                        />
                      )}
                      {activeFilter.hasBloom && (
                        <div className="absolute inset-0 pointer-events-none bg-amber-100/20 mix-blend-screen" />
                      )}
                      <div className="absolute bottom-1.5 left-1.5 z-10 text-[9px] font-mono text-amber-200 font-bold tracking-wider bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                        {customDate || 'OCT 2026'}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        filter: activeFilter.cssFilter !== 'none' ? activeFilter.cssFilter : undefined,
                      }}
                      className={`w-full h-full bg-gradient-to-br ${selectedPreset.gradient} p-3 flex flex-col justify-between text-white relative transition-all duration-150`}
                    >
                      {activeFilter.hasGrain && (
                        <div
                          style={{ backgroundImage: `url("${FILM_GRAIN_SVG_DATA}")` }}
                          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-35"
                        />
                      )}
                      <div className="text-3xl filter drop-shadow">{selectedPreset.icon}</div>
                      <div className="relative z-10">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-amber-200 font-bold">
                          {customDate || 'OCT 2026'}
                        </div>
                        <div className="text-sm font-display font-bold leading-tight drop-shadow truncate">
                          {customTitle || selectedPreset.title}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Handwritten Caption */}
              <div className="mt-3 px-1 min-h-[52px] flex flex-col justify-between">
                <p className="font-hand text-xl text-slate-900 leading-tight line-clamp-3">
                  "{customCaption || selectedPreset.desc}"
                </p>
                <div className="text-right text-[10px] font-mono text-slate-500 mt-1">
                  — {photographer || 'Cozy Desk'}
                </div>
              </div>
            </div>

            {/* Desktop Action Area */}
            <div className="w-full mt-4 z-10 flex flex-col gap-2">
              {isDeveloping ? (
                <button
                  type="button"
                  onClick={handleSkipDeveloping}
                  className="min-h-[48px] h-12 w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono text-xs rounded-xl border border-amber-400/50 flex items-center justify-center gap-1.5 transition active:scale-[0.96] cursor-pointer"
                >
                  <FastForward className="w-4 h-4" />
                  <span>Developing... (Tap to Skip 2.5s)</span>
                </button>
              ) : (
                <button
                  type="submit"
                  form="polaroid-customizer-form"
                  className="min-h-[48px] h-12 w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 hover:brightness-110 text-slate-950 font-display font-bold text-sm rounded-xl transition active:scale-[0.96] shadow-xl flex items-center justify-center gap-2 cursor-pointer border border-amber-200"
                >
                  <Camera className="w-4 h-4 fill-slate-950" />
                  <span>Pin Polaroid to Board 📸</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE FIXED FLOATING BOTTOM BAR (Thumb-Zone CTA, >= 48px height)         */}
        {/* ========================================================================= */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 z-30 shadow-[0_-8px_20px_rgba(0,0,0,0.6)]">
          {isDeveloping ? (
            <button
              type="button"
              onClick={handleSkipDeveloping}
              className="min-h-[48px] h-12 w-full bg-amber-500/20 active:scale-[0.96] text-amber-300 font-mono text-xs rounded-xl border border-amber-400/60 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <FastForward className="w-4 h-4" />
              <span>Developing instant film... {developProgress}% (Skip)</span>
            </button>
          ) : (
            <button
              type="submit"
              form="polaroid-customizer-form"
              className="min-h-[48px] h-12 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 active:scale-[0.96] text-slate-950 font-display font-bold text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 transition cursor-pointer border border-amber-200"
            >
              <Camera className="w-4 h-4 fill-slate-950" />
              <span>Pin Polaroid to Board 📸</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
