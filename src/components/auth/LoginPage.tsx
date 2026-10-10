import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Stethoscope,
  KeyRound
} from 'lucide-react';
import { useAuth, type UserRole } from '../../context/AuthContext';

interface LoginPageProps {
  onSuccessLogin: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Error feedback state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setAuthError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Please enter your email address.');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailError('Please enter a valid email address.');
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setAuthError('');

    setTimeout(() => {
      const res = login(email.trim(), password, selectedRole, false);
      setIsLoading(false);

      if (res.success && res.user) {
        onSuccessLogin(res.user.role);
      } else {
        setAuthError(res.error || 'Authentication failed. Please verify credentials and selected role.');
      }
    }, 600);
  };

  const handleDemoLogin = (role: UserRole) => {
    setIsLoading(true);
    setAuthError('');

    setTimeout(() => {
      const res = login(undefined, undefined, role, true);
      setIsLoading(false);
      if (res.success && res.user) {
        onSuccessLogin(res.user.role);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* LEFT SIDE: Medical Software Branding & Platform Value */}
        <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800/80 overflow-hidden">
          
          {/* Subtle Scan Lines Visual */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl" />
          </div>

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-800 p-0.5 shadow-xl shadow-blue-600/30">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <Activity className="w-6 h-6 text-cyan-400 relative z-10" />
                  <div className="absolute inset-0 bg-cyan-500/20 animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white font-sans flex items-center gap-2">
                  WRIST<span className="text-cyan-400">AI</span>
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Clinical Intelligence Workspace
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              RESEARCH PROTOTYPE ENVIRONMENT
            </div>
          </div>

          {/* Value Proposition */}
          <div className="relative z-10 my-12 space-y-8">
            <div className="space-y-4 max-w-lg">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                AI-assisted wrist radiograph review & clinical decision support.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed font-normal">
                Dual-role clinical workspace integrating deep feature saliency, calibrated confidence metrics, and human-in-the-loop verification.
              </p>
            </div>

            {/* Role Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 space-y-1.5 shadow-md">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider font-mono">
                  <Stethoscope className="w-4 h-4" />
                  DOCTOR WORKSPACE
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Radiograph review, fracture candidates, quality checks & clinical sign-off.
                </p>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 space-y-1.5 shadow-md">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  ADMIN WORKSPACE
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  User management, doctor account controls, system configuration & audit logs.
                </p>
              </div>
            </div>
          </div>

          {/* Left Footer */}
          <div className="relative z-10 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Research prototype • AI-assisted decision support</span>
            <span>v2.5-RBAC</span>
          </div>

        </div>

        {/* RIGHT SIDE: Two-Role Login Form */}
        <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center bg-slate-950 relative">
          
          <div className="w-full max-w-md space-y-7 bg-slate-900/70 p-7 sm:p-9 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
            
            {/* Header Title */}
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to WristAI</h2>
              <p className="text-xs text-slate-400 font-medium">
                Select your authorized workspace role and enter credentials.
              </p>
            </div>

            {/* 1. ROLE SELECTION TABS (Doctor vs Admin) */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                SELECT YOUR INTENDED ROLE
              </label>
              
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
                
                {/* Doctor Role Card */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('doctor');
                    setAuthError('');
                  }}
                  className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedRole === 'doctor'
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 ring-2 ring-blue-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Stethoscope className="w-5 h-5" />
                  <span className="text-xs font-bold">Doctor Login</span>
                  <span className="text-[9px] opacity-80 font-normal">Clinical Workspace</span>
                </button>

                {/* Admin Role Card */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('admin');
                    setAuthError('');
                  }}
                  className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedRole === 'admin'
                      ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30 ring-2 ring-cyan-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <KeyRound className="w-5 h-5" />
                  <span className="text-xs font-bold">Admin Login</span>
                  <span className="text-[9px] opacity-80 font-normal">System Administration</span>
                </button>

              </div>
            </div>

            {/* Auth Error Alert Banner */}
            {authError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block text-white">Authentication Error</span>
                  <span className="leading-relaxed">{authError}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                      if (authError) setAuthError('');
                    }}
                    placeholder={selectedRole === 'admin' ? 'admin@wristai.org' : 'doctor.vance@wristai.org'}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                      emailError
                        ? 'border-rose-500/80 focus:ring-rose-500/30'
                        : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                      if (authError) setAuthError('');
                    }}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                      passwordError
                        ? 'border-rose-500/80 focus:ring-rose-500/30'
                        : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500/30 accent-blue-600"
                  />
                  <span>Remember me</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">Role: {selectedRole.toUpperCase()}</span>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  selectedRole === 'admin'
                    ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In as {selectedRole === 'admin' ? 'Admin' : 'Doctor'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            {/* OR Divider */}
            <div className="relative py-1 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative bg-slate-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                DEVELOPMENT DEMO ACCESS
              </span>
            </div>

            {/* DEMO ACCESSIBLE ROLE BUTTONS */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                
                <button
                  type="button"
                  onClick={() => handleDemoLogin('doctor')}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>Demo Doctor</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
                >
                  <KeyRound className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>Demo Admin</span>
                </button>

              </div>

              <p className="text-[10px] text-slate-500 text-center leading-relaxed font-mono">
                Demo Authentication Mode • Local Storage Session Persistence
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Global Security Footer */}
      <footer className="py-3 px-6 bg-slate-950 border-t border-slate-900 text-center text-[11px] text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Research prototype • WristAI Role-Based Access Control</span>
        <span className="text-slate-600">Notice: Demo authentication mode — clean integration point provided for production OIDC / SAML2.</span>
      </footer>
    </div>
  );
};
