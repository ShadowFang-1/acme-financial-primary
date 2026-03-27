import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, RefreshCw, Zap } from 'lucide-react';

const CameraCapture = ({ onCapture, onCancel }) => {
  const webcamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const [error, setError] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    onCapture(imageSrc);
  }, [webcamRef, onCapture]);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="flex justify-between items-center p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl">
                <Zap size={20} className="text-amber-500" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Live Capture</h3>
        </div>
        <button onClick={onCancel} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white">
          <X size={24} />
        </button>
      </div>

      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          playsInline // Essential for iOS support
          onUserMediaError={() => {
             setError("Camera module access rejected. Verification protocols mandate hardware engagement. Check browser privacy settings.");
          }}
          className="h-full w-full object-cover"
        />
        
        {/* Overlay for alignment */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 border-4 border-white/30 rounded-full border-dashed animate-[pulse_3s_infinite]"></div>
        </div>

        {error && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-8 text-center animate-in fade-in duration-300">
                <div className="max-w-xs space-y-6">
                    <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
                        <Zap size={32} />
                    </div>
                    <div>
                        <h4 className="text-white font-black uppercase italic tracking-tighter text-lg mb-2">Engage Failure</h4>
                        <p className="text-slate-400 text-xs font-bold leading-relaxed">{error}</p>
                    </div>
                    <button onClick={onCancel} className="w-full py-4 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">Abort Protocol</button>
                </div>
            </div>
        )}
      </div>

      <div className="p-8 sm:p-12 bg-slate-900 border-t border-white/10 flex flex-col items-center gap-6 sm:gap-8">
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Center your face within the ring</p>
        
        <div className="flex items-center gap-6">
            <button 
                onClick={onCancel}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/5"
            >
                <X size={24} />
            </button>
            
            <button 
                onClick={capture}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-secondary text-primary flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.3)] hover:scale-110 active:scale-95 transition-all group"
            >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-primary/10 flex items-center justify-center group-hover:border-primary/20">
                    <Camera size={32} className="sm:size-10" />
                </div>
            </button>

            <button 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/5"
                onClick={() => {
                   setError("System desynchronization. Preparing for protocol reset.");
                   setTimeout(() => window.location.reload(), 2000);
                }} 
            >
                <RefreshCw size={24} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
