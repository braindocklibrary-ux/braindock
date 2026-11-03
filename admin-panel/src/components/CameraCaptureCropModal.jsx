import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  RefreshCw, 
  FlipHorizontal,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';

/**
 * CameraCaptureCropModal
 * Direct Camera live stream capture & Gallery upload with interactive cropping tool.
 * Ideal for Student Profile Photos (1:1) and Aadhaar Cards Front/Back (1.58:1).
 */
export default function CameraCaptureCropModal({
  isOpen,
  onClose,
  title = 'Capture & Crop Image',
  aspectRatio = 1, // 1 for square photo, 1.58 for Aadhaar card
  initialImage = null,
  onSave
}) {
  const [mode, setMode] = useState(initialImage ? 'crop' : 'camera');
  const [rawImage, setRawImage] = useState(initialImage);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) | 'user' (front)
  const [cameraError, setCameraError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Sync initialImage on open
  useEffect(() => {
    if (isOpen) {
      if (initialImage) {
        setRawImage(initialImage);
        setMode('crop');
      } else {
        setMode('camera');
        setRawImage(null);
      }
    }
  }, [isOpen, initialImage]);

  // Cropper controls state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const cropCanvasRef = useRef(null);
  const previewImgRef = useRef(null);

  // Initialize camera when modal opens in camera mode
  useEffect(() => {
    if (isOpen && mode === 'camera') {
      startCamera(facingMode);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode, facingMode]);

  // Reset controls when new image is loaded
  useEffect(() => {
    if (rawImage) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
    }
  }, [rawImage]);

  // Start webcam / camera stream
  const startCamera = async (currentFacingMode) => {
    stopCamera();
    setCameraError(null);
    setIsCameraActive(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const constraints = {
        video: {
          facingMode: { ideal: currentFacingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error('Video play error:', e));
          setIsCameraActive(true);
        };
      }
    } catch (err) {
      console.warn('Camera initiation failed:', err);
      // Fallback try simple video: true if facingMode was rejected
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(e => console.error('Fallback video play error:', e));
            setIsCameraActive(true);
          };
        }
      } catch (fallbackErr) {
        setCameraError(fallbackErr.message || 'Camera permission denied or camera not found.');
        setIsCameraActive(false);
      }
    }
  };

  // Stop camera tracks
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Toggle front / back camera
  const handleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Capture frame from live video
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    stopCamera();
    setRawImage(dataUrl);
    setMode('crop');
  };

  // Handle gallery file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      stopCamera();
      setRawImage(event.target.result);
      setMode('crop');
    };
    reader.readAsDataURL(file);
    // Reset input value so same file can be picked again if needed
    e.target.value = '';
  };

  // Mouse / Touch Dragging for crop pan
  const handlePointerDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Perform Final Crop & Compression on Canvas
  const handleApplyCrop = () => {
    if (!rawImage) return;

    const img = new Image();
    img.onload = () => {
      // Target output dimensions
      // Profile Photo (1:1): 600 x 600
      // Aadhaar Card (1.58:1): 950 x 600
      const targetHeight = 600;
      const targetWidth = Math.round(targetHeight * (aspectRatio || 1));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      // Clear with clean background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Save context for transform
      ctx.save();

      // Center transform at canvas center
      ctx.translate(targetWidth / 2, targetHeight / 2);

      // Apply Pan (normalized to target scale)
      // The preview container is roughly 320px wide; target is ~600-950px
      const scaleFactor = targetWidth / 320;
      ctx.translate(pan.x * scaleFactor, pan.y * scaleFactor);

      // Apply Rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply Zoom
      ctx.scale(zoom, zoom);

      // Calculate base image draw size maintaining aspect ratio
      const imgAspect = img.width / img.height;
      let drawW = targetWidth;
      let drawH = targetWidth / imgAspect;

      if (rotation === 90 || rotation === 270) {
        // Swap dimensions for 90/270 deg
        if (drawH < targetHeight) {
          drawH = targetHeight;
          drawW = targetHeight * imgAspect;
        }
      } else {
        if (drawH < targetHeight) {
          drawH = targetHeight;
          drawW = targetHeight * imgAspect;
        }
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Compress to high-quality lightweight JPEG
      const finalDataUrl = canvas.toDataURL('image/jpeg', 0.85);

      // Calculate size in KB
      const base64Len = finalDataUrl.length - (finalDataUrl.indexOf(',') + 1);
      const compressedKB = Math.round((base64Len * 3) / 4 / 1024);

      if (onSave) {
        onSave(finalDataUrl, { compressedKB, width: targetWidth, height: targetHeight });
      }

      handleCloseModal();
    };
    img.src = rawImage;
  };

  const handleCloseModal = () => {
    stopCamera();
    setMode('camera');
    setRawImage(null);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full text-white shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Camera className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
              <p className="text-[10px] text-slate-400">
                {mode === 'camera' ? 'Live Camera Capture' : 'Crop & Adjust Preview'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          className="hidden" 
        />

        {/* Modal Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto flex flex-col items-center justify-center">

          {/* ================= VIEW 1: LIVE CAMERA VIEW ================= */}
          {mode === 'camera' && (
            <div className="w-full flex flex-col items-center space-y-4">
              
              {/* Camera Frame Container */}
              <div className="relative w-full aspect-4/3 max-h-[360px] bg-black rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center shadow-inner">
                {cameraError ? (
                  <div className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-rose-300 font-medium max-w-xs">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 mx-auto cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose from Gallery / Files</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Framing Guidelines Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                      <div 
                        className={`border-2 border-dashed border-white/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] transition-all ${
                          aspectRatio === 1 
                            ? 'w-52 h-52 rounded-full' 
                            : 'w-72 h-44 rounded-xl'
                        }`}
                      />
                    </div>

                    <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                      <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold text-slate-200 border border-white/10">
                        {aspectRatio === 1 ? 'Align face inside circle' : 'Align Aadhaar card inside box'}
                      </span>
                    </div>

                    {/* Camera Flip Button (Only on live stream) */}
                    <button
                      type="button"
                      onClick={handleFlipCamera}
                      title="Flip Camera (Front/Rear)"
                      className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-xl border border-white/20 transition-all cursor-pointer"
                    >
                      <FlipHorizontal className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Camera Actions Bar */}
              <div className="w-full flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border border-slate-700 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Gallery</span>
                </button>

                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  disabled={!isCameraActive}
                  className="flex-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
              </div>

            </div>
          )}

          {/* ================= VIEW 2: INTERACTIVE CROPPER VIEW ================= */}
          {mode === 'crop' && (
            <div className="w-full flex flex-col items-center space-y-4">
              
              {/* Cropping Viewport Container */}
              <div 
                className="relative w-full h-[320px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 select-none cursor-move flex items-center justify-center shadow-inner"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {/* Image being cropped */}
                {rawImage && (
                  <img
                    ref={previewImgRef}
                    src={rawImage}
                    alt="Crop preview"
                    draggable={false}
                    className="max-w-none pointer-events-none transition-transform duration-75"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                      maxHeight: '260px'
                    }}
                  />
                )}

                {/* Aspect Ratio Cutout Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                  <div 
                    className={`border-2 border-purple-400 rounded-xl shadow-[0_0_0_9999px_rgba(15,23,42,0.7)] pointer-events-none ${
                      aspectRatio === 1 
                        ? 'w-52 h-52' 
                        : 'w-72 h-44'
                    }`}
                  >
                    <div className="w-full h-full border border-dashed border-white/60 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-purple-400/80"></div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-slate-300 font-mono border border-white/10 pointer-events-none">
                  Drag to pan • Slider to zoom
                </div>
              </div>

              {/* Cropper Controls (Zoom, Rotate) */}
              <div className="w-full bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold flex items-center space-x-1">
                    <ZoomIn className="w-3.5 h-3.5 text-purple-400" />
                    <span>Zoom Level: {zoom.toFixed(1)}x</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Rotate 90°</span>
                  </button>
                </div>

                {/* Zoom Slider */}
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setZoom(prev => Math.max(0.6, prev - 0.1))}
                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min="0.6"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-purple-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom(prev => Math.min(3.0, prev + 0.1))}
                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bottom Actions (Retake vs Done) */}
              <div className="w-full flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('camera');
                    setRawImage(null);
                  }}
                  className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border border-slate-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyCrop}
                  className="flex-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Crop & Save Photo</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
