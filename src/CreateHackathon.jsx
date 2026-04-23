import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { insforge } from './lib/insforge';
import { useAuth } from './AuthContext';
import HackathonChatbot from './HackathonChatbot';
import './dashboard.css';
import {
  ArrowLeft, ArrowRight, Check, Copy, Plus, Trash2,
  Rocket, Calendar, Users, Trophy, FileText, X, Loader2, LogOut, User, Sparkles, AlertTriangle
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const STEPS = ['Basic Info', 'Timeline & Participation', 'Prizes & Criteria', 'Review & Publish'];

const THEMES = ['AI/ML', 'Web3', 'HealthTech', 'EdTech', 'FinTech', 'Open Innovation', 'Climate', 'Cybersecurity'];

const TYPES = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'hybrid', label: 'Hybrid' },
];

const ELIGIBILITY = [
  { value: 'students', label: 'Students Only' },
  { value: 'professionals', label: 'Professionals' },
  { value: 'open', label: 'Open to All' },
];

const DEFAULT_CRITERIA = {
  relevance: 20,
  innovation: 20,
  technical: 20,
  completeness: 20,
  presentation: 20,
};


// ═══════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════
function ProgressBar({ currentStep, setStep }) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        {STEPS.map((label, i) => (
          <button 
            key={i} 
            onClick={() => { if (i <= currentStep) setStep(i); }}
            disabled={i > currentStep}
            className={`flex items-center gap-3 group transition-all outline-none ${i > currentStep ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold transition-all shadow-lg ${
              i < currentStep ? 'bg-nexus-primary text-white shadow-nexus-primary/30 group-hover:bg-nexus-primary-hover' :
              i === currentStep ? 'bg-gradient-to-br from-nexus-primary to-[#F97316] text-white shadow-[0_0_15px_-3px_rgba(249,115,22,0.4)] border border-white/10' :
              'bg-[#111] border border-white/[0.08] text-[#888]'
            }`}>
              {i < currentStep ? <Check size={16} /> : i + 1}
            </div>
            <span className={`text-[14px] font-semibold hidden md:inline transition-colors ${
              i <= currentStep ? 'text-[#F5F5F5]' : 'text-[#888]'
            }`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-8 sm:w-20 h-[2px] ml-3 rounded-full transition-colors ${
                i < currentStep ? 'bg-nexus-primary' : 'bg-white/[0.06]'
              }`} />
            )}
          </button>
        ))}
      </div>
      {/* Overall bar */}
      <div className="h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div
          className="h-full rounded-full bg-nexus-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// INPUT COMPONENTS
// ═══════════════════════════════════════════════════════════
function FormField({ label, required, children, hint }) {
  return (
    <div className="mb-5">
      <label className="block text-[13px] font-medium text-[#F5F5F5] mb-2">
        {label}{required && <span className="text-nexus-primary ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[#444] mt-1.5">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/[0.02] border border-white/[0.08] rounded-[14px] min-h-[50px] px-4 py-3 text-[14px] text-[#F5F5F5] placeholder:text-[#555] outline-none hover:bg-white/[0.04] focus:border-nexus-primary/50 focus:bg-nexus-primary/5 focus:shadow-[0_0_20px_-5px_rgba(249,115,22,0.2)] transition-all [color-scheme:dark]"
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-white/[0.02] border border-white/[0.08] rounded-[14px] px-4 py-3 text-[14px] text-[#F5F5F5] placeholder:text-[#555] outline-none hover:bg-white/[0.04] focus:border-nexus-primary/50 focus:bg-nexus-primary/5 focus:shadow-[0_0_20px_-5px_rgba(249,115,22,0.2)] transition-all resize-none"
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/[0.02] border border-white/[0.08] rounded-[14px] min-h-[50px] px-4 py-3 text-[14px] text-[#F5F5F5] outline-none hover:bg-white/[0.04] focus:border-nexus-primary/50 focus:bg-nexus-primary/5 focus:shadow-[0_0_20px_-5px_rgba(249,115,22,0.2)] transition-all appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%23888' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}


// ═══════════════════════════════════════════════════════════
// STEP 1: BASIC INFO
// ═══════════════════════════════════════════════════════════
function Step1({ form, setField }) {
  const toggleTheme = (theme) => {
    const current = form.themes || [];
    setField('themes', current.includes(theme)
      ? current.filter(t => t !== theme)
      : [...current, theme]
    );
  };

  return (
    <div>
      <h3 className="text-[18px] font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
        <FileText size={18} className="text-nexus-primary" />
        Basic Info
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Hackathon Name" required>
          <TextInput value={form.name} onChange={v => setField('name', v)} placeholder="e.g. Hackloom 2026" />
        </FormField>
        <FormField label="Tagline">
          <TextInput value={form.tagline} onChange={v => setField('tagline', v)} placeholder="e.g. Build the Future in 48 Hours" />
        </FormField>
      </div>

      <FormField label="Description">
        <TextArea value={form.description} onChange={v => setField('description', v)} placeholder="Describe your hackathon — theme, goals, what participants will build..." rows={4} />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Type">
          <Select value={form.type} onChange={v => setField('type', v)} options={TYPES} />
        </FormField>
        <div className="hidden md:block" /> {/* spacer */}
      </div>

      <FormField label="Themes" hint="Select all that apply">
        <div className="flex flex-wrap gap-2.5">
          {THEMES.map(theme => {
            const active = (form.themes || []).includes(theme);
            return (
              <button
                key={theme}
                onClick={() => toggleTheme(theme)}
                className={`px-4 py-2 rounded-full min-h-[40px] text-[13px] font-medium border transition-all duration-200 active:scale-[0.96] shadow-sm ${
                  active
                    ? 'bg-nexus-primary/10 text-nexus-primary border-nexus-primary/30 shadow-[0_0_15px_-3px_rgba(249,115,22,0.15)]'
                    : 'bg-white/[0.02] text-[#888] border-white/[0.08] hover:text-[#F5F5F5] hover:border-white/[0.2] hover:bg-white/[0.04]'
                }`}
              >
                {active && <Check size={14} className="inline mr-1.5 -mt-px" />}
                {theme}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField label="Cover Image URL" hint="Paste a URL to your hackathon banner image">
        <TextInput value={form.cover_image_url} onChange={v => setField('cover_image_url', v)} placeholder="https://example.com/banner.png" />
      </FormField>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// STEP 2: TIMELINE & PARTICIPATION
// ═══════════════════════════════════════════════════════════
function Step2({ form, setField }) {
  return (
    <div>
      <h3 className="text-[18px] font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
        <Calendar size={18} className="text-nexus-primary" />
        Timeline & Participation
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Registration Opens" required>
          <TextInput type="datetime-local" value={form.registration_opens} onChange={v => setField('registration_opens', v)} />
        </FormField>
        <FormField label="Registration Closes" required>
          <TextInput type="datetime-local" value={form.registration_closes} onChange={v => setField('registration_closes', v)} />
        </FormField>
        <FormField label="Submission Deadline" required>
          <TextInput type="datetime-local" value={form.submission_deadline} onChange={v => setField('submission_deadline', v)} />
        </FormField>
        <FormField label="Results Date">
          <TextInput type="datetime-local" value={form.results_date} onChange={v => setField('results_date', v)} />
        </FormField>
      </div>

      <div className="h-px bg-[rgba(255,255,255,0.06)] my-6" />

      <h4 className="text-[14px] font-semibold text-[#F5F5F5] mb-4 flex items-center gap-2">
        <Users size={15} className="text-nexus-primary/60" />
        Participation Rules
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <FormField label="Team Size (Min)">
          <TextInput type="number" value={form.team_size_min} onChange={v => setField('team_size_min', v)} placeholder="1" />
        </FormField>
        <FormField label="Team Size (Max)">
          <TextInput type="number" value={form.team_size_max} onChange={v => setField('team_size_max', v)} placeholder="5" />
        </FormField>
        <FormField label="Max Teams">
          <TextInput type="number" value={form.max_teams} onChange={v => setField('max_teams', v)} placeholder="Unlimited" />
        </FormField>
      </div>

      <FormField label="Who Can Join">
        <Select value={form.eligibility} onChange={v => setField('eligibility', v)} options={ELIGIBILITY} />
      </FormField>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// STEP 3: PRIZES & CRITERIA
// ═══════════════════════════════════════════════════════════
function Step3({ form, setField }) {
  const prizes = form.prizes || [
    { place: '1st Place', amount: '' },
    { place: '2nd Place', amount: '' },
    { place: '3rd Place', amount: '' },
  ];

  const updatePrize = (index, key, value) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [key]: value };
    setField('prizes', updated);
  };

  const addPrize = () => {
    setField('prizes', [...prizes, { place: '', amount: '' }]);
  };

  const removePrize = (index) => {
    if (prizes.length <= 1) return;
    setField('prizes', prizes.filter((_, i) => i !== index));
  };

  const criteria = form.criteria || { ...DEFAULT_CRITERIA };
  const total = Object.values(criteria).reduce((sum, v) => sum + Number(v), 0);

  const updateCriteria = (key, value) => {
    const num = Math.max(0, Math.min(100, Number(value)));
    setField('criteria', { ...criteria, [key]: num });
  };

  return (
    <div>
      <h3 className="text-[18px] font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
        <Trophy size={18} className="text-nexus-primary" />
        Prizes & Scoring Criteria
      </h3>

      {/* Prizes */}
      <FormField label="Prize Structure">
        <div className="space-y-3">
          {prizes.map((prize, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                value={prize.place}
                onChange={e => updatePrize(i, 'place', e.target.value)}
                placeholder="Prize title"
                className="w-full sm:flex-1 bg-white/[0.02] border border-white/[0.08] rounded-[14px] min-h-[50px] px-4 py-3 text-[14px] text-[#F5F5F5] placeholder:text-[#555] outline-none hover:bg-white/[0.04] focus:border-nexus-primary/50 focus:bg-nexus-primary/5 focus:shadow-[0_0_20px_-5px_rgba(249,115,22,0.2)] transition-all"
              />
              <div className="flex w-full sm:w-auto items-center gap-3">
                <input
                  value={prize.amount}
                  onChange={e => updatePrize(i, 'amount', e.target.value)}
                  placeholder="Amount (e.g. $5,000)"
                  className="flex-1 sm:w-48 bg-white/[0.02] border border-white/[0.08] rounded-[14px] min-h-[50px] px-4 py-3 text-[14px] text-[#F5F5F5] placeholder:text-[#555] outline-none hover:bg-white/[0.04] focus:border-nexus-primary/50 focus:bg-nexus-primary/5 focus:shadow-[0_0_20px_-5px_rgba(249,115,22,0.2)] transition-all"
                />
                <button
                  onClick={() => removePrize(i)}
                  className="w-[50px] h-[50px] bg-white/[0.02] border border-white/[0.08] rounded-[14px] text-[#888] flex items-center justify-center hover:text-nexus-error hover:bg-nexus-error/10 hover:border-nexus-error/20 transition-all active:scale-[0.95]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addPrize}
          className="mt-5 flex items-center justify-center gap-2 min-h-[50px] px-4 w-full border border-dashed border-white/[0.15] bg-white/[0.01] hover:bg-white/[0.03] rounded-[14px] text-[14px] font-semibold text-[#888] hover:text-nexus-primary hover:border-nexus-primary/50 transition-all active:scale-[0.98]"
        >
          <Plus size={14} /> Add Prize
        </button>
      </FormField>

      <div className="h-px bg-[rgba(255,255,255,0.06)] my-6" />

      {/* Problem Statement */}
      <FormField label="Problem Statement" required hint="The AI judge will use this to score submissions against your rubric.">
        <TextArea
          value={form.problem_statement}
          onChange={v => setField('problem_statement', v)}
          placeholder="Describe the challenge participants must solve. Be specific about requirements, constraints, and expected deliverables..."
          rows={5}
        />
      </FormField>

      <div className="h-px bg-[rgba(255,255,255,0.06)] my-6" />

      {/* Criteria Sliders */}
      <FormField label="Scoring Criteria" hint={`Weights must total 100% — currently ${total}%`}>
        <div className="space-y-5 bg-white/[0.01] border border-white/[0.04] p-6 rounded-[20px]">
          {Object.entries(criteria).map(([key, val]) => (
            <div key={key} className="flex items-center gap-5">
              <span className="w-32 text-[14px] font-medium text-[#AAA] capitalize">{key}</span>
              <div className="flex-1 flex items-center group relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={val}
                  onChange={e => updateCriteria(key, e.target.value)}
                  className="w-full accent-nexus-primary h-2 bg-white/[0.06] rounded-full appearance-none cursor-pointer outline-none group-hover:bg-white/[0.1] transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-nexus-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(249,115,22,0.4)]"
                />
              </div>
              <span className={`w-14 text-right text-[15px] font-bold tabular-nums ${
                total === 100 ? 'text-nexus-primary' : 'text-nexus-error'
              }`}>
                {val}%
              </span>
            </div>
          ))}
        </div>
        {total !== 100 && (
          <p className="text-[13px] font-medium text-nexus-error mt-3 flex items-center gap-1.5">
            <AlertTriangle size={14} /> Total must equal 100% (currently {total}%)
          </p>
        )}
      </FormField>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// STEP 4: REVIEW & PUBLISH
// ═══════════════════════════════════════════════════════════
function Step4({ form }) {
  const criteria = form.criteria || DEFAULT_CRITERIA;

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h4 className="text-[12px] font-medium tracking-[0.08em] uppercase text-[#888] mb-3">{title}</h4>
      <div className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-card p-5">
        {children}
      </div>
    </div>
  );

  const Field = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-2 gap-1 sm:gap-0">
      <span className="sm:w-44 shrink-0 text-[13px] text-[#888]">{label}</span>
      <span className="text-[13px] text-[#F5F5F5]">{value || <span className="text-[#444]">—</span>}</span>
    </div>
  );

  return (
    <div>
      <h3 className="text-[18px] font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
        <Rocket size={18} className="text-nexus-primary" />
        Review & Publish
      </h3>

      <Section title="Basic Info">
        <Field label="Name" value={form.name} />
        <Field label="Tagline" value={form.tagline} />
        <Field label="Description" value={form.description} />
        <Field label="Type" value={form.type} />
        <Field label="Themes" value={(form.themes || []).join(', ')} />
      </Section>

      <Section title="Timeline">
        <Field label="Registration Opens" value={form.registration_opens ? new Date(form.registration_opens).toLocaleString() : ''} />
        <Field label="Registration Closes" value={form.registration_closes ? new Date(form.registration_closes).toLocaleString() : ''} />
        <Field label="Submission Deadline" value={form.submission_deadline ? new Date(form.submission_deadline).toLocaleString() : ''} />
        <Field label="Results Date" value={form.results_date ? new Date(form.results_date).toLocaleString() : ''} />
      </Section>

      <Section title="Participation">
        <Field label="Team Size" value={`${form.team_size_min || 1} – ${form.team_size_max || 5} members`} />
        <Field label="Max Teams" value={form.max_teams || 'Unlimited'} />
        <Field label="Eligibility" value={form.eligibility} />
      </Section>

      <Section title="Prizes">
        {(form.prizes || []).map((p, i) => (
          <Field key={i} label={p.place || `Prize ${i + 1}`} value={p.amount} />
        ))}
      </Section>

      <Section title="Problem Statement">
        <p className="text-[13px] text-[#F5F5F5] whitespace-pre-wrap leading-relaxed">{form.problem_statement || <span className="text-[#444]">Not provided</span>}</p>
      </Section>

      <Section title="Scoring Criteria">
        <div className="space-y-2">
          {Object.entries(criteria).map(([key, val]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-32 text-[13px] text-[#888] capitalize">{key}</span>
              <div className="flex-1 h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                <div className="h-full rounded-full bg-nexus-primary" style={{ width: `${val}%` }} />
              </div>
              <span className="w-10 text-right text-[13px] font-semibold text-[#F5F5F5] tabular-nums">{val}%</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// SUCCESS STATE
// ═══════════════════════════════════════════════════════════
function SuccessState({ hackathonId, hackathonName }) {
  const [copied, setCopied] = useState(null);
  const baseUrl = window.location.origin;

  const links = [
    { label: 'Public Page', url: `${baseUrl}/hackathon/${hackathonId}` },
    { label: 'Registration Link', url: `${baseUrl}/hackathon/${hackathonId}/register` },
    { label: 'Submission Link', url: `${baseUrl}/hackathon/${hackathonId}/submit` },
  ];

  const copyToClipboard = (url, label) => {
    navigator.clipboard.writeText(url);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-xl mx-auto text-center py-10">
      <div className="w-16 h-16 rounded-full bg-nexus-primary/15 flex items-center justify-center mx-auto mb-6">
        <Check size={28} className="text-nexus-primary" />
      </div>
      <h2 className="text-[24px] font-bold text-[#F5F5F5] mb-2">Hackathon Published!</h2>
      <p className="text-[14px] text-[#888] mb-8">
        <span className="text-[#F5F5F5] font-medium">{hackathonName}</span> is now live. Share these links with participants.
      </p>

      <div className="space-y-3 text-left">
        {links.map((link) => (
          <div key={link.label} className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-card p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium tracking-[0.06em] uppercase text-[#888] block mb-1">{link.label}</span>
              <span className="text-[13px] text-nexus-primary truncate">{link.url}</span>
            </div>
            <button
              onClick={() => copyToClipboard(link.url, link.label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-[12px] font-medium transition-all active:scale-[0.98] ${
                copied === link.label
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'text-[#F5F5F5] border border-[rgba(255,255,255,0.1)] hover:border-nexus-primary hover:text-nexus-primary'
              }`}
            >
              {copied === link.label ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-btn px-6 py-2.5 text-[13px] font-medium transition-colors active:scale-[0.98]"
        >
          Go to Dashboard <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// MAIN CREATE HACKATHON PAGE
// ═══════════════════════════════════════════════════════════
export default function CreateHackathon() {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshSession } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);
  const [hackathonId, setHackathonId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showChatbot, setShowChatbot] = useState(false);

  // ─── Handle AI chatbot form fill ───
  const handleFormFill = (aiData) => {
    // Map AI extraction response → form state
    setForm(prev => ({
      ...prev,
      name:                aiData.name                || prev.name,
      tagline:             aiData.tagline             || prev.tagline,
      description:         aiData.description         || prev.description,
      type:                aiData.type                || prev.type,
      themes:              Array.isArray(aiData.themes) ? aiData.themes : prev.themes,
      cover_image_url:     aiData.cover_image_url     || prev.cover_image_url,
      registration_opens:  aiData.registration_opens  || prev.registration_opens,
      registration_closes: aiData.registration_closes || prev.registration_closes,
      submission_deadline: aiData.submission_deadline || prev.submission_deadline,
      results_date:        aiData.results_date        || prev.results_date,
      team_size_min:       String(aiData.team_size_min  || prev.team_size_min),
      team_size_max:       String(aiData.team_size_max  || prev.team_size_max),
      max_teams:           aiData.max_teams ? String(aiData.max_teams) : prev.max_teams,
      eligibility:         aiData.eligibility         || prev.eligibility,
      prizes:              Array.isArray(aiData.prizes) && aiData.prizes.length
                             ? aiData.prizes
                             : prev.prizes,
      problem_statement:   aiData.problem_statement   || prev.problem_statement,
      criteria:            aiData.criteria            || prev.criteria,
    }));
    setShowChatbot(false);
    // Jump to review step so organizer can check everything
    setStep(3);
  };

  // Auth protection
  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'ai') {
      setShowChatbot(true);
    }
  }, []);

  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    type: 'online',
    themes: [],
    cover_image_url: '',
    registration_opens: '',
    registration_closes: '',
    submission_deadline: '',
    results_date: '',
    team_size_min: '1',
    team_size_max: '5',
    max_teams: '',
    eligibility: 'open',
    prizes: [
      { place: '1st Place', amount: '' },
      { place: '2nd Place', amount: '' },
      { place: '3rd Place', amount: '' },
    ],
    problem_statement: '',
    criteria: { ...DEFAULT_CRITERIA },
  });

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  // Validation
  const validateStep = (s) => {
    const errs = {};
    if (s === 0) {
      if (!form.name.trim()) errs.name = 'Hackathon name is required';
    }
    if (s === 1) {
      if (!form.registration_opens) errs.registration_opens = 'Required';
      if (!form.registration_closes) errs.registration_closes = 'Required';
      if (!form.submission_deadline) errs.submission_deadline = 'Required';
    }
    if (s === 2) {
      if (!form.problem_statement.trim()) errs.problem_statement = 'Problem statement is required';
      const total = Object.values(form.criteria).reduce((sum, v) => sum + Number(v), 0);
      if (total !== 100) errs.criteria = 'Criteria must total 100%';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, 3));
    }
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleLogout = async () => {
    await insforge.auth.signOut();
    await refreshSession();
    navigate('/auth');
  };

  // Publish to InsForge
  const handlePublish = async () => {
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        tagline: form.tagline || null,
        description: form.description || null,
        type: form.type,
        themes: form.themes,
        cover_image_url: form.cover_image_url || null,
        registration_opens: form.registration_opens || null,
        registration_closes: form.registration_closes || null,
        submission_deadline: form.submission_deadline || null,
        results_date: form.results_date || null,
        team_size_min: parseInt(form.team_size_min) || 1,
        team_size_max: parseInt(form.team_size_max) || 5,
        max_teams: form.max_teams ? parseInt(form.max_teams) : null,
        eligibility: form.eligibility,
        prizes: form.prizes,
        problem_statement: form.problem_statement,
        criteria: form.criteria,
        status: 'published',
        organizer_id: user.id,
      };

      const { data, error } = await insforge.database
        .from('hackathons')
        .insert(payload)
        .select();

      if (error) throw error;
      setHackathonId(data[0].id);
      setPublished(true);
    } catch (err) {
      console.error('Publish error:', err);
      alert('Failed to publish hackathon. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  // Save as Draft
  const handleSaveDraft = async () => {
    setSubmitting(true);
    try {
      const payload = {
        name: form.name || 'Untitled Hackathon',
        tagline: form.tagline || null,
        description: form.description || null,
        type: form.type,
        themes: form.themes,
        cover_image_url: form.cover_image_url || null,
        registration_opens: form.registration_opens || null,
        registration_closes: form.registration_closes || null,
        submission_deadline: form.submission_deadline || null,
        results_date: form.results_date || null,
        team_size_min: parseInt(form.team_size_min) || 1,
        team_size_max: parseInt(form.team_size_max) || 5,
        max_teams: form.max_teams ? parseInt(form.max_teams) : null,
        eligibility: form.eligibility,
        prizes: form.prizes,
        problem_statement: form.problem_statement || null,
        criteria: form.criteria,
        status: 'draft',
        organizer_id: user.id,
      };

      const { error } = await insforge.database
        .from('hackathons')
        .insert(payload)
        .select();

      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      console.error('Save draft error:', err);
      alert('Failed to save draft. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><Loader2 className="animate-spin text-nexus-primary" size={32} /></div>;
  }

  if (published) {
    return (
      <div className="nexus-dashboard min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-inter">
        {/* Navbar */}
        <header className="h-[60px] bg-[#0D0D0D] border-b border-[rgba(255,255,255,0.05)] flex items-center px-8">
          <div className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="chGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#F97316"/><stop offset="100%" stopColor="#FB9A57"/></linearGradient></defs><path d="M8 7h3v7.5h10V7h3v18h-3v-7.5H11V25H8V7z" fill="url(#chGrad)"/></svg>
            <span className="text-[16px] font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Hackloom</span>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-8 py-12">
          <SuccessState hackathonId={hackathonId} hackathonName={form.name} />
        </main>
      </div>
    );
  }

  return (
    <div className="nexus-dashboard min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-inter">
      {/* Navbar */}
      <header className="h-[60px] bg-[#0D0D0D] border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-[13px] text-[#888] hover:text-[#F5F5F5] transition-colors"
          >
            <ArrowLeft size={15} /> Dashboard
          </button>
          <div className="w-px h-5 bg-[rgba(255,255,255,0.08)]" />
          <h1 className="text-[16px] font-bold text-white">Create Hackathon</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowChatbot(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-nexus-primary/10 to-purple-600/10 hover:from-nexus-primary/20 hover:to-purple-600/20 border border-nexus-primary/25 text-nexus-primary rounded-btn min-h-[36px] px-4 py-2 text-[13px] font-semibold transition-all"
          >
            <Sparkles size={14} />
            AI Fill
          </button>
          <span className="text-[11px] font-semibold text-nexus-primary bg-nexus-primary/10 px-3 py-1.5 rounded-full tracking-wide">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[800px] mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
        <ProgressBar currentStep={step} setStep={setStep} />

        {/* Validation error banner */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-nexus-error/10 border border-nexus-error/20 rounded-2xl p-4 mb-8 flex items-start gap-3 backdrop-blur-md shadow-lg shadow-nexus-error/5">
            <X size={18} className="text-nexus-error mt-0.5 shrink-0" />
            <div>
              <p className="text-[14px] font-bold text-nexus-error">Please fix the following:</p>
              <ul className="mt-1 space-y-1">
                {Object.values(errors).filter(Boolean).map((err, i) => (
                  <li key={i} className="text-[13px] text-nexus-error/90">• {err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="glass-shell rounded-[32px] p-[1px] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.8)] relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-nexus-primary/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          <div className="glass-inner rounded-[32px] p-6 md:p-10 relative z-10 bg-[#050505]/95 backdrop-blur-3xl">
            {step === 0 && <Step1 form={form} setField={setField} />}
            {step === 1 && <Step2 form={form} setField={setField} />}
            {step === 2 && <Step3 form={form} setField={setField} />}
            {step === 3 && <Step4 form={form} />}
          </div>
        </div>

        {/* Nav Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 sm:gap-0 mt-8">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={`w-full sm:w-auto min-h-[50px] flex items-center justify-center gap-2 px-6 py-3 rounded-[14px] text-[14px] font-semibold transition-all active:scale-[0.98] ${
              step === 0
                ? 'opacity-0 pointer-events-none'
                : 'text-[#F5F5F5] bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.15] shadow-sm'
            }`}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {step === 3 && (
              <button
                onClick={handleSaveDraft}
                disabled={submitting}
                className="w-full sm:w-auto min-h-[50px] flex items-center justify-center gap-2 px-6 py-3 rounded-[14px] text-[14px] font-semibold text-[#F5F5F5] bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.15] shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Save as Draft
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="w-full sm:w-auto min-h-[50px] flex items-center justify-center gap-2 bg-gradient-to-br from-nexus-primary to-[#F97316] hover:opacity-90 text-white rounded-[14px] px-8 py-3 text-[14px] font-semibold transition-all active:scale-[0.98] shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)]"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={submitting}
                className="w-full sm:w-auto min-h-[50px] flex items-center justify-center gap-2 bg-gradient-to-br from-nexus-primary to-[#F97316] hover:opacity-90 text-white rounded-[14px] px-8 py-3 text-[14px] font-semibold transition-all active:scale-[0.98] shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Publishing...</>
                ) : (
                  <><Rocket size={16} /> Publish Hackathon</>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* ─── AI Chatbot Modal ─── */}
      {showChatbot && (
        <HackathonChatbot
          onFormFill={handleFormFill}
          onClose={() => setShowChatbot(false)}
        />
      )}
    </div>
  );
}
