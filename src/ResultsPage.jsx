import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { insforge } from './lib/insforge';
import { useAuth } from './AuthContext';
import {
  ArrowLeft, Trophy, Award, Star, Download, FileText, Loader2,
  CheckCircle, XCircle, Medal, Users, Calendar, ExternalLink, Sparkles
} from 'lucide-react';

const STATUS_CONFIG = {
  winner: { label: 'Winner', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  'runner-up': { label: 'Runner-up', icon: Award, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  finalist: { label: 'Finalist', icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  qualified: { label: 'Qualified', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  not_selected: { label: 'Not Selected', icon: XCircle, color: 'text-[#888]', bg: 'bg-white/5 border-white/10' },
  participation_completed: { label: 'Participation Completed', icon: Medal, color: 'text-[#FF8C32]', bg: 'bg-[#FF8C32]/10 border-[#FF8C32]/20' },
};

export default function ResultsPage() {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hackathon, setHackathon] = useState(null);
  const [myResult, setMyResult] = useState(null);
  const [myReg, setMyReg] = useState(null);
  const [publicResults, setPublicResults] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const { data: h } = await insforge.database.from('hackathons').select().eq('id', hackathonId).maybeSingle();
        setHackathon(h);

        // Public winners
        const { data: pubRes } = await insforge.database.from('results').select('*').eq('hackathon_id', hackathonId).eq('is_published', true).eq('public_visible', true).order('rank', { ascending: true }).limit(10);
        setPublicResults(pubRes || []);

        if (user) {
          const { data: reg } = await insforge.database.from('registrations').select('*').eq('hackathon_id', hackathonId).eq('user_id', user.id).maybeSingle();
          setMyReg(reg);
          if (reg) {
            const { data: res } = await insforge.database.from('results').select('*').eq('registration_id', reg.id).eq('is_published', true).maybeSingle();
            setMyResult(res);
          }
        }
      } catch (err) {
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [hackathonId, user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#FF8C32]" />
      </div>
    );
  }

  const sc = myResult ? (STATUS_CONFIG[myResult.final_status] || STATUS_CONFIG.participation_completed) : null;
  const StatusIcon = sc?.icon || Medal;

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-inter">
      {/* Nav */}
      <nav className="h-[64px] border-b border-white/[0.05] flex items-center px-4 sm:px-8 sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-xl">
        <button onClick={() => navigate(`/hackathon/${hackathonId}`)} className="flex items-center gap-2 text-[#888] hover:text-white transition-colors">
          <ArrowLeft size={16} />
          <span className="text-[13px] font-bold tracking-widest uppercase">Back to Event</span>
        </button>
      </nav>

      <div className="max-w-[800px] mx-auto px-6 sm:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="text-[11px] font-bold text-[#FF8C32] uppercase tracking-[0.12em] mb-2">Results</div>
          <h1 className="text-[32px] sm:text-[44px] font-black text-white tracking-tight leading-[1.1]">{hackathon?.name || 'Hackathon'}</h1>
        </div>

        {/* My Result - Private */}
        {myResult && sc && (
          <div className="mb-12">
            <h2 className="text-[16px] font-bold text-white mb-4 flex items-center gap-2"><Star size={16} className="text-[#FF8C32]" /> Your Result</h2>
            <div className={`border rounded-2xl p-6 sm:p-8 ${sc.bg}`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className={`flex items-center gap-3 mb-2`}>
                    <StatusIcon size={28} className={sc.color} />
                    <span className={`text-[24px] sm:text-[32px] font-black ${sc.color}`}>{sc.label}</span>
                  </div>
                  {myResult.rank && <div className="text-[14px] text-[#888] font-medium">Rank #{myResult.rank}</div>}
                </div>
                {myResult.score && (
                  <div className="text-right">
                    <div className="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-1">Score</div>
                    <div className="text-[28px] font-black text-white">{myResult.score}<span className="text-[14px] text-[#888]">/100</span></div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/10">
                <div>
                  <div className="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-1">Team</div>
                  <div className="text-[14px] font-medium text-white">{myResult.team_name || myReg?.team_name || '—'}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-1">Project</div>
                  <div className="text-[14px] font-medium text-white">{myResult.project_title || myReg?.project_title || '—'}</div>
                </div>
              </div>

              {myResult.feedback_summary && (
                <div className="mb-6">
                  <div className="text-[12px] font-bold text-[#888] uppercase tracking-wider mb-2">Judge Feedback</div>
                  <p className="text-[14px] text-[#ccc] leading-relaxed bg-black/20 rounded-xl p-4 border border-white/5">{myResult.feedback_summary}</p>
                </div>
              )}

              {myResult.feedback_pdf_url && (
                <a href={myResult.feedback_pdf_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl px-5 py-3 text-[13px] font-bold transition-colors">
                  <Download size={16} /> Download Feedback PDF
                </a>
              )}
            </div>
          </div>
        )}

        {/* Not registered message */}
        {!myReg && user && (
          <div className="mb-12 bg-[#111] border border-white/5 rounded-2xl p-8 text-center">
            <FileText size={32} className="mx-auto mb-3 text-[#444]" />
            <p className="text-[15px] text-[#888]">You weren't registered for this hackathon.</p>
          </div>
        )}

        {/* Registered but no result yet */}
        {myReg && !myResult && (
          <div className="mb-12 bg-[#111] border border-white/5 rounded-2xl p-8 text-center">
            <Sparkles size={32} className="mx-auto mb-3 text-[#FF8C32]" />
            <p className="text-[15px] text-white font-medium mb-1">Results Pending</p>
            <p className="text-[13px] text-[#888]">Results haven't been published for your team yet. Check back soon.</p>
          </div>
        )}

        {/* Public Winners */}
        {publicResults.length > 0 && (
          <div>
            <h2 className="text-[16px] font-bold text-white mb-4 flex items-center gap-2"><Trophy size={16} className="text-[#FF8C32]" /> Top Projects</h2>
            <div className="space-y-3">
              {publicResults.map((r, i) => {
                const rsc = STATUS_CONFIG[r.final_status] || STATUS_CONFIG.participation_completed;
                return (
                  <div key={r.id} className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-black shrink-0 ${i === 0 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : i === 1 ? 'bg-gray-400/10 text-gray-300 border border-gray-400/20' : i === 2 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-white/5 text-[#888] border border-white/10'}`}>
                      {r.rank || i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-white truncate">{r.project_title || 'Untitled'}</div>
                      <div className="text-[12px] text-[#888] flex items-center gap-2 mt-0.5">
                        <Users size={11} /> {r.team_name || 'Anonymous'}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rsc.bg} ${rsc.color}`}>{rsc.label}</span>
                      </div>
                    </div>
                    {r.score && <div className="text-[18px] font-black text-white shrink-0">{r.score}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Not logged in */}
        {!user && !authLoading && (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-8 text-center">
            <p className="text-[15px] text-[#888] mb-4">Log in to see your personal results.</p>
            <Link to={`/auth?returnTo=/hackathon/${hackathonId}/results`} className="inline-flex items-center gap-2 bg-[#FF8C32] text-black rounded-xl px-6 py-3 text-[14px] font-bold" style={{ textDecoration: 'none' }}>
              Sign In <ExternalLink size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
