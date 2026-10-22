import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Sparkles, Mail, Lock, User, Briefcase, ArrowRight, KeyRound, AlertCircle, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RESEND_COOLDOWN_SECS = 60;

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, verifyOTP, resendOTP, forgotPassword, resetPassword, loginAsDemo } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'verify-otp' | 'forgot-password' | 'reset-password'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Software Engineer');
  const [otp, setOtp] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef(null);

  const startCooldown = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN_SECS);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => clearInterval(cooldownRef.current);
  }, []);

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

  const resetForm = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setOtp('');
    setChallengeId('');
    clearInterval(cooldownRef.current);
    setResendCooldown(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (res && res.requiresOtp && res.step === 'verify-otp') {
        // Two-step: password validated, OTP challenge issued — do NOT authenticate yet
        setChallengeId(res.challengeId || '');
        setEmail(res.email || email);
        setSuccessMessage('Verification code sent to your email. Please enter the 6-digit code.');
        setMode('verify-otp');
        startCooldown();
      } else if (res && res.success) {
        // Direct login without OTP (should not happen in two-step flow, but handle gracefully)
        onClose();
      } else {
        setErrorMessage(res?.message || 'Login failed. Please check your credentials.');
      }
    } else if (mode === 'register') {
      const res = await register(name, email, password, targetRole);
      setLoading(false);
      if (res && res.success) {
        setChallengeId(res.challengeId || '');
        setSuccessMessage('Account created! Verification code sent to your email.');
        setMode('verify-otp');
        startCooldown();
      } else {
        setErrorMessage(res?.message || 'Registration failed. Please try again.');
      }
    } else if (mode === 'verify-otp') {
      const res = await verifyOTP(email, otp, challengeId);
      setLoading(false);
      if (res && res.success) {
        setSuccessMessage('✓ Email verified successfully! Welcome to CareerElevate AI.');
        setTimeout(() => onClose(), 1000);
      } else {
        setErrorMessage(res?.message || 'Invalid or expired verification code.');
      }
    } else if (mode === 'forgot-password') {
      const res = await forgotPassword(email);
      setLoading(false);
      if (res && res.success) {
        setSuccessMessage('✓ Password reset link sent to your email. Please check your inbox.');
      } else {
        setErrorMessage(res?.message || 'Failed to send password reset email.');
      }
    } else if (mode === 'reset-password') {
      const res = await resetPassword(email, resetToken, newPassword);
      setLoading(false);
      if (res && res.success) {
        setSuccessMessage('✓ Password reset successful! You can now sign in.');
        setTimeout(() => setMode('login'), 1500);
      } else {
        setErrorMessage(res?.message || 'Failed to reset password. Invalid or expired token.');
      }
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    const res = await resendOTP(email, challengeId);
    setLoading(false);
    if (res && res.success) {
      setChallengeId(res.challengeId || challengeId);
      setSuccessMessage('✓ Fresh verification code sent to your email.');
      setOtp(''); // Clear old OTP entry
      startCooldown();
    } else {
      setErrorMessage(res?.message || 'Failed to resend code. Please try again.');
    }
  };

  const handleDemoAccess = () => {
    if (typeof loginAsDemo === 'function') {
      loginAsDemo();
    }
    onClose();
  };

  if (!isOpen) return null;

  // Demo button is only shown in development
  const isDev = !import.meta.env.PROD;

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
            {mode === 'verify-otp' && 'Verify Your Email'}
            {mode === 'forgot-password' && 'Password Recovery'}
            {mode === 'reset-password' && 'Set New Account Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'verify-otp'
              ? `A 6-digit code was sent to ${email}`
              : 'Unlock personalized ATS optimization and AI interview coaching'}
          </p>
        </div>

        {/* Dev-only Demo Fast Account Button */}
        {isDev && (mode === 'login' || mode === 'register') && (
          <div className="mb-6 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="font-bold text-white">Dev Demo Account <span className="text-amber-400 font-mono text-[10px]">[DEV ONLY]</span></p>
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
        )}

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
              onClick={() => { resetForm(); setMode('login'); }}
              className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
                mode === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { resetForm(); setMode('register'); }}
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
                    onClick={() => { resetForm(); setMode('forgot-password'); }}
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

          {/* Mode: OTP Verification */}
          {mode === 'verify-otp' && (
            <div className="space-y-4 my-2">
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-center">
                <ShieldCheck className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs text-indigo-200 font-semibold">Check your inbox</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Enter the 6-digit code sent to <span className="text-white font-mono">{email}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-center uppercase tracking-wider">
                  6-Digit Verification Code
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
                    autoComplete="one-time-code"
                    className="w-full bg-slate-900 border border-indigo-500/50 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-3 text-center text-xl font-mono tracking-widest text-white focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-amber-400/90 text-center font-medium mt-2">
                  ⏰ Code expires in 5 minutes
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => { resetForm(); setMode('login'); }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ← Back to Sign In
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || loading}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold disabled:text-slate-600 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                >
                  {resendCooldown > 0 ? (
                    <>
                      <Clock className="w-3 h-3" />
                      Resend in {resendCooldown}s
                    </>
                  ) : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          {/* Mode: Reset Password */}
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
                  {mode === 'register' && 'Create Account & Send Code'}
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
                onClick={() => { resetForm(); setMode('login'); }}
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
