import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { insforge } from './lib/insforge';
import { useAuth } from './AuthContext';
import {
  ArrowLeft, Loader2, Search, Trophy, Save, Eye, EyeOff, Send,
  ChevronDown, X, Upload, FileText, CheckCircle, AlertCircle, Users
} from 'lucide-react';

const IC = "w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-[#555] outline-none focus:border-[#FF8C32]/50 transition-all";
const STATUSES = ['winner', 'runner-up', 'finalist', 'qualified', 'not_selected', 'participation_completed'];
const STATUS_LABELS = { winner: 'Winner', 'runner-up': 'Runner-up', finalist: 'Finalist', qualified: 'Qualified', not_selected: 'Not Selected', participation_completed: 'Participated' };

export default function OrganizerResults() {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hackathon, setHackathon] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [results, setResults] = useState({});
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [publishWinners, setPublishWinners] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data: h } = await insforge.database.from('hackathons').select().eq('id', hackathonId).maybeSingle();
        setHackathon(h);

        const { data: regs } = await insforge.database.from('registrations').select('*').eq('hackathon_id', hackathonId).order('registered_at', { ascending: false });
        setRegistrations(regs || []);

        const { data: res } = await insforge.database.from('results').select('*').eq('hackathon_id', hackathonId);
        const resMap = {};
        (res || []).forEach(r => { resMap[r.registration_id] = r; });
        setResults(resMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [hackathonId, user, authLoading]);

  const getResult = (regId) => results[regId] || { final_status: 'participation_completed', rank: null, score: null, feedback_summary: '', judge_remarks: '', feedback_pdf_url: '', is_published: false, public_visible: false };

  const updateResult = (regId, field, value) => {
    setResults(prev => ({
      ...prev,
      [regId]: { ...getResult(regId), [field]: value }
    }));
  };

  const saveResult = async (reg) => {
    setSaving(true);
    try {
      const r = getResult(reg.id);
      const payload = {
        registration_id: reg.id,
        hackathon_id: hackathonId,
        user_id: reg.user_id,
        team_name: reg.team_name,
        project_title: reg.project_title,
        rank: r.rank ? parseInt(r.rank) : null,
        final_status: r.final_status,
        score: r.score ? parseFloat(r.score) : null,
        feedback_summary: r.feedback_summary || null,
        judge_remarks: r.judge_remarks || null,
        feedback_pdf_url: r.feedback_pdf_url || null,
        is_published: r.is_published || false,
        public_visible: r.public_visible || false,
        updated_at: new Date().toISOString(),
      };

      if (r.id) {
        await insforge.database.from('results').update(payload).eq('id', r.id);
      } else {
        const { data } = await insforge.database.from('results').insert([payload]).select();
        if (data?.[0]) updateResult(reg.id, 'id', data[0].id);
      }
      showToast('Result saved');
    } catch (err) {
      console.error(err);
      showToast('Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const publishAll = async () => {
    setSaving(true);
    try {
      await insforge.database.from('results').update({ is_published: true }).eq('hackathon_id', hackathonId);
      setResults(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(k => { updated[k] = { ...updated[k], is_published: true }; });
        return updated;
      });
      showToast('All results published');
    } catch (err) {
      showToast('Publish failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = registrations.filter(r => {
    if (search && !r.team_name?.toLowerCase().includes(search.toLowerCase()) && !r.lead_name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== 'all') {
      const res = getResult(r.id);
      if (res.final_status !== filterStatus) return false;
    }
    return true;
  });

  if (loading || authLoading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#FF8C32]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-inter">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-[13px] font-medium flex items-center gap-2 shadow-xl border ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
          {toast.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />} {toast.msg}
        </div>
      )}

      <nav className="h-[64px] border-b border-white/[0.05] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[#888] hover:text-white transition-colors">
          <ArrowLeft size={16} />
          <span className="text-[13px] font-bold tracking-widest uppercase">Dashboard</span>
        </button>
        <div className="flex gap-3">
          <button onClick={publishAll} disabled={saving} className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl px-4 py-2 text-[13px] font-bold transition-colors">
            <Eye size={14} /> Publish All
          </button>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-10">
        <div className="mb-8">
          <div className="text-[11px] font-bold text-[#FF8C32] uppercase tracking-[0.12em] mb-2">Organizer Panel</div>
          <h1 className="text-[28px] sm:text-[36px] font-black text-white tracking-tight">{hackathon?.name} — Results</h1>
          <p className="text-[14px] text-[#888] mt-1">{registrations.length} registrations</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams..." className={IC + " pl-11"} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-[#0D0D0D] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-white outline-none">
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>

        {/* Registrations Table */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
              <Users size={32} className="mx-auto mb-3 text-[#444]" />
              <p className="text-[14px] text-[#888]">No registrations found.</p>
            </div>
          )}
          {filtered.map(reg => {
            const r = getResult(reg.id);
            const isEditing = editingId === reg.id;
            return (
              <div key={reg.id} className={`bg-[#0A0A0A] border rounded-xl overflow-hidden transition-colors ${isEditing ? 'border-[#FF8C32]/30' : 'border-white/5 hover:border-white/10'}`}>
                {/* Row header */}
                <button onClick={() => setEditingId(isEditing ? null : reg.id)} className="w-full flex items-center gap-4 p-5 text-left">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[14px] font-bold text-[#888] shrink-0">
                    {r.rank || '—'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-white truncate">{reg.team_name || 'Solo'}</div>
                    <div className="text-[12px] text-[#888] truncate">{reg.lead_name || reg.email} · {reg.project_title || 'No project'}</div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                    r.final_status === 'winner' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    r.final_status === 'runner-up' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    r.is_published ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    'bg-white/5 text-[#888] border-white/10'
                  }`}>
                    {STATUS_LABELS[r.final_status] || 'Pending'}
                  </span>
                  <ChevronDown size={16} className={`text-[#555] transition-transform ${isEditing ? 'rotate-180' : ''}`} />
                </button>

                {/* Expanded editor */}
                {isEditing && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-1.5 block">Status</label>
                        <select value={r.final_status} onChange={e => updateResult(reg.id, 'final_status', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white outline-none">
                          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-1.5 block">Rank</label>
                        <input type="number" value={r.rank || ''} onChange={e => updateResult(reg.id, 'rank', e.target.value)} placeholder="—" className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-1.5 block">Score /100</label>
                        <input type="number" value={r.score || ''} onChange={e => updateResult(reg.id, 'score', e.target.value)} placeholder="—" max={100} className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-1.5 block">Feedback (visible to participant)</label>
                      <textarea value={r.feedback_summary || ''} onChange={e => updateResult(reg.id, 'feedback_summary', e.target.value)} rows={2} placeholder="Write feedback..." className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white outline-none resize-none" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-1.5 block">Judge Remarks (private)</label>
                      <textarea value={r.judge_remarks || ''} onChange={e => updateResult(reg.id, 'judge_remarks', e.target.value)} rows={2} placeholder="Internal notes..." className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white outline-none resize-none" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#666] uppercase tracking-wider mb-1.5 block">Feedback PDF URL</label>
                      <input value={r.feedback_pdf_url || ''} onChange={e => updateResult(reg.id, 'feedback_pdf_url', e.target.value)} placeholder="https://..." className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white outline-none" />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={r.is_published || false} onChange={e => updateResult(reg.id, 'is_published', e.target.checked)} className="accent-[#FF8C32]" />
                        <span className="text-[12px] font-medium text-[#999]">Published</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={r.public_visible || false} onChange={e => updateResult(reg.id, 'public_visible', e.target.checked)} className="accent-[#FF8C32]" />
                        <span className="text-[12px] font-medium text-[#999]">Show on public leaderboard</span>
                      </label>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => saveResult(reg)} disabled={saving} className="bg-[#FF8C32] hover:bg-[#FF6B00] disabled:opacity-50 text-black rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all flex items-center gap-2">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="bg-white/5 hover:bg-white/10 text-[#888] border border-white/10 rounded-xl px-5 py-2.5 text-[13px] font-medium transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
