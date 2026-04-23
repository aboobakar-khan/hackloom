import { useState } from 'react';
import { insforge } from './lib/insforge';
import {
  X, Star, AlertTriangle, CheckCircle, TrendingUp,
  Code2, FileText, Trophy, Target, Lightbulb, Shield,
  ChevronDown, ChevronUp, ExternalLink, Loader2,
  Video, PlayCircle, Clock, Save, MessageSquare, Activity
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// SCORE RING — Circular progress indicator
// ═══════════════════════════════════════════════════════════
function ScoreRing({ score, size = 80, label, color }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = (s) => {
    if (color) return color;
    if (s >= 80) return '#22C55E';
    if (s >= 60) return '#EAB308';
    if (s >= 40) return '#F97316';
    return '#EF4444';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <circle
            cx={size/2} cy={size/2} r={radius} fill="none"
            stroke={getColor(score)} strokeWidth="4"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[18px] font-bold text-white tabular-nums">{score}</span>
        </div>
      </div>
      {label && <span className="text-[11px] font-medium text-[#888] text-center leading-tight">{label}</span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// GRADE BADGE
// ═══════════════════════════════════════════════════════════
function GradeBadge({ grade }) {
  const colors = {
    'A+': 'bg-green-500/15 text-green-400 border-green-500/20',
    'A':  'bg-green-500/10 text-green-400 border-green-500/15',
    'B+': 'bg-blue-500/10 text-blue-400 border-blue-500/15',
    'B':  'bg-blue-500/10 text-blue-400 border-blue-500/15',
    'C+': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/15',
    'C':  'bg-yellow-500/10 text-yellow-400 border-yellow-500/15',
    'D':  'bg-orange-500/10 text-orange-400 border-orange-500/15',
    'F':  'bg-red-500/10 text-red-400 border-red-500/15',
  };
  return (
    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[14px] font-bold border ${colors[grade] || colors['C']}`}>
      {grade}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// COLLAPSIBLE SECTION
// ═══════════════════════════════════════════════════════════
function CollapsibleSection({ title, icon: IconComp, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#111111]/80 border border-white/[0.05] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
            <IconComp size={15} className="text-[#F97316]" />
          </div>
          <span className="text-[14px] font-semibold text-white">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-[#888]" /> : <ChevronDown size={16} className="text-[#888]" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-white/[0.03]">{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN ANALYSIS REPORT MODAL
// ═══════════════════════════════════════════════════════════
export default function AnalysisReport({ analysis, submission, onClose }) {
  const [notes, setNotes] = useState(analysis?.organizer_notes || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showProgressLog, setShowProgressLog] = useState(false);

  if (!analysis || !analysis.final_result) return null;

  const final = analysis.final_result;
  const code = analysis.code_result || {};
  const doc = analysis.doc_result || {};
  const videoData = analysis.video_result || {};
  const progressLog = analysis.progress_log || [];
  const breakdown = final.score_breakdown || {};
  const feedback = final.team_feedback || {};
  const orgNotes = final.organizer_notes || {};
  const problemMatch = final.problem_statement_match || {};

  const saveNotes = async () => {
    setSaving(true);
    try {
      await insforge.database.from('project_analyses').update({
        organizer_notes: notes,
        organizer_notes_saved_at: new Date().toISOString(),
      }).eq('id', analysis.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save notes:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8" onClick={onClose}>
      <div 
        className="bg-[#0A0A0A] border border-white/[0.08] rounded-3xl w-full max-w-3xl mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* ─── Header ─── */}
        <div className="p-6 md:p-8 border-b border-white/[0.05]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-[11px] font-bold tracking-[0.08em] text-[#F97316] uppercase mb-2">AI Analysis Report</div>
              <h2 className="text-[22px] font-bold text-white leading-tight">{submission?.project_name}</h2>
              <p className="text-[14px] text-[#888] mt-1">Team <span className="text-white font-medium">{submission?.team_name}</span></p>
            </div>
            <button onClick={onClose} className="text-[#888] hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5">
              <X size={20} />
            </button>
          </div>

          {/* Score Overview */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#111111]/60 rounded-2xl p-6 border border-white/[0.04]">
            <div className="flex flex-col items-center gap-1">
              <ScoreRing score={Math.round(parseFloat(final.final_score) || 0)} size={96} />
              <span className="text-[11px] font-medium text-[#888] mt-1">Overall</span>
            </div>
            <div className="flex-1 flex flex-col items-center sm:items-start gap-3">
              <div className="flex items-center gap-3">
                <GradeBadge grade={final.grade || 'N/A'} />
                <span className="text-[15px] font-semibold text-white">{final.verdict || 'N/A'}</span>
              </div>
              <p className="text-[13px] text-[#888] leading-relaxed">{feedback.opening || ''}</p>
              {orgNotes.one_line_summary && (
                <p className="text-[12px] text-[#F97316]/80 italic">{orgNotes.one_line_summary}</p>
              )}
            </div>
          </div>
        </div>

        {/* ─── Body ─── */}
        <div className="p-6 md:p-8 space-y-4">

          {/* Score Breakdown */}
          <div className="bg-[#111111]/80 border border-white/[0.05] rounded-2xl p-6">
            <h3 className="text-[14px] font-semibold text-white mb-5 flex items-center gap-2">
              <TrendingUp size={15} className="text-[#F97316]" /> Score Breakdown
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              <ScoreRing score={breakdown.code_quality || 0} size={72} label="Code Quality" />
              <ScoreRing score={breakdown.technical_complexity || 0} size={72} label="Technical" />
              <ScoreRing score={breakdown.innovation || 0} size={72} label="Innovation" />
              <ScoreRing score={breakdown.presentation || 0} size={72} label="Presentation" />
              <ScoreRing score={breakdown.problem_relevance || 0} size={72} label="Relevance" />
            </div>
          </div>

          {/* Problem Statement Match */}
          {problemMatch.match_reason && (
            <div className={`rounded-2xl p-5 border ${problemMatch.addressed ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Target size={15} className={problemMatch.addressed ? 'text-green-400' : 'text-red-400'} />
                <span className="text-[13px] font-semibold text-white">Problem Statement Match — {problemMatch.match_percentage || 0}%</span>
              </div>
              <p className="text-[13px] text-[#888] leading-relaxed">{problemMatch.match_reason}</p>
            </div>
          )}

          {/* Code Analysis */}
          <CollapsibleSection title="Code Analysis" icon={Code2} defaultOpen={true}>
            <div className="space-y-4 pt-4">
              {code.tech_stack && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {code.tech_stack.map((t, i) => (
                    <span key={i} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/5 text-[#888] border border-white/5">{t}</span>
                  ))}
                  {code.complexity_level && (
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/15 capitalize">{code.complexity_level}</span>
                  )}
                </div>
              )}
              
              {code.code_quality_reason && (
                <div>
                  <div className="text-[11px] font-bold tracking-wide uppercase text-[#888] mb-1">Code Quality — {code.code_quality_score}/100</div>
                  <p className="text-[13px] text-[#ccc] leading-relaxed">{code.code_quality_reason}</p>
                </div>
              )}
              {code.technical_complexity_reason && (
                <div>
                  <div className="text-[11px] font-bold tracking-wide uppercase text-[#888] mb-1">Technical Complexity — {code.technical_complexity_score}/100</div>
                  <p className="text-[13px] text-[#ccc] leading-relaxed">{code.technical_complexity_reason}</p>
                </div>
              )}
              {code.innovation_reason && (
                <div>
                  <div className="text-[11px] font-bold tracking-wide uppercase text-[#888] mb-1">Innovation — {code.innovation_score}/100</div>
                  <p className="text-[13px] text-[#ccc] leading-relaxed">{code.innovation_reason}</p>
                </div>
              )}

              {code.code_positives?.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold tracking-wide uppercase text-green-400/80 mb-2">Strengths</div>
                  <ul className="space-y-1.5">
                    {code.code_positives.map((p, i) => (
                      <li key={i} className="text-[13px] text-[#ccc] flex items-start gap-2">
                        <CheckCircle size={13} className="text-green-400 mt-0.5 shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {code.code_concerns?.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold tracking-wide uppercase text-orange-400/80 mb-2">Concerns</div>
                  <ul className="space-y-1.5">
                    {code.code_concerns.map((c, i) => (
                      <li key={i} className="text-[13px] text-[#ccc] flex items-start gap-2">
                        <AlertTriangle size={13} className="text-orange-400 mt-0.5 shrink-0" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {code.plagiarism_flag && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                  <Shield size={14} className="text-red-400" />
                  <span className="text-[12px] text-red-300 font-medium">Plagiarism Flag: {code.plagiarism_reason}</span>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Document Analysis */}
          {doc.analysis_type === 'document' && doc.presentation_reason && (
            <CollapsibleSection title="Document / Presentation Analysis" icon={FileText}>
              <div className="space-y-4 pt-4">
                {doc.presentation_reason && (
                  <div>
                    <div className="text-[11px] font-bold tracking-wide uppercase text-[#888] mb-1">Presentation — {doc.presentation_score}/100</div>
                    <p className="text-[13px] text-[#ccc] leading-relaxed">{doc.presentation_reason}</p>
                  </div>
                )}
                {doc.problem_understanding_reason && (
                  <div>
                    <div className="text-[11px] font-bold tracking-wide uppercase text-[#888] mb-1">Problem Understanding — {doc.problem_understanding_score}/100</div>
                    <p className="text-[13px] text-[#ccc] leading-relaxed">{doc.problem_understanding_reason}</p>
                  </div>
                )}
                {doc.solution_clarity_reason && (
                  <div>
                    <div className="text-[11px] font-bold tracking-wide uppercase text-[#888] mb-1">Solution Clarity — {doc.solution_clarity_score}/100</div>
                    <p className="text-[13px] text-[#ccc] leading-relaxed">{doc.solution_clarity_reason}</p>
                  </div>
                )}
                {doc.impact_reason && (
                  <div>
                    <div className="text-[11px] font-bold tracking-wide uppercase text-[#888] mb-1">Impact — {doc.impact_score}/100</div>
                    <p className="text-[13px] text-[#ccc] leading-relaxed">{doc.impact_reason}</p>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Video Analysis (NEW) */}
          {videoData && (videoData.demo_quality_reason || videoData.note) && (
            <CollapsibleSection title="Demo Video Analysis" icon={Video}>
              <div className="space-y-4 pt-4">
                {videoData.note && (
                  <p className="text-[12px] text-[#888] italic">{videoData.note}</p>
                )}
                {videoData.demo_quality_reason && (
                  <div>
                    <div className="text-[11px] font-bold tracking-wide uppercase text-[#888] mb-1">Demo Quality — {videoData.demo_quality_score}/100</div>
                    <p className="text-[13px] text-[#ccc] leading-relaxed">{videoData.demo_quality_reason}</p>
                  </div>
                )}
                {videoData.feature_coverage_reason && (
                  <div>
                    <div className="text-[11px] font-bold tracking-wide uppercase text-[#888] mb-1">Feature Coverage — {videoData.feature_coverage_score}/100</div>
                    <p className="text-[13px] text-[#ccc] leading-relaxed">{videoData.feature_coverage_reason}</p>
                  </div>
                )}
                {videoData.working_product_reason && (
                  <div className={`rounded-xl p-3 border ${videoData.working_product_proof ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                    <span className="text-[12px] font-medium text-[#ccc]">
                      {videoData.working_product_proof ? '✅' : '❌'} Working Product: {videoData.working_product_reason}
                    </span>
                  </div>
                )}
                {videoData.video_positives?.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold tracking-wide uppercase text-green-400/80 mb-2">Positives</div>
                    <ul className="space-y-1.5">
                      {videoData.video_positives.map((p, i) => (
                        <li key={i} className="text-[13px] text-[#ccc] flex items-start gap-2"><CheckCircle size={13} className="text-green-400 mt-0.5 shrink-0" /> {p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {videoData.video_concerns?.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold tracking-wide uppercase text-orange-400/80 mb-2">Concerns</div>
                    <ul className="space-y-1.5">
                      {videoData.video_concerns.map((c, i) => (
                        <li key={i} className="text-[13px] text-[#ccc] flex items-start gap-2"><AlertTriangle size={13} className="text-orange-400 mt-0.5 shrink-0" /> {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Team Feedback */}
          {feedback.strengths && (
            <CollapsibleSection title="Team Feedback" icon={Star} defaultOpen={true}>
              <div className="space-y-5 pt-4">
                <div>
                  <div className="text-[11px] font-bold tracking-wide uppercase text-green-400/80 mb-2">Strengths</div>
                  <ul className="space-y-2">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="text-[13px] text-[#ccc] flex items-start gap-2 leading-relaxed">
                        <CheckCircle size={13} className="text-green-400 mt-0.5 shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[11px] font-bold tracking-wide uppercase text-yellow-400/80 mb-2">Areas for Improvement</div>
                  <ul className="space-y-2">
                    {feedback.improvements?.map((imp, i) => (
                      <li key={i} className="text-[13px] text-[#ccc] flex items-start gap-2 leading-relaxed">
                        <Lightbulb size={13} className="text-yellow-400 mt-0.5 shrink-0" /> {imp}
                      </li>
                    ))}
                  </ul>
                </div>
                {feedback.closing && (
                  <p className="text-[13px] text-[#F97316]/80 italic border-t border-white/[0.04] pt-4">{feedback.closing}</p>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Organizer Notes */}
          {(orgNotes.shortlist_recommendation || orgNotes.human_review_needed || orgNotes.red_flag) && (
            <CollapsibleSection title="Organizer Notes" icon={Shield}>
              <div className="space-y-3 pt-4">
                <div className="flex flex-wrap gap-3">
                  {orgNotes.shortlist_recommendation && (
                    <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/15">✓ Shortlisted</span>
                  )}
                  {orgNotes.human_review_needed && (
                    <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/15">⚠ Human Review Needed</span>
                  )}
                </div>
                {orgNotes.human_review_reason && (
                  <p className="text-[13px] text-[#888]">Review reason: {orgNotes.human_review_reason}</p>
                )}
                {orgNotes.red_flag && orgNotes.red_flag !== 'null' && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <span className="text-[12px] text-red-300 font-medium">🚩 {orgNotes.red_flag}</span>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Organizer Notes — Editable */}
          <CollapsibleSection title="Your Notes (Organizer)" icon={MessageSquare} defaultOpen={true}>
            <div className="pt-4 space-y-3">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add your personal feedback for this team... This will be saved and can be sent to the team later."
                rows={4}
                className="w-full bg-[#0A0A0A] border border-white/[0.08] focus:border-nexus-primary/40 rounded-xl px-4 py-3 text-[13px] text-[#F5F5F5] placeholder-[#555] outline-none resize-y transition-colors"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#555]">
                  {analysis.organizer_notes_saved_at ? `Last saved: ${new Date(analysis.organizer_notes_saved_at).toLocaleString()}` : 'Not saved yet'}
                </span>
                <button
                  onClick={saveNotes}
                  disabled={saving}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.97] ${
                    saved
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-nexus-primary/10 text-nexus-primary border border-nexus-primary/25 hover:bg-nexus-primary/20'
                  }`}
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <CheckCircle size={13} /> : <Save size={13} />}
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Notes'}
                </button>
              </div>
            </div>
          </CollapsibleSection>

          {/* Live Progress Log */}
          <div className="bg-[#111111]/80 border border-white/[0.05] rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowProgressLog(!showProgressLog)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  <Activity size={15} className="text-[#F97316]" />
                </div>
                <span className="text-[14px] font-semibold text-white">AI Pipeline Log</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-[#888]">{progressLog.length} steps</span>
              </div>
              {showProgressLog ? <ChevronUp size={16} className="text-[#888]" /> : <ChevronDown size={16} className="text-[#888]" />}
            </button>
            {showProgressLog && (
              <div className="px-5 pb-5 border-t border-white/[0.03] space-y-0">
                {progressLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/[0.02] last:border-0">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      log.status === 'done' ? 'bg-green-500/15 text-green-400' :
                      log.status === 'running' ? 'bg-purple-500/15 text-purple-400' :
                      log.status === 'error' ? 'bg-red-500/15 text-red-400' :
                      log.status === 'skipped' ? 'bg-yellow-500/15 text-yellow-400' :
                      'bg-white/5 text-[#888]'
                    }`}>
                      {log.status === 'done' ? <CheckCircle size={11} /> :
                       log.status === 'running' ? <Loader2 size={11} className="animate-spin" /> :
                       log.status === 'error' ? <AlertTriangle size={11} /> :
                       <Clock size={11} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[#ccc] leading-relaxed">{log.detail}</p>
                      <p className="text-[10px] text-[#555] mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confidence */}
          <div className="text-center pt-2 pb-2">
            <span className="text-[11px] text-[#444]">
              AI Confidence: {final.evaluation_confidence || code.confidence || '—'}% · Model: DeepSeek v3.2 · Analysis ID: {analysis.id?.slice(0, 8)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
