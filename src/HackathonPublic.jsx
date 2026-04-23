import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { insforge } from './lib/insforge';
import { useAuth } from './AuthContext';
import RegisterWizard from './RegisterWizard';
import './dashboard.css';
import {
  Calendar, Clock, Users, Trophy, MapPin, Globe, ArrowRight,
  ChevronRight, ExternalLink, CheckCircle, CheckCircle2, AlertCircle,
  FileText, GitBranch, SlidersHorizontal, PlayCircle, Star, Zap, Target,
  BarChart3, Award, Rocket, ArrowLeft, Copy, Check, Loader2,
  Timer, Sparkles, ArrowUpRight, ShieldCheck, HelpCircle
} from 'lucide-react';


// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });
}

function getCountdown(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) return { expired: true, text: 'Ended' };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  if (days > 0) return { expired: false, text: `${days}d ${hours}h` };
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  return { expired: false, text: `${hours}h ${mins}m` };
}

function getHackathonStatus(hackathon) {
  const now = new Date();
  const regOpen = new Date(hackathon.registration_opens);
  const regClose = new Date(hackathon.registration_closes);
  const subDeadline = new Date(hackathon.submission_deadline);
  const resultsDate = hackathon.results_date ? new Date(hackathon.results_date) : null;

  if (now < regOpen) return { label: 'Upcoming', dot: 'bg-blue-400', color: 'text-blue-400' };
  if (now >= regOpen && now <= regClose) return { label: 'Registration Open', dot: 'bg-green-400', color: 'text-green-400' };
  if (now > regClose && now <= subDeadline) return { label: 'Submission Phase', dot: 'bg-nexus-primary', color: 'text-nexus-primary' };
  if (resultsDate && now > subDeadline && now <= resultsDate) return { label: 'Judging', dot: 'bg-yellow-400', color: 'text-yellow-400' };
  return { label: 'Completed', dot: 'bg-[#666]', color: 'text-[#888]' };
}


// ═══════════════════════════════════════════════════════════
// REGISTRATION MODAL
// ═══════════════════════════════════════════════════════════
const INPUT_CLASS = "w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[14px] text-white placeholder:text-[#555] outline-none focus:border-[#FF8C32]/50 focus:ring-4 ring-[#FF8C32]/10 transition-all";

function RegisterModal({ hackathon, user, onClose, onSuccess }) {
  const [teamName, setTeamName] = useState('');
  const [leadName, setLeadName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [members, setMembers] = useState([{ name: '', email: '', role: '' }]);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const addMember = () => setMembers(prev => [...prev, { name: '', email: '', role: '' }]);
  const removeMember = (i) => setMembers(prev => prev.filter((_, idx) => idx !== i));
  const updateMember = (i, key, val) => {
    const updated = [...members];
    updated[i] = { ...updated[i], [key]: val };
    setMembers(updated);
  };

  const validate = () => {
    const e = {};
    if (!teamName.trim()) e.teamName = 'Team name is required';
    if (!leadName.trim()) e.leadName = 'Team lead name is required';
    if (!email.trim() || !email.includes('@')) e.email = 'Valid email is required';
    if (!agreeTerms) e.terms = 'You must agree to the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { error } = await insforge.database
        .from('registrations')
        .insert({
          hackathon_id: hackathon.id,
          user_id: user?.id || null,
          team_name: teamName,
          email,
          members: [
            { name: leadName, email, role: 'Team Lead', phone, college },
            ...members.filter(m => m.name.trim())
          ],
        });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 2500);
    } catch (err) {
      console.error('Registration failed:', err);
      alert('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80 backdrop-blur-md p-0 sm:p-4" onClick={onClose}>
      <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {success ? (
          <div className="flex flex-col items-center justify-center h-full py-20 px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/20">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-[28px] font-bold text-white mb-3 tracking-tight">Registration Complete</h3>
            <p className="text-[15px] text-[#888] max-w-md mx-auto">
              Team <span className="text-white font-medium">{teamName}</span> is officially registered. We've sent a confirmation email to <span className="text-white">{email}</span>.
            </p>
          </div>
        ) : (
          <>
            <div className="px-8 pt-8 pb-6 border-b border-white/5 flex-shrink-0 flex items-start justify-between bg-[#0A0A0A] relative z-10">
              <div>
                <div className="text-[12px] font-bold tracking-[0.1em] text-[#FF8C32] uppercase mb-2">Join Hackathon</div>
                <h3 className="text-[24px] font-semibold text-white leading-tight tracking-tight">{hackathon.name}</h3>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#111] hover:bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-[#888] hover:text-white transition-all">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 bg-[#050505]">
              {/* Basic Info */}
              <section>
                <h4 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2"><Target size={16} className="text-[#888]"/> Team Identity</h4>
                <div className="space-y-4">
                  <div>
                    <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Enter your team name *" className={INPUT_CLASS} />
                    {errors.teamName && <p className="text-[12px] text-red-400 mt-2 ml-1">{errors.teamName}</p>}
                  </div>
                </div>
              </section>

              {/* Lead Info */}
              <section>
                <h4 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2"><ShieldCheck size={16} className="text-[#888]"/> Team Lead Profile</h4>
                <div className="space-y-4">
                  <div>
                    <input value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="Full Name *" className={INPUT_CLASS} />
                    {errors.leadName && <p className="text-[12px] text-red-400 mt-2 ml-1">{errors.leadName}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address *" className={INPUT_CLASS} />
                      {errors.email && <p className="text-[12px] text-red-400 mt-2 ml-1">{errors.email}</p>}
                    </div>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number (Optional)" className={INPUT_CLASS} />
                  </div>
                  <input value={college} onChange={e => setCollege(e.target.value)} placeholder="University or Organization (Optional)" className={INPUT_CLASS} />
                </div>
              </section>

              {/* Members */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[14px] font-bold text-white flex items-center gap-2"><Users size={16} className="text-[#888]"/> Additional Members</h4>
                  <span className="text-[12px] font-medium text-[#666] bg-[#111] px-2 py-1 rounded-md">{members.filter(m => m.name.trim()).length + 1} / {hackathon.team_size_max || 5}</span>
                </div>
                <div className="space-y-3">
                  {members.map((m, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-3 items-start bg-[#0A0A0A] p-3 rounded-2xl border border-white/5">
                      <input value={m.name} onChange={e => updateMember(i, 'name', e.target.value)} placeholder="Name"
                        className="w-full sm:w-[35%] bg-transparent border-none text-[13px] text-white placeholder:text-[#555] outline-none px-2" />
                      <div className="hidden sm:block w-px h-6 bg-white/10 mt-1" />
                      <input value={m.email} onChange={e => updateMember(i, 'email', e.target.value)} placeholder="Email"
                        className="w-full sm:w-[35%] bg-transparent border-none text-[13px] text-white placeholder:text-[#555] outline-none px-2" />
                      <div className="hidden sm:block w-px h-6 bg-white/10 mt-1" />
                      <input value={m.role} onChange={e => updateMember(i, 'role', e.target.value)} placeholder="Role"
                        className="w-full sm:w-[20%] bg-transparent border-none text-[13px] text-white placeholder:text-[#555] outline-none px-2" />
                      {members.length > 1 && (
                        <button onClick={() => removeMember(i)} className="p-2 text-[#555] hover:text-red-400 transition-colors ml-auto sm:ml-0"><ArrowLeft className="rotate-45" size={14}/></button>
                      )}
                    </div>
                  ))}
                </div>
                {(members.length + 1) < (hackathon.team_size_max || 5) && (
                  <button onClick={addMember} className="mt-4 text-[13px] font-medium text-white bg-[#111] hover:bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5 transition-colors flex items-center gap-2">
                    <span className="text-[#FF8C32]">+</span> Add Team Member
                  </button>
                )}
              </section>

              {/* Legal */}
              <section className="pt-4 border-t border-white/5">
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="w-5 h-5 rounded-[6px] border border-white/20 group-hover:border-[#FF8C32] bg-[#0A0A0A] flex justify-center items-center relative overflow-hidden transition-colors shrink-0 mt-0.5">
                    <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="absolute opacity-0 w-full h-full cursor-pointer peer" />
                    <div className="absolute inset-0 bg-[#FF8C32] opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                       <Check size={12} className="text-black stroke-[3]" />
                    </div>
                  </div>
                  <span className="text-[13px] text-[#888] leading-relaxed group-hover:text-[#ccc] transition-colors">
                    I agree to the Hackloom Code of Conduct and official hackathon rules. I confirm my team meets all eligibility requirements.
                  </span>
                </label>
                {errors.terms && <p className="text-[12px] text-red-400 mt-3">{errors.terms}</p>}
              </section>
            </div>

            <div className="px-8 py-6 border-t border-white/5 bg-[#0A0A0A] flex-shrink-0">
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full bg-[#FF8C32] hover:bg-[#FF6B00] disabled:opacity-50 text-black rounded-xl py-4 text-[15px] font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                {submitting ? <><Loader2 size={18} className="animate-spin"/> Processing...</> : 'Complete Registration'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// SUBMISSION MODAL
// ═══════════════════════════════════════════════════════════
function SubmitModal({ hackathon, user, userRegistration, onClose }) {
  const [teamName, setTeamName] = useState(userRegistration?.team_name || '');
  const [projectName, setProjectName] = useState('');
  const [tagline, setTagline] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [pptUrl, setPptUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!teamName.trim() || !projectName.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await insforge.database.from('submissions').insert({
        hackathon_id: hackathon.id, 
        user_id: user?.id || null,
        team_name: teamName, 
        project_name: projectName,
        tagline: tagline || null, github_url: githubUrl || null,
        ppt_url: pptUrl || null, demo_url: demoUrl || null,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Submission failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80 backdrop-blur-md p-0 sm:p-4" onClick={onClose}>
      <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {success ? (
          <div className="flex flex-col items-center justify-center h-full py-20 px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/20">
              <Rocket size={32} className="text-green-500" />
            </div>
            <h3 className="text-[28px] font-bold text-white mb-3 tracking-tight">Project Submitted</h3>
            <p className="text-[15px] text-[#888] max-w-md mx-auto mb-8">
              <span className="text-white font-medium">{projectName}</span> has been securely submitted and is now queued for AI evaluation.
            </p>
            <button onClick={onClose} className="bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl px-8 py-3 text-[14px] font-semibold transition-colors">
              Return to Hackathon
            </button>
          </div>
        ) : (
          <>
            <div className="px-8 pt-8 pb-6 border-b border-white/5 flex-shrink-0 flex items-start justify-between bg-[#0A0A0A] relative z-10">
              <div>
                <div className="text-[12px] font-bold tracking-[0.1em] text-[#FF8C32] uppercase mb-2">Project Submission</div>
                <h3 className="text-[24px] font-semibold text-white leading-tight tracking-tight">{hackathon.name}</h3>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#111] hover:bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-[#888] hover:text-white transition-all">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 bg-[#050505]">
              <section>
                <h4 className="text-[14px] font-bold text-white mb-4">Core Details</h4>
                <div className="space-y-4">
                  <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Team Name (as registered) *" className={INPUT_CLASS} readOnly={!!userRegistration?.team_name} />
                  <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Project Name *" className={INPUT_CLASS} />
                  <div>
                    <input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="140-character tagline" className={INPUT_CLASS} maxLength={140} />
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[14px] font-bold text-white">Project Artifacts</h4>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#FF8C32] bg-[#FF8C32]/10 px-2 py-1 rounded-md"><Zap size={12}/> AI Analyzed</div>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]"><GitBranch size={16}/></div>
                    <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="GitHub Repository URL" className={`${INPUT_CLASS} pl-12`} />
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]"><FileText size={16}/></div>
                    <input value={pptUrl} onChange={e => setPptUrl(e.target.value)} placeholder="Pitch Deck URL (Google Slides/PDF)" className={`${INPUT_CLASS} pl-12`} />
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]"><PlayCircle size={16}/></div>
                    <input value={demoUrl} onChange={e => setDemoUrl(e.target.value)} placeholder="Demo Video URL (YouTube/Loom)" className={`${INPUT_CLASS} pl-12`} />
                  </div>
                </div>
              </section>

              <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 flex items-start gap-4">
                <HelpCircle size={18} className="text-blue-400 mt-0.5 shrink-0" />
                <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                  Our multi-modal AI reads your code, extracts insights from your presentation, and analyzes your video demo. Providing all three links ensures the highest possible accuracy during automated judging.
                </p>
              </div>
            </div>
            
            <div className="px-8 py-6 border-t border-white/5 bg-[#0A0A0A] flex-shrink-0">
              <button onClick={handleSubmit} disabled={submitting || !teamName.trim() || !projectName.trim()}
                className="w-full bg-[#FF8C32] hover:bg-[#FF6B00] disabled:opacity-50 text-black rounded-xl py-4 text-[15px] font-bold transition-all active:scale-[0.98]">
                {submitting ? 'Encrypting & Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// MAIN PUBLIC HACKATHON PAGE
// ═══════════════════════════════════════════════════════════
export default function HackathonPublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regCount, setRegCount] = useState(0);
  const [subCount, setSubCount] = useState(0);
  const [showRegister, setShowRegister] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  
  const [activeSection, setActiveSection] = useState('overview');
  const [userRegistration, setUserRegistration] = useState(null);
  const [userSubmission, setUserSubmission] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await insforge.database.from('hackathons').select().eq('id', id).maybeSingle();
        if (error || !data) { setLoading(false); return; }
        setHackathon(data);

        const { data: regs } = await insforge.database.from('registrations').select('id', { count: 'exact' }).eq('hackathon_id', id);
        const { data: subs } = await insforge.database.from('submissions').select('id', { count: 'exact' }).eq('hackathon_id', id);
        setRegCount(regs?.length || 0);
        setSubCount(subs?.length || 0);

        if (user) {
          const { data: myReg } = await insforge.database.from('registrations').select('*').eq('hackathon_id', id).eq('user_id', user.id).maybeSingle();
          if (myReg) {
            setUserRegistration(myReg);
            const { data: mySub } = await insforge.database.from('submissions').select('*').eq('hackathon_id', id).eq('user_id', user.id).maybeSingle();
            if (mySub) setUserSubmission(mySub);
          }
        }
      } catch (err) {
        console.error('Error fetching:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user, authLoading]);

  // Section Observer for scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { rootMargin: '-20% 0px -80% 0px' });

    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => observer.observe(s));
    return () => sections.forEach(s => observer.unobserve(s));
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#FF8C32]" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-inter flex flex-col items-center justify-center">
        <AlertCircle size={48} className="text-[#333] mb-5" />
        <h2 className="text-[22px] font-bold tracking-tight mb-2">Event Unavailable</h2>
        <p className="text-[14px] text-[#888] mb-8">The hackathon you are looking for does not exist.</p>
        <button onClick={() => navigate('/')} className="text-[#FF8C32] hover:text-white text-[14px] font-semibold transition-colors">
          Return to Platform
        </button>
      </div>
    );
  }

  const status = getHackathonStatus(hackathon);
  const countdown = getCountdown(hackathon.submission_deadline);
  const prizes = hackathon.prizes || [];
  const criteria = hackathon.criteria || {};
  const themes = hackathon.themes || [];
  const totalPrize = prizes.reduce((sum, p) => sum + (p.amount?.match(/[\d,]+/) ? parseInt(p.amount.match(/[\d,]+/)[0].replace(/,/g, '')) : 0), 0);

  const isRegOpen = new Date() <= new Date(hackathon.registration_closes);
  const isSubOpen = new Date() <= new Date(hackathon.submission_deadline);

  const handleRegisterClick = () => {
    if (!user) navigate(`/auth?returnTo=/hackathon/${id}?action=register`);
    else setShowRegister(true);
  };

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'requirements', label: 'Rules & Req' },
    { id: 'prizes', label: 'Prizes' },
    { id: 'judging', label: 'Judging' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-inter selection:bg-[#FF8C32]/30 pb-20 lg:pb-0">
      {showRegister && <RegisterWizard hackathon={hackathon} user={user} onClose={() => setShowRegister(false)} onSuccess={() => { setRegCount(c => c + 1); setUserRegistration({ id: 'pending' }); }} />}
      {showSubmit && <SubmitModal hackathon={hackathon} user={user} userRegistration={userRegistration} onClose={() => { setShowSubmit(false); window.location.reload(); }} />}

      {/* TOP NAV */}
      <nav className="h-[64px] border-b border-white/[0.05] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-xl">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#888] hover:text-white transition-colors">
          <ArrowLeft size={16} />
          <span className="text-[13px] font-bold tracking-widest uppercase">Hackloom</span>
        </button>
      </nav>

      {/* HERO SECTION */}
      <div className="relative pt-10 pb-12 lg:pt-16 lg:pb-20 border-b border-white/[0.05] bg-[#0A0A0A] overflow-hidden">
        {/* Subtle ambient glow — restrained */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#FF8C32]/[0.03] blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 relative z-10">
          {/* Status + Type badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-5">
            <div className="flex items-center gap-2 border border-white/10 px-3 py-1 rounded-full">
              <div className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse shrink-0`} />
              <span className="text-[11px] font-bold text-white tracking-[0.12em] uppercase">{status.label}</span>
            </div>
            {hackathon.type && (
              <span className="text-[11px] font-medium text-[#888] capitalize flex items-center gap-1.5 border border-white/5 px-3 py-1 rounded-full">
                {hackathon.type === 'online' ? <Globe size={12} /> : <MapPin size={12} />}
                {hackathon.type}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-[36px] sm:text-[52px] lg:text-[64px] font-black text-white leading-[1.05] tracking-tight mb-4 max-w-3xl">
            {hackathon.name}
          </h1>

          {/* Tagline */}
          {hackathon.tagline && (
            <p className="text-[16px] sm:text-[18px] text-[#A1A1AA] leading-relaxed font-light mb-6 max-w-2xl">
              {hackathon.tagline}
            </p>
          )}

          {/* Inline meta strip — replaces the old stats widget grid */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-white/[0.06] mt-2">
            {totalPrize > 0 && (
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-[#FF8C32] shrink-0" />
                <span className="text-[13px] font-bold text-[#FF8C32]">${totalPrize.toLocaleString()}</span>
                <span className="text-[12px] text-[#666] font-medium">prize pool</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[#888] shrink-0" />
              <span className="text-[13px] font-bold text-white">{regCount}</span>
              <span className="text-[12px] text-[#666] font-medium">builders</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-[#888] shrink-0" />
              <span className="text-[13px] font-bold text-white">{subCount}</span>
              <span className="text-[12px] text-[#666] font-medium">submissions</span>
            </div>
            {hackathon.submission_deadline && (
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#888] shrink-0" />
                <span className="text-[12px] text-[#666] font-medium">Deadline</span>
                <span className="text-[13px] font-bold text-white">{formatDate(hackathon.submission_deadline)}</span>
              </div>
            )}
          </div>

          {/* Themes */}
          {themes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {themes.map((theme) => (
                <span key={theme} className="text-[11px] font-semibold text-[#666] uppercase tracking-wider px-2.5 py-1 rounded-md border border-white/5">
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-20">
          
          {/* LEFT COLUMN: Content */}
          <div className="min-w-0">
            
            {/* Mobile/Desktop Sticky Nav */}
            <div className="sticky top-[64px] z-30 bg-[#050505]/95 backdrop-blur-md pt-6 pb-4 border-b border-white/5 mb-12 overflow-x-auto hide-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0">
              <div className="flex gap-6 sm:gap-8 min-w-max">
                {navItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`pb-3 text-[13px] font-bold tracking-[0.08em] uppercase transition-all relative ${activeSection === item.id ? 'text-white' : 'text-[#666] hover:text-[#aaa]'}`}
                  >
                    {item.label}
                    {activeSection === item.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF8C32] rounded-t-full shadow-[0_-2px_8px_rgba(255,140,50,0.4)]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-16">
              
              {/* OVERVIEW */}
              <section id="overview" className="content-section scroll-mt-[140px]">
                <h2 className="text-[22px] font-bold text-white mb-6 tracking-tight">Overview</h2>
                <div className="prose prose-invert prose-p:text-[#A1A1AA] prose-p:text-[16px] prose-p:leading-[1.8] max-w-none">
                  {hackathon.description || 'Join us for this exciting hackathon.'}
                </div>

                {hackathon.problem_statement && (
                  <div className="mt-10 border-l-2 border-[#FF8C32] pl-6 py-2">
                    <h3 className="text-[12px] font-bold text-[#FF8C32] uppercase tracking-[0.1em] mb-3">
                      The Challenge
                    </h3>
                    <p className="text-[16px] text-white leading-relaxed font-medium">
                      {hackathon.problem_statement}
                    </p>
                  </div>
                )}
              </section>

              {/* RULES & REQUIREMENTS */}
              <section id="requirements" className="content-section scroll-mt-[140px]">
                <h2 className="text-[22px] font-bold text-white mb-6 tracking-tight">Rules & Requirements</h2>
                
                <div className="flex flex-col sm:flex-row gap-8 mb-10 border-b border-white/[0.05] pb-8">
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-[#666] uppercase tracking-[0.15em] mb-2">Team Size</div>
                    <div className="text-[15px] font-medium text-white flex items-center gap-2">
                      <Users size={16} className="text-[#FF8C32]" />
                      {hackathon.team_size_min || 1} - {hackathon.team_size_max || 5} Members
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-[#666] uppercase tracking-[0.15em] mb-2">Eligibility</div>
                    <div className="text-[15px] font-medium text-white capitalize flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[#FF8C32]" />
                      {hackathon.eligibility || 'Open to everyone'}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[16px] font-bold text-white mb-6 tracking-tight">Required Artifacts</h3>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5"><GitBranch size={18} className="text-[#888]" /></div>
                      <div>
                        <div className="text-[14px] font-bold text-white mb-1">Source Code Repository</div>
                        <div className="text-[14px] text-[#A1A1AA] leading-relaxed max-w-[500px]">Public GitHub or GitLab repository link used for AI code-quality and plagiarism analysis.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5"><FileText size={18} className="text-[#888]" /></div>
                      <div>
                        <div className="text-[14px] font-bold text-white mb-1">Presentation Deck</div>
                        <div className="text-[14px] text-[#A1A1AA] leading-relaxed max-w-[500px]">Slide deck (PDF or link) explaining the problem, solution, and business/technical value.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5"><PlayCircle size={18} className="text-[#888]" /></div>
                      <div>
                        <div className="text-[14px] font-bold text-white mb-1">Demo Video</div>
                        <div className="text-[14px] text-[#A1A1AA] leading-relaxed max-w-[500px]">2-3 minute video demonstrating your working prototype. Required for AI scoring.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* PRIZES */}
              <section id="prizes" className="content-section scroll-mt-[140px]">
                <h2 className="text-[22px] font-bold text-white mb-6 tracking-tight">Prizes</h2>
                {prizes.length === 0 ? (
                  <div className="text-[14px] text-[#888] font-medium italic">
                    Prizes have not been announced yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {prizes.map((prize, i) => {
                      const isFirst = i === 0;
                      return (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.05] py-5 group hover:border-white/10 transition-colors gap-3 sm:gap-0">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold ${isFirst ? 'bg-[#FF8C32]/10 text-[#FF8C32] border border-[#FF8C32]/20' : 'bg-[#111] text-[#888] border border-white/5'}`}>
                              {i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `${i+1}th`}
                            </div>
                            <div>
                              <div className={`text-[16px] font-bold ${isFirst ? 'text-[#FF8C32]' : 'text-white'}`}>{prize.place}</div>
                              {prize.description && <div className="text-[14px] text-[#A1A1AA] mt-1">{prize.description}</div>}
                            </div>
                          </div>
                          <div className={`text-[24px] font-black tracking-tight ${isFirst ? 'text-[#FF8C32]' : 'text-white'}`}>
                            {prize.amount}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* JUDGING */}
              <section id="judging" className="content-section scroll-mt-[140px]">
                <h2 className="text-[22px] font-bold text-white mb-6 tracking-tight">Judging Criteria</h2>
                
                <div className="bg-[#111] border border-white/5 rounded-xl p-5 mb-8 flex items-start gap-4">
                  <div className="shrink-0 mt-0.5"><Sparkles size={18} className="text-[#FF8C32]" /></div>
                  <div>
                    <h3 className="text-[14px] font-bold text-white mb-1">AI-Powered Evaluation</h3>
                    <p className="text-[14px] text-[#A1A1AA] leading-relaxed">
                      Submissions are rigorously scored across defined criteria using multi-modal AI analysis of your codebase, presentation, and demo video.
                    </p>
                  </div>
                </div>

                <div className="border border-white/5 rounded-xl overflow-hidden bg-[#0A0A0A]">
                  {Object.entries(criteria).map(([key, val], idx) => (
                    <div key={key} className={`flex items-center justify-between p-4 ${idx !== Object.keys(criteria).length - 1 ? 'border-b border-white/5' : ''}`}>
                      <div className="text-[14px] font-medium text-white capitalize">{key.replace(/_/g, ' ')}</div>
                      <div className="text-[14px] font-bold text-[#FF8C32]">{val}%</div>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-[140px]">
              
              {/* Main Action Card */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-[24px] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-[#FF8C32]/[0.03] to-transparent pointer-events-none" />
                
                <div className="relative z-10 text-center mb-8">
                  <div className="text-[12px] font-bold text-[#888] uppercase tracking-[0.1em] mb-3">
                    {userSubmission ? 'Project Status' : userRegistration ? 'Time to Submit' : 'Time to Register'}
                  </div>
                  
                  {!userSubmission && countdown && !countdown.expired ? (
                    <div className="text-[40px] font-black text-white tracking-tight tabular-nums leading-none">
                      {countdown.text}
                    </div>
                  ) : userSubmission ? (
                    <div className="text-[24px] font-bold text-green-400 flex items-center justify-center gap-2 mt-2">
                      <CheckCircle2 size={24} /> Submitted
                    </div>
                  ) : (
                    <div className="text-[28px] font-bold text-white tracking-tight mt-2">Closed</div>
                  )}
                </div>

                {/* Primary CTA */}
                <div className="mb-10 relative z-10">
                  {userSubmission ? (
                    <button disabled className="w-full bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl py-4 text-[15px] font-bold cursor-not-allowed shadow-sm">
                      Submission Received
                    </button>
                  ) : userRegistration ? (
                    isSubOpen ? (
                      <button onClick={() => setShowSubmit(true)} className="w-full bg-[#FF8C32] hover:bg-[#FF6B00] text-black rounded-xl py-4 text-[15px] font-bold transition-transform active:scale-[0.98] shadow-[0_0_20px_rgba(255,140,50,0.2)]">
                        Submit Project Now
                      </button>
                    ) : (
                      <button disabled className="w-full bg-[#111] border border-white/10 text-[#888] rounded-xl py-4 text-[15px] font-bold cursor-not-allowed">
                        Submissions Closed
                      </button>
                    )
                  ) : (
                    isRegOpen ? (
                      <button onClick={handleRegisterClick} className="w-full bg-white hover:bg-[#f0f0f0] text-black rounded-xl py-4 text-[15px] font-bold transition-transform active:scale-[0.98] shadow-sm">
                        Register Now
                      </button>
                    ) : (
                      <button disabled className="w-full bg-[#111] border border-white/10 text-[#888] rounded-xl py-4 text-[15px] font-bold cursor-not-allowed">
                        Registration Closed
                      </button>
                    )
                  )}
                </div>

                <div className="h-px bg-white/10 w-full mb-8 relative z-10" />

                {/* Timeline */}
                <div className="relative z-10">
                  <div className="text-[14px] font-bold text-white mb-6 flex items-center gap-2">
                    <Calendar size={16} className="text-[#888]" /> Event Timeline
                  </div>
                  <div className="relative border-l-2 border-white/5 ml-2 pl-6 space-y-6">
                    {[
                      { label: 'Registration Opens', date: hackathon.registration_opens },
                      { label: 'Submission Deadline', date: hackathon.submission_deadline },
                      { label: 'Judging Complete', date: hackathon.results_date },
                    ].filter(d => d.date).map((item, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[31px] top-[6px] w-3 h-3 rounded-full bg-[#0A0A0A] border-2 border-[#FF8C32]" />
                        <div className="text-[14px] font-bold text-white mb-0.5">{formatDateShort(item.date)}</div>
                        <div className="text-[13px] text-[#888] font-medium">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Host Tag */}
              <div className="mt-8 flex items-center justify-center gap-2 text-[13px] text-[#666]">
                Hosted on <span className="font-semibold text-[#888] flex items-center gap-1.5"><Sparkles size={14} className="text-[#FF8C32]"/> Hackloom</span>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Sticky & Elevated) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 px-5 py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-between gap-4 max-w-[1100px] mx-auto">
          <div className="flex flex-col min-w-0">
            {userSubmission ? (
              <span className="text-[15px] font-bold text-green-400 flex items-center gap-1.5"><CheckCircle2 size={18}/> Submitted</span>
            ) : (
              <>
                <span className="text-[11px] text-[#888] font-bold uppercase tracking-widest mb-0.5 truncate">
                  {userRegistration ? 'Submit by' : 'Register by'}
                </span>
                <span className="text-[15px] font-bold text-white truncate">
                  {formatDateShort(userRegistration ? hackathon.submission_deadline : hackathon.registration_closes)}
                </span>
              </>
            )}
          </div>
          <div className="shrink-0">
            {userSubmission ? (
              <button disabled className="bg-[#111] border border-white/10 text-white rounded-xl px-6 py-3.5 text-[14px] font-bold">View Status</button>
            ) : userRegistration ? (
              isSubOpen ? (
                <button onClick={() => setShowSubmit(true)} className="bg-[#FF8C32] text-black rounded-xl px-6 py-3.5 text-[14px] font-bold active:scale-[0.98] shadow-[0_0_15px_rgba(255,140,50,0.2)]">Submit Project</button>
              ) : (
                <button disabled className="bg-[#111] text-[#888] rounded-xl px-6 py-3.5 text-[14px] font-bold">Closed</button>
              )
            ) : (
              isRegOpen ? (
                <button onClick={handleRegisterClick} className="bg-white text-black rounded-xl px-8 py-3.5 text-[14px] font-bold active:scale-[0.98] shadow-sm">Register</button>
              ) : (
                <button disabled className="bg-[#111] text-[#888] rounded-xl px-6 py-3.5 text-[14px] font-bold">Closed</button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
