import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, Mail, User as UserIcon, Loader2, Landmark, 
  ShieldCheck, Eye, EyeOff, ArrowRight, ArrowLeft,
  ChevronRight, Globe, Smartphone, Zap
} from 'lucide-react';
import Logo from '../components/Logo';
import OtpModal from '../components/OtpModal';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, verifyOtp, sendOtp } = useAuth();

  // Shared states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginEmailForOtp, setLoginEmailForOtp] = useState('');

  // Register states
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountry, setRegCountry] = useState('');
  const [regDay, setRegDay] = useState('');
  const [regMonth, setRegMonth] = useState('');
  const [regYear, setRegYear] = useState('');

  useEffect(() => {
    if (location.pathname === '/register') setIsLogin(false);
    else setIsLogin(true);
  }, [location.pathname]);

  const toggleAuth = () => {
    setIsLogin(!isLogin);
    setError('');
    navigate(isLogin ? '/register' : '/login');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(loginIdentifier, loginPassword);
      if (result.requiresOtp) {
        setLoginEmailForOtp(result.email);
        setIsOtpModalOpen(true);
        await sendOtp(loginIdentifier, result.email);
      } else {
        navigate(result.role === 'ADMIN' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formattedDob = `${regYear}-${regMonth.padStart(2, '0')}-${regDay.padStart(2, '0')}`;
      const result = await register(regUsername, regEmail, regPassword, regPhone, regCountry, formattedDob);
      if (result.requiresOtp) {
        setIsOtpModalOpen(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (otpCode) => {
    setLoading(true);
    setError('');
    try {
      const identifier = isLogin ? loginIdentifier : regEmail;
      await verifyOtp(identifier, otpCode);
      setIsOtpModalOpen(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const email = isLogin ? loginEmailForOtp : regEmail;
    const identifier = isLogin ? loginIdentifier : regEmail;
    try {
      await sendOtp(identifier, email);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      {/* Animated Background */}
      <div className="animated-mesh">
        <div className="mesh-ball ball-1"></div>
        <div className="mesh-ball ball-2"></div>
        <div className="mesh-ball ball-3"></div>
      </div>

      <div className={`auth-card-wrapper ${!isLogin ? 'right-panel-active' : ''}`}>
        
        {/* Register Container */}
        <div className="form-container signup-container">
          <form onSubmit={handleRegisterSubmit} className="auth-form overflow-y-auto custom-scrollbar">
            <div className="sm:hidden mb-6 overflow-hidden rounded-2xl">
               <Logo iconSize={24} textSize="text-2xl" />
            </div>
            <h1 className="text-3xl font-black text-primary italic mb-2 tracking-tighter">Join the Elite</h1>
            <p className="text-slate-400 text-sm mb-6 font-medium tracking-tight">Open your gateway to global finance</p>
            
            {error && !isLogin && (
              <div className="w-full bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold mb-4 border border-red-100 animate-zoom-custom">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 w-full mb-3">
               <div className="auth-input-group">
                  <Smartphone size={16} />
                  <input type="text" placeholder="Phone" required value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
               </div>
               <div className="auth-input-group">
                  <Globe size={16} />
                  <select required value={regCountry} onChange={(e) => setRegCountry(e.target.value)} className="bg-transparent border-none outline-none text-slate-600 text-xs w-full">
                     <option value="">Country</option>
                     <option value="Ghana">Ghana</option>
                     <option value="Nigeria">Nigeria</option>
                     <option value="USA">USA</option>
                     <option value="UK">UK</option>
                     {/* Simplified list for now */}
                  </select>
               </div>
            </div>

            <div className="w-full mb-3">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">Birth Identity</label>
               <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="DD" maxLength="2" value={regDay} onChange={(e) => setRegDay(e.target.value.replace(/\D/g,''))} className="auth-input-mini" required />
                  <select value={regMonth} onChange={(e) => setRegMonth(e.target.value)} className="auth-input-mini" required>
                    <option value="">MM</option>
                    {Array.from({length:12}, (_, i) => (
                      <option key={i+1} value={(i+1).toString()}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</option>
                    ))}
                  </select>
                  <input type="text" placeholder="YYYY" maxLength="4" value={regYear} onChange={(e) => setRegYear(e.target.value.replace(/\D/g,''))} className="auth-input-mini" required />
               </div>
            </div>

            <div className="auth-input-group mb-3">
              <UserIcon size={18} />
              <input type="text" placeholder="Full Name" required value={regUsername} onChange={(e) => setRegUsername(e.target.value)} />
            </div>

            <div className="auth-input-group mb-3">
              <Mail size={18} />
              <input type="email" placeholder="Email Address" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
            </div>

            <div className="auth-input-group mb-6">
              <Lock size={18} />
              <input type={showPassword ? "text" : "password"} placeholder="Secure Password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-primary transition-colors">
                 {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="auth-btn-main group">
              {loading ? <Loader2 className="animate-spin" /> : (
                <>Register Now <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
            
            <button type="button" onClick={toggleAuth} className="sm:hidden mt-8 py-3 px-8 rounded-xl border-2 border-slate-100 text-xs font-black text-primary italic uppercase tracking-widest hover:bg-slate-50 transition-all">
              Already a member? Sign In
            </button>
          </form>
        </div>

        {/* Login Container */}
        <div className="form-container signin-container">
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="mb-8 overflow-hidden rounded-2xl">
               <Logo iconSize={32} textSize="text-3xl" />
            </div>
            <h1 className="text-4xl font-black text-primary italic mb-2 tracking-tighter">Welcome Back</h1>
            <p className="text-slate-400 text-sm mb-10 font-medium tracking-tight">Access your global wealth nodes</p>

            {error && isLogin && (
              <div className="w-full bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold mb-6 border border-red-100 italic">
                {error}
              </div>
            )}

            <div className="auth-input-group mb-4">
              <Landmark size={20} />
              <input type="text" placeholder="Username / Email" required value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} />
            </div>

            <div className="auth-input-group mb-1">
              <Lock size={20} />
              <input type={showPassword ? "text" : "password"} placeholder="Password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-primary transition-colors">
                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="w-full flex justify-end mb-8">
               <Link to="/forgot-password" size="sm" className="text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
                  Forgotten Code?
               </Link>
            </div>

            <button type="submit" disabled={loading} className="auth-btn-main group">
              {loading ? <Loader2 className="animate-spin" /> : (
                <>Authorize Access <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

            <button type="button" onClick={toggleAuth} className="sm:hidden mt-10 py-3 px-8 rounded-xl border-2 border-slate-100 text-xs font-black text-primary italic uppercase tracking-widest hover:bg-slate-50 transition-all">
               New here? Create Account
            </button>
          </form>
        </div>

        {/* Overlay Container */}
        <div className="overlay-container hidden sm:block">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-3xl backdrop-blur-xl flex items-center justify-center mb-8 mx-auto border border-white/30 rotate-12">
                   <Zap size={40} className="text-white fill-white" />
                </div>
                <h1 className="text-4xl font-black text-white italic mb-4 tracking-tighter">Already One of Us?</h1>
                <p className="text-white/80 font-medium mb-12 leading-relaxed">Securely return to your accounts and manage your global interests.</p>
                <button className="auth-btn-ghost group" onClick={toggleAuth}>
                   <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Sign In
                </button>
              </div>
            </div>
            <div className="overlay-panel overlay-right">
              <div className="p-12 text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-3xl backdrop-blur-xl flex items-center justify-center mb-8 mx-auto border border-white/30 -rotate-12">
                   <ShieldCheck size={40} className="text-white fill-white" />
                </div>
                <h1 className="text-4xl font-black italic mb-4 tracking-tighter">Start Your Journey</h1>
                <p className="text-white/80 font-medium mb-12 leading-relaxed">Join the world's most elite financial network and unlock true freedom.</p>
                <button className="auth-btn-ghost group" onClick={toggleAuth}>
                   Register <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <OtpModal 
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onVerify={handleOtpVerify}
        onResend={handleResendOtp}
        identifier={isLogin ? loginIdentifier : regEmail}
        emailAddress={isLogin ? loginEmailForOtp : regEmail}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default Auth;
