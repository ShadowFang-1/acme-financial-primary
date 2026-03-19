import React, { useState, useEffect } from 'react';
import { Mail, Loader2, X, ShieldCheck } from 'lucide-react';

const OtpModal = ({ isOpen, onClose, onVerify, onResend, identifier, emailAddress, loading }) => {
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleVerify = (e) => {
    e.preventDefault();
    onVerify(otp);
  };

  const handleResend = () => {
    if (resendTimer === 0) {
      onResend();
      setResendTimer(60);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white rounded-[32px] w-full max-w-md relative z-10 shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <ShieldCheck size={32} />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
              <X size={24} />
            </button>
          </div>

          <div className="mb-8 font-inter">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-outfit mb-2">Two-Factor Security</h2>
            <p className="text-slate-500 font-medium">
              We've sent a 6-digit cryptographic code to:
              <span className="block text-primary mt-1 font-bold">{emailAddress || identifier}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Verification Code</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength="6"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-2xl font-black tracking-[0.5em] text-center focus:border-primary focus:bg-white transition-all outline-none"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setOtp(val);
                    if (val.length === 6 && !loading) {
                      onVerify(val);
                    }
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Authorize Access'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <button
              onClick={handleResend}
              disabled={resendTimer > 0}
              className="text-sm font-bold text-primary hover:text-primary/80 disabled:text-slate-400 transition-colors"
            >
              {resendTimer > 0 ? `Resend challenge in ${resendTimer}s` : 'Resend Security Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
