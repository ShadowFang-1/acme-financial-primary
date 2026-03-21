import React from 'react';

const LoadingScreen = ({ message = "Securing your connection..." }) => {
  return (
    <div 
      className="fixed inset-0 bg-primary flex flex-col items-center justify-center z-[100] p-6 text-center text-white"
      style={{ backgroundColor: '#0f172a' }}
    >
      {/* Premium Gradient Background Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Animated Logo Container */}
      <div className="relative mb-12">
        <div className="w-24 h-24 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-secondary rounded-2xl rotate-45 animate-pulse shadow-[0_0_30px_rgba(251,191,36,0.3)]"></div>
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight font-outfit">
        Secure<span className="text-secondary">Pay</span>
      </h1>
      
      {/* Pulsing Status Message */}
      <div className="flex flex-col items-center">
        <p className="text-slate-400 text-lg font-medium animate-pulse">
          {message}
        </p>
        <div className="mt-8 flex gap-2">
          <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
        </div>
      </div>

      {/* Subtle Footer */}
      <div className="absolute bottom-10 text-slate-500 text-sm font-medium tracking-widest uppercase">
        Antigravity Protection Active
      </div>
    </div>
  );
};

export default LoadingScreen;
