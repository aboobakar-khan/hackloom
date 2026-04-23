import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { insforge } from './lib/insforge';
import { Lock, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './dashboard.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorProp, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token');
  const status = searchParams.get('insforge_status');
  const insforgeError = searchParams.get('insforge_error');

  useEffect(() => {
    if (status === 'error') {
      setError(insforgeError || 'Invalid or expired password reset link.');
    }
  }, [status, insforgeError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!token) {
      setError('Missing reset token. Please use the link from your email.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await insforge.auth.resetPassword({
        newPassword: password,
        otp: token,
      });
      
      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (err) {
      console.error('Reset Error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status !== 'ready' && !success && status !== 'error') {
    return (
      <div className="nexus-dashboard min-h-screen flex items-center justify-center text-[#F5F5F5] font-inter bg-[#0A0A0A]">
        <div className="text-center max-w-md p-8">
          <Loader2 size={32} className="animate-spin mx-auto mb-4 text-[#FF8C32]" />
          <p className="text-[#888]">Verifying reset link...</p>
        </div>
      </div>
    );
  }

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
          {!success && (
            <button 
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 text-[13px] font-medium text-[#888] hover:text-white transition-colors mb-10"
            >
              <ArrowLeft size={16} /> Back to login
            </button>
          )}
          
          <div className="mb-10">
            <h2 className="text-[32px] font-semibold text-white tracking-[-0.03em] mb-3" style={{ fontFamily: 'var(--font-heading)'}}>
              Create New Password
            </h2>
            <p className="text-[14px] text-[#888] leading-relaxed">
              {success ? 'Your password has been successfully reset.' : 'Please enter your new password below.'}
            </p>
          </div>

          {errorProp && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-[13px] text-red-200">{errorProp}</p>
            </div>
          )}

          {success ? (
            <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex flex-col items-center text-center gap-3">
              <CheckCircle2 size={36} className="text-green-500 mb-2" />
              <h3 className="text-[16px] font-semibold text-green-400">Password Reset Complete</h3>
              <p className="text-[13px] text-green-200">
                You can now log in with your new password. Redirecting you to login...
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="mt-4 text-[13px] font-medium text-[#FF8C32] hover:text-[#FF6B00]"
              >
                Go to login now
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-[#888] mb-2 pl-1">New Password</label>
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

              <div>
                <label className="block text-[13px] font-medium text-[#888] mb-2 pl-1">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#111111] border border-white/5 hover:border-white/10 focus:border-[#FF8C32]/50 rounded-[14px] pl-11 pr-4 py-3.5 text-[14px] text-white placeholder:text-[#444] outline-none transition-all focus:ring-4 ring-[#FF8C32]/10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FF8C32] hover:bg-[#FF6B00] text-black rounded-[14px] py-4 mt-8 flex items-center justify-center gap-2 text-[15px] font-bold transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
