import React, { useState, useEffect } from 'react';
import { X, Sparkles, Mail, Lock, User, Briefcase, ArrowRight, KeyRound, AlertCircle, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, verifyOTP, resendOTP, forgotPassword, resetPassword } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'verify-otp' | 'forgot-password' | 'reset-password'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Software Engineer');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if opened with reset token in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('resetToken');
    const emailParam = urlParams.get('email');

    if (tokenParam) {
      setResetToken(tokenParam);
      if (emailParam) setEmail(emailParam);
      setMode('reset-password');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (res && res.requiresVerification) {
        if (res.otpDebug) setOtp(res.otpDebug);
        setErrorMessage(res.message);
        setEmail(res.email || email);
        setMode('verify-otp');
      } else if (res && !res.success) {
        setErrorMessage(res.message || 'Login failed. Invalid credentials.');
      } else {
        onClose();
      }
    } else if (mode === 'register') {
      const res = await register(name, email, password, targetRole);
      setLoading(false);
      if (res && res.success) {
        if (res.otpDebug) setOtp(res.otpDebug);
        setSuccessMessage(`✓ Account created! Verification OTP generated and auto-filled.`);
        setMode('verify-otp');
      } else {
        setErrorMessage(res?.message || 'Registration failed.');
      }
    } else if (mode === 'verify-otp') {
      const res = await verifyOTP(email, otp);
      setLoading(false);
      if (res && res.success) {
        setSuccessMessage('✓ Email verified successfully! Welcome.');
        setTimeout(() => onClose(), 1000);
      } else {
        setErrorMessage(res?.message || 'Invalid or expired OTP code.');
      }
    } else if (mode === 'forgot-password') {
      const res = await forgotPassword(email);
      setLoading(false);
      if (res && res.success) {
        setSuccessMessage('✓ Password reset link sent to your email! Please check your inbox.');
        if (res.resetUrlDebug) {
          console.log('RESET LINK DEBUG:', res.resetUrlDebug);
        }
      } else {
        setErrorMessage(res?.message || 'Failed to send password reset email.');
      }
    } else if (mode === 'reset-password') {
      const res = await resetPassword(email, resetToken, newPassword);
      setLoading(false);
      if (res && res.success) {
        setSuccessMessage('✓ Password reset successful! You can now log in.');
        setTimeout(() => setMode('login'), 1500);
      } else {
        setErrorMessage(res?.message || 'Failed to reset password. Invalid or expired token.');
      }
    }
  };

  const handleResendOTP = async () => {
    setErrorMessage('');
    setSuccessMessage('Generating fresh OTP code...');
    const res = await resendOTP(email);
    if (res && res.success) {
      if (res.otpDebug) setOtp(res.otpDebug);
      setSuccessMessage('✓ Fresh 6-digit OTP code generated and auto-filled!');
    } else {
      setErrorMessage(res?.message || 'Failed to resend OTP.');
    }
  };

  const handleDemoAccess = () => {
    login('demo.candidate@careerelevate.ai', 'demopassword');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel rounded-2xl border border-slate-800 shadow-2xl p-6 lg:p-8 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-indigo-400 shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white">
            {mode === 'login' && 'Candidate Portal Sign In'}
            {mode === 'register' && 'Create Candidate Account'}
            {mode === 'verify-otp' && 'Verify Email OTP Code'}
            {mode === 'forgot-password' && 'Password Recovery'}
            {mode === 'reset-password' && 'Set New Account Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Unlock personalized ATS optimization and AI interview coaching
          </p>
        </div>

        {/* Demo Fast Account Button */}
        <div className="mb-6 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="font-bold text-white">Instant Demo Account</p>
              <p className="text-[10px] text-indigo-300 font-normal">Explore pre-filled resumes & mock sessions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoAccess}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
          >
            Quick Demo
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Mode Toggle */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setErrorMessage(''); setSuccessMessage(''); setMode('login'); }}
              className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
                mode === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setErrorMessage(''); setSuccessMessage(''); setMode('register'); }}
              className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
                mode === 'register' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Career Role</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors appearance-none"
                  >
                    <option value="Senior Software Engineer">Senior Software Engineer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="System Architect">System Architect</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'forgot-password') && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.vance@techcorp.io"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setErrorMessage(''); setSuccessMessage(''); setMode('forgot-password'); }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Mode 3: OTP Verification PIN Code Input */}
          {mode === 'verify-otp' && (
            <div className="space-y-4 my-2">
              {otp && (
                <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-center animate-in fade-in duration-200">
                  <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest flex items-center justify-center gap-1.5 mb-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Instant Verification PIN Code
                  </p>
                  <p className="text-2xl font-black font-mono tracking-widest text-white">{otp}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Code auto-filled in field below</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-center uppercase tracking-wider">
                  6-Digit Verification PIN
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-indigo-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-900 border border-indigo-500/50 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-3 text-center text-xl font-mono tracking-widest text-white focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-amber-400/90 text-center font-medium mt-2">
                  ⏰ Code expires in 10 minutes
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ← Back to Register
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Resend OTP Code
                </button>
              </div>
            </div>
          )}

          {/* Mode 4: Reset Password Input */}
          {mode === 'reset-password' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@techcorp.io"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Secure Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In to Portal'}
                  {mode === 'register' && 'Send Email OTP Code'}
                  {mode === 'verify-otp' && 'Verify & Activate Account'}
                  {mode === 'forgot-password' && 'Send Password Reset Email'}
                  {mode === 'reset-password' && 'Update Password'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {mode === 'forgot-password' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
