import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import OtpModal from '../components/OtpModal';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'reset'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setIsOtpModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code) => {
    setOtp(code);
    setIsOtpModalOpen(false);
    setStep('reset');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword(email, otp, newPassword);
      navigate('/login', { state: { message: 'Password reset successful! Please login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Your code may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 font-inter relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-8 hover:opacity-80 transition-opacity">
            <Logo textSize="text-3xl" iconSize={28} />
          </Link>
          <h1 className="text-4xl font-black text-primary font-outfit">Reset Password</h1>
          <p className="text-slate-500 mt-3 font-medium">Protecting your account is our top priority</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          {step === 'email' ? (
            <form onSubmit={handleSendResetCode} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1 text-left block">Email Address</label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Code'}
              </button>

              <Link to="/login" className="flex items-center justify-center gap-2 text-slate-500 font-bold hover:text-primary transition-colors mt-6">
                <ArrowLeft size={18} />
                Back to Login
              </Link>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="bg-blue-50 text-blue-600 p-4 rounded-xl text-sm font-medium border border-blue-100 mb-6">
                Security challenge resolved. Please define your new access credentials.
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength="6"
                    className="input-field pl-11 pr-12"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>

      <OtpModal 
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onVerify={handleVerifyOtp}
        onResend={() => forgotPassword(email)}
        identifier={email}
        emailAddress={email}
        loading={loading}
      />
    </div>
  );
};

export default ForgotPassword;
