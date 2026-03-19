import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User as UserIcon, Loader2, Landmark, Clock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import OtpModal from '../components/OtpModal';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, verifyOtp, sendOtp } = useAuth();
  const navigate = useNavigate();

  const handleInitialRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await register(username, email, password, phoneNumber, country, dateOfBirth);
      if (result.requiresOtp) {
        setIsOtpModalOpen(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Prioritize specific backend error messages (e.g., 'Email already exists')
      const errorMessage = err.message || (err.response?.data?.message) || 'Registration failed.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (otp) => {
    setLoading(true);
    setError('');
    try {
      await verifyOtp(email, otp);
      setIsOtpModalOpen(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendOtp(email, email);
    } catch (err) {
      console.error('Failed to resend:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 sm:p-6 font-inter relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-secondary/5 blur-[100px] sm:blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-primary/5 blur-[100px] sm:blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-md w-full relative z-10 px-2 sm:px-0">
        <div className="text-center mb-6 lg:mb-10">
          <Link to="/" className="inline-block mb-6 lg:mb-8 hover:opacity-80 transition-opacity">
            <Logo textSize="text-2xl sm:text-3xl" iconSize={24} />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-primary font-outfit tracking-tighter italic">Open Your Account</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2 sm:mt-3 font-medium">Join thousands banking with ACME Financial</p>
        </div>

        <div className="bg-white rounded-[2rem] sm:rounded-3xl shadow-xl p-6 sm:p-10 border border-slate-100">
          <form onSubmit={handleInitialRegister} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Primary Phone</label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    className="input-field pl-10"
                    placeholder="+123..."
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Territory</label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    required
                    className="input-field pl-10"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="US">USA</option>
                    <option value="UK">UK</option>
                    <option value="NG">NG</option>
                    <option value="IN">IN</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Date of Birth</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="date"
                  required
                  className="input-field pl-11"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  required
                  className="input-field pl-11"
                  placeholder="John Doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  required
                  className="input-field pl-11"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
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
              {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <OtpModal 
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onVerify={handleOtpVerify}
        onResend={handleResendOtp}
        identifier={email}
        emailAddress={email}
        loading={loading}
      />
    </div>
  );
};

export default Register;
