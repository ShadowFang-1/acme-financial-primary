import React from 'react';
import logo from '../assets/logo.png';

const Logo = ({ className = "", textClass = "text-secondary", hideText = false, textSize = "text-xs md:text-sm", iconSize = 40 }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div 
      className="rounded-xl bg-white flex items-center justify-center text-primary shadow-lg shadow-secondary/10 overflow-hidden"
      style={{ width: iconSize, height: iconSize }}
    >
      <img src={logo} alt="ACME" className="w-full h-full object-cover" />
    </div>
    {!hideText && (
      <span className={`${textClass} ${textSize} font-black uppercase tracking-[0.2em] italic shrink-0`}>
        ACME <span className="text-secondary italic font-black">FINANCIAL</span>
      </span>
    )}
  </div>
);

export default Logo;
