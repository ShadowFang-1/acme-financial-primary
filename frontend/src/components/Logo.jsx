import React from 'react';
import logo from '../assets/logo.png';

const Logo = ({ className = "", textClass = "text-primary", hideText = false }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-lg shadow-secondary/10 overflow-hidden">
      <img src={logo} alt="ACME" className="w-full h-full object-cover" />
    </div>
    {!hideText && (
      <span className={`${textClass} font-black text-xs md:text-sm uppercase tracking-[0.2em] italic shrink-0`}>
        ACME <span className="text-secondary italic">FINANCIAL</span>
      </span>
    )}
  </div>
);

export default Logo;
