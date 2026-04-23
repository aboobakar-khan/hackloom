import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { insforge } from './lib/insforge';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';
import './dashboard.css';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await refreshSession();
        
        const { data } = await insforge.auth.getUser();
        const userId = data?.user?.id;
        
        if (userId) {
          // Check if profile exists
          const { data: profile } = await insforge.database
            .from('profiles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();
          
          const searchParams = new URLSearchParams(window.location.search);
          const returnTo = searchParams.get('returnTo');
          
          if (profile) {
            localStorage.setItem('nexus_user_role', profile.role);
            navigate(returnTo || (profile.role === 'organizer' ? '/dashboard' : '/user-dashboard'));
          } else {
            // First time OAuth — create profile as participant
            await insforge.database.from('profiles').insert([{
              user_id: userId,
              name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || '',
              role: 'participant',
            }]);
            localStorage.setItem('nexus_user_role', 'participant');
            navigate(returnTo || '/user-dashboard');
          }
        } else {
          navigate('/auth');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        navigate('/auth');
      }
    };
    handleCallback();
  }, []);

  return (
    <div className="nexus-dashboard min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-nexus-primary mx-auto mb-4" />
        <p className="text-[14px] text-[#888]">Authenticating...</p>
      </div>
    </div>
  );
}
