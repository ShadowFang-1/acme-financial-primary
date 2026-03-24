import logo from '../assets/logo.png';

const Logo = ({ className = "", iconSize = 40, textSize = "text-2xl", textColor = "text-primary", hideText = false }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-lg shadow-secondary/10 overflow-hidden">
      <img src={logo} alt="ZENITH" className="w-full h-full object-cover" />
    </div>
    {!hideText && (
      <span className={`${textSize} font-black italic tracking-tighter text-primary`}>
        ZENITH <span className="text-secondary">GLOBAL</span>
      </span>
    )}
  </div>
);

export default Logo;
