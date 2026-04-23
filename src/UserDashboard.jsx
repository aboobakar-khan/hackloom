import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { insforge } from './lib/insforge';
import { useAuth } from './AuthContext';
import './dashboard.css';
import {
  LayoutDashboard, Trophy, Clock, Calendar, ExternalLink, LogOut, User,
  Loader2, ChevronRight, Rocket, Star, Zap, ArrowUpRight, Search,
  CheckCircle, AlertCircle, FileText, MapPin, Globe, Settings, Bell
} from 'lucide-react';


// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatus(h) {
  const now = new Date();
  if (now < new Date(h.registration_opens)) return { label: 'Upcoming', color: 'bg-blue-500/10 text-blue-400' };
  if (now <= new Date(h.registration_closes)) return { label: 'Open', color: 'bg-green-500/10 text-green-400' };
  if (now <= new Date(h.submission_deadline)) return { label: 'Submissions', color: 'bg-orange-500/10 text-orange-400' };
  return { label: 'Ended', color: 'bg-white/5 text-[#888]' };
}


// ═══════════════════════════════════════════════════════════
// STAT CARD — inspired by reference dashboards
// ═══════════════════════════════════════════════════════════
function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-[#111]/80 backdrop-blur-xl border border-white/[0.05] rounded-2xl p-6 group hover:border-nexus-primary/30 hover:-translate-y-0.5 transition-all shadow-lg">
      <div className="flex items-start justify-between mb-5">
        <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#888]">{label}</span>
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-nexus-primary/10 group-hover:border-nexus-primary/20 transition-colors">
          <Icon size={16} className="text-[#888] group-hover:text-nexus-primary transition-colors" />
        </div>
      </div>
      <div className="text-[36px] font-bold text-white leading-none tracking-tight">{value}</div>
      {sub && <p className="text-[12px] text-[#666] mt-2">{sub}</p>}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// HACKATHON CARD — clean card with status pill
// ═══════════════════════════════════════════════════════════
function HackathonCard({ hackathon, registration, submission }) {
  const status = getStatus(hackathon);
  return (
    <Link to={`/hackathon/${hackathon.id}`} className="block group">
      <div className="bg-[#111]/80 backdrop-blur-xl border border-white/[0.05] rounded-2xl p-5 hover:border-nexus-primary/30 hover:-translate-y-0.5 transition-all shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#0A0A0A] border border-white/10 overflow-hidden shrink-0">
            {hackathon.cover_image_url ? (
              <img src={hackathon.cover_image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-nexus-primary/40 bg-gradient-to-br from-white/5 to-transparent">
                <Rocket size={22} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-[15px] font-bold text-white truncate group-hover:text-nexus-primary transition-colors">{hackathon.name}</h4>
              <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
            </div>
            <p className="text-[12px] text-[#888] truncate">{hackathon.tagline || 'No description'}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-[11px] text-[#666] flex items-center gap-1"><Calendar size={11} /> {formatDate(hackathon.submission_deadline)}</span>
              <span className="text-[11px] text-[#666] flex items-center gap-1">
                {hackathon.type === 'online' ? <Globe size={11} /> : <MapPin size={11} />}
                {hackathon.type}
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#444] group-hover:text-nexus-primary transition-colors shrink-0 mt-1" />
        </div>
        {/* Bottom status bar */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/[0.04]">
          {registration && (
            <span className="text-[11px] font-medium text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Registered</span>
          )}
          {submission && (
            <span className="text-[11px] font-medium text-blue-400 flex items-center gap-1"><FileText size={12} /> Submitted</span>
          )}
          {!registration && !submission && (
            <span className="text-[11px] text-[#555]">Not registered</span>
          )}
        </div>
      </div>
    </Link>
  );
}


// ═══════════════════════════════════════════════════════════
// MAIN USER DASHBOARD
// ═══════════════════════════════════════════════════════════
export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshSession } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hackathons, setHackathons] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [activePage, setActivePage] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // All published hackathons
        const { data: hacks } = await insforge.database.from('hackathons').select().eq('status', 'published').order('created_at', { ascending: false });
        setHackathons(hacks || []);

        // My registrations
        const { data: regs } = await insforge.database.from('registrations').select().eq('user_id', user.id);
        setMyRegistrations(regs || []);

        // My submissions
        const { data: subs } = await insforge.database.from('submissions').select().eq('user_id', user.id);
        setMySubmissions(subs || []);
      } catch (err) {
        console.error('Error fetching user dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await insforge.auth.signOut();
    await refreshSession();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="nexus-dashboard min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-nexus-primary" />
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.profile?.name || user?.email?.split('@')[0] || 'User';
  const registeredIds = new Set(myRegistrations.map(r => r.hackathon_id));
  const submittedIds = new Set(mySubmissions.map(s => s.hackathon_id));
  const myHackathons = hackathons.filter(h => registeredIds.has(h.id));
  const recommended = hackathons.filter(h => !registeredIds.has(h.id) && new Date(h.registration_closes) > new Date());

  const NAV = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'my', label: 'My Hackathons', icon: Rocket },
    { id: 'explore', label: 'Explore', icon: Search },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="bg-[#111] border border-white/[0.05] rounded-2xl h-32" />)}
          </div>
          <div className="bg-[#111] border border-white/[0.05] rounded-2xl h-64" />
        </div>
      );
    }

    if (activePage === 'home') {
      return (
        <>
          {/* Greeting */}
          <div className="mb-10">
            <h2 className="text-[28px] font-bold text-white tracking-tight">Hello, {userName} 👋</h2>
            <p className="text-[15px] text-[#888] mt-1">Here's your hackathon activity overview.</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            <StatCard icon={Rocket} label="Registered" value={myRegistrations.length} sub="Hackathons joined" />
            <StatCard icon={FileText} label="Submitted" value={mySubmissions.length} sub="Projects submitted" />
            <StatCard icon={Trophy} label="Active" value={myHackathons.filter(h => new Date(h.submission_deadline) > new Date()).length} sub="Ongoing hackathons" />
          </div>

          {/* My Active Hackathons */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] font-bold text-white">My Hackathons</h3>
              <button onClick={() => setActivePage('my')} className="text-[13px] font-medium text-nexus-primary hover:text-nexus-primary-hover flex items-center gap-1 transition-colors">
                View All <ArrowUpRight size={14} />
              </button>
            </div>
            {myHackathons.length === 0 ? (
              <div className="bg-[#111]/80 border border-white/[0.05] rounded-2xl p-12 text-center">
                <Rocket size={36} className="mx-auto mb-4 text-[#444]" />
                <p className="text-[15px] text-[#F5F5F5] font-medium mb-1">No hackathons yet</p>
                <p className="text-[13px] text-[#888] mb-6">Explore and register for hackathons to get started.</p>
                <button onClick={() => setActivePage('explore')} className="text-[13px] font-semibold text-nexus-primary hover:text-nexus-primary-hover transition-colors">
                  Browse Hackathons →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myHackathons.slice(0, 4).map(h => (
                  <HackathonCard key={h.id} hackathon={h} registration={myRegistrations.find(r => r.hackathon_id === h.id)} submission={mySubmissions.find(s => s.hackathon_id === h.id)} />
                ))}
              </div>
            )}
          </div>

          {/* Recommended */}
          {recommended.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[18px] font-bold text-white flex items-center gap-2"><Zap size={16} className="text-nexus-primary" /> Recommended for You</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommended.slice(0, 4).map(h => (
                  <HackathonCard key={h.id} hackathon={h} />
                ))}
              </div>
            </div>
          )}
        </>
      );
    }

    if (activePage === 'my') {
      return (
        <>
          <h2 className="text-[24px] font-bold text-white mb-6">My Hackathons</h2>
          {myHackathons.length === 0 ? (
            <div className="bg-[#111]/80 border border-white/[0.05] rounded-2xl p-16 text-center">
              <Rocket size={40} className="mx-auto mb-4 text-[#444]" />
              <p className="text-[15px] text-white font-medium mb-1">Nothing here yet</p>
              <p className="text-[13px] text-[#888]">Register for hackathons to see them here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myHackathons.map(h => (
                <HackathonCard key={h.id} hackathon={h} registration={myRegistrations.find(r => r.hackathon_id === h.id)} submission={mySubmissions.find(s => s.hackathon_id === h.id)} />
              ))}
            </div>
          )}
        </>
      );
    }

    if (activePage === 'explore') {
      return (
        <>
          <h2 className="text-[24px] font-bold text-white mb-6">Explore Hackathons</h2>
          {hackathons.length === 0 ? (
            <div className="bg-[#111]/80 border border-white/[0.05] rounded-2xl p-16 text-center">
              <Search size={40} className="mx-auto mb-4 text-[#444]" />
              <p className="text-[15px] text-white font-medium mb-1">No hackathons available</p>
              <p className="text-[13px] text-[#888]">Check back soon for new hackathons.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {hackathons.map(h => (
                <HackathonCard key={h.id} hackathon={h} registration={myRegistrations.find(r => r.hackathon_id === h.id)} submission={mySubmissions.find(s => s.hackathon_id === h.id)} />
              ))}
            </div>
          )}
        </>
      );
    }
  };

  return (
    <div className="nexus-dashboard min-h-screen h-screen bg-[#0A0A0A] text-[#F5F5F5] font-inter flex overflow-hidden">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[240px] shrink-0 bg-[#0D0D0D] border-r border-white/[0.05] flex flex-col transform transition-transform duration-300 md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 h-[60px] flex items-center gap-2.5 border-b border-white/[0.05]">
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="udhlG" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#F97316"/><stop offset="100%" stopColor="#FB9A57"/></linearGradient></defs><path d="M8 7h3v7.5h10V7h3v18h-3v-7.5H11V25H8V7z" fill="url(#udhlG)"/></svg>
          <span className="text-[16px] font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Hackloom</span>
          <span className="ml-auto text-[10px] font-bold text-[#666] bg-white/5 px-2 py-0.5 rounded-full">BETA</span>
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {NAV.map(item => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-lg text-[13px] font-medium mb-0.5 transition-colors relative ${
                  isActive ? 'text-nexus-primary bg-nexus-primary/[0.08]' : 'text-[#888] hover:text-[#F5F5F5] hover:bg-white/[0.03]'
                }`}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-nexus-primary rounded-r-full" />}
                <item.icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-nexus-primary/15 flex items-center justify-center shrink-0">
              <User size={14} className="text-nexus-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-[#F5F5F5] truncate">{userName}</div>
              <div className="text-[11px] text-[#888] truncate">{user?.email}</div>
            </div>
            <button onClick={handleLogout} className="text-[#888] hover:text-[#EF4444] transition-colors p-1" title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative h-full">
        <header className="h-[60px] shrink-0 bg-[#0D0D0D] border-b border-white/[0.05] flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-[#888] p-1" onClick={() => setIsSidebarOpen(true)}>
              <LayoutDashboard size={20} />
            </button>
            <h1 className="text-[17px] font-bold text-white">{activePage === 'home' ? 'Dashboard' : activePage === 'my' ? 'My Hackathons' : 'Explore'}</h1>
          </div>
          <Link to="/" className="text-[13px] font-medium text-[#888] hover:text-white transition-colors flex items-center gap-1">
            Home <ExternalLink size={12} />
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-10 bg-[#0A0A0A]">
          <div className="max-w-[1000px] mx-auto w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
