import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useScroll, useTransform, useMotionTemplate, useInView, animate, useSpring } from 'framer-motion';
import WebGLBackground from './WebGLBackground';
import DashboardMockup from './DashboardMockup';
import PricingSection from './PricingSection';
import { insforge } from './lib/insforge';
import { useAuth } from './AuthContext';

gsap.registerPlugin(ScrollTrigger);

gsap.registerPlugin(ScrollTrigger);

// Metric Counter Component
function CounterText({ value, suffix = '', prefix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (inView) {
      const controls = animate(0, value, {
        duration: 2.4, /* Extended duration allows the easing to create a natural settle */
        ease: [0.16, 1, 0.3, 1], /* Custom extreme ease-out for fast start and very slow finish */
        onUpdate: (v) => setDisplayValue(Math.round(v)),
      });
      return controls.stop;
    }
  }, [inView, value]);

  return <span ref={ref}>{prefix}{displayValue}{suffix}</span>;
}

// Vertical Scrolling Story Section
function ProcessStepsWidget() {
  return (
    <section id="how" className="py-24 sm:py-32 bg-[#050505] border-t border-white/[0.02]">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
        
        {/* Header */}
        <div className="mb-20 max-w-2xl">
          <h2 className="text-[12px] font-bold text-[#FF8C32] uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
             <span className="w-8 h-px bg-[#FF8C32]/50" /> Process
          </h2>
          <h3 className="text-[40px] sm:text-[56px] font-extrabold text-white leading-[1.05] tracking-tight">
             Four steps from<br/>submission to verdict.
          </h3>
        </div>

        {/* 1-2-1 Layout Grid */}
        <div className="flex flex-col gap-6">
          
          {/* Step 1: Submit (Full Width) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden group hover:border-white/10 transition-colors"
          >
             {/* Content Left */}
             <div className="w-full md:w-5/12 relative z-10">
                <div className="text-[64px] md:text-[80px] font-extrabold text-white/5 leading-none mb-6 group-hover:text-[#FF8C32]/10 transition-colors">01</div>
                <h4 className="text-[28px] md:text-[36px] font-bold text-white mb-4">Submit</h4>
                <p className="text-[16px] text-[#888] leading-relaxed max-w-md">
                   Teams submit their GitHub repo, presentation, and demo recording via a simple form or API.
                </p>
             </div>
             {/* Visual Right */}
             <div className="w-full md:w-7/12 h-[240px] md:h-[320px] bg-[#111] rounded-[24px] border border-white/[0.02] relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C32]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex flex-col sm:flex-row items-center gap-6 z-10 w-full max-w-md px-6">
                   <div className="flex flex-col gap-3 w-full sm:w-auto">
                      <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-sm shadow-xl">
                         <Icon icon="solar:branch-linear" width="20" className="text-[#888]" />
                         <span className="text-[13px] font-medium text-white">GitHub Repo</span>
                      </div>
                      <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-sm shadow-xl">
                         <Icon icon="solar:document-text-linear" width="20" className="text-[#888]" />
                         <span className="text-[13px] font-medium text-white">Pitch Deck</span>
                      </div>
                      <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-sm shadow-xl">
                         <Icon icon="solar:video-frame-linear" width="20" className="text-[#888]" />
                         <span className="text-[13px] font-medium text-white">Video Demo</span>
                      </div>
                   </div>
                   <div className="hidden sm:block w-16 h-[2px] bg-gradient-to-r from-white/10 to-[#FF8C32]/40" />
                   <div className="w-[2px] h-10 sm:hidden bg-gradient-to-b from-white/10 to-[#FF8C32]/40" />
                   <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-[#FF8C32] to-[#FB9A57] flex items-center justify-center shadow-[0_0_30px_rgba(255,140,50,0.3)]">
                      <Icon icon="solar:database-bold" width="28" className="text-white" />
                   </div>
                </div>
             </div>
          </motion.div>

          {/* Row 2: Analyze & Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Step 2: Analyze */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
               className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-6 sm:p-8 md:p-10 flex flex-col group hover:border-white/10 transition-colors"
            >
               {/* Visual Top */}
               <div className="w-full h-[180px] sm:h-[200px] bg-[#111] rounded-[24px] border border-white/[0.02] mb-8 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {/* Enhanced Analyze Visual */}
                  <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-6 w-full max-w-[240px] px-2 sm:px-4">
                     {/* Left: Stack of inputs */}
                     <div className="flex flex-col gap-2 relative z-10 shrink-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center shadow-lg transform -translate-y-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500 backdrop-blur-sm">
                           <Icon icon="solar:branch-linear" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#888]" />
                        </div>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center shadow-lg relative z-10 transform group-hover:translate-x-2 transition-transform duration-500 delay-75 backdrop-blur-sm">
                           <Icon icon="solar:video-frame-linear" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#888]" />
                        </div>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-500 delay-150 backdrop-blur-sm">
                           <Icon icon="solar:document-text-linear" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#888]" />
                        </div>
                     </div>

                     {/* Middle: Connection */}
                     <div className="flex flex-col justify-center gap-3 sm:gap-[18px] flex-1">
                        <div className="h-[2px] bg-gradient-to-r from-white/10 to-purple-500/40 w-full rounded-full" />
                        <div className="h-[2px] bg-gradient-to-r from-white/10 to-purple-500/40 w-full rounded-full" />
                        <div className="h-[2px] bg-gradient-to-r from-white/10 to-purple-500/40 w-full rounded-full" />
                     </div>

                     {/* Right: AI Core */}
                     <div className="relative w-16 h-16 sm:w-[88px] sm:h-[88px] shrink-0 border border-white/10 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-[1.5s] ease-in-out" />
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.8)] translate-y-[-100%] group-hover:translate-y-[88px] transition-transform duration-[1.5s] ease-in-out" />
                        
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center z-10 relative">
                           <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-pulse opacity-50" />
                           <Icon icon="solar:cpu-bolt-bold" className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* Content Bottom */}
               <div className="flex-1 flex flex-col justify-end relative z-20">
                  <div className="flex items-end gap-3 sm:gap-4 mb-3 sm:mb-4">
                     <div className="text-[40px] sm:text-[48px] font-extrabold text-white/5 leading-none group-hover:text-purple-500/10 transition-colors">02</div>
                     <h4 className="text-[24px] sm:text-[28px] font-bold text-white mb-1">Analyze</h4>
                  </div>
                  <p className="text-[14px] sm:text-[15px] text-[#888] leading-relaxed">
                     Hackloom's AI reads the code, parses the presentation, and watches the demo automatically.
                  </p>
               </div>
            </motion.div>

            {/* Step 3: Score */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
               className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-6 sm:p-8 md:p-10 flex flex-col group hover:border-white/10 transition-colors"
            >
               {/* Visual Top */}
               <div className="w-full h-[180px] sm:h-[200px] bg-[#111] rounded-[24px] border border-white/[0.02] mb-8 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {/* Enhanced Score Visual */}
                  <div className="relative z-10 w-[90%] max-w-[220px] bg-[#161616] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md transform group-hover:-translate-y-2 transition-transform duration-500">
                     <div className="flex items-center justify-between mb-3 sm:mb-4 border-b border-white/5 pb-3 sm:pb-4">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                           <Icon icon="solar:medal-star-bold" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-blue-400" />
                           <span className="text-[11px] sm:text-[12px] font-bold text-white uppercase tracking-widest">Score</span>
                        </div>
                        <div className="text-[20px] sm:text-[24px] font-black text-white leading-none">92<span className="text-[11px] sm:text-[13px] text-[#888] font-bold">/100</span></div>
                     </div>
                     <div className="space-y-3">
                        <div>
                           <div className="flex justify-between text-[10px] sm:text-[11px] mb-1.5 font-bold">
                              <span className="text-[#888] uppercase tracking-wider">Innovation</span>
                              <span className="text-white">95%</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full w-0 group-hover:w-[95%] transition-all duration-1000 delay-100 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                           </div>
                        </div>
                        <div>
                           <div className="flex justify-between text-[10px] sm:text-[11px] mb-1.5 font-bold">
                              <span className="text-[#888] uppercase tracking-wider">Execution</span>
                              <span className="text-white">88%</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full w-0 group-hover:w-[88%] transition-all duration-1000 delay-200" />
                           </div>
                        </div>
                        <div>
                           <div className="flex justify-between text-[10px] sm:text-[11px] mb-1.5 font-bold">
                              <span className="text-[#888] uppercase tracking-wider">Impact</span>
                              <span className="text-white">90%</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-200 rounded-full w-0 group-hover:w-[90%] transition-all duration-1000 delay-300" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Content Bottom */}
               <div className="flex-1 flex flex-col justify-end relative z-20">
                  <div className="flex items-end gap-3 sm:gap-4 mb-3 sm:mb-4">
                     <div className="text-[40px] sm:text-[48px] font-extrabold text-white/5 leading-none group-hover:text-blue-500/10 transition-colors">03</div>
                     <h4 className="text-[24px] sm:text-[28px] font-bold text-white mb-1">Score</h4>
                  </div>
                  <p className="text-[14px] sm:text-[15px] text-[#888] leading-relaxed">
                     Each submission is scored across criteria — innovation, execution, presentation, and impact — with detailed feedback.
                  </p>
               </div>
            </motion.div>
          </div>

          {/* Step 4: Results (Full Width Reversed) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row-reverse gap-12 items-center relative overflow-hidden group hover:border-white/10 transition-colors"
          >
             {/* Content Right */}
             <div className="w-full md:w-5/12 relative z-10 md:pl-8">
                <div className="text-[64px] md:text-[80px] font-extrabold text-white/5 leading-none mb-6 group-hover:text-emerald-500/10 transition-colors">04</div>
                <h4 className="text-[28px] md:text-[36px] font-bold text-white mb-4">Results</h4>
                <p className="text-[16px] text-[#888] leading-relaxed max-w-md">
                   Organizers receive a full leaderboard, per-team score breakdown, and exportable PDF reports instantly.
                </p>
             </div>
             {/* Visual Left */}
             <div className="w-full md:w-7/12 h-[240px] md:h-[320px] bg-[#111] rounded-[24px] border border-white/[0.02] relative overflow-hidden flex flex-col items-center justify-center p-8">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Leaderboard Mockup */}
                <div className="w-full max-w-sm space-y-3 z-10 relative">
                   <div className="flex items-center gap-4 bg-white/[0.04] border border-white/10 rounded-2xl p-4 shadow-lg scale-100 group-hover:scale-105 transition-transform duration-500 bg-gradient-to-r hover:from-emerald-500/10 hover:to-transparent">
                      <div className="text-[20px]">🥇</div>
                      <div className="flex-1">
                         <div className="h-2 w-24 bg-white/80 rounded-full mb-2" />
                         <div className="h-1.5 w-16 bg-white/20 rounded-full" />
                      </div>
                      <div className="text-[16px] font-bold text-emerald-400">98/100</div>
                   </div>
                   <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4 scale-95 opacity-80 group-hover:opacity-100 transition-all duration-500 delay-75">
                      <div className="text-[20px]">🥈</div>
                      <div className="flex-1">
                         <div className="h-2 w-20 bg-white/60 rounded-full mb-2" />
                         <div className="h-1.5 w-14 bg-white/20 rounded-full" />
                      </div>
                      <div className="text-[16px] font-bold text-white">92/100</div>
                   </div>
                   <div className="flex items-center gap-4 bg-white/[0.01] border border-white/5 rounded-2xl p-4 scale-90 opacity-50 group-hover:opacity-80 transition-all duration-500 delay-150">
                      <div className="text-[20px]">🥉</div>
                      <div className="flex-1">
                         <div className="h-2 w-16 bg-white/40 rounded-full mb-2" />
                         <div className="h-1.5 w-12 bg-white/20 rounded-full" />
                      </div>
                      <div className="text-[16px] font-bold text-white">88/100</div>
                   </div>
                </div>
             </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// Parallax scrolling text section — pure CSS, zero scroll listeners
function ScrollTextParallax() {
  return (
    <section className="parallax-text-section">
      <div className="parallax-line">
        <div className="marquee-track marquee-left" style={{ animationDuration: '22s', gap: '40px' }}>
          {[...Array(4)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-outline">AI-Powered</span>
              <span className="text-highlight-ai">Judging</span>
              <span className="text-outline">•</span>
              <span className="text-filled">Scale to</span>
              <span className="text-highlight-speed">1000+</span>
              <span className="text-filled">Submissions</span>
              <span className="text-outline">•</span>
              <span className="text-outline">Automated</span>
              <span className="text-highlight-ai">Scoring</span>
              <span className="text-outline">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="parallax-line">
        <div className="marquee-track marquee-right" style={{ animationDuration: '28s', gap: '40px' }}>
          {[...Array(4)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-filled">Zero Bias</span>
              <span className="text-highlight-trust">Evaluation</span>
              <span className="text-outline">•</span>
              <span className="text-filled">Instant</span>
              <span className="text-highlight-speed">Rankings</span>
              <span className="text-outline">•</span>
              <span className="text-outline">Objective</span>
              <span className="text-highlight-trust">Fairness</span>
              <span className="text-outline">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="parallax-line">
        <div className="marquee-track marquee-left" style={{ animationDuration: '25s', gap: '40px' }}>
          {[...Array(4)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-outline">Real-Time</span>
              <span className="text-highlight-speed">Feedback</span>
              <span className="text-outline">•</span>
              <span className="text-outline">Empower</span>
              <span className="text-filled">Organizers</span>
              <span className="text-outline">•</span>
              <span className="text-highlight-ai">AI-Powered</span>
              <span className="text-outline">Judging</span>
              <span className="text-outline">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

function getDaysLeft(deadlineStr) {
  if (!deadlineStr) return 'TBA';
  const diff = new Date(deadlineStr) - new Date();
  if (diff < 0) return 'Ended';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${days} day${days !== 1 ? 's' : ''} left`;
}

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ActiveHackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const { data: hackathonsData, error } = await insforge.database
          .from('hackathons')
          .select('*')
          .eq('status', 'published')
          .limit(6);
          
        if (!error && hackathonsData) {
          // Enrich with participant count and prize pools
          const enriched = await Promise.all(hackathonsData.map(async (h) => {
            const { data: regs } = await insforge.database
              .from('registrations')
              .select('id', { count: 'exact' })
              .eq('hackathon_id', h.id);
            
            let totalPrize = 0;
            if (h.prizes && Array.isArray(h.prizes)) {
              totalPrize = h.prizes.reduce((sum, p) => {
                const match = p.amount?.toString().match(/[\d,]+/);
                return sum + (match ? parseInt(match[0].replace(/,/g, '')) : 0);
              }, 0);
            }

            return {
              ...h,
              participantCount: regs?.length || 0,
              totalPrizeValue: totalPrize
            };
          }));
          setHackathons(enriched);
        }
      } catch (err) {
        console.error('Error fetching hackathons:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  if (loading || hackathons.length === 0) return null;

  return (
    <section className="py-24 sm:py-32 bg-[#050505] border-t border-white/[0.02]" id="hackathons">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 sm:mb-20">
          <div className="max-w-2xl">
            <h2 className="text-[12px] font-bold text-[#FF8C32] uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
              <span className="w-8 h-px bg-[#FF8C32]/50" /> Live Events
            </h2>
            <h3 className="text-[40px] sm:text-[56px] font-extrabold text-white leading-[1.05] tracking-tight">
              Active Hackathons
            </h3>
          </div>
          <p className="text-[16px] sm:text-[18px] text-[#888] font-light max-w-[400px] leading-relaxed pb-2">
            Join leading hackathons powered by our multi-modal AI judge engine. Build, ship, and get evaluated instantly.
          </p>
        </div>

        {/* Masonry / Featured Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {hackathons.map((h, i) => {
            const isEnded = h.submission_deadline && new Date(h.submission_deadline) < new Date();
            const isFeatured = i === 0 || h.is_featured; // Make the first one large if featured
            const spanClass = isFeatured ? 'md:col-span-2 lg:col-span-2' : 'col-span-1';

            // Generate a deterministic gradient class based on ID for missing covers
            const gradients = [
              'from-orange-500/20 to-purple-500/20',
              'from-blue-500/20 to-cyan-500/20',
              'from-emerald-500/20 to-teal-500/20',
              'from-rose-500/20 to-pink-500/20'
            ];
            const gradClass = gradients[(h.id || 0) % gradients.length];

            return (
              <Link to={`/hackathon/${h.id}`} key={h.id} style={{ textDecoration: 'none' }} className={`group relative flex flex-col bg-[#0A0A0A] rounded-[32px] border border-white/5 hover:border-white/15 transition-all duration-500 overflow-hidden outline-none focus-visible:ring-4 ring-[#FF8C32]/20 ${spanClass}`}>
                
                {/* Image / Cover Area */}
                <div className={`relative w-full ${isFeatured ? 'h-[240px] sm:h-[320px]' : 'h-[180px]'} bg-[#111] overflow-hidden`}>
                  {h.cover_image_url ? (
                    <img src={h.cover_image_url} alt={h.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradClass} flex items-center justify-center`}>
                      <Icon icon="solar:code-square-bold-duotone" width={isFeatured ? "64" : "48"} className="text-white/20" />
                    </div>
                  )}
                  {/* Subtle vignette over image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
                  
                  {/* Status Pill */}
                  <div className="absolute top-5 right-5 sm:top-6 sm:right-6">
                    <div className={`px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 backdrop-blur-md border ${
                      isEnded 
                        ? 'bg-black/40 border-white/10 text-[#888]' 
                        : 'bg-[#FF8C32]/20 border-[#FF8C32]/30 text-[#FF8C32] shadow-[0_0_20px_rgba(255,140,50,0.2)]'
                    }`}>
                      {!isEnded && <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C32] animate-pulse" />}
                      {isEnded ? 'Closed' : getDaysLeft(h.submission_deadline)}
                    </div>
                  </div>

                  {/* Type Badge Floating */}
                  <div className="absolute bottom-5 left-6 sm:bottom-6 sm:left-8">
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                      <Icon icon="solar:global-bold" width="14" className="text-white/70" />
                      <span className="text-[12px] font-semibold text-white capitalize">{h.type || 'Online'}</span>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex flex-col flex-1 p-6 sm:p-8 pt-6">
                  <h3 className={`font-bold text-white leading-[1.15] mb-3 group-hover:text-[#FF8C32] transition-colors line-clamp-2 ${isFeatured ? 'text-[28px] sm:text-[36px]' : 'text-[22px]'}`}>
                    {h.name}
                  </h3>
                  
                  <p className={`text-[#888] font-light leading-relaxed mb-8 ${isFeatured ? 'text-[16px] sm:text-[18px] line-clamp-2 max-w-2xl' : 'text-[14px] line-clamp-2'}`}>
                    {h.tagline || (h.registration_opens && h.submission_deadline ? `${formatShortDate(h.registration_opens)} to ${formatShortDate(h.submission_deadline)}` : 'Dates TBA')}
                  </p>

                  <div className="mt-auto pt-6 border-t border-white/[0.05] grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] font-bold text-[#666] uppercase tracking-[0.15em] mb-1.5">Prize Pool</div>
                      <div className={`font-bold text-white tracking-tight ${isFeatured ? 'text-[24px]' : 'text-[20px]'}`}>
                        {h.totalPrizeValue ? `$${h.totalPrizeValue.toLocaleString()}` : 'TBA'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[#666] uppercase tracking-[0.15em] mb-1.5">Builders</div>
                      <div className={`font-bold text-white tracking-tight ${isFeatured ? 'text-[24px]' : 'text-[20px]'}`}>
                        {h.participantCount}
                      </div>
                    </div>
                  </div>
                </div>

              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);

  const closeMobileMenu = () => {
    setMenuClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setMenuClosing(false);
    }, 380);
  };
  const { user } = useAuth();
  const heroRef = useRef(null);
  const productRef = useRef(null);
  const trustRef = useRef(null);
  const bentoRef = useRef(null);
  const metricsRef = useRef(null);
  const ctaRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: productRef,
    offset: ["start end", "center center"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [120, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } });
      heroTl
        .fromTo('.hero .badge',         { y: 14 }, { y: 0 }, 0.05)
        .fromTo('.hero .hero-heading',  { y: 22 }, { y: 0 }, 0.18)
        .fromTo('.hero .hero-sub',      { y: 14 }, { y: 0 }, 0.30)
        .fromTo('.hero .hero-buttons',  { y: 14 }, { y: 0 }, 0.42);

      gsap.from('.trust-logo', {
        opacity: 0,
        y: 15,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: trustRef.current,
          start: 'top 85%',
        },
      });

      gsap.from('.bento-tile', {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: bentoRef.current,
          start: 'top 75%',
        },
      });

      gsap.from('.metric-card', {
        opacity: 0,
        y: 30,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: metricsRef.current,
          start: 'top 80%',
        },
      });

      gsap.from(ctaRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 85%',
        },
      });
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      ctx.revert();
    };
  }, []);

  return (
    <>
      <WebGLBackground />

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <div className="navbar-logo">
            {/* Hackloom SVG Logo */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Hackloom">
              <defs>
                <linearGradient id="hlGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#FB9A57" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#hlGrad)" opacity="0.15"/>
              <path d="M8 7h3v7.5h10V7h3v18h-3v-7.5H11V25H8V7z" fill="url(#hlGrad)" stroke="url(#hlGrad)" strokeWidth="0.5"/>
              <line x1="11" y1="12" x2="21" y2="12" stroke="#FB9A57" strokeWidth="1.2" strokeDasharray="2 1.5" opacity="0.7"/>
              <line x1="11" y1="16.5" x2="21" y2="16.5" stroke="#F97316" strokeWidth="1.2" strokeDasharray="2 1.5" opacity="0.7"/>
              <line x1="11" y1="21" x2="21" y2="21" stroke="#FB9A57" strokeWidth="1.2" strokeDasharray="2 1.5" opacity="0.7"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '-0.03em' }}>Hackloom</span>
          </div>
          <div className="navbar-links hidden md:flex">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how" className="nav-link">How It Works</a>
            <a href="#hackathons" className="nav-link">Case Studies</a>
            <a href="#metrics" className="nav-link">Contact</a>
          </div>
          <div className="navbar-actions hidden md:flex">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                Dashboard <Icon icon="solar:alt-arrow-right-linear" width="14" />
              </Link>
            ) : (
              <a
                href="https://calendly.com/khnnabubakar786/new-meeting"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-cta btn-sm"
                style={{ textDecoration: 'none', background: 'linear-gradient(135deg,#F97316,#FB9A57)', border: 'none' }}
              >
                Book a Demo →
              </a>
            )}
          </div>
          
          <button className="md:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(true)}>
            <Icon icon="solar:hamburger-menu-linear" width="24" />
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className={`mobile-menu-overlay ${menuClosing ? 'closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeMobileMenu(); }}
        >
            <div className={`mobile-menu-drawer ${menuClosing ? 'closing' : ''}`}>
              <div className="mobile-menu-header">
                <div className="navbar-logo" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Hackloom</div>
                <button className="mobile-menu-close" onClick={closeMobileMenu}>
                <Icon icon="solar:close-square-linear" width="26" />
              </button>
            </div>

              <nav className="mobile-menu-links">
                {[
                  { href: '#features', label: 'Features', num: '01' },
                  { href: '#how', label: 'How It Works', num: '02' },
                  { href: '#hackathons', label: 'Case Studies', num: '03' },
                  { href: '#pricing', label: 'Pricing', num: '04' },
                ].map((link, i) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="mobile-menu-link"
                    style={{ animationDelay: `${i * 60 + 120}ms` }}
                  >
                    <span className="mobile-menu-num">{link.num}</span>
                    <span className="mobile-menu-label">{link.label}</span>
                    <Icon icon="solar:arrow-right-up-linear" width="18" className="mobile-menu-arrow" />
                  </a>
                ))}
              </nav>

              <div className="mobile-menu-footer">
                {user ? (
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="mobile-cta-btn"
                    style={{ textDecoration: 'none', animationDelay: '360ms' }}
                  >
                    Go to Dashboard <Icon icon="solar:alt-arrow-right-linear" width="18" />
                  </Link>
                ) : (
                  <a
                    href="https://calendly.com/khnnabubakar786/new-meeting"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-cta-btn"
                    style={{ animationDelay: '360ms' }}
                  >
                    Book a Demo <Icon icon="solar:calendar-mark-linear" width="18" />
                  </a>
                )}
              </div>
            </div>
        </div>
      )}

      <section className="relative pt-[120px] pb-0 lg:pt-48 lg:pb-32 overflow-hidden bg-[#050505] hero" ref={heroRef}>
        {/* Glows */}
        <div className="absolute top-0 left-0 w-[150%] sm:w-full h-[500px] bg-[#FF8C32]/[0.05] blur-[100px] pointer-events-none rounded-full transform -translate-y-1/2 -translate-x-1/4 sm:translate-x-0" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[#FF8C32]/[0.03] blur-[120px] pointer-events-none rounded-full translate-x-1/4 hidden lg:block" />

        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Text & Actions */}
            <div className="lg:col-span-6 flex flex-col items-start text-left hero-content w-full">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#ccc] text-[11px] font-bold uppercase tracking-widest mb-6 hero-badge">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C32] shadow-[0_0_8px_rgba(255,140,50,0.8)]" /> 
                Judging Operations
              </div>
              
              <h1 className="text-[42px] leading-[1.05] sm:text-[56px] lg:text-[72px] font-medium text-white tracking-[-0.04em] mb-5 hero-heading w-full max-w-[440px] lg:max-w-none">
                Review and organize hackathons <span className="text-[#FF8C32]">faster with AI.</span>
              </h1>
              
              <p className="text-[16px] sm:text-[18px] text-[#A1A1AA] leading-[1.5] max-w-[420px] mb-8 hero-sub">
                Automate submission screening, speed up manual reviews, and generate final rankings instantly.
              </p>
              
              <div className="flex flex-col gap-5 w-full sm:w-auto hero-buttons">
                {user ? (
                  <Link 
                    to="/dashboard" 
                    className="w-full sm:w-auto flex items-center justify-between sm:justify-center gap-3 bg-white text-black h-[56px] px-6 sm:px-8 rounded-full font-semibold text-[15px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    style={{ textDecoration: 'none' }}
                  >
                    <span>Open Dashboard</span>
                    <Icon icon="solar:arrow-right-linear" width="18" className="opacity-50" />
                  </Link>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center w-full gap-4">
                      <a
                        href="https://calendly.com/khnnabubakar786/new-meeting"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto flex items-center justify-between sm:justify-center gap-3 bg-[#FF8C32] text-black h-[56px] px-6 sm:px-8 rounded-full font-semibold text-[15px] transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_24px_rgba(255,140,50,0.15)]"
                        style={{ textDecoration: 'none' }}
                      >
                        <span>Book a Demo</span>
                        <Icon icon="solar:arrow-right-up-linear" width="18" className="opacity-60" />
                      </a>
                      <a 
                        href="#how" 
                        className="flex items-center justify-start sm:justify-center h-[44px] px-2 text-[14px] text-[#A1A1AA] hover:text-white transition-colors"
                        style={{ textDecoration: 'none' }}
                      >
                        <span className="border-b border-[#A1A1AA]/30 hover:border-white/50 pb-0.5 transition-colors">See How It Works</span>
                      </a>
                    </div>
                    
                    {/* Proof Row */}
                    <div className="flex items-center gap-4 mt-1 opacity-80">
                      <div className="flex items-center gap-1.5 text-[12px] text-[#888]">
                        <Icon icon="solar:check-circle-bold" className="text-[#555]" width="14" /> Integrates with Devpost
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-[#888]">
                        <Icon icon="solar:check-circle-bold" className="text-[#555]" width="14" /> Setup in minutes
                      </div>
                    </div>
                  </>
                )}
              </div>
              
            </div>

            {/* Right Column: Product Preview */}
            <div className="lg:col-span-6 relative w-full mt-4 lg:mt-0 lg:ml-8 hero-product">
              <motion.div 
                className="relative w-full h-[400px] sm:h-[500px] lg:h-[640px] flex items-start lg:items-center" 
                ref={productRef} 
                style={{ scale, y, opacity }}
              >
                {/* The product bleeds off the right side and bottom slightly on mobile */}
                <div className="absolute top-0 right-[-24px] sm:right-[-48px] lg:right-[-120px] w-[calc(100%+24px)] sm:w-[calc(100%+48px)] lg:w-[calc(100%+120px)] h-[120%] lg:h-full rounded-tl-2xl sm:rounded-l-2xl lg:rounded-2xl border-t border-l lg:border border-white/10 bg-[#0A0A0A] shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none z-10" />
                  <DashboardMockup />
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      <div className="trust-bar" ref={trustRef}>
        <div className="container">
          <p className="caption" style={{ textAlign: 'center', marginBottom: 32, opacity: 0.6 }}>WHERE GREAT HACKATHONS ARE WOVEN</p>
        </div>
        
        {/* CSS-native Marquee — zero JS on scroll, pure GPU compositing */}
        <div className="marquee-wrapper">
          {/* Row 1 — left */}
          <div className="marquee-row">
            <div className="marquee-track marquee-left" aria-hidden="true">
              {[...Array(3)].map((_, i) => (
                <React.Fragment key={i}>
                  <div className="marquee-item"><Icon icon="logos:google-developers" width="22" /><span>Google Developers</span></div>
                  <div className="marquee-item"><Icon icon="logos:microsoft-icon" width="22" /><span>Microsoft Reactor</span></div>
                  <div className="marquee-item"><Icon icon="simple-icons:devpost" width="22" /><span>Devpost</span></div>
                  <div className="marquee-item"><Icon icon="simple-icons:mlh" width="22" /><span>Major League Hacking</span></div>
                  <div className="marquee-item"><Icon icon="logos:aws" width="26" /><span>AWS Startups</span></div>
                  <div className="marquee-item"><Icon icon="simple-icons:ethereum" width="22" /><span>ETHGlobal</span></div>
                </React.Fragment>
              ))}
            </div>
          </div>
          {/* Row 2 — right */}
          <div className="marquee-row">
            <div className="marquee-track marquee-right" aria-hidden="true">
              {[...Array(3)].map((_, i) => (
                <React.Fragment key={i}>
                  <div className="marquee-item"><Icon icon="logos:stripe" width="32" /><span>Stripe Build</span></div>
                  <div className="marquee-item"><Icon icon="logos:vercel-icon" width="22" /><span>Vercel</span></div>
                  <div className="marquee-item"><Icon icon="simple-icons:ycombinator" width="22" /><span>Y Combinator</span></div>
                  <div className="marquee-item"><Icon icon="simple-icons:polygon" width="22" /><span>Polygon</span></div>
                  <div className="marquee-item"><Icon icon="logos:github-icon" width="22" /><span>GitHub Education</span></div>
                  <div className="marquee-item"><Icon icon="simple-icons:hackerearth" width="22" /><span>HackerEarth</span></div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ActiveHackathons />

      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="label">Core Capabilities</span>
            <h2 className="heading-lg display-gradient">Every submission parsed.<br />Every score justified.</h2>
          </div>

          <div className="bento-grid" ref={bentoRef}>
            {/* Large tile — Multi-Modal Parser */}
            <div className="bento-span-8 bento-tile">
              <div className="glass-shell" style={{ height: '100%' }}>
                <div className="glass-inner flex flex-col md:flex-row" style={{ minHeight: 320 }}>
                  <div className="bento-tile-content">
                    <div className="icon-box">
                      <Icon icon="solar:magic-stick-3-linear" width="24" />
                    </div>
                    <h3 className="heading-md" style={{ marginBottom: 12 }}>Multi-Modal Parsing Engine</h3>
                    <p className="body-sm" style={{ maxWidth: 440 }}>
                      Ingests GitHub repositories, Google Slides, PowerPoint decks, Figma prototypes, and recorded demos. Our engine understands code architecture, design decisions, and presentation quality in a single pass.
                    </p>
                    <div style={{
                      marginTop: 'auto',
                      paddingTop: 24,
                      display: 'flex',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}>
                      {['GitHub', 'Google Slides', 'PowerPoint', 'Figma', 'Loom', 'YouTube'].map((t, i) => (
                        <span key={i} style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.5)',
                        }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right tile — Objective Scoring */}
            <div className="bento-span-4 bento-tile">
              <div className="glass-shell" style={{ height: '100%' }}>
                <div className="glass-inner">
                  <div className="bento-tile-content">
                    <div className="icon-box">
                      <Icon icon="solar:chart-2-linear" width="24" />
                    </div>
                    <h3 className="heading-sm" style={{ marginBottom: 12 }}>Rubric-Based Scoring</h3>
                    <p className="body-sm">
                      Pre-define criteria across innovation, technical depth, UX, and presentation. Every project gets a transparent breakdown.
                    </p>
                    <div style={{ marginTop: 'auto', paddingTop: 24 }}>
                      {[
                        { label: 'Innovation', pct: 92 },
                        { label: 'Technical', pct: 87 },
                        { label: 'UX / Design', pct: 78 },
                      ].map((bar, i) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                            <span>{bar.label}</span>
                            <span style={{ color: 'var(--primary)' }}>{bar.pct}%</span>
                          </div>
                          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${bar.pct}%`, borderRadius: 2, background: 'linear-gradient(90deg, #F97316, #FB9A57)', transition: 'width 1.5s ease' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom-left tile */}
            <div className="bento-span-4 bento-tile">
              <div className="glass-shell" style={{ height: '100%' }}>
                <div className="glass-inner flex flex-col md:flex-row">
                  <div className="flex-1 bento-tile-content">
                    <div className="icon-box">
                      <Icon icon="solar:plain-2-linear" width="24" />
                    </div>
                    <h3 className="heading-sm" style={{ marginBottom: 16 }}>Instant Feedback</h3>
                    <p className="body-sm">
                      Every team receives a personalized report with strengths, weaknesses, and actionable improvement suggestions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom-right tile */}
            <div className="bento-span-8 bento-tile">
              <div className="glass-shell" style={{ height: '100%' }}>
                <div className="glass-inner flex flex-col md:flex-row">
                  <div className="flex-1 bento-tile-content">
                    <div className="icon-box">
                      <Icon icon="solar:shield-check-linear" width="24" />
                    </div>
                    <h3 className="heading-md" style={{ marginBottom: 12 }}>Human-in-the-Loop Review</h3>
                    <p className="body-sm" style={{ maxWidth: 500 }}>
                      AI narrows the field. Human judges only review the top-ranked projects for the final decision. A hybrid approach that combines speed with expert nuance, cutting review time by 80%.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5 mt-auto pt-6 overflow-x-auto pb-2">
                      {[
                        { val: '200', label: 'Submissions' },
                        { val: '→', label: '' },
                        { val: '15', label: 'Finalists' },
                        { val: '→', label: '' },
                        { val: '3', label: 'Winners' },
                      ].map((item, i) => (
                        <div key={i} style={{ textAlign: 'center', flexShrink: 0 }}>
                          <div style={{
                            fontSize: item.val === '→' ? '20px' : '28px',
                            fontWeight: 300,
                            color: item.val === '→' ? 'rgba(255,255,255,0.15)' : 'var(--primary)',
                            letterSpacing: '-0.03em',
                          }}>{item.val}</div>
                          {item.label && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{item.label}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ METRICS ═══════════════════ */}
      <section className="section" id="metrics" style={{ paddingTop: 0 }}>
        <div className="container" ref={metricsRef}>
          <div className="metrics-row">
            {[
              { num: 96, prefix: '', suffix: '%', label: 'Scoring accuracy vs. expert panels' },
              { num: 3, prefix: '<', suffix: ' min', label: 'Average feedback turnaround per project' },
              { num: 80, prefix: '', suffix: '%', label: 'Reduction in judging operational cost' },
            ].map((m, i) => (
              <div className="metric-card glass-shell" key={i}>
                <div className="glass-inner" style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <div className="metric-value text-gradient-orange">
                    <CounterText value={m.num} prefix={m.prefix} suffix={m.suffix} />
                  </div>
                  <div className="metric-label">{m.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <ProcessStepsWidget />

      {/* ═══════════════════ PARALLAX TEXT ═══════════════════ */}
      <ScrollTextParallax />

      {/* ═══════════════════ PRICING ═══════════════════ */}
      <PricingSection />

      {/* ═══════════════════ PREMIUM CTA ═══════════════════ */}
      {/* ═══════════════════ PREMIUM CTA ═══════════════════ */}
      <section className="relative z-10 pt-32 pb-40 bg-[#050505] overflow-hidden">
        
        {/* Subtle, highly controlled ambient brand glow */}
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-[#FF8C32]/[0.04] blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[#FF8C32]/[0.03] blur-[150px] rounded-full pointer-events-none" />

        <div className="container max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-end">
            
            {/* Left/Main Column: Typography */}
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 text-[11px] font-bold text-[#888] uppercase tracking-[0.2em] mb-8">
                <div className="w-1.5 h-1.5 bg-[#FF8C32] rounded-full shadow-[0_0_8px_rgba(255,140,50,0.8)]" />
                The Hackloom Engine
              </div>
              <h2 className="text-[52px] sm:text-[80px] lg:text-[100px] font-medium text-white leading-[0.92] tracking-[-0.04em] mb-8">
                Focus on builders.<br />
                <span className="text-white/20">Automate the rest.</span>
              </h2>
              <p className="text-[18px] sm:text-[22px] text-[#A1A1AA] max-w-lg font-light leading-[1.6]">
                Replace the chaos of manual evaluation with a precise, instant, and scalable AI engine. Stop sorting spreadsheets. Start scaling.
              </p>
            </div>
            
            {/* Right Column: Actions */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-end">
              <div className="flex flex-col w-full sm:w-[320px] gap-4">
                
                {/* Primary Action */}
                {user ? (
                  <Link 
                    to="/dashboard" 
                    className="group relative flex items-center justify-between bg-white text-black h-[64px] px-8 rounded-full font-semibold text-[16px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Open Dashboard</span>
                    <Icon icon="solar:arrow-right-linear" className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                ) : (
                  <a
                    href="https://calendly.com/khnnabubakar786/new-meeting"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-between bg-[#FF8C32] text-black h-[64px] px-8 rounded-full font-semibold text-[16px] transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,140,50,0.15)]"
                  >
                    <span>Book a Demo</span>
                    <Icon icon="solar:arrow-right-up-linear" className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </a>
                )}
                
                {/* Secondary Action - Designer-Made Object */}
                <a
                  href="mailto:contact@hackloom.com"
                  className="group relative flex items-center p-2 pr-5 bg-[#0A0A0A] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] rounded-full transition-all duration-300 w-full"
                >
                  <div className="w-[48px] h-[48px] shrink-0 rounded-full bg-[#FF8C32]/[0.08] border border-[#FF8C32]/20 flex items-center justify-center mr-4 group-hover:bg-[#FF8C32]/[0.15] transition-colors relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#FF8C32] blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                    <Icon icon="solar:user-speak-rounded-linear" width="22" className="text-[#FF8C32] relative z-10" />
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <span className="text-[14px] font-semibold text-white leading-snug mb-0.5">Contact Sales</span>
                    <span className="text-[12px] font-normal text-[#888] leading-snug">Enterprise & custom setup</span>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.02] group-hover:bg-white/[0.08] transition-colors shrink-0">
                    <Icon icon="solar:arrow-right-up-linear" width="14" className="text-[#888] group-hover:text-white transition-colors" />
                  </div>
                </a>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="footer-loomix">
        {/* Glow & Mesh background effect */}
        <div className="footer-glow-bg"></div>
        {/* Subtle geometric circle overlay */}
        <div className="footer-glow-circle"></div>

        <div className="footer-container">
          <div className="footer-main-grid">
            
            {/* Left Column: CTA */}
            <div className="footer-left">
              <h2 className="footer-large-text">
                Automate your hackathon judging and experience the difference.
              </h2>
              <div className="footer-cta-wrapper">
                <a 
                  href="https://calendly.com/khnnabubakar786/new-meeting" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="footer-circle-btn"
                >
                  <Icon icon="solar:arrow-right-up-linear" width="24" />
                </a>
                <a 
                  href="https://calendly.com/khnnabubakar786/new-meeting" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="footer-cta-link"
                >
                  Book a call
                </a>
              </div>
            </div>

            {/* Center Column: Massive Vertical Text */}
            <div className="footer-center">
              <div className="vertical-brand">
                Hackloom
              </div>
            </div>

            {/* Right Column: Links */}
            <div className="footer-right">
              <div className="footer-link-group">
                <h4 className="footer-heading">Product</h4>
                <a href="#features" className="footer-link">Features</a>
                <a href="#pricing" className="footer-link">Pricing</a>
                <a href="#hackathons" className="footer-link">Case Studies</a>
                <a href="#how" className="footer-link">How it works</a>
              </div>
              <div className="footer-link-group">
                <h4 className="footer-heading">Legal</h4>
                <a href="#" className="footer-link">Terms & conditions</a>
                <a href="#" className="footer-link">Privacy policy</a>
                <a href="mailto:team@hackloom.io" className="footer-link">Contact us</a>
              </div>
            </div>
          </div>

          <div className="footer-divider"></div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <div className="footer-socials">
              <span className="socials-heading">Follow us</span>
              <div className="social-icons">
                <a href="#" className="social-circle"><Icon icon="ri:twitter-x-fill" width="16" /></a>
                <a href="#" className="social-circle"><Icon icon="ri:instagram-line" width="16" /></a>
                <a href="#" className="social-circle"><Icon icon="ri:linkedin-fill" width="16" /></a>
              </div>
            </div>
            <div className="footer-copyright">
              Copyright © 2026 - All rights reserved
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
