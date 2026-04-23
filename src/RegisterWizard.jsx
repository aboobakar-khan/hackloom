import { useState } from 'react';
import { insforge } from './lib/insforge';
import { Check, Loader2, Users, Target, ShieldCheck, ChevronLeft, ChevronRight, CheckCircle, X, AlertCircle } from 'lucide-react';

const IC = "w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[14px] text-white placeholder:text-[#555] outline-none focus:border-[#FF8C32]/50 focus:ring-4 ring-[#FF8C32]/10 transition-all";
const SEL = "w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[14px] text-white outline-none focus:border-[#FF8C32]/50 appearance-none";
const STEPS = ['About You', 'Project Info', 'Team', 'Review'];
const ROLES = ['Student', 'Developer', 'Designer', 'PM', 'Founder', 'Other'];
const SKILLS = ['Frontend', 'Backend', 'Full-Stack', 'AI/ML', 'Design', 'Blockchain', 'DevOps', 'Product', 'Data Science', 'Mobile', 'Other'];

export default function RegisterWizard({ hackathon, user, onClose, onSuccess }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // Step 1: About You
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [roleType, setRoleType] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [skills, setSkills] = useState([]);
  const [category, setCategory] = useState('student');

  // Step 2: Project Info
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [track, setTrack] = useState('');
  const [techStack, setTechStack] = useState('');
  const [whyJoin, setWhyJoin] = useState('');
  const [priorExp, setPriorExp] = useState(false);

  // Step 3: Team
  const [mode, setMode] = useState('solo');
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  // Step 4: Consent
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeConduct, setAgreeConduct] = useState(false);
  const [agreeUpdates, setAgreeUpdates] = useState(true);

  const minTeam = hackathon.team_size_min || 1;
  const maxTeam = hackathon.team_size_max || 5;
  const themes = hackathon.themes || [];

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!fullName.trim()) e.fullName = 'Required';
      if (!email.trim() || !email.includes('@')) e.email = 'Valid email required';
      if (!roleType) e.roleType = 'Select a role';
    }
    if (s === 1) {
      if (!projectTitle.trim()) e.projectTitle = 'Required';
      if (!projectSummary.trim()) e.projectSummary = 'Required';
    }
    if (s === 2) {
      if (mode === 'team' && !teamName.trim()) e.teamName = 'Team name required';
      if (mode === 'team' && (members.length + 1) < minTeam) e.members = `Need at least ${minTeam} total members`;
    }
    if (s === 3) {
      if (!agreeTerms) e.terms = 'Required';
      if (!agreeConduct) e.conduct = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep(s => Math.min(s + 1, 3)); };
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const addMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) { showToast('Name and email required'); return; }
    if (!newMemberEmail.includes('@')) { showToast('Invalid email'); return; }
    if (members.some(m => m.email === newMemberEmail)) { showToast('Duplicate email'); return; }
    if ((members.length + 1) >= maxTeam) { showToast(`Max ${maxTeam} members total`); return; }
    setMembers(prev => [...prev, { name: newMemberName, email: newMemberEmail, role: newMemberRole || 'Member', status: 'pending' }]);
    setNewMemberName(''); setNewMemberEmail(''); setNewMemberRole('');
  };

  const removeMember = (i) => setMembers(prev => prev.filter((_, idx) => idx !== i));

  const toggleSkill = (s) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setSubmitting(true);
    try {
      const regData = {
        hackathon_id: hackathon.id,
        user_id: user.id,
        email,
        lead_name: fullName,
        phone,
        college,
        role_type: roleType,
        city,
        country,
        github_url: githubUrl || null,
        linkedin_url: linkedinUrl || null,
        mode,
        team_name: mode === 'team' ? teamName : `${fullName} (Solo)`,
        project_title: projectTitle,
        project_summary: projectSummary,
        track: track || null,
        tech_stack: techStack || null,
        why_join: whyJoin || null,
        reg_status: 'registered',
        members: [
          { name: fullName, email, role: 'Lead', skills, category, status: 'verified' },
          ...members
        ]
      };
      const { error } = await insforge.database.from('registrations').insert([regData]);
      if (error) {
        if (error.message?.includes('duplicate') || error.code === '23505') {
          showToast('You are already registered for this hackathon');
        } else { throw error; }
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 2000);
    } catch (err) {
      console.error('Registration failed:', err);
      showToast('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const Err = ({ field }) => errors[field] ? <p className="text-[12px] text-red-400 mt-1.5 ml-1">{errors[field]}</p> : null;

  const Checkbox = ({ checked, onChange, children, error }) => (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="w-5 h-5 rounded-md border border-white/20 group-hover:border-[#FF8C32] bg-[#0A0A0A] flex justify-center items-center relative overflow-hidden shrink-0 mt-0.5">
        <input type="checkbox" checked={checked} onChange={onChange} className="absolute opacity-0 w-full h-full cursor-pointer peer" />
        <div className="absolute inset-0 bg-[#FF8C32] opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
          <Check size={12} className="text-black stroke-[3]" />
        </div>
      </div>
      <div>
        <span className="text-[13px] text-[#999] leading-relaxed group-hover:text-[#ccc] transition-colors">{children}</span>
        {error && <p className="text-[12px] text-red-400 mt-1">{error}</p>}
      </div>
    </label>
  );

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80 backdrop-blur-md">
        <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-lg rounded-3xl p-12 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 border border-green-500/20">
            <CheckCircle size={36} className="text-green-500" />
          </div>
          <h3 className="text-[28px] font-bold text-white mb-3">You're In!</h3>
          <p className="text-[15px] text-[#888] max-w-sm mx-auto">
            Registered for <span className="text-white font-medium">{hackathon.name}</span>. Check your dashboard for status updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80 backdrop-blur-md p-0 sm:p-4" onClick={onClose}>
      <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        
        {/* Toast */}
        {toast && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-[13px] font-medium flex items-center gap-2 shadow-xl border ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
            <AlertCircle size={14} /> {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-white/5 flex items-start justify-between shrink-0">
          <div>
            <div className="text-[11px] font-bold tracking-[0.12em] text-[#FF8C32] uppercase mb-1.5">Register</div>
            <h3 className="text-[22px] font-bold text-white tracking-tight">{hackathon.name}</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#111] hover:bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-[#888] hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-8 py-4 border-b border-white/5 flex gap-2 shrink-0 overflow-x-auto">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => { if (i < step) setStep(i); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all whitespace-nowrap ${
                i === step ? 'bg-[#FF8C32]/10 text-[#FF8C32] border border-[#FF8C32]/20' :
                i < step ? 'bg-green-500/10 text-green-400 border border-green-500/20 cursor-pointer' :
                'bg-white/5 text-[#666] border border-white/5'
              }`}>
              {i < step ? <Check size={12} /> : <span className="w-4 text-center">{i + 1}</span>}
              <span className="hidden sm:inline">{s}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 bg-[#050505]">
          {step === 0 && (
            <div className="space-y-8">
              <section>
                <h4 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2"><ShieldCheck size={15} className="text-[#888]"/> Personal Info</h4>
                <div className="space-y-3">
                  <div><input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name *" className={IC} /><Err field="fullName" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email *" className={IC} /><Err field="email" /></div>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone (optional)" className={IC} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={college} onChange={e => setCollege(e.target.value)} placeholder="College / Company" className={IC} />
                    <div>
                      <select value={roleType} onChange={e => setRoleType(e.target.value)} className={SEL}>
                        <option value="">Role *</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <Err field="roleType" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={city} onChange={e => setCity(e.target.value)} placeholder="City" className={IC} />
                    <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" className={IC} />
                  </div>
                </div>
              </section>
              <section>
                <h4 className="text-[14px] font-bold text-white mb-4">Links & Skills</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="GitHub URL" className={IC} />
                    <input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="LinkedIn URL" className={IC} />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-[#888] mb-2 uppercase tracking-wider">Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {SKILLS.map(s => (
                        <button key={s} onClick={() => toggleSkill(s)} className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${skills.includes(s) ? 'bg-[#FF8C32]/10 text-[#FF8C32] border-[#FF8C32]/30' : 'bg-white/5 text-[#888] border-white/10 hover:border-white/20'}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-[#888] mb-2 uppercase tracking-wider">Participating As</div>
                    <div className="flex gap-2">
                      {['student', 'professional', 'open'].map(c => (
                        <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-xl text-[13px] font-medium border capitalize transition-all ${category === c ? 'bg-[#FF8C32]/10 text-[#FF8C32] border-[#FF8C32]/30' : 'bg-white/5 text-[#888] border-white/10'}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <section>
                <h4 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2"><Target size={15} className="text-[#888]"/> Project Details</h4>
                <div className="space-y-3">
                  <div><input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="Project Idea Title *" className={IC} /><Err field="projectTitle" /></div>
                  <div><textarea value={projectSummary} onChange={e => setProjectSummary(e.target.value)} placeholder="Short Project Summary *" rows={3} className={IC + " resize-none"} /><Err field="projectSummary" /></div>
                  {themes.length > 0 && (
                    <div>
                      <div className="text-[12px] font-bold text-[#888] mb-2 uppercase tracking-wider">Track / Theme</div>
                      <div className="flex flex-wrap gap-2">
                        {themes.map(t => (
                          <button key={t} onClick={() => setTrack(t)} className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${track === t ? 'bg-[#FF8C32]/10 text-[#FF8C32] border-[#FF8C32]/30' : 'bg-white/5 text-[#888] border-white/10'}`}>{t}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <input value={techStack} onChange={e => setTechStack(e.target.value)} placeholder="Tech Stack (e.g. React, Node, PostgreSQL)" className={IC} />
                  <textarea value={whyJoin} onChange={e => setWhyJoin(e.target.value)} placeholder="Why do you want to join this hackathon?" rows={2} className={IC + " resize-none"} />
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={priorExp} onChange={e => setPriorExp(e.target.checked)} className="accent-[#FF8C32]" />
                    <span className="text-[13px] text-[#999]">I have prior hackathon experience</span>
                  </label>
                </div>
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <section>
                <h4 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2"><Users size={15} className="text-[#888]"/> Participation Mode</h4>
                <div className="flex gap-3 mb-6">
                  {['solo', 'team'].map(m => (
                    <button key={m} onClick={() => setMode(m)} className={`flex-1 py-3 rounded-xl text-[14px] font-bold border capitalize transition-all ${mode === m ? 'bg-[#FF8C32]/10 text-[#FF8C32] border-[#FF8C32]/30' : 'bg-white/5 text-[#888] border-white/10'}`}>{m}</button>
                  ))}
                </div>
                {mode === 'team' && (
                  <div className="space-y-4">
                    <div><input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Team Name *" className={IC} /><Err field="teamName" /></div>
                    <div className="text-[12px] text-[#666] font-medium">Team size: {minTeam}–{maxTeam} members (including you). Current: {members.length + 1}</div>
                    {/* Current members */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 bg-[#111] p-3 rounded-xl border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-[#FF8C32]/10 flex items-center justify-center text-[#FF8C32] text-[12px] font-bold">You</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-white truncate">{fullName || 'You'}</div>
                          <div className="text-[11px] text-[#888] truncate">{email}</div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Lead</span>
                      </div>
                      {members.map((m, i) => (
                        <div key={i} className="flex items-center gap-3 bg-[#111] p-3 rounded-xl border border-white/5">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#888] text-[12px] font-bold">{i + 2}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-white truncate">{m.name}</div>
                            <div className="text-[11px] text-[#888] truncate">{m.email}</div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Pending</span>
                          <button onClick={() => removeMember(i)} className="text-[#555] hover:text-red-400 transition-colors"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                    <Err field="members" />
                    {/* Add member form */}
                    {(members.length + 1) < maxTeam && (
                      <div className="bg-[#0A0A0A] border border-dashed border-white/10 rounded-xl p-4 space-y-3">
                        <div className="text-[12px] font-bold text-[#888] uppercase tracking-wider">Add Team Member</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input value={newMemberName} onChange={e => setNewMemberName(e.target.value)} placeholder="Full Name" className={IC} />
                          <input value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} placeholder="Email Address" className={IC} />
                        </div>
                        <input value={newMemberRole} onChange={e => setNewMemberRole(e.target.value)} placeholder="Role in team (optional)" className={IC} />
                        <button onClick={addMember} className="text-[13px] font-medium text-[#FF8C32] hover:text-white transition-colors">+ Add Member</button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <section>
                <h4 className="text-[14px] font-bold text-white mb-5">Review & Confirm</h4>
                <div className="space-y-4">
                  <div className="bg-[#111] border border-white/5 rounded-xl p-5 space-y-3">
                    <Row label="Name" value={fullName} />
                    <Row label="Email" value={email} />
                    <Row label="Role" value={roleType} />
                    <Row label="College" value={college || '—'} />
                    <Row label="City" value={[city, country].filter(Boolean).join(', ') || '—'} />
                  </div>
                  <div className="bg-[#111] border border-white/5 rounded-xl p-5 space-y-3">
                    <Row label="Project" value={projectTitle} />
                    <Row label="Track" value={track || '—'} />
                    <Row label="Mode" value={mode} />
                    {mode === 'team' && <Row label="Team" value={`${teamName} (${members.length + 1} members)`} />}
                  </div>
                </div>
              </section>
              <section className="space-y-4 pt-4 border-t border-white/5">
                <Checkbox checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} error={errors.terms}>
                  I agree to the Terms & Conditions *
                </Checkbox>
                <Checkbox checked={agreeConduct} onChange={e => setAgreeConduct(e.target.checked)} error={errors.conduct}>
                  I agree to the Code of Conduct *
                </Checkbox>
                <Checkbox checked={agreeUpdates} onChange={e => setAgreeUpdates(e.target.checked)}>
                  Send me event updates (optional)
                </Checkbox>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-white/5 bg-[#0A0A0A] flex items-center justify-between shrink-0 gap-3">
          {step > 0 ? (
            <button onClick={prev} className="flex items-center gap-1.5 text-[13px] font-medium text-[#888] hover:text-white transition-colors">
              <ChevronLeft size={16} /> Back
            </button>
          ) : <div />}
          {step < 3 ? (
            <button onClick={next} className="bg-[#FF8C32] hover:bg-[#FF6B00] text-black rounded-xl px-8 py-3 text-[14px] font-bold transition-all active:scale-[0.98] flex items-center gap-1.5">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="bg-[#FF8C32] hover:bg-[#FF6B00] disabled:opacity-50 text-black rounded-xl px-8 py-3 text-[14px] font-bold transition-all active:scale-[0.98] flex items-center gap-2">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Registering...</> : 'Complete Registration'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] font-bold text-[#666] uppercase tracking-wider">{label}</span>
      <span className="text-[13px] font-medium text-white capitalize">{value}</span>
    </div>
  );
}
