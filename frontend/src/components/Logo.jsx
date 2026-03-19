import React from 'react';
import { Landmark } from 'lucide-react';

const Logo = ({ className = "", iconSize = 24, textSize = "text-2xl", textColor = "text-primary" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary shadow-lg shadow-secondary/20">
      <Landmark size={iconSize} />
    </div>
    <span className={`${textSize} font-black font-outfit tracking-tighter ${textColor} uppercase`}>
      ACME
    </span>
  </div>
);

export default Logo;
