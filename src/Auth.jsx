import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { insforge } from './lib/insforge';
import { useAuth } from './AuthContext';
import { Mail, Lock, User, AlertCircle, Loader2, Rocket, Users, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './dashboard.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(0); // 0: email, 1: code, 2: new pass, 3: success
  const [resetCode, setResetCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorProp, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('participant');
  
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem('nexus_remember_me') === 'true'
  );

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSession, user } = useAuth();

  useEffect(() => {
    if (user) {
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        navigate(returnTo);
      } else {
        const userRole = user?.profile?.role || localStorage.getItem('nexus_user_role') || 'participant';
        navigate(userRole === 'organizer' ? '/dashboard' : '/user-dashboard');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isLogin && rememberMe) {
      const savedEmail = localStorage.getItem('nexus_saved_email');
      if (savedEmail && !email) {
        setEmail(savedEmail);
      }
    }
  }, [isLogin, rememberMe]);

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email to reset password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error } = await insforge.auth.sendResetPasswordEmail({ email });
      if (error) throw error;
      setResetStep(1);
    } catch (err) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!resetCode) return setError('Please enter the 6-digit code');
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error } = await insforge.auth.exchangeResetPasswordToken({
        email,
        code: resetCode
      });
      if (error) throw error;
      setResetToken(data.token);
      setResetStep(2);
    } catch (err) {
      setError(err.message || 'Invalid or expired code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return setError('Please enter a new password');
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error } = await insforge.auth.resetPassword({
        newPassword,
        otp: resetToken
      });
      if (error) throw error;
      setResetStep(3);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data, error } = await insforge.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (rememberMe) {
          localStorage.setItem('nexus_remember_me', 'true');
          localStorage.setItem('nexus_saved_email', email);
        } else {
          localStorage.removeItem('nexus_remember_me');
          localStorage.removeItem('nexus_saved_email');
        }
      } else {
        const { data, error } = await insforge.auth.signUp({ email, password, name });
        if (error) throw error;
        
        if (data?.user) {
          await insforge.database.from('profiles').insert([{
            user_id: data.user.id,
            name: name,
            role: role,
          }]);
          localStorage.setItem('nexus_user_role', role);
        }
      }
      
      await refreshSession();
      
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        navigate(returnTo);
        return;
      }
      
      if (isLogin) {
        const { data: sessionData } = await insforge.auth.getUser();
        if (sessionData?.user) {
          const { data: profile } = await insforge.database.from('profiles').select('role').eq('user_id', sessionData.user.id).maybeSingle();
          const userRole = profile?.role || 'participant';
          localStorage.setItem('nexus_user_role', userRole);
          navigate(userRole === 'organizer' ? '/dashboard' : '/user-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      } else {
        navigate(role === 'organizer' ? '/dashboard' : '/user-dashboard');
      }
    } catch (err) {
      console.error('Authentication Error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      const returnTo = searchParams.get('returnTo');
      let callbackUrl = window.location.origin + '/auth-callback';
      if (returnTo) {
        callbackUrl += `?returnTo=${encodeURIComponent(returnTo)}`;
      }
      
      await insforge.auth.signInWithOAuth({ 
        provider,
        redirectTo: callbackUrl
      });
    } catch (err) {
      console.error('OAuth Error:', err);
      setError('OAuth authentication failed.');
    }
  };

  // ═══════ FORGOT PASSWORD VIEW ═══════
  if (isForgotPassword) {
    return (
      <div className="nexus-dashboard min-h-screen flex flex-row-reverse text-[#F5F5F5] font-inter bg-[#0A0A0A]">
        {/* Right side visual */}
        <div className="hidden lg:block lg:w-[50%] p-4 pl-0">
          <div className="w-full h-full rounded-[32px] overflow-hidden relative bg-[#0D0D0D]">
            <img src="/auth-bg.png" alt="Abstract AI Hackathon" className="w-full h-full object-cover opacity-80 mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
          </div>
        </div>

        {/* Left side form */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-12 lg:px-24">
          <div className="w-full max-w-[400px] mx-auto">
            <button 
              onClick={() => setIsForgotPassword(false)}
              className="flex items-center gap-2 text-[13px] font-medium text-[#888] hover:text-white transition-colors mb-10"
            >
              <ArrowLeft size={16} /> Back to login
            </button>
            
            {resetStep === 3 ? (
              <div className="flex flex-col items-center text-center mt-8">
                <div className="w-16 h-16 rounded-full bg-[#111] border border-white/5 flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl opacity-50" />
                  <CheckCircle2 size={28} className="text-green-500 relative z-10" />
                </div>
                <h3 className="text-[24px] font-semibold text-white tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)'}}>
                  Password Updated
                </h3>
                <p className="text-[14px] text-[#888] leading-relaxed max-w-[320px] mb-8">
                  Your password has been successfully reset. You can now use your new password to sign in.
                </p>
                <button
                  onClick={() => { setIsForgotPassword(false); setResetStep(0); setIsLogin(true); setEmail(''); setPassword(''); }}
                  className="w-full bg-[#FF8C32] hover:bg-[#FF6B00] text-black rounded-[14px] py-4 flex items-center justify-center gap-2 text-[15px] font-bold transition-all active:scale-[0.98] mb-4"
                >
                  Return to login
                </button>
              </div>
            ) : (
              <div className="mb-10">
                <h2 className="text-[32px] font-semibold text-white tracking-[-0.03em] mb-3" style={{ fontFamily: 'var(--font-heading)'}}>
                  {resetStep === 0 ? 'Reset Password' : resetStep === 1 ? 'Enter Code' : 'New Password'}
                </h2>
                <p className="text-[14px] text-[#888] leading-relaxed">
                  {resetStep === 0 
                    ? "Enter your email address and we'll send you a secure 6-digit code to reset your password."
                    : resetStep === 1
                    ? `We've sent a 6-digit code to ${email}. Please enter it below.`
                    : "Please enter your new password."}
                </p>
              </div>
            )}

            {resetStep !== 3 && errorProp && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-[13px] text-red-200">{errorProp}</p>
              </div>
            )}

            {resetStep === 0 && (
              <form onSubmit={handleSendResetCode} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-[#888] mb-2 pl-1">Email address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#111111] border border-white/5 hover:border-white/10 focus:border-[#FF8C32]/50 rounded-[14px] pl-11 pr-4 py-3.5 text-[14px] text-white placeholder:text-[#444] outline-none transition-all focus:ring-4 ring-[#FF8C32]/10"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FF8C32] hover:bg-[#FF6B00] text-black rounded-[14px] py-4 mt-4 flex items-center justify-center gap-2 text-[15px] font-bold transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Code'}
                </button>
              </form>
            )}

            {resetStep === 1 && (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-[#888] mb-2 pl-1">6-Digit Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      maxLength={6}
                      className="w-full bg-[#111111] border border-white/5 hover:border-white/10 focus:border-[#FF8C32]/50 rounded-[14px] px-4 py-3.5 text-[18px] text-center tracking-[0.5em] text-white placeholder:text-[#444] outline-none transition-all focus:ring-4 ring-[#FF8C32]/10"
                      placeholder="••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FF8C32] hover:bg-[#FF6B00] text-black rounded-[14px] py-4 mt-4 flex items-center justify-center gap-2 text-[15px] font-bold transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Verify Code'}
                </button>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleSetNewPassword} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-[#888] mb-2 pl-1">New Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#111111] border border-white/5 hover:border-white/10 focus:border-[#FF8C32]/50 rounded-[14px] pl-11 pr-4 py-3.5 text-[14px] text-white placeholder:text-[#444] outline-none transition-all focus:ring-4 ring-[#FF8C32]/10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FF8C32] hover:bg-[#FF6B00] text-black rounded-[14px] py-4 mt-4 flex items-center justify-center gap-2 text-[15px] font-bold transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════ MAIN AUTH VIEW ═══════
  return (
    <div className="nexus-dashboard min-h-screen flex flex-row-reverse text-[#F5F5F5] font-inter bg-[#0A0A0A]">
      
      {/* ═══════ RIGHT SIDE (VISUAL) ═══════ */}
      <div className="hidden lg:block lg:w-[50%] p-4 pl-0">
        <div className="w-full h-full rounded-[32px] overflow-hidden relative bg-[#0D0D0D]">
          {/* Extremely high quality AI generated image */}
          <img src="/auth-bg.png" alt="Abstract Hackathon AI" className="w-full h-full object-cover opacity-90 mix-blend-lighten" />
          
          {/* Subtle vignette / overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/40" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0A0A0A]/80" />
          
          {/* Minimal text overlay on image */}
          <div className="absolute bottom-16 left-16 z-10 max-w-sm">
            <div className="flex items-center gap-3 mb-6 opacity-90">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#FF8C32]">Hackloom Engine</span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-[#FF8C32]/40 to-transparent" />
            </div>
            <h1 className="text-[44px] font-semibold leading-[1.1] tracking-[-0.03em] text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Empower<br />
              <span className="text-white/60">Your Vision.</span>
            </h1>
            <p className="text-[14px] font-medium text-white/50 leading-relaxed">
              Launch, manage, and evaluate cutting-edge AI hackathons with unparalleled speed.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════ LEFT SIDE (FORM) ═══════ */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-12 lg:px-24 xl:px-32 relative">
        <div className="w-full max-w-[400px] mx-auto">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-14">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ahlG2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#F97316"/><stop offset="100%" stopColor="#FB9A57"/></linearGradient></defs><path d="M8 7h3v7.5h10V7h3v18h-3v-7.5H11V25H8V7z" fill="url(#ahlG2)"/></svg>
            <span className="text-[18px] font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Hackloom</span>
          </div>

          <div className="mb-10">
            <h2 className="text-[32px] font-semibold text-white tracking-[-0.03em] mb-3" style={{ fontFamily: 'var(--font-heading)'}}>
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-[14px] text-[#888] leading-relaxed">
              {isLogin 
                ? 'Enter your credentials to access your dashboard.' 
                : 'Enter your details below to get started with Hackloom.'}
            </p>
          </div>

          {errorProp && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-[13px] text-red-200">{errorProp}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-[13px] font-medium text-[#888] mb-2 pl-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#111111] border border-white/5 hover:border-white/10 focus:border-[#FF8C32]/50 rounded-[14px] pl-11 pr-4 py-3.5 text-[14px] text-white placeholder:text-[#444] outline-none transition-all focus:ring-4 ring-[#FF8C32]/10"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#888] mb-3 pl-1">I want to</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('participant')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-[14px] border transition-all ${role === 'participant' ? 'bg-[#FF8C32]/10 border-[#FF8C32]/40 text-[#FF8C32]' : 'bg-[#111] border-white/5 text-[#888] hover:border-white/15'}`}
                    >
                      <Users size={20} />
                      <span className="text-[13px] font-semibold">Participate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('organizer')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-[14px] border transition-all ${role === 'organizer' ? 'bg-[#FF8C32]/10 border-[#FF8C32]/40 text-[#FF8C32]' : 'bg-[#111] border-white/5 text-[#888] hover:border-white/15'}`}
                    >
                      <Rocket size={20} />
                      <span className="text-[13px] font-semibold">Organize</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[13px] font-medium text-[#888] mb-2 pl-1">Email address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111111] border border-white/5 hover:border-white/10 focus:border-[#FF8C32]/50 rounded-[14px] pl-11 pr-4 py-3.5 text-[14px] text-white placeholder:text-[#444] outline-none transition-all focus:ring-4 ring-[#FF8C32]/10"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 pl-1 pr-1">
                <label className="text-[13px] font-medium text-[#888]">Password</label>
                {isLogin && (
                  <button 
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setError(''); setResetSent(false); }}
                    className="text-[12px] font-medium text-[#FF8C32] hover:text-[#FF6B00] transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111111] border border-white/5 hover:border-white/10 focus:border-[#FF8C32]/50 rounded-[14px] pl-11 pr-4 py-3.5 text-[14px] text-white placeholder:text-[#444] outline-none transition-all focus:ring-4 ring-[#FF8C32]/10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="w-4 h-4 rounded-[4px] border border-white/20 group-hover:border-[#FF8C32] bg-transparent flex justify-center items-center relative overflow-hidden transition-colors">
                    <input 
                      type="checkbox" 
                      className="absolute opacity-0 w-full h-full cursor-pointer peer" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className="absolute inset-0 bg-[#FF8C32] opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                       <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  </div>
                  <span className="text-[13px] text-[#888] select-none group-hover:text-[#F5F5F5] transition-colors">Remember me for 30 days</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF8C32] hover:bg-[#FF6B00] text-black rounded-[14px] py-4 mt-8 flex items-center justify-center gap-2 text-[15px] font-bold transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#555]">Or continue with</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <button
            onClick={() => handleOAuth('google')}
            className="w-full bg-[#111111] border border-white/5 hover:border-white/10 hover:bg-white/5 text-white rounded-[14px] py-3.5 flex items-center justify-center gap-3 text-[14px] font-medium transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <p className="text-center text-[13px] text-[#888] mt-12">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-white font-semibold hover:text-[#FF8C32] transition-colors focus:outline-none"
            >
              {isLogin ? 'Sign up for free' : 'Sign in instead'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
