import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { insforge } from './lib/insforge';
import { useAuth } from './AuthContext';
import { HackathonProvider, useHackathon } from './HackathonContext';
import AnalysisReport from './AnalysisReport';
import './dashboard.css';
import {
  LayoutDashboard, FileText, Trophy, ShieldCheck, Settings, LogOut,
  ChevronRight, CheckCircle, AlertTriangle, ExternalLink,
  Search, Filter, Download, Send, ArrowUpRight, Plus, X,
  Star, Award, Medal, BarChart3, Clock, User, Rocket, Loader2,
  GitBranch, PlayCircle, Layers, Zap, Brain, Eye, Sparkles,
  ChevronDown, Trash2, AlertOctagon, Save, Calendar, Users, Pencil, Globe
} from 'lucide-react';


// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}


// ═══════════════════════════════════════════════════════════
// STATUS BADGE
// ═══════════════════════════════════════════════════════════
function StatusBadge({ status }) {
  const styles = {
    evaluated: 'bg-green-500/10 text-green-400',
    evaluating: 'bg-blue-500/10 text-blue-400',
    flagged: 'bg-orange-500/10 text-orange-400',
    pending: 'bg-white/5 text-[#888]',
  };
  const labels = {
    evaluated: 'Evaluated',
    evaluating: 'Evaluating',
    flagged: 'Flagged',
    pending: 'Pending',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}


// ═══════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════
function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-card p-6 h-28">
            <div className="h-3 bg-[rgba(255,255,255,0.06)] rounded w-24 mb-4" />
            <div className="h-8 bg-[rgba(255,255,255,0.06)] rounded w-16" />
          </div>
        ))}
      </div>
      <div className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-card p-6 h-64">
        <div className="h-4 bg-[rgba(255,255,255,0.06)] rounded w-40 mb-6" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-3 bg-[rgba(255,255,255,0.06)] rounded w-full mb-4" />
        ))}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// NO HACKATHON PLACEHOLDER
// ═══════════════════════════════════════════════════════════
function NoHackathonPlaceholder() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-nexus-primary/20 to-purple-500/20 flex items-center justify-center border border-white/5">
          <Rocket size={40} className="text-nexus-primary/60" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-[#111111] border border-white/[0.06] flex items-center justify-center">
          <Plus size={18} className="text-[#888]" />
        </div>
      </div>
      <h2 className="text-[22px] font-bold text-white mb-2">No hackathon yet</h2>
      <p className="text-[14px] text-[#888] text-center max-w-md mb-8 leading-relaxed">
        Create your first hackathon to start receiving submissions, run AI analysis, and generate rankings.
      </p>
      <button
        onClick={() => navigate('/create-hackathon')}
        className="flex items-center gap-2 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-btn min-h-[44px] px-6 py-3 text-[14px] font-medium transition-colors active:scale-[0.98]"
      >
        <Plus size={16} />
        Create Hackathon
      </button>
    </div>
  );
}

function OverviewPage({ submissions, loading, hackathon, userName, onGoToSettings }) {
  const navigate = useNavigate();
  if (loading) return <LoadingSkeleton />;
  if (!hackathon) return <NoHackathonPlaceholder />;

  const total = submissions.length;
  const evaluated = submissions.filter(s => s.status === 'evaluated').length;
  const pending = submissions.filter(s => s.status === 'pending').length;
  const flagged = submissions.filter(s => s.status === 'flagged').length;
  const topScore = submissions.reduce((max, s) => s.score > max ? s.score : max, 0);
  const maxPossible = submissions[0]?.max_score || 25;
  const evalPercent = total > 0 ? Math.round((evaluated / total) * 100) : 0;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const recent = [...submissions].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)).slice(0, 5);

  const subDeadline = hackathon.submission_deadline ? new Date(hackathon.submission_deadline) : null;
  const daysLeft = subDeadline ? Math.max(0, Math.ceil((subDeadline - new Date()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <div className="space-y-6">
      {/* ─── Greeting Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4 border-b border-white/[0.05]">
        <div>
          <h2 className="text-[28px] font-bold text-white tracking-tight">
            Overview
          </h2>
          <p className="text-[14px] text-[#888] mt-1">
            Managing <span className="text-white font-medium">{hackathon.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[13px] text-[#666] bg-white/[0.02] border border-white/[0.05] px-3 py-1.5 rounded-full">
            <Clock size={14} />
            {today}
          </div>
        </div>
      </div>

      {/* ─── Main Grid Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: KPI & Submissions (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111] border border-white/[0.05] rounded-[20px] p-5 relative overflow-hidden group hover:border-white/[0.1] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[12px] font-medium text-[#888]">Submissions</div>
                <Layers size={14} className="text-[#555]" />
              </div>
              <div className="text-[32px] font-bold text-white tabular-nums tracking-tight">{total}</div>
            </div>
            
            <div className="bg-[#111] border border-white/[0.05] rounded-[20px] p-5 relative overflow-hidden group hover:border-white/[0.1] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[12px] font-medium text-[#888]">Evaluated</div>
                <CheckCircle size={14} className="text-green-500/50" />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-[32px] font-bold text-white tabular-nums tracking-tight">{evaluated}</div>
                {total > 0 && <div className="text-[12px] font-medium text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-md">{evalPercent}%</div>}
              </div>
            </div>

            <div className="bg-[#111] border border-white/[0.05] rounded-[20px] p-5 relative overflow-hidden group hover:border-white/[0.1] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[12px] font-medium text-[#888]">Flagged</div>
                <AlertTriangle size={14} className="text-orange-500/50" />
              </div>
              <div className="text-[32px] font-bold text-white tabular-nums tracking-tight">{flagged}</div>
            </div>

            <div className="bg-[#111] border border-white/[0.05] rounded-[20px] p-5 relative overflow-hidden group hover:border-white/[0.1] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[12px] font-medium text-[#888]">Top Score</div>
                <Trophy size={14} className="text-nexus-primary/50" />
              </div>
              <div className="text-[32px] font-bold text-white tabular-nums tracking-tight">
                {total > 0 ? topScore : '—'}
                <span className="text-[14px] text-[#555] font-normal ml-1">/{maxPossible}</span>
              </div>
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-[#111] border border-white/[0.05] rounded-[24px] overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04]">
              <h3 className="text-[15px] font-bold text-white">Recent Submissions</h3>
              {total > 0 && (
                <button className="text-[12px] font-semibold text-nexus-primary hover:text-nexus-primary-hover transition-colors">
                  View All
                </button>
              )}
            </div>
            
            {total === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-4">
                  <FileText size={24} className="text-[#444]" />
                </div>
                <h4 className="text-[15px] font-bold text-white mb-1">Awaiting Submissions</h4>
                <p className="text-[13px] text-[#888] max-w-xs mx-auto">
                  Once teams start submitting their projects, they will appear here for AI evaluation.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      <th className="px-6 py-4 text-[11px] font-semibold tracking-wider text-[#666] uppercase">Project & Team</th>
                      <th className="px-6 py-4 text-[11px] font-semibold tracking-wider text-[#666] uppercase">Score</th>
                      <th className="px-6 py-4 text-[11px] font-semibold tracking-wider text-[#666] uppercase">Status</th>
                      <th className="px-6 py-4 text-[11px] font-semibold tracking-wider text-[#666] uppercase text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((row) => (
                      <tr key={row.id} className="border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="text-[14px] font-semibold text-white group-hover:text-nexus-primary transition-colors">{row.project_name}</div>
                          <div className="text-[12px] text-[#666] mt-0.5">{row.team_name}</div>
                        </td>
                        <td className="px-6 py-4 text-[14px] font-bold text-white tabular-nums">
                          {row.status === 'pending' || row.status === 'evaluating' ? (
                            <span className="text-[#444]">—</span>
                          ) : (
                            `${row.score}/${row.max_score}`
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-6 py-4 text-right text-[12px] text-[#666]">
                          {timeAgo(row.submitted_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Control Panel (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Hackathon Status Widget */}
          <div className="bg-gradient-to-b from-[#161616] to-[#0A0A0A] border border-white/[0.08] rounded-[24px] p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-nexus-primary/5 blur-3xl rounded-full pointer-events-none" />
            
            <div className="flex items-start justify-between mb-6 relative">
              <div className="w-12 h-12 rounded-[14px] bg-[#111] border border-white/10 flex items-center justify-center shadow-lg">
                <Rocket size={20} className="text-nexus-primary" />
              </div>
              <button
                onClick={onGoToSettings}
                className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[#888] hover:text-white transition-all border border-transparent hover:border-white/[0.1]"
              >
                <Settings size={16} />
              </button>
            </div>

            <h3 className="text-[18px] font-bold text-white leading-tight mb-2 pr-4">{hackathon.name}</h3>
            
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${hackathon.status === 'published' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]'}`} />
              <span className="text-[13px] font-semibold text-[#888] capitalize">{hackathon.status}</span>
            </div>

            <div className="space-y-4">
              <div className="bg-[#111] border border-white/[0.04] rounded-xl p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-[#555]" />
                  <span className="text-[13px] text-[#888]">Deadline</span>
                </div>
                <span className="text-[13px] font-semibold text-white">
                  {subDeadline ? subDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not set'}
                </span>
              </div>
              <div className="bg-[#111] border border-white/[0.04] rounded-xl p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-[#555]" />
                  <span className="text-[13px] text-[#888]">Time Left</span>
                </div>
                <span className="text-[13px] font-semibold text-white">
                  {daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} days` : 'Ended') : '—'}
                </span>
              </div>
            </div>
            
            <button className="w-full mt-6 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/[0.1] text-white rounded-xl py-3 text-[13px] font-semibold transition-all flex items-center justify-center gap-2">
              <ExternalLink size={14} />
              View Public Page
            </button>
          </div>

          {/* AI Processing Widget */}
          <div className="bg-[#111] border border-white/[0.05] rounded-[24px] p-6">
            <h4 className="text-[13px] font-bold text-[#888] tracking-wide uppercase mb-5 flex items-center gap-2">
              <Brain size={14} className="text-purple-500" /> AI Evaluation
            </h4>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-[72px] h-[72px]">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#F97316" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${evalPercent * 0.88} 88`}
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[16px] font-bold text-white tabular-nums tracking-tight">{evalPercent}%</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-bold text-white mb-1">{evaluated} of {total} <span className="text-[#666] font-normal">scored</span></div>
                <div className="text-[12px] text-[#888] leading-tight">
                  {pending > 0 ? `${pending} waiting for analysis` : total === 0 ? 'No submissions yet' : 'All submissions evaluated'}
                </div>
              </div>
            </div>

            {pending > 0 && (
              <button 
                onClick={() => onNavigate('submissions')}
                className="w-full bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-xl py-3 text-[13px] font-semibold transition-all shadow-[0_0_15px_rgba(249,115,22,0.15)] flex items-center justify-center gap-2"
              >
                <Zap size={14} /> Run Analysis Queue
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// PAGE: SUBMISSIONS
// ═══════════════════════════════════════════════════════════
function SubmissionsPage({ submissions, loading, onAnalyze, onViewReport, onViewProgress, analyzingIds }) {
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) return <LoadingSkeleton />;

  const filtered = submissions.filter(s =>
    s.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.project_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
        <div className="relative w-full md:flex-1 md:max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
          <input
            type="text"
            placeholder="Search teams or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-btn min-h-[44px] pl-9 pr-4 py-2.5 text-[13px] text-[#F5F5F5] placeholder:text-[#444] outline-none focus:border-[rgba(255,255,255,0.15)] transition-colors"
          />
        </div>
        <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-btn min-h-[44px] px-4 py-2.5 text-[13px] text-[#888] hover:text-[#F5F5F5] hover:border-[rgba(255,255,255,0.15)] transition-colors">
          <Filter size={14} />
          Filter
        </button>
        <div className="hidden md:block flex-1" />
        {pendingCount > 0 && (
          <button
            onClick={() => {
              const pending = submissions.filter(s => s.status === 'pending');
              pending.forEach(s => onAnalyze(s.id));
            }}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-btn min-h-[44px] px-4 py-2.5 text-[13px] font-medium transition-colors active:scale-[0.98]"
          >
            <Brain size={14} />
            Analyze All ({pendingCount})
          </button>
        )}
      </div>

      {/* Table — Desktop */}
      <div className="hidden md:block bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[800px]">
            <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)]">
              <th className="text-left px-5 py-3.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#888] w-10">#</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#888]">Team Name</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#888]">Project</th>
              <th className="text-center px-5 py-3.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#888]">GitHub</th>
              <th className="text-center px-5 py-3.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#888]">PPT</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#888]">Submitted</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#888]">Score</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#888]">Status</th>
              <th className="text-right px-5 py-3.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#888]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => {
              const isAnalyzing = analyzingIds?.includes(row.id) || row.status === 'evaluating';
              return (
                <tr key={row.id} className={`border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors ${isAnalyzing ? 'bg-purple-500/[0.03]' : ''}`}>
                  <td className="px-5 py-4 text-[13px] text-[#444] tabular-nums">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-5 py-4 text-[14px] font-medium text-[#F5F5F5]">{row.team_name}</td>
                  <td className="px-5 py-4 text-[13px] text-[#888]">{row.project_name}</td>
                  <td className="px-5 py-4 text-center">
                    {row.github_url ? (
                      <a href={row.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-btn text-[#888] hover:text-nexus-primary hover:bg-[rgba(249,115,22,0.08)] transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    ) : <span className="text-[#444]">—</span>}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {row.ppt_url ? (
                      <a href={row.ppt_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-btn text-[#888] hover:text-nexus-primary hover:bg-[rgba(249,115,22,0.08)] transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    ) : <span className="text-[#444]">—</span>}
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[#888]">{timeAgo(row.submitted_at)}</td>
                  <td className="px-5 py-4 text-[14px] font-semibold text-[#F5F5F5] tabular-nums">
                    {row.status === 'pending' || row.status === 'evaluating' ? '—' : `${row.score}/${row.max_score}`}
                  </td>
                  <td className="px-5 py-4">
                    {isAnalyzing ? (
                      <button
                        onClick={() => onViewProgress(row.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/15 transition-colors cursor-pointer"
                      >
                        <Loader2 size={11} className="animate-spin" /> Analyzing... <Eye size={10} />
                      </button>
                    ) : (
                      <StatusBadge status={row.status} />
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(row.status === 'evaluated' || row.status === 'flagged') && (
                        <button
                          onClick={() => onViewReport(row.id)}
                          className="text-[12px] font-medium text-[#F5F5F5] border border-[rgba(255,255,255,0.1)] rounded-btn px-3 py-1.5 hover:border-nexus-primary hover:text-nexus-primary transition-colors active:scale-[0.98] flex items-center gap-1.5"
                        >
                          <Eye size={12} /> Report
                        </button>
                      )}
                      <button
                        onClick={() => onAnalyze(row.id)}
                        disabled={isAnalyzing}
                        className={`text-[11px] font-medium rounded-btn px-2.5 py-1.5 transition-colors active:scale-[0.98] flex items-center gap-1.5 ${
                          isAnalyzing
                            ? 'text-[#444] border border-[rgba(255,255,255,0.03)] cursor-not-allowed'
                            : row.status === 'pending'
                              ? 'text-purple-400 border border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/40'
                              : 'text-[#888] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] hover:text-[#F5F5F5]'
                        }`}
                      >
                        {isAnalyzing ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                        {isAnalyzing ? 'Running...' : row.status === 'pending' ? 'Analyze' : 'Re-analyze'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center text-[14px] text-[#444]">
                  {searchQuery ? 'No submissions match your search.' : 'No submissions yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Cards — Mobile Only */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-2xl p-10 text-center">
            <FileText size={28} className="mx-auto mb-3 text-[#333]" />
            <p className="text-[14px] text-[#888]">{searchQuery ? 'No submissions match your search.' : 'No submissions yet.'}</p>
          </div>
        ) : filtered.map((row, idx) => {
          const isAnalyzing = analyzingIds?.includes(row.id) || row.status === 'evaluating';
          return (
            <div key={row.id} className="bg-[#111]/80 border border-white/[0.05] rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-white truncate">{row.team_name}</div>
                  <div className="text-[12px] text-[#888] truncate mt-0.5">{row.project_name}</div>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  {row.status !== 'pending' && row.status !== 'evaluating' && (
                    <span className="text-[16px] font-bold text-nexus-primary tabular-nums">{row.score}/{row.max_score}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                {isAnalyzing ? (
                  <button
                    onClick={() => onViewProgress(row.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/15"
                  >
                    <Loader2 size={11} className="animate-spin" /> Analyzing...
                  </button>
                ) : (
                  <StatusBadge status={row.status} />
                )}
                <span className="text-[11px] text-[#666]">{timeAgo(row.submitted_at)}</span>
                {row.github_url && (
                  <a href={row.github_url} target="_blank" rel="noreferrer" className="text-[#888] hover:text-nexus-primary ml-auto">
                    <GitBranch size={14} />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(row.status === 'evaluated' || row.status === 'flagged') && (
                  <button
                    onClick={() => onViewReport(row.id)}
                    className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 text-[12px] font-medium text-white border border-white/[0.1] rounded-xl transition-colors active:scale-[0.97]"
                  >
                    <Eye size={12} /> Report
                  </button>
                )}
                <button
                  onClick={() => onAnalyze(row.id)}
                  disabled={isAnalyzing}
                  className={`flex-1 min-h-[40px] flex items-center justify-center gap-1.5 text-[12px] font-medium rounded-xl transition-colors active:scale-[0.97] ${
                    isAnalyzing ? 'text-[#444] border border-white/[0.03] cursor-not-allowed'
                    : row.status === 'pending' ? 'text-purple-400 border border-purple-500/20'
                    : 'text-[#888] border border-white/[0.06]'
                  }`}
                >
                  {isAnalyzing ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                  {isAnalyzing ? 'Running...' : row.status === 'pending' ? 'Analyze' : 'Re-analyze'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// PAGE: RESULTS
// ═══════════════════════════════════════════════════════════
function ResultsPage({ submissions, loading }) {
  if (loading) return <LoadingSkeleton />;

  const ranked = [...submissions]
    .filter(s => s.status === 'evaluated')
    .sort((a, b) => b.score - a.score);

  const medalColors = ['border-yellow-500/40', 'border-gray-400/40', 'border-amber-700/40'];
  const medalEmoji = ['🥇', '🥈', '🥉'];
  const maxScore = ranked[0]?.max_score || 25;

  // Assign badges
  const getBadge = (rank, total) => {
    if (rank === 1) return 'Top 1%';
    if (rank <= Math.ceil(total * 0.05)) return 'Top 5%';
    if (rank <= Math.ceil(total * 0.1)) return 'Top 10%';
    return null;
  };

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-[20px] font-bold text-[#F5F5F5] mb-1">Rankings</h3>
        <p className="text-[14px] text-[#888]">Final leaderboard — {ranked.length} submissions evaluated</p>
      </div>

      {ranked.length === 0 ? (
        <div className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-card p-16 text-center">
          <Trophy size={40} className="mx-auto mb-4 text-[#444]" />
          <p className="text-[16px] text-[#F5F5F5] font-medium mb-1">No results yet</p>
          <p className="text-[13px] text-[#888]">Rankings will appear once submissions are evaluated.</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {ranked.length >= 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              {ranked.slice(0, 3).map((entry, i) => (
                <div key={entry.id} className={`bg-[#111111] border-2 ${medalColors[i]} rounded-card p-6 hover:shadow-[0_0_0_1px_rgba(249,115,22,0.2)] transition-shadow duration-200`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[28px]">{medalEmoji[i]}</span>
                    <div>
                      <div className="text-[16px] font-bold text-[#F5F5F5]">{entry.team_name}</div>
                      <div className="text-[12px] text-[#888]">{entry.project_name}</div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-[36px] font-bold text-[#F5F5F5] leading-none tabular-nums">
                      {entry.score}<span className="text-[16px] text-[#444]">/{maxScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full Rankings Table — Desktop */}
          <div className="hidden md:block bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-card overflow-hidden mb-6">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[700px]">
                <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left px-5 py-3.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#888] w-16">Rank</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#888]">Team</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#888]">Project</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#888]">Score</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#888]">Badge</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#888]">Action</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((row, i) => {
                  const badge = getBadge(i + 1, ranked.length);
                  return (
                    <tr key={row.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="px-5 py-4 text-[14px] font-semibold text-[#F5F5F5] tabular-nums">#{i + 1}</td>
                      <td className="px-5 py-4 text-[14px] font-medium text-[#F5F5F5]">{row.team_name}</td>
                      <td className="px-5 py-4 text-[13px] text-[#888]">{row.project_name}</td>
                      <td className="px-5 py-4 text-[14px] font-semibold text-[#F5F5F5] tabular-nums">{row.score}/{maxScore}</td>
                      <td className="px-5 py-4">
                        {badge ? (
                          <span className="text-[11px] font-medium text-nexus-primary bg-nexus-primary/10 px-2.5 py-1 rounded-full">{badge}</span>
                        ) : <span className="text-[11px] text-[#444]">—</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="text-[12px] font-medium text-[#F5F5F5] border border-[rgba(255,255,255,0.1)] rounded-btn px-3 py-1.5 hover:border-nexus-primary hover:text-nexus-primary transition-colors active:scale-[0.98]">
                          View Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          {/* Rankings Cards — Mobile Only */}
          <div className="md:hidden space-y-3 mb-6">
            {ranked.map((row, i) => {
              const badge = getBadge(i + 1, ranked.length);
              return (
                <div key={row.id} className="bg-[#111]/80 border border-white/[0.05] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[14px] font-bold text-[#888] tabular-nums shrink-0">#{i + 1}</span>
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold text-white truncate">{row.team_name}</div>
                        <div className="text-[11px] text-[#888] truncate">{row.project_name}</div>
                      </div>
                    </div>
                    <span className="text-[18px] font-bold text-nexus-primary tabular-nums shrink-0 ml-3">{row.score}<span className="text-[12px] text-[#555]">/{maxScore}</span></span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    {badge ? (
                      <span className="text-[11px] font-medium text-nexus-primary bg-nexus-primary/10 px-2.5 py-1 rounded-full">{badge}</span>
                    ) : <span />}
                    <button className="min-h-[36px] text-[12px] font-medium text-white border border-white/[0.1] rounded-xl px-3 py-1.5 active:scale-[0.97]">
                      View Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 text-[13px] font-medium text-[#F5F5F5] min-h-[44px] border border-[rgba(255,255,255,0.1)] rounded-btn px-4 py-2.5 hover:border-nexus-primary hover:text-nexus-primary transition-colors active:scale-[0.98]">
              <Download size={14} /> Export CSV
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-nexus-primary min-h-[44px] hover:bg-nexus-primary-hover text-white rounded-btn px-5 py-2.5 text-[13px] font-medium transition-colors active:scale-[0.98]">
              <Send size={14} /> Publish Results
            </button>
          </div>
        </>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// PAGE: REVIEW
// ═══════════════════════════════════════════════════════════
function ReviewPage({ submissions, loading, onRefresh }) {
  if (loading) return <LoadingSkeleton />;

  const flagged = submissions.filter(s => s.status === 'flagged');

  const handleApprove = async (id) => {
    await insforge.database.from('submissions').update({ status: 'evaluated', flag_reason: null }).eq('id', id);
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <h3 className="text-[20px] font-bold text-[#F5F5F5]">Flagged for Human Review</h3>
        <span className="text-[12px] font-bold text-nexus-primary bg-nexus-primary/10 px-2.5 py-1 rounded-full tabular-nums">
          {flagged.length}
        </span>
      </div>

      {flagged.length === 0 ? (
        <div className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-card p-16 text-center">
          <CheckCircle size={40} className="mx-auto mb-4 text-green-500/40" />
          <p className="text-[16px] text-[#F5F5F5] font-medium mb-1">All clear</p>
          <p className="text-[13px] text-[#888]">No submissions flagged for review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {flagged.map((item) => {
            const dims = item.dimensions || {};
            return (
              <div key={item.id} className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-card p-6 hover:shadow-[0_0_0_1px_rgba(249,115,22,0.2)] transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-[15px] font-semibold text-[#F5F5F5]">{item.team_name}</h4>
                      <span className="text-[13px] text-[#888]">{item.project_name}</span>
                    </div>

                    {Object.keys(dims).length > 0 && (
                      <div className="flex items-center gap-4 mt-4 mb-3">
                        {Object.entries(dims).map(([dim, val]) => (
                          <div key={dim} className="flex-1">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-medium tracking-[0.06em] uppercase text-[#888]">{dim}</span>
                              <span className="text-[10px] font-semibold text-[#F5F5F5] tabular-nums">{val}/5</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${(val / 5) * 100}%`,
                                  background: val >= 4 ? '#22C55E' : val >= 3 ? '#EAB308' : '#EF4444',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.flag_reason && (
                      <p className="text-[12px] italic text-[#888] mt-3">
                        <AlertTriangle size={11} className="inline mr-1 text-nexus-primary/60 relative -top-px" />
                        {item.flag_reason}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end mt-4 md:mt-0 md:ml-8 gap-3 shrink-0">
                    <div className="text-[24px] font-bold text-[#F5F5F5] tabular-nums leading-none">
                      {item.score}<span className="text-[13px] text-[#444]">/{item.max_score}</span>
                    </div>
                    <div className="flex items-center w-full md:w-auto gap-2 mt-2">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex-1 md:flex-none text-[12px] font-medium text-green-400 border border-green-500/20 rounded-btn min-h-[44px] px-3.5 py-1.5 hover:bg-green-500/10 transition-colors active:scale-[0.98]"
                      >
                        Approve
                      </button>
                      <button className="flex-1 md:flex-none text-[12px] font-medium text-nexus-primary border min-h-[44px] border-nexus-primary/20 rounded-btn px-3.5 py-1.5 hover:bg-nexus-primary/10 transition-colors active:scale-[0.98]">
                        Override
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// PAGE: GALLERY
// ═══════════════════════════════════════════════════════════
function GalleryPage({ submissions, loading }) {
  const [selectedProject, setSelectedProject] = useState(null);

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-[20px] font-bold text-[#F5F5F5]">Project Gallery</h3>
          <p className="text-[14px] text-[#888]">Browse all submitted projects with their public artifacts.</p>
        </div>
      </div>

      {submissions.length === 0 ? (
         <div className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-card p-16 text-center">
           <Rocket size={40} className="mx-auto mb-4 text-[#444]" />
           <p className="text-[16px] text-[#F5F5F5] font-medium mb-1">No projects submitted yet.</p>
           <p className="text-[13px] text-[#888]">Projects will appear here once teams submit their artifacts.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {submissions.map((sub) => (
            <div key={sub.id} onClick={() => setSelectedProject(sub)} className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-card p-6 cursor-pointer hover:border-nexus-primary/40 hover:bg-[#151515] transition-all group">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-[16px] font-bold text-[#F5F5F5] line-clamp-1 group-hover:text-nexus-primary transition-colors">{sub.project_name}</h3>
                <ArrowUpRight size={16} className="text-[#444] group-hover:text-nexus-primary transition-colors flex-shrink-0" />
              </div>
              <p className="text-[13px] text-[#888] mb-5">Team: <span className="font-medium text-[#ccc]">{sub.team_name}</span></p>
              
              <div className="flex gap-2">
                 {sub.github_url && <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.04)] text-[#888] border border-[rgba(255,255,255,0.06)]">Code</span>}
                 {sub.demo_url && <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.04)] text-[#888] border border-[rgba(255,255,255,0.06)]">Demo</span>}
                 {sub.ppt_url && <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.04)] text-[#888] border border-[rgba(255,255,255,0.06)]">Deck</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VIEW PROJECT MODAL
// ═══════════════════════════════════════════════════════════
function ProjectModal({ project, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] rounded-card w-full max-w-lg p-8 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-[11px] font-bold tracking-[0.06em] text-nexus-primary uppercase mb-2">Submitted Project</div>
            <h3 className="text-[22px] font-bold text-[#F5F5F5] leading-tight">{project.project_name}</h3>
            <p className="text-[14px] text-[#888] mt-1">by Team <span className="text-[#F5F5F5] font-medium">{project.team_name}</span></p>
          </div>
          <button onClick={onClose} className="text-[#888] hover:text-[#F5F5F5] transition-colors p-1">✕</button>
        </div>

        <div className="space-y-3">
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-[rgba(255,255,255,0.08)] hover:border-nexus-primary/50 hover:bg-nexus-primary/5 rounded-card transition-all group">
              <div className="flex items-center gap-3">
                <GitBranch size={16} className="text-[#888] group-hover:text-nexus-primary transition-colors" />
                <span className="text-[14px] font-medium text-[#F5F5F5]">GitHub Repository</span>
              </div>
              <ExternalLink size={14} className="text-[#444] group-hover:text-nexus-primary transition-colors" />
            </a>
          )}
          {project.demo_url && (
            <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-[rgba(255,255,255,0.08)] hover:border-nexus-primary/50 hover:bg-nexus-primary/5 rounded-card transition-all group">
              <div className="flex items-center gap-3">
                <PlayCircle size={16} className="text-[#888] group-hover:text-nexus-primary transition-colors" />
                <span className="text-[14px] font-medium text-[#F5F5F5]">Demo Video</span>
              </div>
              <ExternalLink size={14} className="text-[#444] group-hover:text-nexus-primary transition-colors" />
            </a>
          )}
          {project.ppt_url && (
            <a href={project.ppt_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-[rgba(255,255,255,0.08)] hover:border-nexus-primary/50 hover:bg-nexus-primary/5 rounded-card transition-all group">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-[#888] group-hover:text-nexus-primary transition-colors" />
                <span className="text-[14px] font-medium text-[#F5F5F5]">Presentation Deck</span>
              </div>
              <ExternalLink size={14} className="text-[#444] group-hover:text-nexus-primary transition-colors" />
            </a>
          )}
          
          {!project.github_url && !project.demo_url && !project.ppt_url && (
            <div className="text-center py-6 text-[#888] text-[13px] bg-[#0A0A0A] rounded-card border border-[rgba(255,255,255,0.04)]">
              No public artifacts provided for this submission.
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between">
            <span className="text-[12px] text-[#888]">Status: <span className="text-[#F5F5F5] capitalize">{project.status || 'Submitted'}</span></span>
            <span className="text-[12px] text-[#888]">Submitted: {timeAgo(project.created_at)}</span>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// HACKATHON SWITCHER DROPDOWN
// ═══════════════════════════════════════════════════════════
function HackathonSwitcher({ onDeleteRequest }) {
  const { allHackathons, activeHackathon, setActiveHackathon } = useHackathon();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (allHackathons.length === 0) return null;

  // Single hackathon — just show name, no dropdown
  if (allHackathons.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
        <div className="w-2 h-2 rounded-full bg-nexus-primary shrink-0" />
        <span className="text-[13px] font-semibold text-white truncate max-w-[160px]">{activeHackathon?.name || 'No Hackathon'}</span>
      </div>
    );
  }

  // Multiple hackathons — full switcher
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all group"
      >
        <div className="w-2 h-2 rounded-full bg-nexus-primary shrink-0" />
        <span className="text-[13px] font-semibold text-white truncate max-w-[160px]">{activeHackathon?.name || 'Select Hackathon'}</span>
        <ChevronDown size={14} className={`text-[#666] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-[#111] border border-white/[0.08] rounded-2xl shadow-2xl z-50 overflow-hidden py-2">
          <div className="px-4 py-2 mb-1">
            <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#555]">Your Hackathons</span>
          </div>
          {allHackathons.map((h) => {
            const isActive = h.id === activeHackathon?.id;
            return (
              <div key={h.id} className="px-2">
                <div className={`flex items-center justify-between rounded-xl px-3 py-2.5 group transition-colors ${
                  isActive ? 'bg-nexus-primary/10' : 'hover:bg-white/[0.04]'
                }`}>
                  <button
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    onClick={() => { setActiveHackathon(h); setOpen(false); }}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      isActive ? 'bg-nexus-primary' : 'bg-[#444]'
                    }`} />
                    <div className="min-w-0">
                      <div className={`text-[13px] font-semibold truncate ${
                        isActive ? 'text-nexus-primary' : 'text-white'
                      }`}>{h.name}</div>
                      <div className="text-[11px] text-[#666] capitalize">{h.status}</div>
                    </div>
                    {isActive && <CheckCircle size={14} className="text-nexus-primary ml-auto shrink-0" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE: SETTINGS (Edit & Delete)
// ═══════════════════════════════════════════════════════════
function SettingsPage({ hackathon, onDeleteRequest }) {
  const { updateHackathon } = useHackathon();
  const [form, setForm] = useState({ ...hackathon });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({ ...hackathon });
    setErrors({});
    setSuccessMsg(null);
  }, [hackathon]);

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
    if (successMsg) setSuccessMsg(null);
  };

  const validateForm = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = 'Hackathon name is required';
    if (!form.registration_opens) errs.registration_opens = 'Required';
    if (!form.registration_closes) errs.registration_closes = 'Required';
    if (!form.submission_deadline) errs.submission_deadline = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    setSuccessMsg(null);
    try {
      await updateHackathon(hackathon.id, form);
      setSuccessMsg('Settings saved successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Helper for inputs
  const formatDatetimeForInput = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d)) return isoStr; // fallback
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  if (!hackathon) return <NoHackathonPlaceholder />;

  return (
    <div className="max-w-[800px] mx-auto space-y-8">
      <div>
        <h2 className="text-[28px] font-bold text-white tracking-tight mb-2">Settings</h2>
        <p className="text-[15px] text-[#888]">Manage configuration and details for <span className="text-white font-semibold">{hackathon.name}</span>.</p>
      </div>

      <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6 md:p-8 space-y-8">
        
        {/* Basic Info */}
        <section>
          <h3 className="text-[16px] font-bold text-white mb-5 flex items-center gap-2 border-b border-white/[0.05] pb-3">
            <FileText size={16} className="text-nexus-primary" /> Basic Information
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-[#F5F5F5] mb-2">Name <span className="text-nexus-primary">*</span></label>
              <input value={form.name || ''} onChange={e => setField('name', e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[14px] text-white focus:border-nexus-primary/50 outline-none" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#F5F5F5] mb-2">Tagline</label>
              <input value={form.tagline || ''} onChange={e => setField('tagline', e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[14px] text-white focus:border-nexus-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#F5F5F5] mb-2">Description</label>
              <textarea value={form.description || ''} onChange={e => setField('description', e.target.value)} rows={4} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[14px] text-white focus:border-nexus-primary/50 outline-none resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-medium text-[#F5F5F5] mb-2">Type</label>
                <select value={form.type || 'online'} onChange={e => setField('type', e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[14px] text-white focus:border-nexus-primary/50 outline-none">
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#F5F5F5] mb-2">Eligibility</label>
                <select value={form.eligibility || 'open'} onChange={e => setField('eligibility', e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[14px] text-white focus:border-nexus-primary/50 outline-none">
                  <option value="students">Students Only</option>
                  <option value="professionals">Professionals</option>
                  <option value="open">Open to All</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h3 className="text-[16px] font-bold text-white mb-5 flex items-center gap-2 border-b border-white/[0.05] pb-3">
            <Calendar size={16} className="text-nexus-primary" /> Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-medium text-[#F5F5F5] mb-2">Registration Opens <span className="text-nexus-primary">*</span></label>
              <input type="datetime-local" value={formatDatetimeForInput(form.registration_opens)} onChange={e => setField('registration_opens', e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[14px] text-white focus:border-nexus-primary/50 outline-none [color-scheme:dark]" />
              {errors.registration_opens && <p className="text-red-400 text-xs mt-1">{errors.registration_opens}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#F5F5F5] mb-2">Registration Closes <span className="text-nexus-primary">*</span></label>
              <input type="datetime-local" value={formatDatetimeForInput(form.registration_closes)} onChange={e => setField('registration_closes', e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[14px] text-white focus:border-nexus-primary/50 outline-none [color-scheme:dark]" />
              {errors.registration_closes && <p className="text-red-400 text-xs mt-1">{errors.registration_closes}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#F5F5F5] mb-2">Submission Deadline <span className="text-nexus-primary">*</span></label>
              <input type="datetime-local" value={formatDatetimeForInput(form.submission_deadline)} onChange={e => setField('submission_deadline', e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[14px] text-white focus:border-nexus-primary/50 outline-none [color-scheme:dark]" />
              {errors.submission_deadline && <p className="text-red-400 text-xs mt-1">{errors.submission_deadline}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#F5F5F5] mb-2">Results Date</label>
              <input type="datetime-local" value={formatDatetimeForInput(form.results_date)} onChange={e => setField('results_date', e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[14px] text-white focus:border-nexus-primary/50 outline-none [color-scheme:dark]" />
            </div>
          </div>
        </section>

        {/* Public Page Link */}
        <section>
          <h3 className="text-[16px] font-bold text-white mb-5 flex items-center gap-2 border-b border-white/[0.05] pb-3">
            <Globe size={16} className="text-nexus-primary" /> Live Pages
          </h3>
          <div className="space-y-3">
             <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
               <div>
                 <div className="text-[13px] font-bold text-white">Public Hackathon Page</div>
                 <div className="text-[12px] text-[#888] mt-1">{window.location.origin}/hackathon/{hackathon.id}</div>
               </div>
               <a href={`/hackathon/${hackathon.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-[12px] text-white font-medium transition-colors border border-white/[0.05]">
                 Visit <ExternalLink size={12} />
               </a>
             </div>
          </div>
        </section>

        {/* Save Actions */}
        <div className="pt-6 border-t border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-xl px-6 py-2.5 text-[14px] font-bold transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
            {successMsg && <span className="text-[13px] text-green-400 font-medium flex items-center gap-1.5"><CheckCircle size={14} /> {successMsg}</span>}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/[0.02] border border-red-500/20 rounded-2xl p-6 md:p-8 mt-12">
        <h3 className="text-[16px] font-bold text-red-400 mb-2 flex items-center gap-2">
          <AlertOctagon size={18} /> Danger Zone
        </h3>
        <p className="text-[13px] text-[#888] mb-6">
          Permanently delete this hackathon and all associated data, including registrations, submissions, and analysis reports. This action cannot be undone.
        </p>
        <button
          onClick={() => onDeleteRequest(hackathon)}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all flex items-center gap-2"
        >
          <Trash2 size={16} /> Delete Hackathon
        </button>
      </div>

    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// DELETE CONFIRMATION MODAL
// ═══════════════════════════════════════════════════════════
function DeleteHackathonModal({ hackathon, onClose, onDeleted }) {
  const { deleteHackathon } = useHackathon();
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const required = hackathon?.name || '';
  const canDelete = confirmText === required;

  const handleDelete = async () => {
    if (!canDelete || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteHackathon(hackathon.id);
      onDeleted();
    } catch (err) {
      console.error('[Delete]', err);
      setError(err.message || 'Deletion failed. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <div
        className="bg-[#0D0D0D] border border-red-500/20 rounded-[24px] max-w-md w-full shadow-2xl p-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertOctagon size={28} className="text-red-500" />
        </div>

        <h3 className="text-[20px] font-bold text-white text-center mb-2 tracking-tight">Delete Hackathon</h3>
        <p className="text-[14px] text-[#888] text-center mb-6 leading-relaxed">
          This will permanently delete <span className="text-white font-semibold">{hackathon?.name}</span> and all of its data.
        </p>

        {/* What gets deleted */}
        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 mb-6">
          <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-3">The following will be deleted:</div>
          <div className="space-y-1.5">
            {['All registered teams', 'All project submissions', 'All AI evaluations & scores', 'All analysis reports', 'Hackathon settings & configuration'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[13px] text-[#888]">
                <X size={12} className="text-red-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Confirm by typing name */}
        <div className="mb-6">
          <label className="block text-[12px] font-bold text-[#888] mb-2 tracking-wide">
            Type <span className="text-white font-mono">{hackathon?.name}</span> to confirm deletion:
          </label>
          <input
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={hackathon?.name}
            className="w-full bg-[#111] border border-white/[0.08] focus:border-red-500/50 rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-[#444] outline-none transition-colors font-mono"
            autoFocus
          />
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[13px] text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-3 text-[14px] font-semibold text-[#888] hover:text-white border border-white/[0.08] rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            className="flex-1 py-3 text-[14px] font-bold text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {deleting ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : <><Trash2 size={16} /> Delete Forever</>}
          </button>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// MAIN DASHBOARD SHELL
// ═══════════════════════════════════════════════════════════
const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Judging Ops',
    items: [
      { id: 'submissions', label: 'Submissions', icon: Layers },
      { id: 'review', label: 'Manual Review', icon: ShieldCheck },
      { id: 'results', label: 'Leaderboard', icon: Trophy }
    ]
  },
  {
    title: 'Configuration',
    items: [
      { id: 'gallery', label: 'Public Gallery', icon: Globe },
      { id: 'settings', label: 'Settings', icon: Settings }
    ]
  }
];

const PAGE_TITLES = {
  overview: 'Overview',
  gallery: 'Project Gallery',
  submissions: 'Submissions',
  results: 'Results',
  review: 'Review Queue',
  settings: 'Settings',
};

// Inner dashboard — consumes HackathonContext
function DashboardInner() {
  const [activePage, setActivePage] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // hackathon to delete
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshSession } = useAuth();
  // Pull active hackathon from context — single source of truth
  const { activeHackathon: hackathon, loadingHackathons, refreshHackathons } = useHackathon();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzingIds, setAnalyzingIds] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [progressModal, setProgressModal] = useState(null);
  const [showCreateOptions, setShowCreateOptions] = useState(false);

  // Auth protection + role check
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (!authLoading && user) {
      const checkRole = async () => {
        try {
          const { data: profile } = await insforge.database
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
          if (profile && profile.role !== 'organizer') {
            navigate('/user-dashboard');
          }
        } catch (err) {
          console.warn('Role check failed:', err);
        }
      };
      checkRole();
    }
  }, [user, authLoading, navigate]);

  // Fetch submissions scoped ONLY to the active hackathon
  const fetchData = useCallback(async () => {
    if (!hackathon) {
      setSubmissions([]);
      return;
    }
    setLoading(true);
    try {
      const { data: subs, error: sErr } = await insforge.database
        .from('submissions')
        .select()
        .eq('hackathon_id', hackathon.id)
        .order('submitted_at', { ascending: false });
      if (sErr) throw sErr;
      setSubmissions(subs || []);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [hackathon]);

  // Re-fetch whenever active hackathon changes — zero mixing
  useEffect(() => {
    setSubmissions([]); // clear immediately to prevent stale display
    fetchData();
  }, [fetchData]);

  // ─── AI ANALYSIS (fire-and-forget + polling) ───
  const handleAnalyze = useCallback(async (submissionId) => {
    setAnalyzingIds(prev => [...prev, submissionId]);
    try {
      // Fire-and-forget: invoke but don't wait for the full AI response
      // The edge function takes 30-90s to complete (3 AI calls)
      // We rely on polling (below) to detect when it finishes
      insforge.functions.invoke('analyze-project', {
        body: { submission_id: submissionId }
      }).then(({ data, error }) => {
        if (error) console.error('Analysis completed with error:', error);
        else console.log('Analysis completed:', data);
        // Remove from analyzing list and refresh
        setAnalyzingIds(prev => prev.filter(id => id !== submissionId));
        fetchData();
      }).catch(err => {
        // Timeout errors are OK — the edge function is still running server-side
        console.log('Analysis invoke timeout (edge function still running):', err.message);
      });

      // Immediately refresh to show "evaluating" status
      setTimeout(() => fetchData(), 2000);
    } catch (err) {
      console.error('Analysis error:', err);
      setAnalyzingIds(prev => prev.filter(id => id !== submissionId));
    }
  }, []);

  const handleViewReport = useCallback(async (submissionId) => {
    try {
      const { data, error } = await insforge.database
        .from('project_analyses')
        .select()
        .eq('submission_id', submissionId)
        .single();
      if (error || !data) {
        alert('No analysis report found. Run analysis first.');
        return;
      }
      const submission = submissions.find(s => s.id === submissionId);
      setReportData({ analysis: data, submission });
    } catch (err) {
      console.error('Failed to load report:', err);
    }
  }, [submissions]);

  // ─── VIEW LIVE PROGRESS (polls every 3s) ───
  const progressPollRef = useRef(null);
  const handleViewProgress = useCallback(async (submissionId) => {
    // Initial fetch
    const fetchProgress = async () => {
      const { data } = await insforge.database
        .from('project_analyses').select('progress_log,step,status,team_name')
        .eq('submission_id', submissionId).single();
      if (data) {
        setProgressModal({ submissionId, logs: data.progress_log || [], step: data.step, status: data.status, team: data.team_name });
        if (data.status === 'completed') {
          clearInterval(progressPollRef.current);
          fetchData();
        }
      }
    };
    await fetchProgress();
    // Poll every 3 seconds
    clearInterval(progressPollRef.current);
    progressPollRef.current = setInterval(fetchProgress, 3000);
  }, []);

  const closeProgressModal = useCallback(() => {
    clearInterval(progressPollRef.current);
    setProgressModal(null);
  }, []);

  // Poll for analysis progress updates — auto-detect completion
  useEffect(() => {
    if (analyzingIds.length === 0) return;
    const interval = setInterval(async () => {
      await fetchData();
      // Check if any analyzing submissions have completed
      setAnalyzingIds(prev => {
        const stillRunning = prev.filter(id => {
          const sub = submissions.find(s => s.id === id);
          return sub && (sub.status === 'evaluating' || sub.status === 'pending');
        });
        return stillRunning;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [analyzingIds, submissions]);

  const flaggedCount = submissions.filter(s => s.status === 'flagged').length;

  const renderPage = () => {
    // If no hackathon exists, show placeholder on all pages
    if (!hackathon && !loading) {
      return <NoHackathonPlaceholder />;
    }
    const uName = user?.user_metadata?.full_name || user?.profile?.name || user?.email?.split('@')[0] || 'Organizer';
    switch (activePage) {
      case 'overview': return <OverviewPage submissions={submissions} loading={loading} hackathon={hackathon} userName={uName} onGoToSettings={() => setActivePage('settings')} onNavigate={setActivePage} />;
      case 'gallery': return <GalleryPage submissions={submissions} loading={loading} />;
      case 'submissions': return <SubmissionsPage submissions={submissions} loading={loading} onAnalyze={handleAnalyze} onViewReport={handleViewReport} onViewProgress={handleViewProgress} analyzingIds={analyzingIds} />;
      case 'results': return <ResultsPage submissions={submissions} loading={loading} />;
      case 'review': return <ReviewPage submissions={submissions} loading={loading} onRefresh={fetchData} />;
      case 'settings': return <SettingsPage hackathon={hackathon} onDeleteRequest={(h) => setDeleteTarget(h)} />;
      default: return <OverviewPage submissions={submissions} loading={loading} hackathon={hackathon} userName={uName} onGoToSettings={() => setActivePage('settings')} onNavigate={setActivePage} />;
    }
  };

  const handleLogout = async () => {
    await insforge.auth.signOut();
    await refreshSession();
    navigate('/auth');
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><Loader2 className="animate-spin text-nexus-primary" size={32} /></div>;
  }

  return (
    <div className="nexus-dashboard flex h-screen bg-[#0A0A0A] text-[#F5F5F5] font-inter overflow-hidden relative">
      
      {/* ═══════ MOBILE SIDEBAR OVERLAY ═══════ */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ═══════ SIDEBAR ═══════ */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] shrink-0 bg-[#0D0D0D] border-r border-white/[0.05] flex flex-col transform transition-transform duration-300 md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* User Profile Header (Campaign dashboard pattern) */}
        <div className="px-5 py-5 border-b border-white/[0.05]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="dhlG" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#F97316"/><stop offset="100%" stopColor="#FB9A57"/></linearGradient></defs><path d="M8 7h3v7.5h10V7h3v18h-3v-7.5H11V25H8V7z" fill="url(#dhlG)"/></svg>
              <span className="text-[16px] font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Hackloom</span>
            </div>
            <button className="md:hidden text-[#888]" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-nexus-primary/15 flex items-center justify-center overflow-hidden shrink-0 border border-nexus-primary/20">
              {user?.profile?.avatar_url ? (
                <img src={user.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="text-nexus-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold text-white truncate">{user?.user_metadata?.full_name || user?.profile?.name || user?.email?.split('@')[0]}</div>
              <div className="text-[11px] text-nexus-primary font-medium">Organizer</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-6">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx}>
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#555] px-3 mb-2">{group.title}</div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActivePage(item.id); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 min-h-[40px] px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 relative ${
                        isActive
                          ? 'text-white bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                          : 'text-[#888] hover:text-[#E0E0E0] hover:bg-white/[0.03]'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-nexus-primary rounded-r-full shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                      )}
                      <item.icon size={16} className={isActive ? 'text-nexus-primary' : 'opacity-70'} />
                      {item.label}
                      {item.id === 'review' && flaggedCount > 0 && (
                        <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${isActive ? 'bg-nexus-primary/20 text-nexus-primary' : 'bg-white/5 text-[#888]'}`}>
                          {flaggedCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 pb-3 space-y-2">
          <button
            onClick={() => setShowCreateOptions(true)}
            className="w-full flex items-center justify-center gap-2 min-h-[44px] bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors active:scale-[0.98]"
          >
            <Rocket size={15} />
            Create Hackathon
          </button>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 min-h-[40px] text-[#666] hover:text-red-400 text-[12px] font-medium transition-colors">
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ═══════ MAIN ═══════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative h-full">
        <header className="h-[60px] shrink-0 bg-[#0D0D0D] border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-[#888] p-1 flex items-center justify-center min-h-[44px]" onClick={() => setIsSidebarOpen(true)}>
              <LayoutDashboard size={20} />
            </button>
            {/* Hackathon Switcher — primary context control */}
            <HackathonSwitcher onDeleteRequest={(h) => setDeleteTarget(h)} />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[11px] font-semibold text-nexus-primary bg-nexus-primary/10 px-3 py-1.5 rounded-full tracking-wide">
              Alpha v1.0
            </span>
            <button 
              onClick={() => setShowCreateOptions(true)}
              className="flex items-center gap-2 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-btn min-h-[44px] px-4 py-2 text-[13px] font-medium transition-colors active:scale-[0.98]"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Create</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 md:p-10 bg-[#0D0D0D]">
          <div className="max-w-[1240px] mx-auto w-full">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* ═══════ MOBILE BOTTOM TAB BAR ═══════ */}
      <nav className="mobile-bottom-bar flex md:hidden items-center justify-around bg-[#0D0D0D] border-t border-white/[0.05] h-[64px] px-2 pb-safe absolute bottom-0 w-full z-40">
        {NAV_GROUPS.flatMap(g => g.items).slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              activePage === item.id ? 'text-nexus-primary' : 'text-[#888] hover:text-[#ccc]'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>

      {/* ═══════ ANALYSIS REPORT MODAL ═══════ */}
      {reportData && (
        <AnalysisReport
          analysis={reportData.analysis}
          submission={reportData.submission}
          onClose={() => setReportData(null)}
        />
      )}

      {/* ═══════ DELETE HACKATHON MODAL ═══════ */}
      {deleteTarget && (
        <DeleteHackathonModal
          hackathon={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null);
            setActivePage('overview');
            refreshHackathons();
          }}
        />
      )}

      {/* ═══════ PROGRESS MODAL ═══════ */}
      {progressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={closeProgressModal}>
          <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-3xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold tracking-[0.08em] text-purple-400 uppercase mb-1">Live AI Progress</div>
                <h3 className="text-[18px] font-bold text-white">{progressModal.team || 'Analysis'}</h3>
              </div>
              <button onClick={closeProgressModal} className="text-[#888] hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors">✕</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-5 space-y-0">
              {progressModal.logs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/[0.02] last:border-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    log.status === 'done' ? 'bg-green-500/15 text-green-400' :
                    log.status === 'running' ? 'bg-purple-500/15 text-purple-400' :
                    log.status === 'error' ? 'bg-red-500/15 text-red-400' :
                    log.status === 'skipped' ? 'bg-yellow-500/15 text-yellow-400' :
                    'bg-white/5 text-[#888]'
                  }`}>
                    {log.status === 'done' ? <CheckCircle size={12} /> :
                     log.status === 'running' ? <Loader2 size={12} className="animate-spin" /> :
                     log.status === 'error' ? <AlertTriangle size={12} /> :
                     <Clock size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#ccc] leading-relaxed">{log.detail}</p>
                    <p className="text-[10px] text-[#555] mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {progressModal.status !== 'completed' && (
                <div className="flex items-center justify-center gap-2 py-4 text-[12px] text-purple-400">
                  <Loader2 size={13} className="animate-spin" /> Refreshing every 3 seconds...
                </div>
              )}
              {progressModal.status === 'completed' && (
                <div className="flex items-center justify-center gap-2 py-4 text-[12px] text-green-400 font-semibold">
                  <CheckCircle size={13} /> Analysis complete!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ═══════ CREATE OPTIONS MODAL ═══════ */}
      {showCreateOptions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setShowCreateOptions(false)}>
          <div className="bg-[#111111] border border-white/[0.08] rounded-[24px] max-w-md w-full shadow-2xl p-6 md:p-8" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
              <h3 className="text-[22px] font-bold text-white mb-2">How would you like to build?</h3>
              <p className="text-[14px] text-[#888]">Choose between full manual control or let our AI assist you.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => navigate('/create-hackathon?mode=ai')}
                className="group relative flex items-center p-5 rounded-2xl bg-[#1A1A1A] border border-white/[0.06] hover:border-nexus-primary/40 hover:bg-nexus-primary/5 transition-all text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-nexus-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity pointer-events-none" />
                <div className="w-12 h-12 rounded-xl bg-nexus-primary/20 flex items-center justify-center mr-4 shrink-0 border border-nexus-primary/20">
                  <Sparkles size={20} className="text-nexus-primary" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-[16px] font-bold text-white mb-1 group-hover:text-nexus-primary transition-colors">Hackloom AI Assistant</h4>
                  <p className="text-[13px] text-[#888]">Chat with our AI to generate everything instantly.</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/create-hackathon')}
                className="group flex items-center p-5 rounded-2xl bg-[#1A1A1A] border border-white/[0.06] hover:border-white/20 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mr-4 shrink-0 border border-white/10">
                  <Plus size={20} className="text-[#888] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-white mb-1">Manual Entry</h4>
                  <p className="text-[13px] text-[#888]">Configure all details step-by-step yourself.</p>
                </div>
              </button>
            </div>

            <button 
              onClick={() => setShowCreateOptions(false)}
              className="mt-6 w-full py-3 text-[13px] font-semibold text-[#888] hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// EXPORTED WRAPPER — provides HackathonContext
// ═══════════════════════════════════════════════════════════
export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null; // auth guard handled inside DashboardInner
  return (
    <HackathonProvider user={user}>
      <DashboardInner />
    </HackathonProvider>
  );
}
