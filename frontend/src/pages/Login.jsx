import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, Landmark, Smartphone, X, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import OtpModal from '../components/OtpModal';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' or 'verify'
  const [resendTimer, setResendTimer] = useState(0);
  const { login, verifyOtp, sendOtp } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleInitialLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(identifier, password);
      if (result.requiresOtp) {
        setIdentifier(result.identifier);
        setEmailAddress(result.email);
        setIsOtpModalOpen(true);
        // Automatically trigger OTP dispatch
        await sendOtp(result.identifier, result.email);
      } else {
        handlePostAuth(result);
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await sendOtp(identifier, emailAddress);
    } catch (err) {
      setError('Failed to resend OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (code) => {
    setLoading(true);
    setError('');
    try {
      const user = await verifyOtp(identifier, code);
      setIsOtpModalOpen(false);
      handlePostAuth(user);
    } catch (err) {
      setError(err.message || 'Invalid code. Authentication challenge failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostAuth = (user) => {
    if (user.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 sm:p-6 font-inter relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-secondary/5 blur-[80px] sm:blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/5 blur-[80px] sm:blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="max-w-md w-full relative z-10 px-2 sm:px-0">
        <div className="text-center mb-6 lg:mb-10">
          <Link to="/" className="inline-block mb-6 lg:mb-8 hover:opacity-80 transition-opacity">
            <Logo textSize="text-2xl sm:text-3xl" iconSize={24} />
          </Link>
          <h1 className="text-2xl sm:text-4xl font-black text-primary font-outfit tracking-tighter italic">Welcome Back</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2 sm:mt-3 font-medium">Verify your access to the ACME core</p>
        </div>

        <div className="bg-white rounded-[2rem] sm:rounded-3xl shadow-xl p-6 sm:p-10 border border-slate-100">
          <form onSubmit={handleInitialLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email, Username or Account Number</label>
              <div className="relative">
                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  required
                  className="input-field pl-11"
                  placeholder="Enter details..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" size="sm" className="text-sm font-medium text-primary hover:text-primary-light">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="input-field pl-11 pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="mt-8 pt-6 text-center">
          <p className="text-slate-600 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>

      <OtpModal 
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onVerify={handleOtpVerify}
        onResend={handleSendOtp}
        identifier={identifier}
        emailAddress={emailAddress}
        loading={loading}
      />
    </div>
  );
};

export default Login;
