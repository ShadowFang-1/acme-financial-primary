import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/canvasUtils';
import { RotateCcw, RotateCw, X, Check, SlidersHorizontal } from 'lucide-react';

const ImageEditor = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onCropAreaChange = useCallback((items, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleDone = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="flex justify-between items-center p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl">
                <SlidersHorizontal size={20} className="text-secondary" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Adjust Portrait</h3>
        </div>
        <button onClick={onCancel} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white">
          <X size={24} />
        </button>
      </div>

      <div className="relative flex-1 bg-black/40">
        <Cropper
          image={image}
          crop={crop}
          rotation={rotation}
          zoom={zoom}
          aspect={1}
          onCropChange={onCropChange}
          onRotationChange={setRotation}
          onCropComplete={onCropAreaChange}
          onZoomChange={setZoom}
          cropShape="round"
          showGrid={false}
        />
      </div>

      <div className="p-8 bg-slate-900 border-t border-white/10 space-y-8">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-12">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="flex-1 accent-secondary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-12">Rotate</span>
            <div className="flex-1 flex items-center gap-4">
                <button 
                    onClick={() => setRotation(r => (r - 90) % 360)}
                    className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
                >
                    <RotateCcw size={20} />
                </button>
                <input
                    type="range"
                    value={rotation}
                    min={0}
                    max={360}
                    step={1}
                    aria-labelledby="Rotation"
                    onChange={(e) => setRotation(e.target.value)}
                    className="flex-1 accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <button 
                    onClick={() => setRotation(r => (r + 90) % 360)}
                    className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
                >
                    <RotateCw size={20} />
                </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button 
            onClick={onCancel}
            className="px-8 py-4 bg-white/5 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleDone}
            className="px-12 py-4 bg-secondary text-primary font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 transition-all shadow-xl shadow-secondary/10 flex items-center gap-2"
          >
            <Check size={18} /> Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
